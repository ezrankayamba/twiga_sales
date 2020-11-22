from . import models
from rest_framework import serializers
from users.serializers import UserSerializer


class TaskTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.TaskType
        fields = '__all__'


class TaskSerializer(serializers.ModelSerializer):
    maker = UserSerializer(many=False, read_only=True)
    checker = UserSerializer(many=False, read_only=True)
    task_type = TaskTypeSerializer(many=False, read_only=True)

    class Meta:
        model = models.Task
        fields = '__all__'
