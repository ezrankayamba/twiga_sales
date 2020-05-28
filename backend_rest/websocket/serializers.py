from . import models
from django.contrib.auth.models import User
from rest_framework import serializers


class CallGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CallGroup
        fields = "__all__"
