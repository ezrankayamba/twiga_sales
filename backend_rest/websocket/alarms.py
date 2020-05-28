from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import json

layer = get_channel_layer()


def trigger(user, data):
    async_to_sync(layer.group_send)('events', {
        'type': 'events.alarm',
        'user_id': user.id,
        'data': data
    })
