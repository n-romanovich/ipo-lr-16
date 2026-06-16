document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('productGrid')) return;
    loadProducts();
});

var currentPage = 1;
var totalPages = 1;

function loadProducts(page) {
    if (!page) page = 1;
    currentPage = page;

    var spinner = document.getElementById('loadingSpinner');
    var grid = document.getElementById('productGrid');
    var errorMsg = document.getElementById('errorMessage');
    var paginationNav = document.getElementById('paginationNav');

    spinner.style.display = 'block';
    grid.innerHTML = '';
    errorMsg.style.display = 'none';
    paginationNav.style.display = 'none';

    var category = document.getElementById('filterCategory') ? document.getElementById('filterCategory').value : '';
    var manufacturer = document.getElementById('filterManufacturer') ? document.getElementById('filterManufacturer').value : '';
    var search = document.getElementById('filterSearch') ? document.getElementById('filterSearch').value : '';

    var url = '/api/products/?page=' + page;
    if (category) url += '&category=' + category;
    if (manufacturer) url += '&manufacturer=' + manufacturer;
    if (search) url += '&q=' + encodeURIComponent(search);

    fetch(url)
        .then(function(response) {
            if (!response.ok) throw new Error('Ошибка: ' + response.status);
            return response.json();
        })
        .then(function(data) {
            spinner.style.display = 'none';
            var products = data.results || data;
            if (products.length === 0) {
                grid.innerHTML = '<p class="text-muted text-center">Товары не найдены</p>';
                return;
            }
            renderProducts(products);
            renderPagination(data);
        })
        .catch(function(error) {
            spinner.style.display = 'none';
            errorMsg.textContent = 'Ошибка загрузки: ' + error.message;
            errorMsg.style.display = 'block';
        });
}

function renderProducts(products) {
    var grid = document.getElementById('productGrid');
    grid.innerHTML = '';

    products.forEach(function(product) {
        var col = document.createElement('div');
        col.className = 'col-sm-6 col-md-4 mb-3';

        var photoHtml = product.photo
            ? '<img src="' + product.photo + '" class="card-img-top" alt="' + product.name + '">'
            : '<div class="d-flex align-items-center justify-content-center" style="height:180px; background:#eee;"><span style="font-size:3em;">?</span></div>';

        var stockHtml = product.stock > 0
            ? '<span class="badge bg-success mb-2">В наличии</span>'
            : '<span class="badge bg-danger mb-2">Нет в наличии</span>';

        col.innerHTML = [
            '<div class="card h-100">',
                photoHtml,
                '<div class="card-body d-flex flex-column">',
                    stockHtml,
                    '<h5 class="card-title">' + escapeHtml(product.name) + '</h5>',
                    '<p class="card-text small text-muted flex-grow-1">' + escapeHtml(product.category_name || '') + '</p>',
                    '<p class="fw-bold mb-2">' + product.price + ' BYN</p>',
                    '<div class="d-flex gap-2">',
                        '<a href="/catalog/' + product.id + '/" class="btn btn-outline-dark btn-sm flex-fill">Подробнее</a>',
                        '<button onclick="addToCartJs(' + product.id + ')" class="btn btn-dark btn-sm flex-fill">В корзину</button>',
                    '</div>',
                '</div>',
            '</div>'
        ].join('');

        grid.appendChild(col);
    });
}

function renderPagination(data) {
    var nav = document.getElementById('paginationNav');
    var list = document.getElementById('paginationList');

    var count = data.count || 0;
    totalPages = Math.ceil(count / 9);

    if (totalPages <= 1) {
        nav.style.display = 'none';
        return;
    }

    nav.style.display = 'block';
    list.innerHTML = '';

    var prevLi = document.createElement('li');
    prevLi.className = 'page-item' + (currentPage <= 1 ? ' disabled' : '');
    prevLi.innerHTML = '<button class="page-link" onclick="loadProducts(' + (currentPage - 1) + ')">«</button>';
    list.appendChild(prevLi);

    for (var i = 1; i <= totalPages; i++) {
        var li = document.createElement('li');
        li.className = 'page-item' + (i === currentPage ? ' active' : '');
        li.innerHTML = '<button class="page-link" onclick="loadProducts(' + i + ')">' + i + '</button>';
        list.appendChild(li);
    }

    var nextLi = document.createElement('li');
    nextLi.className = 'page-item' + (currentPage >= totalPages ? ' disabled' : '');
    nextLi.innerHTML = '<button class="page-link" onclick="loadProducts(' + (currentPage + 1) + ')">»</button>';
    list.appendChild(nextLi);
}

function addToCartJs(productId) {
    var csrfToken = getCsrfToken();

    fetch('/cart/add/' + productId + '/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'product_id=' + productId,
    })
    .then(function(response) {
        if (response.redirected) {
            if (response.url.indexOf('/accounts/login/') !== -1) {
                showNotification('Войдите, чтобы добавить в корзину', 'warning');
                return;
            }
            showNotification('Товар добавлен!', 'success');
        } else if (response.ok) {
            showNotification('Товар добавлен!', 'success');
        } else {
            throw new Error('Ошибка');
        }
    })
    .catch(function() {
        showNotification('Ошибка при добавлении', 'danger');
    });
}

function showNotification(message, type) {
    var container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'position-fixed top-0 end-0 p-3';
        container.style.zIndex = 9999;
        document.body.appendChild(container);
    }
    var alert = document.createElement('div');
    alert.className = 'alert alert-' + type + ' alert-dismissible fade show';
    alert.innerHTML = message + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
    container.appendChild(alert);
    setTimeout(function() { alert.remove(); }, 3000);
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

document.addEventListener('DOMContentLoaded', function() {
    var applyBtn = document.getElementById('applyFilters');
    if (applyBtn) {
        applyBtn.addEventListener('click', function() { loadProducts(1); });
    }
});
