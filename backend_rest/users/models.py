from django.db import models
from django.contrib.auth.models import User
from PIL import Image
from . import choices
from django.urls import reverse
from multiselectfield import MultiSelectField


class Role(models.Model):
    name = models.CharField(max_length=40, unique=True)
    description = models.CharField(max_length=100, null=True, blank=True)
    privileges = MultiSelectField(choices=choices.PRIVILEGE_CHOICES, null=True)
    created_at = models.DateTimeField(auto_now=False, auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, auto_now_add=False, null=True)

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('role-list')

    class Meta:
        ordering = ['-created_at']


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(default='default.jpg', upload_to='users/profile_photos/')
    change_password = models.BooleanField(default=True)
    date_created = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    date_updated = models.DateTimeField(auto_now=True, null=True, blank=True)
    created_by = models.ForeignKey(to=User, related_name="created_profiles",
                                   on_delete=models.PROTECT, null=True, blank=True)
    updated_by = models.ForeignKey(to=User, related_name="updated_profiles",
                                   on_delete=models.PROTECT, null=True, blank=True)
    role = models.ForeignKey(to=Role, related_name='profiles', on_delete=models.PROTECT, null=True)

    def __str__(self):
        return f'{self.user.username}'

    def save(self, *args, **kwargs):
        super(Profile, self).save(*args, **kwargs)
        img = Image.open(self.image.path)
        if img.height > 300 or img.width > 300:
            output_size = (300, 300)
            img.thumbnail(output_size)
            img.save(self.image.path)


class Agent(models.Model):
    code = models.CharField(max_length=20, unique=True)
    commission = models.DecimalField(max_digits=10, decimal_places=2)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='agent')
