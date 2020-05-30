from rest_framework import generics, permissions
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope
from rest_framework.views import APIView
from rest_framework import generics, permissions
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.renderers import JSONRenderer
from . import models
from . import serializers
from django.db.models import Q, F
from django.db import models as d_models
from sequences import get_next_value
from django.db import transaction
from decimal import Decimal
from datetime import datetime, timedelta
from django.http import HttpResponse
from . import exports

INVOICES_SEQUENCE_KEY = 'INVOICES'
INVOICES_DIGITS = 5
INVOICES_PREFIX = 'EXPINV'


def generate_num():
    n = f'{get_next_value(INVOICES_SEQUENCE_KEY)}'
    return f'{INVOICES_PREFIX}{n.zfill(INVOICES_DIGITS)}'


class InvoiceListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        print(request.GET)
        data = serializers.InvoiceSerializer(models.Invoice.objects.all(), many=True).data
        return Response({'result': 0, 'message': 'Fetched invoices successfully', 'data': data})


class InvoiceSaleListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, invoice_id):
        print(request.GET)
        data = serializers.SaleSerializer(models.Sale.objects.filter(invoice_id=invoice_id), many=True).data
        return Response({'result': 0, 'message': 'Fetched invoices successfully', 'data': data})

    def post(self, request, invoice_id):
        data = models.Sale.objects.filter(invoice_id=invoice_id)
        export_id = datetime.now().strftime("%Y%m%d%H%M%S")
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="{export_id}_Sales.xlsx"'
        xlsx_data = exports.export_report(request, data)
        response.write(xlsx_data)
        return response


class InvoiceReportExportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = models.Invoice.objects.all()
        export_id = datetime.now().strftime("%Y%m%d%H%M%S")
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="{export_id}_Sales.xlsx"'
        xlsx_data = exports.export_invoices(request, data)
        response.write(xlsx_data)
        return response


class InvoiceManageView(APIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = []

    def get(self, request):
        agent = None
        try:
            agent = request.user.agent
        except Exception as e:
            pass
        qs = self.eligible_summary(request)
        data = {'complete': {'quantity': 0, 'quantity': 0}, 'incomplete': {
            'quantity': 0, 'quantity': 0}, 'commission': agent.commission if agent else 0}
        for row in qs:
            if row.complete:
                data['complete']['quantity'] = row.quantity_sum
                data['complete']['value'] = row.value_sum
            else:
                data['incomplete']['quantity'] = row.quantity_sum
                data['incomplete']['value'] = row.value_sum
        return Response({'result': 0, 'message': 'Invoicable sales retrieved successfully', 'data': data})

    def eligible_summary(self, request):
        sql = "select max(id) as id, complete, count(id) as volume, sum(total_value2) as value_sum, sum(quantity2) as quantity_sum from (select *, (case when (select count(*) from sales_document d where d.sale_id=s.id and d.doc_type in ('C2','Assessment'))=2 then 1 else 0 end) as complete from sales_sale s where s.invoice_id is null) as sales group by complete"
        return models.Sale.objects.raw(sql)

    def eligible_list(self, request):
        sql = "select *, (case when (select count(*) from sales_document d where d.sale_id=s.id and d.doc_type in ('C2','Assessment'))=2 then 1 else 0 end) as complete from sales_sale s where complete=1"
        return models.Sale.objects.raw(sql)

    def post(self, request):
        agent = request.user.agent
        qs = self.eligible_summary(request)
        data = {'quantity': 0, 'quantity': 0, 'number': generate_num(), 'commission': agent.commission, 'agent': agent}
        for row in qs:
            if row.complete and row.quantity_sum:
                data['quantity'] = row.quantity_sum
                data['value'] = Decimal(row.quantity_sum) * agent.commission

        with transaction.atomic():
            inv = models.Invoice.objects.create(**data)
            qs2 = self.eligible_list(request)
            for row in qs2:
                sale = models.Sale.objects.get(pk=row.id)
                sale.invoice = inv
                sale.save()
                print(sale)

        return Response({'result': 0, 'message': f'Successfully created invoice with number: {inv.number}'})

    def put(self, request, invoice_id):
        invoice = models.Invoice.objects.get(pk=invoice_id)
        invoice.status = 1
        invoice.save()
        return Response({'result': 0, 'message': f'Successfully updated invoice number: {invoice.number}'})

    def delete(self, request, invoice_id):
        invoice = models.Invoice.objects.get(pk=invoice_id)
        num = invoice.number
        invoice.delete()
        return Response({'result': 0, 'message': f'Successfully updated invoice number: {num}'})
