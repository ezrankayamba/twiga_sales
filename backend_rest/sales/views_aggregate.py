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
from functools import reduce
from decimal import Decimal


DEST_COUNTRIES = ['BURUNDI_DIS', 'BURUNDI_DC', 'CONGO_DIS', 'CONGO_DC']


def outstanding_cf():
    prev_aggr = models.AggregateSale.objects.filter(bal_quantity__gt=0).first()
    return (prev_aggr.bal_quantity if prev_aggr else 0, prev_aggr)


class CustomerListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            'result': 0,
            'message': 'Fetched customers successfully',
            'data': models.Sale.objects.filter(destination__in=DEST_COUNTRIES, assign_no__isnull=True).values('customer_name').annotate(count=Count('customer_name')).order_by('customer_name'),
        })


class CustomerSalesListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data
        sales = models.Sale.objects.filter(destination__in=DEST_COUNTRIES, assign_no__isnull=True,
                                           customer_name=data['customer'], transaction_date__gte=data['dateFrom'], transaction_date__lte=data['dateTo'])
        return Response({
            'result': 0,
            'message': 'Fetched customer sales successfully',
            'data': serializers.SaleSerializer(sales, many=True).data,
        })


class AggregateOutstandingCF(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            'result': 0,
            'message': 'Fetched outstanding CF successfully',
            'data': outstanding_cf()[0]
        })


class AggregateSaleDocsView(APIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = []
    parser_classes = [FormParser, MultiPartParser]

    def post(self, request, format=None):
        data = request.data
        print(data)

        errors = []
        docs = []

        quantity2 = Decimal(data['quantity2'])
        total_value2 = Decimal(data['total_value2'])
        selected_sale_ids = list(map(lambda x: int(x), request.POST.getlist('selected[]')))

        def extract(d):
            if d['key'] not in request.FILES:
                return
            if not d['letter'] in ['R', 'AKG']:
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
                print("Extract Res: ", d['name'], ref_number)
                name = d['name']
                duplicate = models.AggregateDocument.objects.filter(ref_number=ref_number, doc_type=name).first()

                if duplicate:
                    error = f'Duplicate {name} document with ref# {ref_number}; existing document attached to aggregate sale'
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
                        'doc_type': name,
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
                print(errors)
        with concurrent.futures.ThreadPoolExecutor() as executor:
            results = executor.map(extract, imports.docs_schema())
            for i, result in enumerate(results):
                print(result)

        if len(list(filter(lambda x: x['mandatory'], errors))):
            print('Errors: ', errors)
            return Response({
                'status': -1,
                'message': f'Invalid document(s)',
                'errors': errors
            })
        try:
            sales = models.Sale.objects.filter(id__in=selected_sale_ids, assign_no__isnull=True)
            total_qty = reduce(lambda a, b: a + b, list(map(lambda x: x.quantity, sales)), 0)
            cf_quantity, prev_aggr = outstanding_cf()
            bal_quantity = (cf_quantity + quantity2) - total_qty
            new_aggr = models.AggregateSale.objects.create(cf_quantity=cf_quantity, total_quantity=quantity2, total_value=total_value2, bal_quantity=bal_quantity)
            for doc in docs:
                doc['aggregate_sale'] = new_aggr
                models.AggregateDocument.objects.create(**doc)
            for sale in sales:
                sale.aggregate = new_aggr
                sale.agent = request.user.agent
                sale.quantity2 = sale.quantity
                sale.total_value2 = sale.total_value
                sale.assign_no = sale.assign_no if sale.assign_no else get_next_value(SALE_DOCS_ASSIGN_SEQUENCE_KEY)
                sale.save()
            if prev_aggr:
                prev_aggr.bal_quantity = 0
                prev_aggr.bal_used_on = new_aggr

        except Exception as ex:
            print(ex)
            return Response({
                'status': -1,
                'message': f'Invalid document(s)',
                'errors': [{
                    'key': 'None',
                    'name': "Exception",
                    'message': str(ex),
                    'mandatory': False
                }]
            })

        return Response({
            'status': 0,
            'message': f'Successfully created aggregate data!',
            'errors': errors,
            'quantity2': quantity2,
            'total_value2': total_value2,
            'total_qty': total_qty,
            'bal_quantity': bal_quantity
        })
