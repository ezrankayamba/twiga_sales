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


class InvoiceManageView(APIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = []

    def get(self, request):
        agent = request.user.agent
        qs = self.eligible_summary(request)
        data = {'complete': {'quantity': 0, 'quantity': 0}, 'incomplete': {
            'quantity': 0, 'quantity': 0}, 'commission': agent.commission}
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
            if row.complete:
                data['quantity'] = row.quantity_sum * agent.commission
                data['value'] = row.value_sum

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
