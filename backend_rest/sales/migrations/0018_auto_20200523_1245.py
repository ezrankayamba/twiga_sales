# Generated by Django 3.0.6 on 2020-05-23 09:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0017_auto_20200523_1231'),
    ]

    operations = [
        migrations.RenameField(
            model_name='invoice',
            old_name='commission_rate',
            new_name='commission',
        ),
    ]
