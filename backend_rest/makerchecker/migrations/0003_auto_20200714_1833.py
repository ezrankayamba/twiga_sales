# Generated by Django 3.0.6 on 2020-07-14 15:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('makerchecker', '0002_auto_20200711_2124'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='status',
            field=models.CharField(choices=[('INITIATED', 'Initiated'), ('APPROVED', 'Approved'), ('REJECTED', 'Rejected')], default='INITIATED', max_length=20),
        ),
    ]
