from django.urls import path, include
from . import views

urlpatterns = [
    path('makerchecker/types', views.TaskTypeView.as_view()),
    path('makerchecker', views.ManageTaskMakerChecker.as_view()),
    path('makerchecker/<int:task_id>', views.ManageTaskMakerChecker.as_view()),
]
