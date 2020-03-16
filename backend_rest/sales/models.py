from django.db import models
from django.contrib.auth.models import User


class Document(models.Model):
    DOC_ASSESSMENT = "Assessment"
    DOC_C2 = "C2"
    DOC_EXIT = "Exit"
    ref_number = models.CharField(max_length=20, unique=True)
    description = models.CharField(max_length=100, blank=True, null=True)
    doc_type = models.CharField(max_length=10)
    file = models.FileField(upload_to='docs/')
    sale = models.ForeignKey('Sale', related_name='docs', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now=False, auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, auto_now_add=False, null=True)

    def __str__(self):
        return self.ref_number

    class Meta:
        ordering = ['-created_at']


class Sale(models.Model):
    sales_order = models.CharField(max_length=100, unique=True)
    transaction_date = models.CharField(max_length=20)
    customer_name = models.CharField(max_length=100)
    delivery_note = models.CharField(max_length=100)
    vehicle_number = models.CharField(max_length=100)
    tax_invoice = models.CharField(max_length=100)
    product_name = models.CharField(max_length=100)
    quantity = models.CharField(max_length=100)
    total_value = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    agent_name = models.CharField(max_length=100)
    agent_code = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now=False, auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, auto_now_add=False)

    def __str__(self):
        return self.customer_name

    class Meta:
        ordering = ['-created_at']
