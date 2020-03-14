from rest_framework import generics, permissions
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope
from . import serializers
from . import models
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response


class UserListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = ['users']
    serializer_class = serializers.UserSerializer

    def get_queryset(self):
        return User.objects.all().order_by('-date_joined')


class RoleListView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = ['users']
    serializer_class = serializers.RoleSerializer

    def paginate_queryset(self, queryset):
        return None

    def get_queryset(self):
        return models.Role.objects.all()


class CreateUserView(APIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = ['users']

    def post(self, request, format=None):
        data = request.data

        user = User.objects.create_user(username=data['username'], password='testing321')
        profile = user.profile
        profile.role_id = data['role']
        profile.save()
        return Response({
            'status': 0,
            'message': f'Successfully created user'
        })


class MyUserDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = ['read']
    serializer_class = serializers.UserSerializer

    def get_object(self):
        return User.objects.get(pk=self.request.user.id)


class ManageUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = ['read']
    serializer_class = serializers.UserSerializer

    def get_queryset(self):
        return models.User.objects.all()
