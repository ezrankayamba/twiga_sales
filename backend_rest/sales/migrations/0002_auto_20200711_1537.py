# Generated by Django 3.0.6 on 2020-07-11 12:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sale',
            name='assign_no',
            field=models.CharField(max_length=22, null=True),
        ),
    ]
