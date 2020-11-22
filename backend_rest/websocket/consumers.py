from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
import json
from . import models
from functools import reduce


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = "events"
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    def receive(self, text_data):
        message = json.loads(text_data)
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {"type": "broadcast", "message": message},
        )

    def broadcast(self, event):
        message = event["message"]
        print("Broadcast: ", message)
        self.send(text_data=json.dumps(message))

    def events_alarm(self, event):
        print("Alarm: ", event)
        self.send(text_data=json.dumps(event))
