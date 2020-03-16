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
            'message': f'Successfully created -- records'
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
