# Generated by Django 3.0.6 on 2020-06-10 15:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sales', '0027_auto_20200605_1624'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='document',
            unique_together={('ref_number', 'doc_type')},
        ),
        migrations.CreateModel(
            name='InvoiceDocument',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ref_number', models.CharField(max_length=20)),
                ('description', models.CharField(blank=True, max_length=100, null=True)),
                ('doc_type', models.CharField(max_length=10)),
                ('file', models.FileField(upload_to='docs/')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
                ('invoice', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='docs', to='sales.Invoice')),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('ref_number', 'doc_type')},
            },
        ),
    ]
