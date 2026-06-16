from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .api_views import ProductViewSet, CategoryViewSet, ManufacturerViewSet, CartViewSet, CartItemViewSet, MeView, MyOrdersView

#API маршруты
router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'manufacturers', ManufacturerViewSet)
router.register(r'carts', CartViewSet)
router.register(r'cart-items', CartItemViewSet)

urlpatterns = [
    path('api/me/', MeView.as_view(), name='api_me'),
    path('api/orders/', MyOrdersView.as_view(), name='api_orders'),
    path('api/', include(router.urls)),
    path('signup/', views.signup, name='signup'),
    path('profile/', views.profile_view, name='profile'),
    path('settings/', views.settings_view, name='settings'),
    path('', views.index, name='index'),
    path('catalog/', views.product_list, name='product_list'),
    path('catalog/<int:pk>/', views.product_detail, name='product_detail'),
    path('about_us', views.about_us, name='about us'),
    path('about_shop', views.about_shop, name="about shop (laba)"),
    path("about", views.about),
    path('cart/', views.cart_view, name='cart_view'),
    path('cart/add/<int:product_id>/', views.add_to_cart, name='add_to_cart'),
    path('cart/update/<int:item_id>/', views.update_cart, name='update_cart'),
    path('cart/remove/<int:item_id>/', views.remove_from_cart, name='remove_from_cart'),
    path('checkout/', views.checkout, name='checkout'),
    path('checkout/success/', views.checkout_success, name='checkout_success'),
]
