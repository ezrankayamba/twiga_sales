from rest_framework import generics, permissions
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope
from . import serializers
from . import models
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.parsers import FormParser, MultiPartParser
from . import imports
from django.db.models import Count


class SaleListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = []
    serializer_class = serializers.SaleSerializer

    def get_queryset(self):
        return models.Sale.objects.all()

    def create(self, request, *args, **kwargs):
        data = request.data
        print(data)
        entity = models.Sale.objects.create(**data)
        return Response(self.get_serializer(entity).data)


class ImportSalesView(APIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = ['sales']
    parser_classes = [FormParser, MultiPartParser]

    def post(self, request, format=None):
        excel_file = request.FILES['file']
        imports.import_sales(excel_file)
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
        agent_code = request.data['agent_code']
        imports.import_docs(file, agent_code)
        return Response({
            'status': 0,
            'message': f'Successfully uploaded documents'
        })


class SaleDocsView(APIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = []
    parser_classes = [FormParser, MultiPartParser]

    def post(self, request, format=None):
        data = request.data
        print(data)
        sale = models.Sale.objects.get(pk=data['sale_id'])

        c2_doc = request.FILES['c2_doc']
        exit_doc = request.FILES['exit_doc']
        assessment_doc = request.FILES['assessment_doc']

        c2_ref = data['c2_ref']
        exit_ref = data['exit_ref']
        assessment_ref = data['assessment_ref']

        quantity = data['quantity']
        total_value = data['total_value']

        if sale.quantity == quantity and sale.total_value == total_value:
            models.Document.objects.create(ref_number=c2_ref, file=c2_doc, sale=sale, doc_type=models.Document.DOC_C2)
            models.Document.objects.create(ref_number=exit_ref, file=exit_doc, sale=sale, doc_type=models.Document.DOC_EXIT)
            models.Document.objects.create(ref_number=assessment_ref, file=assessment_doc, sale=sale, doc_type=models.Document.DOC_ASSESSMENT)
            sale.agent = request.user.agent
            sale.save()
            return Response({
                'status': 0,
                'message': f'Successfully uploaded documents'
            })
        else:
            return Response({
                'status': -1,
                'message': f'Data mismatch'
            })


class SaleSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = []
    parser_classes = [FormParser, MultiPartParser]

    def get(self, request, format=None):
        with_docs = models.Sale.objects.filter(agent__isnull=False).count()
        no_docs = models.Sale.objects.filter(agent__isnull=True).count()
        return Response({
            'status': 0,
            'summary': [
                {'name': 'Sales with Docs', 'value': with_docs, 'color': "#33FF33"},
                {'name': 'Sales without Docs', 'value': no_docs, 'color': "#FF3333"}
            ]
        })
