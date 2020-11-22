from makerchecker.executor import EXECUTOR_CHOICES

PRIVILEGE_CHOICES = [
    ('Users.manage', 'Manage users'),
    ('Roles.manage', 'Manage roles'),
    ('Sales.manage', 'Manage sales'),
    ('Sales.view', 'View sales'),
    ('Sales.view.docs', 'View sales documents'),
    ('Sales.manage.docs', 'Manage sale documents'),
    ('Sales.reports', 'Sales reports'),
    ('Sales.view.invoices', 'View Invoices'),
    ('Sales.create.invoice', 'Create Invoice'),
    ('Sales.update.invoice', 'Update Invoice'),
    ('Sales.invoice.CrDrnote', 'Attach CrDr Note'),
]

PRIVILEGE_CHOICES.extend(list(map(lambda x: (f'{x[0]}_maker', f'{ x[1]} Maker'), EXECUTOR_CHOICES)))
PRIVILEGE_CHOICES.extend(list(map(lambda x: (f'{x[0]}_checker', f'{ x[1]} Checker'), EXECUTOR_CHOICES)))
PRIVILEGE_CHOICES.extend(list(map(lambda x: (f'{x[0]}_view', f'{ x[1]} View'), EXECUTOR_CHOICES)))
