from django.urls import path, include
from . import views

urlpatterns = [
    path('customers', views.CustomerListView.as_view()),
    path('regions', views.RegionListView.as_view()),
    path('types', views.cust_types),
    path('distributors', views.DistributorListView.as_view()),
    path('customers/<int:pk>', views.CustomerDetailView.as_view()),
]
