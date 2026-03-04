from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User

#Модель категории товара
class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

#Модель производителя товара
class Manufacturer(models.Model):
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

#Модель товара
class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    photo = models.ImageField(upload_to='products/') 
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    stock = models.IntegerField(validators=[MinValueValidator(0)])
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    manufacturer = models.ForeignKey(Manufacturer, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

#Модель корзины, привязанной к конкретному пользователю
class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="Пользователь")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    def __str__(self):
        return f"Корзина пользователя {self.user.username}"

    #Вычисляет общую стоимость всех товаров в корзине
    def total_price(self):
        return sum(item.item_price() for item in self.items.all())


#Модель товара в корзине пользователя
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items', verbose_name="Корзина")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Товар")
    quantity = models.PositiveIntegerField(verbose_name="Количество")

    def __str__(self):
        return f"{self.product.name} ({self.quantity} шт.)"

    #Вычисляет стоимость элемента корзины (цена * кол-во товара в корзине)
    def item_price(self):
        return self.product.price * self.quantity

    #Валидация на то, что кол-во товара в корзине не превышает запас н складе
    def clean(self):
        """Валидация: количество не должно превышать остаток на складе (stock)"""
        if self.quantity > self.product.stock:
            raise ValidationError(
                f"Недостаточно товара на складе. Доступно: {self.product.stock}"
            )

    #Валидация  днных перед сохранением в БД
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)