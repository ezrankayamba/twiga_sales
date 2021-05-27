from sales import models as m_sales


def delete_sale_docs(task, status):
    from .models import STATUS_APPROVED
    sale_id = int(task.reference)
    sale = m_sales.Sale.objects.get(pk=sale_id)
    if status == STATUS_APPROVED:
        m_sales.Document.objects.filter(sale_id=sale_id).delete()
        m_sales.Sale.objects.filter(pk=sale_id).update(agent=None, task=None)
        return f'Documents deleted successfully from sale: {sale.sales_order}'
    else:
        return f'Documents deleted successfully rejected for sale: {sale.sales_order}'


def waive_missing_c2(task, status):
    from .models import STATUS_APPROVED
    sale_id = int(task.reference)
    sale = m_sales.Sale.objects.get(pk=sale_id)
    if status == STATUS_APPROVED:
        m_sales.Document.objects.filter(sale_id=sale_id).update(status=1)
        m_sales.Sale.objects.filter(pk=sale_id).update(task=None)
        return f'Documents with missing C2 successfully approved for sale: {sale.sales_order}'
    else:
        m_sales.Document.objects.filter(sale_id=sale_id).delete()
        m_sales.Sale.objects.filter(pk=sale_id).update(agent=None, task=None)
        return f'Documents with missing C2 successfully rejected for sale: {sale.sales_order}'


EXECUTOR_CHOICES = [
    ('delete_sale_docs', 'Delete Sale Documents'),
    ('waive_missing_c2', 'Waive Missing C2 Sale Documents'),
]
