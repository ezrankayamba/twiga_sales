from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import Profile
from django.conf import settings
from django.template.loader import render_to_string
# from nots import gmail


# def notify_created(user):
#     sub = 'Successful regitstraion'
#     html_content = render_to_string('users/created_user_mail.html', {'user': user})
#     sender = 'PMT<nezatech.notifications@gmail.com>'
#     to = user.email
#     service = gmail.init_service()
#     message = gmail.create_message(sender, to, sub, html_content)
#     gmail.send_message(service, message)


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
        print(f'Profile for user {instance} created')
        # notify_created(instance)


@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    instance.profile.save()
