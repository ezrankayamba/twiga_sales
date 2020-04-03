from django.urls import path, include
from . import views
# CreateAgentUserView
urlpatterns = [
    path('sales', views.SaleListView.as_view()),
    path('sales/<int:pk>', views.SaleDetailView.as_view()),
    path('sales/import', views.ImportSalesView.as_view()),
    # path('sales/create-agent', views.CreateAgentUserView.as_view()),
    path('sales/docs', views.SaleDocsView.as_view()),
    path('documents', views.DocumentListView.as_view()),
    path('documents/<int:pk>', views.DocumentDetailView.as_view()),
    path('sales/summary', views.SaleSummaryView.as_view()),
]
