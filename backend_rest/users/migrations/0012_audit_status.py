# Generated by Django 3.0.6 on 2020-07-07 16:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_auto_20200707_1916'),
    ]

    operations = [
        migrations.AddField(
            model_name='audit',
            name='status',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
