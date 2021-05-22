from sales import models as m_sales


def delete_sale_docs(task):
    sale_id = int(task.reference)
    m_sales.Document.objects.filter(sale_id=sale_id).delete()
    m_sales.Sale.objects.filter(pk=sale_id).update(agent=None, task=None)
    sale = m_sales.Sale.objects.get(pk=sale_id)
    return f'Documents deleted successfully from sale: {sale.sales_order}'


def waive_missing_c2(task):
    sale_id = int(task.reference)
    m_sales.Document.objects.filter(sale_id=sale_id).delete()
    m_sales.Sale.objects.filter(pk=sale_id).update(agent=None, task=None)
    sale = m_sales.Sale.objects.get(pk=sale_id)
    return f'Documents deleted successfully from sale: {sale.sales_order}'


EXECUTOR_CHOICES = [
    ('delete_sale_docs', 'Delete Sale Documents'),
    ('waive_missing_c2', 'Waive Missing C2 Sale Documents'),
]
