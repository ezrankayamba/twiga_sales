# Generated by Django 3.1.6 on 2021-03-19 12:20

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('sales', '0008_sale_task'),
    ]

    operations = [
        migrations.CreateModel(
            name='AggregateSale',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cf_quantity', models.FloatField()),
                ('total_quantity', models.FloatField()),
                ('total_value', models.FloatField()),
                ('bal_quantity', models.FloatField()),
            ],
        ),
        migrations.AddField(
            model_name='sale',
            name='aggregate',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='sales', to='sales.aggregatesale'),
        ),
        migrations.CreateModel(
            name='AggregateDocument',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ref_number', models.CharField(max_length=20)),
                ('description', models.CharField(blank=True, max_length=100, null=True)),
                ('doc_type', models.CharField(max_length=20)),
                ('truck', models.CharField(default='trailer', max_length=10)),
                ('file', models.FileField(upload_to='docs/')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
                ('aggregate_sale', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='aggregate_docs', to='sales.aggregatesale')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='aggregate_docs', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('ref_number', 'doc_type')},
            },
        ),
    ]
