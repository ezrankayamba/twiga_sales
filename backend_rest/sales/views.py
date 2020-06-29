from rest_framework import generics, permissions
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.parsers import FormParser, MultiPartParser
from . import imports, ocr, serializers, models, ocr2
from django.db.models import Count
import io
import re
from django.db import models as d_models
from . import reports
import ast


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
            filt['delivery_note__contains'] = self.get_filter('delivery_note')
            date_from = self.get_filter('date_from')
            date_to = self.get_filter('date_to')
            if date_from:
                filt['transaction_date__gte'] = date_from
            if date_to:
                filt['transaction_date__lte'] = date_to
            print(filt)
            q_more = self.request.query_params.get('more_filter')
            if q_more:
                sales = reports.get_sales(q=q_more).filter(**filt)
            else:
                sales = models.Sale.objects.annotate(doc_count=d_models.Count('docs')).filter(**filt)
        else:
            sales = models.Sale.objects.annotate(doc_count=d_models.Count('docs')).all()
        return sales

    def create(self, request, *args, **kwargs):
        data = request.data
        entity = models.Sale.objects.create(**data)
        return Response(self.get_serializer(entity).data)


class BatchListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.BatchSerializer

    def get_queryset(self):
        return models.Batch.objects.filter(user=self.request.user)


class BatchUnreadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            'result': 0,
            'message': 'Fetched unread count',
            'data': models.Batch.objects.filter(user=request.user, read=False).count()
        })

    def put(self, request):
        models.Batch.objects.filter(user=request.user, read=False).update(read=True)
        return Response({
            'result': 0,
            'message': 'Updated unread count',
            'data': models.Batch.objects.filter(user=request.user, read=False).count()
        })


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
        print('Asynchronous response ....')
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
        truck = 'trailer' if sale.quantity >= models.TRUCK_THRESHOLD else 'head'

        errors = []
        docs = []
        for d in imports.docs_schema():
            if d['key'] not in request.FILES:
                continue
            print()
            print("======================")
            file = request.FILES[d['key']]
            pdf_data = io.BytesIO(file.read())
            args = d['params']
            regex = d['regex']
            # ref_number = ocr.new_extract_from_file(regex, pdf_data, **args)
            ref_number = ocr2.extract_ref_number(pdf_data, regex, **args)
            # ret = re.search(d['regex'], text)
            if ref_number:
                prefix = d.get('prefix', '')
                ref_number = f'{prefix}{ref_number}'
                print(d['name'], ref_number)
                name = d['name']
                duplicate = models.Document.objects.filter(ref_number=ref_number, truck=truck).first()
                if duplicate:
                    errors.append({
                        'key': d['key'],
                        'name': d['name'],
                        'message': f'Duplicate {name} document',
                        'mandatory': d['mandatory']
                    })
                else:
                    docs.append({
                        'ref_number': ref_number,
                        'file': file,
                        'sale': sale,
                        'doc_type': name,
                        'truck': truck,
                        'user': request.user
                    })
            else:
                name = d['name']
                errors.append({
                    'key': d['key'],
                    'name': d['name'],
                    'message': f'Invalid {name} document',
                    'mandatory': d['mandatory']
                })
        print()
        print("======================")
        if len(list(filter(lambda x: x['mandatory'], errors))):
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
                'message': f'Successfully uploaded documents',
                'errors': errors
            })

    def put(self, request, format=None):
        data = request.data
        print(data)
        sale = models.Sale.objects.get(pk=data['sale_id'])
        truck = 'trailer' if sale.quantity >= models.TRUCK_THRESHOLD else 'head'

        errors = []
        docs = []
        for d in imports.docs_schema():
            if d['key'] not in request.FILES:
                continue
            print()
            print("======================")
            file = request.FILES[d['key']]
            pdf_data = io.BytesIO(file.read())
            args = d['params']
            regex = d['regex']
            # ref_number = ocr.new_extract_from_file(regex, pdf_data, **args)
            ref_number = ocr2.extract_ref_number(pdf_data, regex, **args)
            # ret = re.search(d['regex'], text)
            if ref_number:
                prefix = d.get('prefix', '')
                ref_number = f'{prefix}{ref_number}'
                print(d['name'], ref_number)
                name = d['name']
                duplicate = models.Document.objects.filter(ref_number=ref_number, truck=truck).first()
                if duplicate:
                    errors.append({
                        'key': d['key'],
                        'name': d['name'],
                        'message': f'Duplicate {name} document',
                        'mandatory': d['mandatory']
                    })
                else:
                    docs.append({
                        'ref_number': ref_number,
                        'file': file,
                        'sale': sale,
                        'doc_type': name,
                        'truck': truck,
                        'user': request.user
                    })
            else:
                name = d['name']
                errors.append({
                    'key': d['key'],
                    'name': d['name'],
                    'message': f'Invalid {name} document',
                    'mandatory': d['mandatory']
                })
        print()
        print("======================")
        if len(list(filter(lambda x: x['mandatory'], errors))):
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
                exist = models.Document.objects.filter(doc_type=doc['doc_type'], sale=sale).first()
                models.Document.objects.create(**doc)
                if exist:
                    models.Document.objects.get(pk=exist.id).delete()
            return Response({
                'status': 0,
                'message': f'Successfully uploaded documents',
                'errors': errors
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
            if p == 'zoom':
                args[p] = float(params.get(p))
            else:
                args[p] = int(params.get(p))
        print('Args: ', args)
        with ocr.Timer("Elapsed time to extract text: {:,.2f} ms"):
            schema = None
            for d in imports.docs_schema():
                if d['letter'] != letter:
                    continue
                schema = d
                prefix = d.get('prefix', '')
                regex = d['regex']
                # ref_number = ocr.new_extract_from_file(regex, pdf_data, **args)
                ref_number = ocr2.extract_ref_number(pdf_data, regex, **args)
                if 'corrections' in d:
                    ref_number = ocr2.apply_corrections(ref_number, d['corrections'])
                print(ref_number)
                # print(regex)
                # ret = re.search(regex, text)
                if ref_number:
                    return Response({
                        'status': 0,
                        'message': 'Successfully extracted text',
                        'text': f'{prefix}{ref_number}',
                        'name': d['name'],
                    })

        return Response({
            'status': -1,
            'message': 'System was not able to validate the document',
            'text': ref_number,
            'schema': schema
        })
