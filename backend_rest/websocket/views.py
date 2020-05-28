from rest_framework import generics, permissions
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope
from . import serializers
from . import models
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
import json


class CallGroupView(generics.ListCreateAPIView):
    model = models.CallGroup
    permission_classes = [permissions.AllowAny]
    serializer_class = serializers.CallGroupSerializer


class ManageCallGroupView(generics.RetrieveUpdateDestroyAPIView):
    model = models.CallGroup
    permission_classes = [permissions.AllowAny]
    serializer_class = serializers.CallGroupSerializer
    queryset = models.CallGroup.objects.all()


class AunthenticateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        cg = models.CallGroup.objects.get(pk=data["id"])
        res = 0 if cg.pin == data["pin"] else -1
        msg = "Authenticated successfully"
        if res == -1:
            msg = "Validation failed"
        return Response({"result": res, "message": msg})


class ChatRoomView(APIView):
    permission_classes = [permissions.AllowAny]

    def put(self, request, pk):
        data = request.data
        cg = models.CallGroup.objects.get(pk=pk)
        cg.offer = json.dumps(data["offer"])
        cg.status = data["status"]
        cg.save()
        res = 0
        msg = "Chat room updated successfully"
        return Response({"result": res, "message": msg})
