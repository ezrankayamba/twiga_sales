from . import models
from rest_framework import serializers
from users.serializers import UserSerializer, AgentSerializer
from makerchecker.serializers import TaskSerializer
from django.db import models as db_models


class DocumentSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Document
        fields = '__all__'


class AggregateDocumentSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.AggregateDocument
        fields = '__all__'


class BatchSerializer(serializers.ModelSerializer):
    user = UserSerializer(many=False, read_only=True)

    class Meta:
        model = models.Batch
        fields = '__all__'


class AggregateSaleSerializer(serializers.ModelSerializer):
    docs = AggregateDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = models.AggregateSale
        fields = '__all__'


class SaleSerializer(serializers.ModelSerializer):
    docs = DocumentSerializer(many=True, read_only=True)
    agent = AgentSerializer(many=False, read_only=True)
    task = TaskSerializer(many=False, read_only=True)
    aggregate = AggregateSaleSerializer(many=False, read_only=True)
    doc_count = serializers.IntegerField(read_only=True)
    mandatory_size = serializers.IntegerField(read_only=True)

    class Meta:
        model = models.Sale
        fields = '__all__'
