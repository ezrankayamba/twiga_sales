# Generated by Django 3.2.3 on 2021-05-22 11:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('makerchecker', '0006_auto_20210511_2133'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='tasktype',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]