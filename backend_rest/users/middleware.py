from . import models
from datetime import datetime


class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.

        response = self.get_response(request)
        # Code to be executed for each request/response after
        # the view is called.

        username = request.user.username if request.user.is_authenticated else 'annonimous'
        req_data = {'path': request.path, 'method': request.method,
                    'ip_address': self.get_client_ip(request), 'username': username, 'status': response.status_code}
        audit = models.Audit.objects.create(**req_data)

        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
