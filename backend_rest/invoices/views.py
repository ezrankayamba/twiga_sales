from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from . import models
from . import serializers
from datetime import datetime, timedelta
from sequences import get_next_value
from django.http import HttpResponse
from . import exports
from . import invoice_ocr
from decimal import Decimal
from django.db import transaction
from sales.models import Sale
from sales.serializers import SaleSerializer
import io
from . import sql as raw_sql

INVOICES_SEQUENCE_KEY = 'INVOICES'
INVOICES_DIGITS = 5
INVOICES_PREFIX = 'EXPINV'

NOTE_DOCS_SEQUENCE_KEY = "DebitOrCreditNotes"


def generate_num():
    n = f'{get_next_value(INVOICES_SEQUENCE_KEY)}'
    return f'{INVOICES_PREFIX}{n.zfill(INVOICES_DIGITS)}'


class InvoiceListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        agent = request.user.profile.agent
        data = request.data
        print(data)
        f = {}
        if agent:
            f['agent'] = agent
        if 'number' in data:
            f['number__contains'] = data['number']
        qs = models.Invoice.objects.filter(**f)
        data = serializers.InvoiceSerializer(qs, many=True).data
        return Response({'result': 0, 'message': 'Fetched invoices successfully', 'data': data})


class InvoiceSaleListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, invoice_id):
        print(request.GET)
        data = SaleSerializer(Sale.objects.filter(invoice_id=invoice_id), many=True).data
        return Response({'result': 0, 'message': 'Fetched invoices successfully', 'data': data})

    def post(self, request, invoice_id):
        data = Sale.objects.filter(invoice_id=invoice_id)
        export_id = datetime.now().strftime("%Y%m%d%H%M%S")
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="{export_id}_Sales.xlsx"'
        xlsx_data = exports.export_report_inv_details(request, data)
        response.write(xlsx_data)
        return response


class InvoiceReportExportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        agent = request.user.profile.agent
        if agent:
            data = models.Invoice.objects.filter(agent__code=agent.code)
        else:
            data = models.Invoice.objects.all()
        export_id = datetime.now().strftime("%Y%m%d%H%M%S")
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="{export_id}_Sales.xlsx"'
        xlsx_data = exports.export_invoices(request, data)
        response.write(xlsx_data)
        return response


class InvoiceDocsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data
        invoice = models.Invoice.objects.get(pk=data['invoice_id'])
        inv_file = request.FILES['invoice']
        let_file = request.FILES['letter']
        invoice_res, letter_res = invoice_ocr.extract_invoice_copy(io.BytesIO(inv_file.read()), io.BytesIO(let_file.read()))
        print(invoice_res, letter_res)
        result = -1
        msg = f'Attached invoice docs failed. Check the docs and reupload'
        try:
            # if invoice_res and letter_res:
            if letter_res:
                # if invoice_res['invoice_number'] == letter_res['invoice_number']:
                volume = round(Decimal(letter_res['volume']), 2)
                if volume == invoice.quantity:
                    ref_number = letter_res['invoice_number']
                    models.InvoiceDoc.objects.create(
                        ref_number=ref_number, doc_type=models.InvoiceDoc.DOC_INVOICE, file=inv_file, invoice=invoice)
                    models.InvoiceDoc.objects.create(
                        ref_number=ref_number, doc_type=models.InvoiceDoc.DOC_LETTER, file=let_file, invoice=invoice)

                    invoice.status = 1
                    invoice.save()

                    msg = f'Successfully attached invoice docs'
                    result = 0
                else:
                    msg = f'Quantity mismatch. Invoice Qty: {invoice.quantity}, Uploaded Qty: {volume} tons'
        except Exception as e:
            print(dir(e))
            msg = f'${e}'
        return Response({'result': result, 'message': msg, 'data': {'letter': letter_res, 'invoice': invoice_res}})

    def put(self, request, invoice_id):
        data = request.data
        invoice = models.Invoice.objects.get(pk=invoice_id)
        doc_file = request.FILES['file'] if 'file' in request.FILES else None
        doc_type = data['doc_type'] if 'file' in data else None
        ref_number = get_next_value(NOTE_DOCS_SEQUENCE_KEY)
        if doc_file and doc_type:
            models.InvoiceDoc.objects.create(ref_number=ref_number, doc_type=doc_type, file=doc_file, invoice=invoice)
        else:
            return Response({'result': -1, 'message': "Not valid request/parameters"})

        return Response({'result': 0, 'message': f"Successfully attached {doc_type} document"})


