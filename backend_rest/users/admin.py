from django.contrib import admin
from . import models
from django import forms
from . import choices


# class RolePrivilegeForm(forms.ModelForm):
#     privilege = forms.MultipleChoiceField(choices=choices.PRIVILEGE_CHOICES, widget=forms.SelectMultiple)

#     class Meta:
#         model = models.RolePrivilege
#         fields = ['role', 'privilege']


# class RolePrivilegeAdmin(admin.ModelAdmin):
#     form = RolePrivilegeForm


admin.site.register(models.Role)
admin.site.register(models.Agent)
admin.site.register(models.Profile)
