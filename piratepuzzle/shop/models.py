from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


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


#Модель заказа пользователя
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Пользователь")
    address = models.TextField(verbose_name="Адрес доставки")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата заказа")
    total_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Общая стоимость")

    def __str__(self):
        return f"Заказ #{self.id} — {self.user.username}"


#Модель товара в заказе
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name="Заказ")
    product_name = models.CharField(max_length=200, verbose_name="Название товара")
    quantity = models.PositiveIntegerField(verbose_name="Количество")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Цена за единицу")

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"

    def item_price(self):
        return self.price * self.quantity


#Модель профиля пользователя
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="Пользователь")
    full_name = models.CharField(max_length=200, verbose_name="ФИО", blank=True)
    phone = models.CharField(max_length=20, verbose_name="Телефон", blank=True)
    address = models.TextField(verbose_name="Адрес доставки", blank=True)
    favorite_category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Любимая категория")
    city = models.CharField(max_length=100, verbose_name="Город доставки", blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name="Аватар")

    def __str__(self):
        return f"Профиль {self.user.username}"


#Сигнал — при создании пользователя автоматически создаётся профиль
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)