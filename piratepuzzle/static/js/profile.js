document.addEventListener('DOMContentLoaded', function() {
    loadProfile();
    loadOrders();
});

function loadProfile() {
    fetch('/api/me/')
        .then(function(response) {
            if (response.status === 401) {
                window.location.href = '/accounts/login/';
                return;
            }
            if (!response.ok) throw new Error('Ошибка загрузки');
            return response.json();
        })
        .then(function(data) {
            if (!data) return;
            renderProfile(data);
        })
        .catch(function() {
            document.getElementById('profileInfo').innerHTML =
                '<div class="alert alert-danger">Не удалось загрузить профиль</div>';
        });
}

function renderProfile(data) {
    var profile = data.profile || {};
    var role = data.is_staff ? 'Администратор' : 'Покупатель';
    var roleBadge = data.is_staff
        ? '<span class="badge bg-danger">Администратор</span>'
        : '<span class="badge bg-primary">Покупатель</span>';

    document.getElementById('inputFullName').value = profile.full_name || '';
    document.getElementById('inputPhone').value = profile.phone || '';
    document.getElementById('inputCity').value = profile.city || '';
    document.getElementById('inputAddress').value = profile.address || '';
    if (document.getElementById('inputFavoriteCategory')) {
        document.getElementById('inputFavoriteCategory').value = profile.favorite_category || '';
    }

    document.getElementById('profileInfo').innerHTML = [
        '<div class="text-center mb-3">',
            '<h4>' + escapeHtml(data.username) + '</h4>',
            '<p>' + roleBadge + '</p>',
        '</div>',
        '<ul class="list-group list-group-flush">',
            '<li class="list-group-item"><strong>Email:</strong> ' + escapeHtml(data.email || '—') + '</li>',
            '<li class="list-group-item"><strong>ФИО:</strong> ' + escapeHtml(profile.full_name || '—') + '</li>',
            '<li class="list-group-item"><strong>Телефон:</strong> ' + escapeHtml(profile.phone || '—') + '</li>',
            '<li class="list-group-item"><strong>Город:</strong> ' + escapeHtml(profile.city || '—') + '</li>',
            '<li class="list-group-item"><strong>Адрес:</strong> ' + escapeHtml(profile.address || '—') + '</li>',
        '</ul>',
        '<div class="mt-3">',
            '<a href="/settings/" class="btn btn-outline-dark btn-sm">Настройки</a>',
        '</div>'
    ].join('');
}

document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('profileForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        var data = {
            full_name: document.getElementById('inputFullName').value,
            phone: document.getElementById('inputPhone').value,
            city: document.getElementById('inputCity').value,
            address: document.getElementById('inputAddress').value,
            favorite_category: document.getElementById('inputFavoriteCategory') ? document.getElementById('inputFavoriteCategory').value : '',
        };

        var csrfToken = getCsrfToken();

        fetch('/api/me/', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(data),
        })
        .then(function(response) {
            if (!response.ok) throw new Error('Ошибка сохранения');
            return response.json();
        })
        .then(function() {
            document.getElementById('profileSaveMessage').innerHTML =
                '<div class="alert alert-success mt-2">Профиль обновлён</div>';
            loadProfile();
            setTimeout(function() {
                document.getElementById('profileSaveMessage').innerHTML = '';
            }, 3000);
        })
        .catch(function() {
            document.getElementById('profileSaveMessage').innerHTML =
                '<div class="alert alert-danger mt-2">Ошибка при сохранении</div>';
        });
    });
});

function loadOrders() {
    fetch('/api/orders/')
        .then(function(response) {
            if (!response.ok) throw new Error('Ошибка загрузки');
            return response.json();
        })
        .then(function(orders) {
            renderOrders(orders);
        })
        .catch(function() {
            document.getElementById('ordersContainer').innerHTML =
                '<div class="alert alert-danger">Не удалось загрузить заказы</div>';
        });
}

function renderOrders(orders) {
    var container = document.getElementById('ordersContainer');

    if (!orders || orders.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">У вас пока нет заказов</p>';
        return;
    }

    var html = '<div class="table-responsive"><table class="table table-bordered"><thead class="table-dark"><tr>' +
        '<th>№</th><th>Дата</th><th>Адрес</th><th>Сумма</th><th></th>' +
        '</tr></thead><tbody>';

    orders.forEach(function(order) {
        var date = new Date(order.created_at).toLocaleDateString('ru-RU');
        html += '<tr>' +
            '<td>' + order.id + '</td>' +
            '<td>' + date + '</td>' +
            '<td>' + escapeHtml(order.address) + '</td>' +
            '<td>' + order.total_price + ' BYN</td>' +
            '<td><button class="btn btn-outline-dark btn-sm" onclick="showOrderDetails(' + order.id + ')">Подробнее</button></td>' +
            '</tr>';
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function showOrderDetails(orderId) {
    fetch('/api/orders/')
        .then(function(response) { return response.json(); })
        .then(function(orders) {
            var order = orders.find(function(o) { return o.id === orderId; });
            if (!order || !order.items) return;

            var details = '<div class="table-responsive"><table class="table table-bordered table-sm">' +
                '<thead class="table-dark"><tr><th>Товар</th><th>Кол-во</th><th>Цена</th><th>Стоимость</th></tr></thead><tbody>';

            order.items.forEach(function(item) {
                var sum = item.price * item.quantity;
                details += '<tr><td>' + escapeHtml(item.product_name) + '</td><td>' + item.quantity + '</td><td>' + item.price + ' BYN</td><td>' + sum + ' BYN</td></tr>';
            });

            details += '<tr class="table-secondary fw-bold"><td colspan="3">Итого</td><td>' + order.total_price + ' BYN</td></tr>';
            details += '</tbody></table></div>';

            var modal = new bootstrap.Modal(document.getElementById('orderModal'));
            document.getElementById('orderModalBody').innerHTML = details;
            modal.show();
        });
}

function getCsrfToken() {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf('csrftoken=') === 0) {
            return cookie.substring('csrftoken='.length);
        }
    }
    return '';
}

function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
