from . import models
from django.contrib.auth.models import User
from rest_framework import serializers


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Role
        fields = ('id', 'name', 'privileges')


class ProfileSerializer(serializers.ModelSerializer):
    role = RoleSerializer(many=False, read_only=True)

    class Meta:
        model = models.Profile
        fields = ('id', 'role', 'image')


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    profile = ProfileSerializer(many=False, read_only=True)

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username']
        )
        user.set_password(validated_data['password'])
        user.save()

        return user

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'profile')
