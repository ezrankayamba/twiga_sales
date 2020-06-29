from rest_framework import generics, permissions
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.parsers import FormParser, MultiPartParser
from . import imports, ocr, serializers, models
from django.db.models import Count
import io
import re
from django.db import models as d_models
from datetime import datetime, timedelta
from django.db.models import Q, F, Count
from . import exports
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

THRESHOLD_DAYS = 14


def threshold_date():
    return datetime.now()-timedelta(days=THRESHOLD_DAYS)


def get_sales(q):
    mandatory = ['C2', 'Assessment']
    qs = models.Sale.objects.annotate(doc_count=Count('docs', filter=Q(docs__doc_type__in=mandatory)))
    if q == 'nodocs_old':
        return qs.filter(doc_count__lt=2, transaction_date__lte=threshold_date())
    elif q == 'nodocs_new':
        return qs.filter(doc_count__lt=2, transaction_date__gt=threshold_date())
    elif q == 'docs_nomatch':
        return qs.filter(doc_count=2).filter(~Q(total_value=F('total_value2'))).filter(~Q(quantity=F('quantity2')))
    else:
        return qs.filter(doc_count=2)


class SummaryDetailExport(APIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = []

    def get_filter(self, name):
        data = self.request.data
        if data and name in data:
            return data[name] if data[name] else ''
        else:
            return ''

    def post(self, request):
        q = self.request.query_params.get('q')
        export_id = datetime.now().strftime("%Y%m%d%H%M%S")
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="{export_id}_Sales.xlsx"'
        sales = get_sales(q)
        xlsx_data = exports.export_report(request, sales)
        response.write(xlsx_data)
        return response


class SalesReportList(APIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = []

    def get_filter(self, name):
        data = self.request.data
        if data and name in data:
            return data[name] if data[name] else ''
        else:
            return ''

    def post(self, request):
        data = request.data
        print(data)
        q = self.get_filter('q')

        if q:
            sales = get_sales(q)
        elif data:
            filt = {}
            filt['customer_name__contains'] = self.get_filter('customer_name')
            filt['vehicle_number__contains'] = self.get_filter('vehicle_number')
            filt['tax_invoice__contains'] = self.get_filter('tax_invoice')
            filt['sales_order__contains'] = self.get_filter('sales_order')
            filt['delivery_note__contains'] = self.get_filter('delivery_note')
            date_from = self.get_filter('date_from')
            date_to = self.get_filter('date_to')
            if date_from:
                filt['transaction_date__gte'] = date_from
            if date_to:
                filt['transaction_date__lte'] = date_to
            print(filt)
            sales = models.Sale.objects.annotate(doc_count=d_models.Count('docs')).filter(**filt)
        else:
            sales = []

        return Response({
            'status': 0,
            'message': f'Successfully fetched report',
            'data': serializers.SaleSerializer(sales, many=True).data
        })


class SalesReportExport(APIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = []

    def get_filter(self, name):
        data = self.request.data
        if data and name in data:
            return data[name] if data[name] else ''
        else:
            return ''

    def post(self, request):
        data = request.data
        print(data)
        q = self.get_filter('q')

        if q:
            sales = get_sales(q)
        elif data:
            filt = {}
            filt['customer_name__contains'] = self.get_filter('customer_name')
            filt['vehicle_number__contains'] = self.get_filter('vehicle_number')
            filt['tax_invoice__contains'] = self.get_filter('tax_invoice')
            filt['sales_order__contains'] = self.get_filter('sales_order')
            date_from = self.get_filter('date_from')
            date_to = self.get_filter('date_to')
            if date_from:
                filt['transaction_date__gte'] = date_from
            if date_to:
                filt['transaction_date__lte'] = date_to
            print(filt)
            sales = models.Sale.objects.annotate(doc_count=d_models.Count('docs')).filter(**filt)
        else:
            sales = []

        export_id = datetime.now().strftime("%Y%m%d%H%M%S")
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="{export_id}_Sales.xlsx"'
        xlsx_data = exports.export_report(request, sales)
        response.write(xlsx_data)
        return response


class SaleSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = []
    parser_classes = [FormParser, MultiPartParser]

    def get(self, request, format=None):
        with_docs = get_sales(q='withdocs').count()
        no_docs_older = get_sales(q='nodocs_old').count()
        no_docs_new = get_sales(q='nodocs_new').count()
        docs_nomatch = get_sales(q='docs_nomatch').count()
        return Response({
            'status': 0,
            'summary': [
                {'name': 'Has Docs, value match', 'value': with_docs, 'color': "#00FF00", 'q': 'withdocs'},
                {'name': 'Has Docs, value mismatch', 'value': docs_nomatch, 'color': "#CCFFCC", 'q': 'docs_nomatch'},
                {'name': 'No Docs new', 'value': no_docs_new, 'color': "#FFCCCC", 'q': 'nodocs_new'},
                {'name': 'No Docs 14 days', 'value': no_docs_older, 'color': "#FF6666", 'q': 'nodocs_old'},
            ]
        })


class DestinationReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        sql = 'select max(id) as id, destination, complete, count(id) as volume, sum(total_value) as value_sum, sum(quantity) as quantity_sum from (select *, (case when (select count(*) from sales_document d where d.sale_id=s.id)=3 then 1 else 0 end) as complete from sales_sale s) as sales group by destination, complete'
        qs = models.Sale.objects.raw(sql)
        data = {}
        for row in qs:
            dest = row.destination
            if dest not in data:
                data[dest] = {'withdocs': {'value': 0, 'qty': 0, 'volume': 0},
                              'nodocs': {'value': 0, 'qty': 0, 'volume': 0}}
            if row.complete == 1:
                data[dest]['withdocs']['value'] = row.value_sum
                data[dest]['withdocs']['qty'] = row.quantity_sum
                data[dest]['withdocs']['volume'] = row.volume
            else:
                data[dest]['nodocs']['value'] = row.value_sum
                data[dest]['nodocs']['qty'] = row.quantity_sum
                data[dest]['nodocs']['volume'] = row.volume

        print(data)

        return Response({
            'status': 0,
            'message': f'Successfully fetched report',
            'data': data
        })


class CustomerReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_data(self, request):
        sql = 'select max(id) as id, customer_name, count(id) as qty, sum(total_value) as total_value, sum(quantity) as total_volume, sum(total_value2) as total_value2, sum(quantity2) as total_volume2  from sales_sale group by customer_name'
        qs = models.Sale.objects.raw(sql)
        data = []
        columns = ['customer_name', 'qty', 'total_value', 'total_volume', 'total_value2', 'total_volume2']
        for row in qs:
            cust = {}
            for col in columns:
                cust[col] = getattr(row, col)
            data.append(cust)

        return data

    def get(self, request, format=None):
        data = self.get_data(request)
        print(data)

        return Response({
            'status': 0,
            'message': f'Successfully fetched report',
            'data': data
        })

    def post(self, request):
        customers = self.get_data(request)
        export_id = datetime.now().strftime("%Y%m%d%H%M%S")
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="{export_id}_Customers.xlsx"'
        xlsx_data = exports.export_customers(request, customers)
        response.write(xlsx_data)
        return response


class UnmatchedValuesReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_val(self, key):
        val = self.request.data.get(key)
        return val if val else ''

    def post(self, request, format=None):
        filt = {}
        filt['customer_name__contains'] = self.get_val('customer_name')
        filt['vehicle_number__contains'] = self.get_val('vehicle_number')
        filt['tax_invoice__contains'] = self.get_val('tax_invoice')
        filt['sales_order__contains'] = self.get_val('sales_order')

        mismatch = models.Sale.objects.filter(~d_models.Q(
            total_value=d_models.F('total_value2'), quantity=d_models.F('quantity2')),  ** filt)
        return Response({
            'status': 0,
            'message': f'Successfully fetched report',
            'data': serializers.SaleSerializer(mismatch, many=True).data
        })

    def get(self, request, format=None):
        mismatch = models.Sale.objects.filter(~d_models.Q(
            total_value=d_models.F('total_value2'), quantity=d_models.F('quantity2')))

        return Response({
            'status': 0,
            'message': f'Successfully fetched report',
            'data': serializers.SaleSerializer(mismatch, many=True).data
        })


# '''
# >>> models.Sale.objects.values('destination').annotate(quantity=Sum('quantity'), value=Sum('total_value')).order_by('destination')
# <QuerySet [{'destination': 'Kenya', 'quantity': 377, 'value': 312431}, {'destination': 'Rwanda', 'quantity': 711, 'value': 599704}, {'destination': 'Uganda', 'quantity': 189, 'value': 272427}, {'destination': 'Zambia', 'quantity': 841, 'value': 544854}]>

# '''
