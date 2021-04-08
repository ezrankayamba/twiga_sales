from django.contrib import admin
from . import models


@admin.register(models.Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['number', 'quantity', 'commission', 'status', 'agent']
    search_fields = ['agent__code', 'number']
    list_filter = ['agent__code']
# admin.site.register(models.Invoice)
