from django.urls import path, include
from . import views

urlpatterns = [
    path('invoices', views.InvoiceListView.as_view()),
    path('invoices/sales/<int:invoice_id>', views.InvoiceSaleListView.as_view()),
    path('invoices/export', views.InvoiceReportExportView.as_view()),
    path('invoices/docs', views.InvoiceDocsView.as_view()),
    path('invoices/docs/<int:invoice_id>', views.InvoiceDocsView.as_view()),
    path('invoices/manage', views.InvoiceManageView.as_view()),
    path('invoices/manage/<int:invoice_id>', views.InvoiceManageView.as_view()),
]
