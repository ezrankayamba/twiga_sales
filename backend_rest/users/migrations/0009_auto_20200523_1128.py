# Generated by Django 3.0.6 on 2020-05-23 08:28

from django.db import migrations
import multiselectfield.db.fields


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_auto_20200523_1048'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='privileges',
            field=multiselectfield.db.fields.MultiSelectField(choices=[('Users.manage', 'Manage users'), ('Roles.manage', 'Manage roles'), ('Sales.manage', 'Manage sales'), ('Sales.view', 'View sales'), ('Sales.view.docs', 'View sales documents'), ('Sales.manage.docs', 'Manage sale documents'), ('Sales.reports', 'Sales reports'), ('Sales.view.invoices', 'View Invoices'), ('Sales.create.invoice', 'Create Invoice'), ('Sales.update.invoice', 'Update Invoice')], max_length=159, null=True),
        ),
    ]