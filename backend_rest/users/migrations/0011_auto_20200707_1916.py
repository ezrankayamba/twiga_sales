# Generated by Django 3.0.6 on 2020-07-07 16:16

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0010_audit'),
    ]

    operations = [
        migrations.RenameField(
            model_name='audit',
            old_name='request',
            new_name='method',
        ),
    ]