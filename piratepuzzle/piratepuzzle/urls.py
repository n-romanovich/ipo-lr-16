from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from shop.views import PirateLoginView, media_serve, static_serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/login/', PirateLoginView.as_view(template_name='registration/login.html'), name='login'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('media/<path:path>', media_serve, name='media_serve'),
    path('static/<path:path>', static_serve, name='static_serve'),
    path('', include('shop.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
