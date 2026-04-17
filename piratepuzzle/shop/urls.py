from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('catalog', views.home, name='home'),
    path('about_us', views.about_us, name='about us'),
    path('about_shop', views.about_shop, name="about shop (laba)"),
    path("about", views.about),
    
]
