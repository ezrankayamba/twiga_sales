# Generated by Django 3.0.2 on 2020-03-16 07:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0002_auto_20200314_1815'),
    ]

    operations = [
        migrations.AlterField(
            model_name='document',
            name='ref_number',
            field=models.CharField(max_length=20, unique=True),
        ),
    ]
