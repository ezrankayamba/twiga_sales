from . import models
from rest_framework import serializers
from users.serializers import UserSerializer


class DocumentSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Document
        fields = '__all__'


class SaleSerializer(serializers.ModelSerializer):
    c2_doc = DocumentSerializer(many=False, read_only=True)
    assessment_doc = DocumentSerializer(many=False, read_only=True)
    exit_doc = DocumentSerializer(many=False, read_only=True)

    class Meta:
        model = models.Sale
        fields = '__all__'
