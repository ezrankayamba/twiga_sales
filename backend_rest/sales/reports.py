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
from django.db.models import Q
from . import exports
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

THRESHOLD_DAYS = 14


def threshold_date():
    return datetime.now()-timedelta(days=THRESHOLD_DAYS)


def get_sales(q):
    if q == 'nodocs_old':
        return models.Sale.objects.annotate(doc_count=d_models.Count('docs')).filter(
            doc_count__lt=3, transaction_date__lte=threshold_date())
    elif q == 'nodocs_new':
        return models.Sale.objects.annotate(doc_count=d_models.Count('docs')).filter(doc_count__lt=3, transaction_date__gt=threshold_date())
    else:
        return models.Sale.objects.annotate(doc_count=d_models.Count('docs')).filter(doc_count=3)


class SummaryDetailExport(APIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = []

    def get_filter(self, name):
        data = self.request.data
        return data[name] if data[name] else ''

    def post(self, request):
        q = self.request.query_params.get('q')
        export_id = datetime.now().strftime("%Y%m%d%H%M%S")
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="{export_id}_Sales.xlsx"'
        sales = get_sales(q)
        xlsx_data = exports.export_report(request, sales)
        response.write(xlsx_data)
        return response


class SalesReportExport(APIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = []

    def get_filter(self, name):
        data = self.request.data
        return data[name] if data[name] else ''

    def post(self, request):
        data = request.data
        q = self.get_filter('q')
        print(data)
        if q:
            sales = get_sales(q)
        elif data:
            filt = {}
            filt['customer_name__contains'] = self.get_filter('customer_name')
            filt['vehicle_number__contains'] = self.get_filter('vehicle_number')
            filt['tax_invoice__contains'] = self.get_filter('tax_invoice')
            filt['sales_order__contains'] = self.get_filter('sales_order')
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
        return Response({
            'status': 0,
            'summary': [
                {'name': 'Has Docs', 'value': with_docs, 'color': "#33FF33", 'q': 'withdocs'},
                {'name': 'No Docs 14 days', 'value': no_docs_older, 'color': "#FF3333", 'q': 'nodocs_old'},
                {'name': 'No Docs new', 'value': no_docs_new, 'color': "#3333FF", 'q': 'nodocs_new'}
            ]
        })


class OverThresholdDaysReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def threshold(self):
        return datetime.now() - timedelta(days=14)

    def get_val(self, key):
        val = self.request.data.get(key)
        return val if val else ''

    def post(self, request, format=None):
        print(request.data, request.POST)
        filt = {}
        # filt['customer_name'] = ''
        filt['customer_name__contains'] = self.get_val('customer_name')
        filt['vehicle_number__contains'] = self.get_val('vehicle_number')
        filt['tax_invoice__contains'] = self.get_val('tax_invoice')
        filt['sales_order__contains'] = self.get_val('sales_order')
        filt['created_at__lt'] = self.threshold()
        filt['doc_count__lt'] = 3

        no_docs = models.Sale.objects.annotate(doc_count=d_models.Count('docs')).filter(**filt)
        return Response({
            'status': 0,
            'message': f'Successfully fetched report',
            'data': serializers.SaleSerializer(no_docs, many=True).data
        })

    def get(self, request, format=None):
        no_docs = models.Sale.objects.annotate(doc_count=d_models.Count(
            'docs')).filter(doc_count__lt=3, created_at__lt=self.threshold())

        return Response({
            'status': 0,
            'message': f'Successfully fetched report',
            'data': serializers.SaleSerializer(no_docs, many=True).data
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
