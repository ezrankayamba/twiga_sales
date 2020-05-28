from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path("chat/ws/", consumers.ChatConsumer),
]
