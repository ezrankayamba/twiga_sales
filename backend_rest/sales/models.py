from django.db import models
from django.contrib.auth.models import User
from users import models as u_models

TRUCK_THRESHOLD = 25.00


class Invoice(models.Model):
    number = models.CharField(max_length=20)
    commission = models.DecimalField(max_digits=20, decimal_places=2)
    agent = models.ForeignKey(u_models.Agent, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=20, decimal_places=2)
    value = models.DecimalField(max_digits=20, decimal_places=2)
    status = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now=False, auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, auto_now_add=False, null=True)


class Document(models.Model):
    DOC_ASSESSMENT = "Assessment"
    DOC_C2 = "C2"
    DOC_EXIT = "Exit"
    LETTER_ASSESSMENT = "A"
    LETTER_C2 = "C"
    LETTER_EXIT = "E"
    ref_number = models.CharField(max_length=20)
    description = models.CharField(max_length=100, blank=True, null=True)
    doc_type = models.CharField(max_length=10)
    truck = models.CharField(max_length=10, default='trailer')
    file = models.FileField(upload_to='docs/')
    sale = models.ForeignKey('Sale', related_name='docs', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now=False, auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, auto_now_add=False, null=True)

    def __str__(self):
        return f'{self.ref_number} - {self.doc_type}'

    class Meta:
        ordering = ['-created_at']
        unique_together = ['ref_number', 'doc_type', 'truck']


class Sale(models.Model):
    sales_order = models.CharField(max_length=100, unique=True)
    transaction_date = models.CharField(max_length=20)
    customer_name = models.CharField(max_length=100)
    delivery_note = models.CharField(max_length=100)
    vehicle_number = models.CharField(max_length=100)
    tax_invoice = models.CharField(max_length=100)
    product_name = models.CharField(max_length=100)
    quantity = models.DecimalField(decimal_places=2, max_digits=20)
    total_value = models.DecimalField(decimal_places=2, max_digits=20)
    quantity2 = models.DecimalField(decimal_places=2, max_digits=20, null=True)
    total_value2 = models.DecimalField(decimal_places=2, max_digits=20, null=True)
    destination = models.CharField(max_length=100)
    agent = models.ForeignKey(u_models.Agent, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now=False, auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, auto_now_add=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, related_name='sales')

    def __str__(self):
        return self.customer_name

    class Meta:
        ordering = ['-created_at']


class Batch(models.Model):
    user = models.ForeignKey(to=User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now=True, auto_now_add=False)
    file_in = models.FileField(upload_to='batches')
    file_out = models.FileField(upload_to='batches', null=True)
    status = models.IntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Batches'

    def __str__(self):
        return f'{self.user} - {self.created_at}'
