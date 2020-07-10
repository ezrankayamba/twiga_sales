from . import models
from rest_framework import serializers
from sales.serializers import SaleSerializer
from users.serializers import UserSerializer, AgentSerializer


class InvoiceDocSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.InvoiceDoc
        fields = '__all__'


class InvoiceSerializer(serializers.ModelSerializer):
    sales = SaleSerializer(many=True, read_only=True)
    agent = AgentSerializer(many=False, read_only=True)
    docs = InvoiceDocSerializer(many=True, read_only=True)

    class Meta:
        model = models.Invoice
        fields = '__all__'
