from django.contrib import admin
from . import models

admin.site.register(models.Customer)
admin.site.register(models.Distributor)
admin.site.register(models.Region)
admin.site.register(models.Record)
