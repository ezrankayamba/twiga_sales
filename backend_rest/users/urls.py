from django.urls import path, include
from . import views

urlpatterns = [
    path('me/', views.MyUserDetailView.as_view()),
    path('details/<int:pk>', views.ManageUserDetailView.as_view()),
    path('roles/<int:pk>', views.ManageRoleDetailView.as_view()),
    path('register-me/', views.CreateUserView.as_view()),
    path('', views.UserListView.as_view()),
    path('roles/', views.RoleListView.as_view()),
    path('create', views.CreateUserView.as_view()),
    path('update/<int:pk>', views.CreateUserView.as_view()),
    path('privileges', views.privileges),
    path('changepwd', views.ManagePasswordView.as_view()),
    path('my-photo', views.ManageMyProfilePhotoView.as_view()),
]
