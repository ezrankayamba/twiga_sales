from django.contrib import admin
from . import models


@admin.register(models.Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['number', 'quantity', 'commission', 'status', 'agent']
    search_fields = ['agent__code', 'number']
    list_filter = ['agent__code']


@admin.register(models.InvoiceDoc)
class InvoiceDocAdmin(admin.ModelAdmin):
    list_display = ['invoice', 'ref_number', 'doc_type',  'file']
    search_fields = ['invoice__sales__sales_order', 'ref_number', 'invoice__sales__customer_name']
    list_filter = ['invoice__sales__destination']
