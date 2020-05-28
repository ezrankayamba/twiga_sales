from . import models
from rest_framework import serializers
from users.serializers import UserSerializer, AgentSerializer


class DocumentSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Document
        fields = '__all__'


class BatchSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Batch
        fields = '__all__'


class SaleSerializer(serializers.ModelSerializer):
    docs = DocumentSerializer(many=True, read_only=True)
    agent = AgentSerializer(many=False, read_only=True)

    class Meta:
        model = models.Sale
        fields = '__all__'


class InvoiceSerializer(serializers.ModelSerializer):
    sales = SaleSerializer(many=True, read_only=True)
    agent = AgentSerializer(many=False, read_only=True)

    class Meta:
        model = models.Invoice
        fields = '__all__'
