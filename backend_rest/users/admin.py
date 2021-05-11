from django.contrib import admin
from . import models
from django import forms
from . import choices


class AuditAdmin(admin.ModelAdmin):
    list_display = ('method', 'path', 'ip_address', 'username', 'created_on', 'updated_on', 'status')
    search_fields = ['path', 'username']
    list_filter = ['method']


class AgentAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'commission')


admin.site.register(models.Role)
admin.site.register(models.Agent, AgentAdmin)
admin.site.register(models.Profile)
admin.site.register(models.Audit, AuditAdmin)
