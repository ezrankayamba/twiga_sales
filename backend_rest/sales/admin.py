from django.contrib import admin
from . import models


@admin.register(models.Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['id', 'sales_order', 'customer_name', 'destination', 'agent']
    search_fields = ['sales_order', 'customer_name']
    list_filter = ['destination']


# admin.site.register(models.Sale)
admin.site.register(models.Document)
admin.site.register(models.InvoiceDoc)
admin.site.register(models.Batch)
admin.site.register(models.AggregateDocument)
admin.site.register(models.AggregateSale)

# admin.site.register(models.Schema)
# admin.site.register(models.Params)
