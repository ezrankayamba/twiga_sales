from sales import models as m_sales


def delete_sale_docs(task):
    sale_id = int(task.reference)
    m_sales.Document.objects.filter(sale_id=sale_id).delete()
    sale = m_sales.Sale.objects.get(pk=sale_id)
    sale.update(agent=None, task=None)
    return f'Documents deleted successfully from sale: {sale.sales_order}'


EXECUTOR_CHOICES = [
    ('delete_sale_docs', 'Delete Sale Documents')
]
