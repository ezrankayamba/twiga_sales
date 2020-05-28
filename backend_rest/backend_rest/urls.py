from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

context_path = 'api/'

urlpatterns = [
    path(f'{context_path}admin/', admin.site.urls),
    path(f'{context_path}oauth2/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    path(f'{context_path}users/', include('users.urls')),
    path(f'{context_path}', include('sales.urls')),
    path(f"{context_path}ws/", include("websocket.urls")),
    path('', include('web.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
