from rest_framework import generics, permissions
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope
from . import serializers
from . import models
from . import choices
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, renderer_classes


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

        agent_code = data.get('agent_code', None)
        commission = data.get('commission', 0)
        if agent_code:
            models.Agent.objects.create(user=user, code=agent_code, commission=commission)

        return Response({
            'status': 0,
            'message': f'Successfully created user'
        })

    def put(self, request, pk, format=None):
        data = request.data

        user = User.objects.get(pk=pk)
        profile = user.profile
        profile.role_id = data['role']
        profile.save()

        agent_code = data.get('agent_code', None)
        commission = data.get('commission', None)
        if not commission:
            commission = 0.00
        agent = user.agent
        if not agent and agent_code:
            models.Agent.objects.create(user=user, code=agent_code, commission=commission)
        else:
            agent.code = agent_code
            agent.commission = commission
            agent.save()

        return Response({
            'status': 0,
            'message': f'Successfully updated user'
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


class ManageRoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, TokenHasScope]
    required_scopes = ['read']
    serializer_class = serializers.RoleSerializer

    def get_queryset(self):
        return models.Role.objects.all()


@api_view()
def privileges(request):
    return Response([{'id': x[0], 'name':x[1]} for x in choices.PRIVILEGE_CHOICES])
