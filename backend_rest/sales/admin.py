from django.contrib import admin
from . import models

admin.site.register(models.Sale)
admin.site.register(models.Document)
admin.site.register(models.InvoiceDoc)
admin.site.register(models.Batch)
admin.site.register(models.Invoice)
admin.site.register(models.Schema)
admin.site.register(models.Params)
