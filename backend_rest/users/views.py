from rest_framework import generics, permissions
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope
from . import serializers
from . import models
from . import choices
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, renderer_classes
from django.contrib.auth import authenticate
import string
import random
from core import mailsender as m


def gen_default_pass():
    letters = string.ascii_letters
    d_pass = ''.join(random.choice(letters) for i in range(8))
    return d_pass


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

    def agent_id(self, data):
        return int(data['agent']) if 'agent' in data and data['agent'] else None

    def post(self, request, format=None):
        data = request.data
        d_pass = gen_default_pass()
        user = User.objects.create_user(username=data['username'], password=d_pass, email=data['email'])
        profile = user.profile
        profile.role_id = data['role']
        profile.agent_id = self.agent_id(data)
        profile.save()

        # agent_code = data.get('agent_code', None)
        # commission = data.get('commission', 0)
        # if agent_code:
        #     models.Agent.objects.create(user=user, code=agent_code, commission=commission)
        link_url = request.META.get('HTTP_REFERER')
        html = f'''
            <p>You have been created with username: {user.username} and default password: {d_pass}. <a href="{link_url}" style="text-decoration: none; border: 1px solid #999; padding: .2em .4em; border-radius: .4em;">Login</a></p>
            <br/>
            <p>Regards, Admin</p>
            '''
        m.send_mail(to=[user.email], text=html, subject='User Registration')

        return Response({
            'status': 0,
            'message': f'Successfully created user'
        })

    def put(self, request, pk, format=None):
        data = request.data
        print('Data: ', data)

        user = User.objects.get(pk=pk)
        user.email = data['email']
        user.save()
        profile = user.profile
        profile.role_id = data['role']
        profile.agent_id = self.agent_id(data)
        profile.save()

        # agent_code = data.get('agent_code', None)
        # commission = data.get('commission', None)
        # if not commission:
        #     commission = 0.00
        # agent = None
        # try:
        #     agent = user.agent
        # except Exception as e:
        #     pass
        # if not agent:
        #     if agent_code:
        #         models.Agent.objects.create(user=user, code=agent_code, commission=commission)
        # else:
        #     agent.code = agent_code
        #     agent.commission = commission
        #     agent.save()

        return Response({
            'status': 0,
            'message': f'Successfully updated user'
        })


class ManagePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    required_scopes = []

    def post(self, request, format=None):
        data = request.data

        user = authenticate(username=request.user.username, password=data.get('password'))
        result = -1
        if user:
            user.set_password(data.get('new_password'))
            user.save()
            result = 0
        return Response({
            'status': result,
            'message': f'Successfully upmdated password' if result == 0 else 'Password update failed, check your crendentials'
        })


class ManageMyProfilePhotoView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    required_scopes = []

    def post(self, request, format=None):
        photo = request.FILES['photo']

        user = request.user
        result = -1
        if user and photo:
            p = user.profile
            p.image = photo
            p.save()
            result = 0
        return Response({
            'status': result,
            'message': f'Successfully updated profile photo' if result == 0 else 'Photo update failed, check your inputs'
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


@api_view()
def agents(request):
    lst = [{'id': "", 'name': 'Not applicable'}] + [{'id': int(x.id), 'name': str(x)} for x in models.Agent.objects.all()]
    print(lst)
    return Response(lst)
