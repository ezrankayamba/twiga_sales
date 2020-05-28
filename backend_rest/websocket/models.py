from django.db import models


class CallGroup(models.Model):
    pin = models.CharField(max_length=100)
    offer = models.CharField(max_length=1000, null=True, blank=True)
    status = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now=False, auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, auto_now_add=False, null=True)
