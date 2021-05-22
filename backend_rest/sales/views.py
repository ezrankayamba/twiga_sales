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
from sequences import get_next_value
import concurrent
from .constants import SALE_DOCS_ASSIGN_SEQUENCE_KEY
from makerchecker.models import Task


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
            if self.get_filter('destination'):
                filt['destination__contains'] = self.get_filter('destination')
            filt_ref_num = self.get_filter('doc_ref')
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
    permission_classes = [permissions.IsAuthenticated]
    required_scopes = []
    serializer_class = serializers.SaleSerializer

    def get_queryset(self):
        return models.Sale.objects.all()


class DocumentListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
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

    def delete(self, request, sale_id, *args, **kwargs):
        models.Document.objects.filter(sale_id=sale_id).delete()
        return Response({'result': 0, 'message': 'Documents deleted successfully'})

    def post(self, request, format=None):
        data = request.data
        print(data)
        sale = models.Sale.objects.get(pk=data['sale_id'])
        truck = 'trailer' if sale.quantity >= models.TRUCK_THRESHOLD else 'head'
        category = list(map(lambda x: int(x), data['category'].split(','))) if 'category' in data and not data['category'] == 'null' else []
        missing_c2 = data['missing_c2'] if 'missing_c2' in data else 0
        print(category)

        errors = []
        docs = []

        aggr_doc_lookup = {
            'A': 3 in category,
            'C': 4 in category,
            'E': False
        }

        def is_aggregate(letter):
            return aggr_doc_lookup[letter]

        def extract(d):
            if d['key'] not in request.FILES:
                return
            if not d['letter'] in ['A', 'E', 'C']:
                return
            if d['letter'] == 'C' and missing_c2:
                return
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
                if 'replace' in d:
                    ref_number = re.sub(d['replace'], '', ref_number)
                prefix = d.get('prefix', '')
                ref_number = f'{prefix}{ref_number}'
                print(d['name'], ref_number)
                name = d['name']
                if is_aggregate(d['letter']):
                    duplicate = None
                else:
                    duplicate = models.Document.objects.filter(ref_number=ref_number, doc_type=name, truck=truck).first()
                if duplicate:
                    error = f'Duplicate {name} document with ref# {ref_number}; existing document attached to sale: {duplicate.sale.sales_order}'
                    errors.append({
                        'key': d['key'],
                        'name': d['name'],
                        'message': error,
                        'mandatory': d['mandatory']
                    })
                else:
                    docs.append({
                        'ref_number': ref_number,
                        'file': file,
                        'sale': sale,
                        'doc_type': name,
                        'truck': truck,
                        'user': request.user,
                        'letter': d['letter']
                    })
            else:
                name = d['name']
                errors.append({
                    'key': d['key'],
                    'name': d['name'],
                    'message': f'Invalid {name} document',
                    'mandatory': d['mandatory']
                })
        with concurrent.futures.ThreadPoolExecutor() as executor:
            results = executor.map(extract, imports.docs_schema())
            for i, result in enumerate(results):
                print(result)
        # for d in imports.docs_schema():
        #     extract(d)
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
            assess_doc = next(filter(lambda x: x['doc_type'] == 'Assessment', docs), None)
            c2_doc = next(filter(lambda x: x['doc_type'] == 'C2', docs), None)
            print(assess_doc, c2_doc)
            aggr_obj = None

            if is_aggregate('A') and assess_doc:
                aggr_doc = models.AggregateDocument.objects.filter(ref_number=assess_doc['ref_number'], doc_type=assess_doc['doc_type']).first()
                if not aggr_doc:
                    aggr_obj = models.AggregateSale.objects.create(cf_quantity=0, total_quantity=0, total_value=0, bal_quantity=0, category=2)
                    assess_doc['aggregate_sale'] = aggr_obj
                    assess_doc.pop('sale', None)
                    assess_doc.pop('truck', None)
                    assess_doc.pop('letter', None)
                    aggr_doc = models.AggregateDocument.objects.create(**assess_doc)
                    assess_doc['letter'] = 'A'
                else:
                    aggr_obj = aggr_doc.aggregate_sale

            if is_aggregate('C') and c2_doc:
                aggr_doc = models.AggregateDocument.objects.filter(ref_number=c2_doc['ref_number'], doc_type=c2_doc['doc_type']).first()
                if not aggr_doc:
                    # aggr_obj = models.AggregateSale.objects.create(cf_quantity=0, total_quantity=0, total_value=0, bal_quantity=0, category=2)
                    c2_doc['aggregate_sale'] = aggr_obj
                    c2_doc.pop('sale', None)
                    c2_doc.pop('truck', None)
                    c2_doc.pop('letter', None)
                    aggr_doc = models.AggregateDocument.objects.create(**c2_doc)
                    c2_doc['letter'] = 'C'
                else:
                    aggr_obj = aggr_doc.aggregate_sale
            agent = request.user.profile.agent
            sale.agent = agent
            sale.quantity2 = data['quantity2']
            sale.total_value2 = data['total_value2']
            sale.assign_no = sale.assign_no if sale.assign_no else get_next_value(SALE_DOCS_ASSIGN_SEQUENCE_KEY)
            sale.aggregate = aggr_obj
            if missing_c2:
                print("Creating missing C2 approval initiation: ", sale.id)
                name = 'Waive Missing C2 Sale Documents'
                tType = models.TaskType.objects.filter(name=name).first()
                t_info = {'reverse': True, 'task_type_id': tType.id, 'reference': sale.id, 'maker_comment': 'C2 is missing due to TRA system issue', 'maker': request.user}
                task = Task.objects.create(**t_info)
                sale.task = task
            sale.save()
            for doc in docs:
                print('Doc: ', doc)
                if is_aggregate(doc['letter']):
                    continue
                doc.pop('letter', None)
                models.Document.objects.create(**doc)
            return Response({
                'status': 0,
                'message': f'Successfully attached documents on sale: {sale.sales_order} and assigned serial no: {sale.assign_no} ',
                'errors': errors
            })


def test_poppler():
    import subprocess
    p = subprocess.Popen(["pdftoppm", "-h"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out, err = p.communicate()
    print(out, err)


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
                    if 'replace' in d:
                        ref_number = re.sub(d['replace'], '', ref_number)
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
