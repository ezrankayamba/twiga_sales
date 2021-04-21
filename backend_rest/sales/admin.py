from django.contrib import admin
from . import models


@admin.register(models.Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['id', 'sales_order', 'customer_name', 'destination', 'agent']
    search_fields = ['sales_order', 'customer_name']
    list_filter = ['destination']


@admin.register(models.Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['ref_number', 'user', 'doc_type', 'truck', 'file']
    search_fields = ['sale__sales_order', 'ref_number', 'sale__customer_name']
    list_filter = ['sale__destination']


@admin.register(models.AggregateDocument)
class AggrDocumentAdmin(admin.ModelAdmin):
    list_display = ['ref_number', 'user', 'doc_type', 'file']
    search_fields = ['aggregate_sale__sales__sales_order', 'ref_number', 'aggregate_sale__sales__customer_name']
    list_filter = ['aggregate_sale__sales__destination']


@admin.register(models.AggregateSale)
class AggrSaleAdmin(admin.ModelAdmin):
    list_display = ['category_', 'cf_quantity', 'total_quantity', 'total_value', 'bal_quantity', 'bal_used_on']
    search_fields = ['sales__sales_order', 'sales__customer_name']
    list_filter = ['sales__destination']

    def category_(request, obj):
        cats = [(1, 'Rusumo'), (2, 'Kabanga & Rusumo Aggr'), (3, 'Kigoma Aggr')]
        cat = list(filter(lambda x: x[0] == obj.category, cats))
        return cat[0][1] if len(cat) else 'None'


@admin.register(models.Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ['user', 'file_in', 'file_out', 'status_', 'read']
    search_fields = ['file_in']
    list_filter = ['read']

    def status_(request, obj):
        return 'Processed' if obj.status == 1 else 'Pending'