class InvoiceManageView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    required_scopes = []

    def get(self, request):
        agent = request.user.profile.agent

        qs = self.eligible_summary(request)
        data = {'complete': {'quantity': 0, 'value': 0, 'volume': 0}, 'incomplete': {
            'quantity': 0, 'value': 0, 'volume': 0}, 'commission': agent.commission if agent else 0}
        for row in qs:
            if row.complete:
                data['complete']['quantity'] = row.quantity_sum
                data['complete']['value'] = row.value_sum
                data['complete']['volume'] = row.volume
            else:
                data['incomplete']['quantity'] = row.quantity_sum
                data['incomplete']['value'] = row.value_sum
                data['incomplete']['volume'] = row.volume
        return Response({'result': 0, 'message': 'Invoicable sales retrieved successfully', 'data': data})

    def eligible_summary(self, request):
        max_date = request.GET['max_date'] if 'max_date' in request.GET else datetime.now().strftime(
            '%Y-%m-%d %H:%m:%S')
        agent = request.user.profile.agent
        agent_code = agent.code if agent else 0
        category = int(request.GET['category']) if 'category' in request.GET else -1
        print('Category: ', category)
        if category == 1:
            sql = raw_sql.summary_query(category='rusumo')
        if category == 4:
            sql = raw_sql.summary_query(category='rusumo_noc2')
        elif category == 2:
            sql = raw_sql.summary_query(category='kabanga')
        elif category == 3:
            sql = raw_sql.summary_query(category='kigoma')
        else:
            return []
        print("SQL: ", sql)
        return Sale.objects.raw(sql, [max_date, agent_code])

    def eligible_list(self, request):
        max_date = request.GET['max_date'] if 'max_date' in request.GET else datetime.now().strftime(
            '%Y-%m-%d %H:%m:%S')
        agent = request.user.profile.agent
        agent_code = agent.code if agent else 0

        # sql = "select *, (case when (select count(*) from sales_document d where d.created_at <= %s and d.sale_id=s.id and d.doc_type in ('C2','Assessment'))=2 then 1 else 0 end) as complete from sales_sale s left join users_agent a on s.agent_id=a.id where s.invoice_id is null and a.code = %s and complete=1"
        # print(category, "=>", sql)
        # return Sale.objects.raw(sql, [max_date, agent_code])
        category = int(request.GET['category']) if 'category' in request.GET else -1
        print('Category: ', category)
        if category == 1:
            sql = raw_sql.rusumo_list_query(for_summary=False)
        elif category == 2:
            sql = raw_sql.kabanga_list_query(for_summary=False)
        elif category == 3:
            sql = raw_sql.kigoma_list_query(for_summary=False)
        else:
            return []
        print("SQL: ", sql)
        return Sale.objects.raw(sql, [max_date, agent_code])

    def post(self, request):
        agent = request.user.profile.agent
        qs = self.eligible_summary(request)
        data = {'quantity': 0, 'quantity': 0, 'volume': 0, 'number': generate_num(), 'commission': agent.commission, 'agent': agent}
        for row in qs:
            if row.complete and row.quantity_sum:
                data['quantity'] = row.quantity_sum
                data['value'] = Decimal(row.quantity_sum) * agent.commission
                data['volume'] = Decimal(row.volume)

        with transaction.atomic():
            print("Invoice Data: ", data)
            volume = data['volume']
            del data['volume']
            if data['quantity'] <= 0:
                return Response({'result': -1, 'message': f'Invoice creation ignored as no sales attached'})
            qs2 = self.eligible_list(request)
            volume2 = len(list(qs2))
            print("Summary/List Count: ", volume, "/", volume2)
            if not (volume2 == volume):
                return Response({'result': -1, 'message': f'Invoice creation ignored as there is volume mismatch!'})
            inv = models.Invoice.objects.create(**data)
            for row in qs2:
                sale = Sale.objects.get(pk=row.id)
                sale.invoice = inv
                sale.save()
        return Response({'result': 0, 'message': f'Successfully created invoice with number: {inv.number}'})

    def put(self, request, invoice_id):
        invoice = models.Invoice.objects.get(pk=invoice_id)
        invoice.status = invoice.status + 1
        invoice.save()
        return Response({'result': 0, 'message': f'Successfully updated invoice number: {invoice.number}'})

    def delete(self, request, invoice_id):
        invoice = models.Invoice.objects.get(pk=invoice_id)
        num = invoice.number
        invoice.delete()
        return Response({'result': 0, 'message': f'Successfully updated invoice number: {num}'})
