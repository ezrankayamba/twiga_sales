from . import models
from rest_framework import serializers
from users.serializers import UserSerializer


class DocumentSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Document
        fields = '__all__'


class SaleSerializer(serializers.ModelSerializer):
    docs = DocumentSerializer(many=True, read_only=True)

    class Meta:
        model = models.Sale
        fields = '__all__'
