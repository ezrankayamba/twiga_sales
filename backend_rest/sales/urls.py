from django.urls import path, include
from . import views
from . import reports
# CreateAgentUserView
urlpatterns = [
    path('sales', views.SaleListView.as_view()),
    path('sales/<int:pk>', views.SaleDetailView.as_view()),
    path('sales/import', views.ImportSalesView.as_view()),
    path('sales/docs', views.SaleDocsView.as_view()),
    path('documents', views.DocumentListView.as_view()),
    path('documents/<int:pk>', views.DocumentDetailView.as_view()),
    path('sales/summary', reports.SaleSummaryView.as_view()),
    path('sales/testocr', views.TestOCRView.as_view()),
    path('reports/over-threshold-days', reports.OverThresholdDaysReportView.as_view()),
    path('reports/unmatched', reports.UnmatchedValuesReportView.as_view()),
    path('reports/export', reports.SalesReportExport.as_view()),
]
