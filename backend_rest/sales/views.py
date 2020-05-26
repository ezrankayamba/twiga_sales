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
from . import reports


class SaleListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = []
    serializer_class = serializers.SaleSerializer

    def get_filter(self, name):
        data = self.request.GET
        if data and name in data:
            return data[name] if data[name] else ''
        else:
            return ''

    def get_queryset(self):
        q = self.request.query_params.get('q')
        data = self.request.GET
        print(data)
        if q:
            return reports.get_sales(q)

        if data:
            filt = {}
            filt['customer_name__contains'] = self.get_filter('customer_name')
            filt['vehicle_number__contains'] = self.get_filter('vehicle_number')
            filt['tax_invoice__contains'] = self.get_filter('tax_invoice')
            filt['sales_order__contains'] = self.get_filter('sales_order')
            print(filt)
            sales = models.Sale.objects.annotate(doc_count=d_models.Count('docs')).filter(**filt)
        else:
            sales = models.Sale.objects.annotate(doc_count=d_models.Count('docs')).all()
        return sales

    def create(self, request, *args, **kwargs):
        data = request.data
        entity = models.Sale.objects.create(**data)
        return Response(self.get_serializer(entity).data)


class ImportSalesView(APIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = ['sales']
    parser_classes = [FormParser, MultiPartParser]

    def post(self, request, format=None):
        file = request.FILES['file']
        # imports.import_sales(excel_file)

        batch = models.Batch.objects.create(file_in=file, user=request.user)
        imports.sales_import_async(batch)

        return Response({
            'status': 0,
            'message': f'Successfully imported sales'
        })


class SaleDetailView(generics.RetrieveUpdateDestroyAPIView):
    model = models.Sale
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = []
    serializer_class = serializers.SaleSerializer

    def get_queryset(self):
        return models.Sale.objects.all()


class DocumentListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = []
    serializer_class = serializers.DocumentSerializer

    def get_queryset(self):
        return models.Document.objects.all()


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    model = models.Document
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = []
    serializer_class = serializers.DocumentSerializer

    def get_queryset(self):
        return models.Document.objects.all()


class UploadDocsView(APIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = []
    parser_classes = [FormParser, MultiPartParser]

    def post(self, request, format=None):
        file = request.FILES['file']
        batch = models.Batch.objects.create(file_in=file, user=request.user)
        imports.docs_import_async(batch)
        return Response({
            'status': 0,
            'message': f'Successfully uploaded documents with batch id: {batch.id}'
        })


class SaleDocsView(APIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = []
    parser_classes = [FormParser, MultiPartParser]

    def post(self, request, format=None):
        data = request.data
        print(data)
        sale = models.Sale.objects.get(pk=data['sale_id'])
        truck = 'trailer' if sale.quantity < models.TRUCK_THRESHOLD else 'head'

        errors = []
        docs = []
        for d in imports.docs_schema:
            if d['key'] not in request.FILES:
                continue
            print()
            print("======================")
            file = request.FILES[d['key']]
            pdf_data = io.BytesIO(file.read())
            args = d['params']
            text = ocr.extract_from_file(pdf_data, **args)
            ret = re.search(d['regex'], text)
            if ret:
                prefix = d.get('prefix', '')
                ref_number = f'{prefix}{ret.group(1)}'
                print(d['name'], ref_number)
                name = d['name']
                duplicate = models.Document.objects.filter(ref_number=ref_number, truck=truck).first()
                if duplicate:
                    errors.append({
                        'key': d['key'],
                        'name': d['name'],
                        'message': f'Duplicate {name} document',
                    })
                else:
                    docs.append({
                        'ref_number': ref_number,
                        'file': file,
                        'sale': sale,
                        'doc_type': name,
                        'truck': truck
                    })
            else:
                print(d['name'], text)
                name = d['name']
                errors.append({
                    'key': d['key'],
                    'name': d['name'],
                    'message': f'Invalid {name} document',
                })
        print()
        print("======================")
        if len(errors):
            print('Errors: ', errors)
            return Response({
                'status': -1,
                'message': f'Invalid document(s)',
                'errors': errors
            })
        else:
            print('Docs: ', docs)
            sale.agent = request.user.agent
            sale.quantity2 = data['quantity2']
            sale.total_value2 = data['total_value2']
            sale.save()
            for doc in docs:
                models.Document.objects.create(**doc)
            return Response({
                'status': 0,
                'message': f'Successfully uploaded documents'
            })

    def put(self, request, format=None):
        data = request.data
        print(data)
        sale = models.Sale.objects.get(pk=data['sale_id'])
        truck = 'trailer' if sale.quantity < models.TRUCK_THRESHOLD else 'head'

        errors = []
        docs = []
        for d in imports.docs_schema:
            if d['key'] not in request.FILES:
                continue
            print()
            print("======================")
            file = request.FILES[d['key']]
            pdf_data = io.BytesIO(file.read())
            args = d['params']
            text = ocr.extract_from_file(pdf_data, **args)
            ret = re.search(d['regex'], text)
            if ret:
                prefix = d.get('prefix', '')
                ref_number = f'{prefix}{ret.group(1)}'
                print(d['name'], ref_number)
                name = d['name']
                duplicate = models.Document.objects.filter(ref_number=ref_number, truck=truck).first()
                if duplicate:
                    errors.append({
                        'key': d['key'],
                        'name': d['name'],
                        'message': f'Duplicate {name} document',
                    })
                else:
                    docs.append({
                        'ref_number': ref_number,
                        'file': file,
                        'sale': sale,
                        'doc_type': name,
                        'truck': truck
                    })
            else:
                print(d['name'], text)
                name = d['name']
                errors.append({
                    'key': d['key'],
                    'name': d['name'],
                    'message': f'Invalid {name} document',
                })
        print()
        print("======================")
        if len(errors):
            print('Errors: ', errors)
            return Response({
                'status': -1,
                'message': f'Invalid document(s)',
                'errors': errors
            })
        else:
            print('Docs: ', docs)
            sale.agent = request.user.agent
            sale.quantity2 = data['quantity2']
            sale.total_value2 = data['total_value2']
            sale.save()
            for doc in docs:
                models.Document.objects.create(**doc)
            return Response({
                'status': 0,
                'message': f'Successfully uploaded documents'
            })


class TestOCRView(APIView):
    permission_classes = [permissions.AllowAny]
    required_scopes = []
    parser_classes = [FormParser, MultiPartParser]

    def post(self, request, format=None):
        params = request.data
        letter = params.get('letter')
        file = request.FILES['file']
        print(file)
        pdf_data = io.BytesIO(file.read())
        del params['file']
        del params['letter']
        args = {}
        for p in params:
            args[p] = int(params.get(p))
        print('Args: ', args)
        text = ocr.extract_from_file(pdf_data, **args)
        print(text)
        for d in imports.docs_schema:
            if d['letter'] != letter:
                continue
            prefix = d.get('prefix', '')
            ret = re.search(d['regex'], text)
            if ret:
                return Response({
                    'status': 0,
                    'message': 'Successfully extracted text',
                    'text': f'{prefix}{ret.group(1)}',
                    'name': d['name'],
                    'raw': text
                })

        return Response({
            'status': -1,
            'message': 'System was not able to validate the document',
            'text': text
        })
