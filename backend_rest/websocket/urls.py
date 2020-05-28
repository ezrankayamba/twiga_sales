from django.urls import path, include
from . import views

urlpatterns = [
    path("callgroup", views.CallGroupView.as_view()),
    path("callgroup/<int:pk>", views.ManageCallGroupView.as_view()),
    path("chatroom/<int:pk>", views.ChatRoomView.as_view()),
    path("validate", views.AunthenticateView.as_view()),
]
