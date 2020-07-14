from rest_framework import generics, permissions
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope
from . import serializers
from . import models
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from . import executor


class ManageTaskMakerChecker(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({'result': 0, 'message': 'Fetched tasks successfully', 'data': []})

    def post(self, request):
        data = request.data
        data['maker'] = request.user
        task = models.Task.objects.create(**data)
        return Response({'result': 0, 'message': f'Successfully created task approval request with id: {task.id}'})

    def put(self, request, task_id):
        task = models.Task.objects.get(pk=task_id)
        status = request.data['status']
        if status == 'APPROVE':
            func = getattr(executor, task.executor)
            result = func(task)
        task.maker_comment = request.data['maker_comment']
        task.maker = request.user
        task.status = status
        task.result = result
        task.save()

        return Response({'result': 0, 'message': f'Successfully updated task approval request with id: {task.id}'})


class TaskTypeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        name = request.data['name']
        tType = models.TaskType.objects.filter(name=name).first()
        return Response({'result': 0, 'message': f'Successfully fetched task type by name', 'data': serializers.TaskTypeSerializer(tType).data})
