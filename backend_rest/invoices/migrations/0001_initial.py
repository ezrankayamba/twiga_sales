# Generated by Django 3.0.6 on 2020-07-09 15:48

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0013_remove_audit_response'),
    ]

    operations = [
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number', models.CharField(max_length=20)),
                ('commission', models.DecimalField(decimal_places=2, max_digits=20)),
                ('quantity', models.DecimalField(decimal_places=2, max_digits=20)),
                ('value', models.DecimalField(decimal_places=2, max_digits=20)),
                ('status', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
                ('agent', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='users.Agent')),
            ],
        ),
        migrations.CreateModel(
            name='InvoiceDoc',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ref_number', models.CharField(max_length=20)),
                ('description', models.CharField(blank=True, max_length=100, null=True)),
                ('doc_type', models.CharField(max_length=10)),
                ('file', models.FileField(upload_to='docs/')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
                ('invoice', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='docs', to='invoices.Invoice')),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('ref_number', 'doc_type')},
            },
        ),
    ]
