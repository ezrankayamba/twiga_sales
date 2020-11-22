from django.urls import path, include
from . import views
from . import reports

urlpatterns = [
    path('sales', views.SaleListView.as_view()),
    path('sales/<int:pk>', views.SaleDetailView.as_view()),
    path('sales/import', views.ImportSalesView.as_view()),
    path('sales/docs', views.SaleDocsView.as_view()),
    path('sales/docs/<int:sale_id>', views.SaleDocsView.as_view()),
    path('sales/docs/attach', views.UploadDocsView.as_view()),
    path('documents', views.DocumentListView.as_view()),
    path('documents/<int:pk>', views.DocumentDetailView.as_view()),
    path('sales/summary', reports.SaleSummaryView.as_view()),
    path('sales/testocr', views.TestOCRView.as_view()),
    path('reports/destination', reports.DestinationReportView.as_view()),
    path('sales/destinations', reports.destinations),
    path('reports/customers', reports.CustomerReportView.as_view()),
    path('reports/export', reports.SalesReportExport.as_view()),
    path('reports/search', reports.SalesReportList.as_view()),
    path('batches', views.BatchListView.as_view()),
    path('batches/unread', views.BatchUnreadView.as_view()),
]
