from . import models
from rest_framework import serializers
from users.serializers import UserSerializer, AgentSerializer


class DocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = models.Document
        fields = '__all__'

    def get_file_url(self, doc):
        request = self.context.get('request')
        url = request.build_absolute_uri(doc.file.url)
        print('Url: ', url)
        return url


class SaleSerializer(serializers.ModelSerializer):
    docs = DocumentSerializer(many=True, read_only=True)
    agent = AgentSerializer(many=False, read_only=True)

    class Meta:
        model = models.Sale
        fields = '__all__'
