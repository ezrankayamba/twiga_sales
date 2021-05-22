# Generated by Django 3.1.6 on 2021-05-11 18:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('makerchecker', '0005_auto_20210322_1631'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tasktype',
            name='checker_privilege',
            field=models.CharField(choices=[('Home.dashboard', 'View Dashboard'), ('Users.manage', 'Manage users'), ('Roles.manage', 'Manage roles'), ('Sales.manage', 'Manage sales'), ('Sales.view', 'View sales'), ('Sales.view.docs', 'View sales documents'), ('Sales.manage.docs', 'Manage sale documents'), ('Sales.manage.docs.aggregate', 'Manage sale aggregate documents'), ('Sales.reports', 'Sales reports'), ('Sales.view.invoices', 'View Invoices'), ('Sales.create.invoice', 'Create Invoice'), ('Sales.update.invoice', 'Update Invoice'), ('Sales.invoice.CrDrnote', 'Attach CrDr Note'), ('delete_sale_docs_maker', 'Delete Sale Documents Maker'), ('delete_sale_docs_checker', 'Delete Sale Documents Checker'), ('delete_sale_docs_view', 'Delete Sale Documents View')], max_length=40),
        ),
        migrations.AlterField(
            model_name='tasktype',
            name='maker_privilege',
            field=models.CharField(choices=[('Home.dashboard', 'View Dashboard'), ('Users.manage', 'Manage users'), ('Roles.manage', 'Manage roles'), ('Sales.manage', 'Manage sales'), ('Sales.view', 'View sales'), ('Sales.view.docs', 'View sales documents'), ('Sales.manage.docs', 'Manage sale documents'), ('Sales.manage.docs.aggregate', 'Manage sale aggregate documents'), ('Sales.reports', 'Sales reports'), ('Sales.view.invoices', 'View Invoices'), ('Sales.create.invoice', 'Create Invoice'), ('Sales.update.invoice', 'Update Invoice'), ('Sales.invoice.CrDrnote', 'Attach CrDr Note'), ('delete_sale_docs_maker', 'Delete Sale Documents Maker'), ('delete_sale_docs_checker', 'Delete Sale Documents Checker'), ('delete_sale_docs_view', 'Delete Sale Documents View')], max_length=40),
        ),
        migrations.AlterField(
            model_name='tasktype',
            name='view_privilege',
            field=models.CharField(choices=[('Home.dashboard', 'View Dashboard'), ('Users.manage', 'Manage users'), ('Roles.manage', 'Manage roles'), ('Sales.manage', 'Manage sales'), ('Sales.view', 'View sales'), ('Sales.view.docs', 'View sales documents'), ('Sales.manage.docs', 'Manage sale documents'), ('Sales.manage.docs.aggregate', 'Manage sale aggregate documents'), ('Sales.reports', 'Sales reports'), ('Sales.view.invoices', 'View Invoices'), ('Sales.create.invoice', 'Create Invoice'), ('Sales.update.invoice', 'Update Invoice'), ('Sales.invoice.CrDrnote', 'Attach CrDr Note'), ('delete_sale_docs_maker', 'Delete Sale Documents Maker'), ('delete_sale_docs_checker', 'Delete Sale Documents Checker'), ('delete_sale_docs_view', 'Delete Sale Documents View')], max_length=40),
        ),
    ]