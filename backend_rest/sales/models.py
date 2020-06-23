from django.db import models
from django.contrib.auth.models import User
from users import models as u_models

TRUCK_THRESHOLD = 25.00


class NonStrippingCharField(models.CharField):
    def formfield(self, **kwargs):
        kwargs['strip'] = False
        return super(NonStrippingCharField, self).formfield(**kwargs)


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
    user = models.ForeignKey(User, related_name='docs', on_delete=models.PROTECT, null=True)
    created_at = models.DateTimeField(auto_now=False, auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, auto_now_add=False, null=True)

    def __str__(self):
        return f'{self.ref_number} - {self.doc_type}'

    class Meta:
        ordering = ['-created_at']
        unique_together = ['ref_number', 'doc_type']


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


class Sale(models.Model):
    sales_order = models.CharField(max_length=100, unique=True)
    transaction_date = models.CharField(max_length=20)
    customer_name = models.CharField(max_length=100)
    delivery_note = models.CharField(max_length=100)
    vehicle_number = models.CharField(max_length=100)
    vehicle_number_trailer = models.CharField(max_length=100, null=True, blank=True)
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
    read = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = 'Batches'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user} - {self.created_at}'


class Params(models.Model):
    x = models.IntegerField()
    y = models.IntegerField()
    h = models.IntegerField()
    w = models.IntegerField()
    threshold = models.IntegerField()

    def __str__(self):
        return f'{self.schema} params'


class Schema(models.Model):
    name = models.CharField(max_length=40)
    letter = models.CharField(max_length=40)
    key = models.CharField(max_length=40)
    regex = NonStrippingCharField(max_length=40)
    prefix = NonStrippingCharField(max_length=40, null=True, blank=True)
    params = models.OneToOneField(Params, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
