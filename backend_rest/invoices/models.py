from django.db import models
from django.contrib.auth.models import User
from users import models as u_models


class Invoice(models.Model):
    number = models.CharField(max_length=20)
    commission = models.DecimalField(max_digits=20, decimal_places=2)
    agent = models.ForeignKey(u_models.Agent, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=20, decimal_places=2)
    value = models.DecimalField(max_digits=20, decimal_places=2)
    status = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now=False, auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, auto_now_add=False, null=True)


class InvoiceDoc(models.Model):
    DOC_LETTER = "Letter"
    DOC_INVOICE = "Invoice"
    ref_number = models.CharField(max_length=20)
    description = models.CharField(max_length=100, blank=True, null=True)
    doc_type = models.CharField(max_length=10)
    file = models.FileField(upload_to='docs/')
    invoice = models.ForeignKey('Invoice', related_name='docs', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now=False, auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, auto_now_add=False, null=True)

    def __str__(self):
        return f'{self.ref_number} - {self.doc_type}'

    class Meta:
        ordering = ['-created_at']
        unique_together = ['ref_number', 'doc_type']
