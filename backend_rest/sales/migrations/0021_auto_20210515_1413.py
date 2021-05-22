# Generated by Django 3.1.6 on 2021-05-15 11:13

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('sales', '0020_auto_20210504_2213'),
    ]

    operations = [
        migrations.CreateModel(
            name='DocumentView',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ref_number', models.CharField(max_length=20)),
                ('description', models.CharField(blank=True, max_length=100, null=True)),
                ('doc_type', models.CharField(max_length=10)),
                ('truck', models.CharField(default='trailer', max_length=10)),
                ('file', models.FileField(upload_to='docs/')),
                ('created_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
            ],
            options={
                'db_table': 'vw_sale_documents',
                'managed': False,
            },
        ),
        migrations.AlterField(
            model_name='document',
            name='sale',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='docs_org', to='sales.sale'),
        ),
        migrations.AlterField(
            model_name='document',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='docs_org', to=settings.AUTH_USER_MODEL),
        ),
    ]