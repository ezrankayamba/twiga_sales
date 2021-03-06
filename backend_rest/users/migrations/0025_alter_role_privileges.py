# Generated by Django 3.2.3 on 2021-05-22 15:49

from django.db import migrations
import multiselectfield.db.fields


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0024_auto_20210522_1419'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='privileges',
            field=multiselectfield.db.fields.MultiSelectField(choices=[('Home.dashboard', 'View Dashboard'), ('Users.manage', 'Manage users'), ('Roles.manage', 'Manage roles'), ('Sales.manage', 'Manage sales'), ('Sales.view', 'View sales'), ('Sales.view.docs', 'View sales documents'), ('Sales.manage.docs', 'Manage sale documents'), ('Sales.manage.docs.aggregate', 'Manage sale aggregate documents'), ('Sales.reports', 'Sales reports'), ('Sales.view.invoices', 'View Invoices'), ('Sales.create.invoice', 'Create Invoice'), ('Sales.update.invoice', 'Update Invoice'), ('Sales.invoice.CrDrnote', 'Attach CrDr Note'), ('delete_sale_docs_maker', 'Delete Sale Documents Maker'), ('waive_missing_c2_maker', 'Waive Missing C2 Sale Documents Maker'), ('delete_sale_docs_checker', 'Delete Sale Documents Checker'), ('waive_missing_c2_checker', 'Waive Missing C2 Sale Documents Checker'), ('delete_sale_docs_view', 'Delete Sale Documents View'), ('waive_missing_c2_view', 'Waive Missing C2 Sale Documents View')], max_length=365, null=True),
        ),
    ]
