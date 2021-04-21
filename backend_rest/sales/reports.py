from rest_framework import generics, permissions
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.parsers import FormParser, MultiPartParser
from . import imports, ocr, serializers, models
import io
import re
from django.db import models as d_models
from datetime import datetime, timedelta
from django.db.models import Q, F, Count
from django.db.models import Sum, Case, When, IntegerField
from . import exports
from django.http import HttpResponse
import json
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from datetime import date, time, datetime
from .raw_sql import SQL_SUMMARY_PER_DEST, SQL_SUMMARY_PER_DEST_NO_FILTER

THRESHOLD_DAYS = 14


def threshold_date():
    return datetime.now()-timedelta(days=THRESHOLD_DAYS)


def mand_docs_date():
    dt = datetime(year=2021, month=4, day=1)
    return dt


def destinations(request):
    qs = models.Sale.objects.values('destination').annotate(count=Count('id')).order_by('destination')
    return JsonResponse({'data': list(qs)})


def get_sales(q):
    print(q)
    m1 = ['Assessment', 'Exit']  # with aggregate
    m2 = ['C2', 'Assessment', 'Exit']
    m3 = ['C2', 'Assessment']  # before April
    docs_count = Case(When(aggregate__isnull=False, then=Count('aggregate__docs', filter=Q(aggregate__docs__doc_type__in=m1))),
                      default=Count('docs', filter=Q(docs__doc_type__in=m2)))
    mand_size = Case(When(aggregate__isnull=False, then=2), When(transaction_date__lt=mand_docs_date(), then=2), default=3, output_field=IntegerField())
    qs = models.Sale.objects.annotate(doc_count=docs_count, mandatory_size=mand_size)

    if q == 'nodocs_old':
        qs = qs.filter(doc_count__lt=F('mandatory_size'), transaction_date__lte=threshold_date())
    elif q == 'nodocs_new':
        qs = qs.filter(doc_count__lt=F('mandatory_size'), transaction_date__gt=threshold_date())
    elif q == 'docs_nomatch':
        qs = qs.filter(doc_count__gte=F('mandatory_size')).filter(~Q(total_value=F('total_value2')) | ~Q(quantity=F('quantity2')))
    elif q == 'docs_and_match':
        qs = qs.filter(doc_count__gte=F('mandatory_size')).filter(total_value=F('total_value2'), quantity=F('quantity2'))
    else:  # with docs check only
        qs = qs.filter(doc_count__gte=F('mandatory_size'))

    # print(qs.query)
    return qs


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
            filt_ref_num = self.get_filter('doc_ref')
            if self.get_filter('destination'):
                filt['destination'] = self.get_filter('destination')
            if(filt_ref_num):
                filt['docs__ref_number__contains'] = self.get_filter('doc_ref')
            filt['sales_order__contains'] = self.get_filter('sales_order')
            filt['delivery_note__contains'] = self.get_filter('delivery_note')
            assign_no = self.get_filter('assign_no')
            if assign_no:
                filt['assign_no'] = self.get_filter('assign_no')
            date_from = self.get_filter('date_from')
            date_to = self.get_filter('date_to')
            if date_from:
                filt['transaction_date__gte'] = date_from
            if date_to:
                filt['transaction_date__lte'] = date_to
            print(filt)
            q_more = self.get_filter('more_filter')
            if not q_more:
                q_more = self.request.query_params.get('more_filter')
            if q_more:
                sales = get_sales(q=q_more).filter(**filt)
            else:
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
        # sql = 'select max(id) as id, destination, complete, count(id) as volume, sum(total_value) as value_sum, sum(quantity) as quantity_sum from (select *, (case when (select count(*) from sales_document d where d.sale_id=s.id)=3 then 1 else 0 end) as complete from sales_sale s) as sales group by destination, complete'
        year = request.GET.get('year', datetime.today().year)
        frm = f'{year}-01-01 00:00:00'
        to = f'{year}-12-31 23:59:59'
        # sql = SQL_SUMMARY_PER_DEST_NO_FILTER
        sql = SQL_SUMMARY_PER_DEST
        qs = models.Sale.objects.raw(sql, [frm, to])
        # qs = models.Sale.objects.raw(sql, [])
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

        return Response({
            'status': 0,
            'message': f'Successfully fetched report',
            'data': data
        })


class CustomerReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_data(self, request):
        whereby = ''
        print(request.data)
        if 'destination' in request.data and request.data['destination']:
            dest = request.data['destination']
            whereby = f"where s.destination = '{dest}'"
            print(dest)
        sql = f'select max(id) as id, customer_name, count(id) as qty, sum(total_value) as total_value, sum(quantity) as total_volume, sum(total_value2) as total_value2, sum(quantity2) as total_volume2  from sales_sale s {whereby} group by customer_name'
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

        return Response({
            'status': 0,
            'message': f'Successfully fetched report',
            'data': data
        })

    def post(self, request):
        if 'export' in request.data:
            customers = self.get_data(request)
            export_id = datetime.now().strftime("%Y%m%d%H%M%S")
            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="{export_id}_Customers.xlsx"'
            xlsx_data = exports.export_customers(request, customers)
            response.write(xlsx_data)
            return response
        else:
            data = self.get_data(request)
            return Response({
                'status': 0,
                'message': f'Successfully fetched report',
                'data': data
            })


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
