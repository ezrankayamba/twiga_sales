# Generated by Django 3.0.6 on 2020-08-03 18:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0006_sale_task'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='sale',
            name='task',
        ),
    ]
