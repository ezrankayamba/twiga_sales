from rest_framework import generics, permissions
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope
from . import serializers
from . import models
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import api_view, renderer_classes


class CustomerListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = ['customers']
    serializer_class = serializers.CustomerSerializer

    def get_queryset(self):
        return models.Customer.objects.all()

    def create(self, request, *args, **kwargs):
        data = request.data
        print(data)
        customer = models.Customer.objects.create(**data)
        return Response(self.get_serializer(customer).data)


class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    model = models.Customer
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = ['customers']
    serializer_class = serializers.CustomerSerializer

    def get_queryset(self):
        return models.Customer.objects.all()


class RecordListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = ['customers']
    serializer_class = serializers.RecordSerializer

    def get_queryset(self):
        return models.Record.objects.all()


class RecordDetailView(generics.RetrieveUpdateDestroyAPIView):
    model = models.Record
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = ['customers']
    serializer_class = serializers.RecordSerializer

    def get_queryset(self):
        return models.Record.objects.all()


class RegionListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = ['customers']
    serializer_class = serializers.RegionSerializer

    def get_queryset(self):
        return models.Region.objects.all()


class DistributorListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = ['customers']
    serializer_class = serializers.DistributorSerializer

    def get_queryset(self):
        return models.Distributor.objects.all()


@api_view(('GET',))
@renderer_classes((JSONRenderer,))
def cust_types(request):
    res = []
    for t in models.CUSTOMER_TYPES:
        res.append({'id': t[0], 'name': t[1]})
    return Response(res)
