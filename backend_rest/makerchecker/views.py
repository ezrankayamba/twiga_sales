from rest_framework import generics, permissions
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope
from . import serializers
from . import models
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from . import executor
from sales.models import Sale


class ManageTaskMakerChecker(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if 'pending' in request.GET and request.GET['pending']:
            res = models.Task.objects.filter(status=models.STATUS_INITIATED)
        else:
            res = models.Task.objects.all()
        return Response({'result': 0, 'message': 'Fetched tasks successfully', 'data': serializers.TaskSerializer(res, many=True).data, 'count': res.count()})

    def post(self, request):
        data = request.data
        data['maker'] = request.user
        task = models.Task.objects.create(**data)
        if task.task_type.name == 'Sales Documents Delete':
            Sale.objects.filter(pk=task.reference).update(task=task)
        return Response({'result': 0, 'message': f'Successfully created task approval request with id: {task.id}'})

    def put(self, request, task_id):
        task = models.Task.objects.get(pk=task_id)
        status = request.data['status']
        result = None
        # if (statusm == models.STATUS_APPROVED and not task.task_type.reverse) or (status == models.STATUS_REJECTED and task.task_type.reverse):
        #     func = getattr(executor, task.task_type.executor)
        #     result = func(task)
        #     print(result)
        if (status == models.STATUS_APPROVED or status == models.STATUS_REJECTED):
            func = getattr(executor, task.task_type.executor)
            result = func(task, status=status)
            print(result)
            task.checker_comment = request.data['checker_comment']
            task.checker = request.user
            task.status = status
            task.result = result
            task.save()

            return Response({'result': 0, 'message': f'Successfully updated task approval request with id: {task.id}'})

        return Response({'result': -1, 'message': f'Approval execution failed, seems not valid status : {task.id} => {status}'})


class TaskTypeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        name = request.data['name']
        tType = models.TaskType.objects.filter(name=name).first()
        return Response({'result': 0, 'message': f'Successfully fetched task type by name', 'data': serializers.TaskTypeSerializer(tType).data})
