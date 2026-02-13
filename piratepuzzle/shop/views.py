from django.shortcuts import render
from django.http import HttpResponse

def about(request):
    return HttpResponse("<h1>WELCOME!</h1><br><a href=http://127.0.0.1:8000/about_shop>О МАГАЗИНЕ (ЛАБА)</a><br><a href=http://127.0.0.1:8000/about_us>Об авторе</a>")


def about_us(request):
    return HttpResponse("<h1>АВТОР: РОМАНОВИЧ НИКТА</h1> <h2>Группа 88, Вариант 18</h2>")

def about_shop(request):
    return HttpResponse("Лабораторная работа №16 “Создание и базовая настройка приложений Django”")

def home(request):
    items_list = [
        {
            'name': 'Кубик Рубика 3x3 QiYi MoFangGe Thunderclap',
            'price': 45,
            'description': 'Это первая версия отличной бюджетной головоломки от компании MoFangGe'
        },
        {
            'name': 'Головоломка IQ - Твист',
            'price': 43,
            'description': 'Игра IQ-Твист безусловно заслуживает самого пристального внимания как взрослых любителей поломать голову, так и их юных коллег.'
        },
        {
            'name': 'Головоломка Racing N 3 (Метал)',
            'price': 23,
            'description': 'Головоломка на логику из металла, сложность 1 из 4.'
        },
    ]
    
    context = {
        'items': items_list
    }
    return render(request, "index.html", context)