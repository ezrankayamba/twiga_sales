# Generated by Django 3.1.6 on 2021-03-19 15:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0012_auto_20210319_1755'),
    ]

    operations = [
        migrations.AlterField(
            model_name='aggregatesale',
            name='bal_quantity',
            field=models.DecimalField(decimal_places=2, max_digits=38),
        ),
        migrations.AlterField(
            model_name='aggregatesale',
            name='cf_quantity',
            field=models.DecimalField(decimal_places=2, max_digits=38),
        ),
        migrations.AlterField(
            model_name='aggregatesale',
            name='total_quantity',
            field=models.DecimalField(decimal_places=2, max_digits=38),
        ),
        migrations.AlterField(
            model_name='aggregatesale',
            name='total_value',
            field=models.DecimalField(decimal_places=2, max_digits=38),
        ),
    ]