from django.db import models
from django.contrib.auth.models import User
from users.choices import PRIVILEGE_CHOICES
from .executor import EXECUTOR_CHOICES
STATUS_INITIATED = 'INITIATED'
STATUS_APPROVED = 'APPROVED'
STATUS_REJECTED = 'REJECTED'
STATUS_CHOICES = [
    (STATUS_INITIATED, "Initiated"),
    (STATUS_APPROVED, "Approved"),
    (STATUS_REJECTED, "Rejected"),
]


class TaskType(models.Model):
    name = models.CharField(max_length=40)
    maker_privilege = models.CharField(max_length=40, choices=PRIVILEGE_CHOICES)
    checker_privilege = models.CharField(max_length=40, choices=PRIVILEGE_CHOICES)
    view_privilege = models.CharField(max_length=40, choices=PRIVILEGE_CHOICES)
    executor = models.CharField(max_length=40, choices=EXECUTOR_CHOICES)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Task(models.Model):
    maker = models.ForeignKey(User, on_delete=models.PROTECT, related_name="made_tasks")
    maker_comment = models.CharField(max_length=40,  blank=False)
    checker = models.ForeignKey(User, on_delete=models.PROTECT, related_name="checked_tasks", null=True)
    checker_comment = models.CharField(max_length=40, null=True)
    task_type = models.ForeignKey(TaskType, on_delete=models.PROTECT)
    reference = models.CharField(max_length=40, blank=False)
    status = models.CharField(max_length=20, default="INITIATED", choices=STATUS_CHOICES)
    result = models.CharField(max_length=100, null=True)
    created_at = models.DateTimeField(auto_now=False, auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, auto_now_add=False, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.task_type.name
