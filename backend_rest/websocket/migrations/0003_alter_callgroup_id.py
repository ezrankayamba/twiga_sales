# Generated by Django 3.2.3 on 2021-05-22 11:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('websocket', '0002_auto_20200525_0010'),
    ]

    operations = [
        migrations.AlterField(
            model_name='callgroup',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]
