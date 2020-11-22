from . import models
from django.contrib.auth.models import User
from rest_framework import serializers, fields
from multiselectfield import MultiSelectField
from users import choices


class RoleSerializer(serializers.ModelSerializer):
    privileges = fields.MultipleChoiceField(choices=choices.PRIVILEGE_CHOICES)

    class Meta:
        model = models.Role
        fields = ('id', 'name', 'privileges')


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Agent
        fields = '__all__'


class ProfileSerializer(serializers.ModelSerializer):
    role = RoleSerializer(many=False, read_only=True)

    class Meta:
        model = models.Profile
        fields = ('id', 'role', 'image')


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    profile = ProfileSerializer(many=False, read_only=True)
    agent = AgentSerializer(many=False, read_only=True)

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username']
        )
        user.set_password(validated_data['password'])
        user.save()

        return user

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'profile', 'agent')
