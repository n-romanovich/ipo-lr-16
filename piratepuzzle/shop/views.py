from django.shortcuts import render
from .models import Product

#Главная страница магазина
def home(request):
    items = Product.objects.all()
    return render(request, 'shop/index.html', {'items': items})

#Страница об авторе лабы
def about_us(request):
    return render(request, 'shop/about_us.html')

#Страница с информацией о ЛР №16-18
def about_shop(request):
    return render(request, 'shop/about_shop.html')

#Страница с ссылками на информацию об аторе и лр
def about(request):
    return render(request, 'shop/about.html')