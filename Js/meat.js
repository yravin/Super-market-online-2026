let products = [];  
let cart = [];
const API_BASE_URL = 'http://127.0.0.1:8000';

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCartFromStorage();

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', submitOrder);
    }
});

// ================= LOAD PRODUCTS =================
async function loadProducts() {
    try {
        const res = await fetch(`${API_BASE_URL}/category/Meat/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        products = data.map(p => ({
            id: p.id,
            name: p.name || 'ផលិតផល',
            price: parseFloat(p.price) || 0,
            image: p.image && p.image.startsWith('/')
                ? `${API_BASE_URL}${p.image}`
                : (p.image || 'https://via.placeholder.com/150'),
            unit: p.unit || 'pcs',
            stock: p.stock || 0
        }));

        renderProductList(products); 
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// ================= SEARCH =================
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm) 
    );
    renderProductList(filtered);
}

// ================= RENDER PRODUCTS =================
function renderProductList(items) {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">រកមិនឃើញទំនិញ...</p>
            </div>`;
        return;
    }

    items.forEach(p => {
        const div = document.createElement('div'); 
        div.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';

        div.innerHTML = `
            <div class="product-card h-100 shadow-sm border-0">
                <div class="product-image" style="background-image:url('${p.image}')">
                    <span class="price-badge">$${p.price.toFixed(2)}</span>
                </div>
                <div class="product-body p-3">
                    <h5 class="product-title text-truncate" title="${p.name}">
                        ${p.name}
                    </h5>

                    <div class="qty-wrapper my-2 d-flex justify-content-center align-items-center">
                        <button class="btn btn-sm btn-outline-secondary"
                            onclick="changeQtyUI(${p.id}, -1)">−</button>

                        <input type="text"
                            id="qty-${p.id}"
                            value="0"
                            readonly
                            class="text-center mx-2 border-0"
                            style="width:40px">

                        <button class="btn btn-sm btn-outline-secondary"
                            onclick="changeQtyUI(${p.id}, 1)">+</button>
                    </div>

                    <button class="add-cart-btn btn btn-primary w-100"
                        onclick="addToCart(${p.id})">
                        <i class="fas fa-cart-plus me-1"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;

        container.appendChild(div); 
    });
}


// ================= ADD TO CART =================
function addToCart(id) {
    const product = products.find(p => p.id === id); 
    if (!product) return;

    const qtyInput = document.getElementById(`qty-${id}`);
    const qty = parseInt(qtyInput.value);

    if (qty < 1) {
        alert("សូមជ្រើសចំនួនមុន");
        return;
    }

    const exist = cart.find(i => i.id === id);
    if (exist) {
        exist.quantity += qty;
    } else {
        cart.push({ ...product, quantity: qty });
    }

    qtyInput.value = 0;
    updateCart();
    updateCartCount();
    saveCartToStorage();
}

// ================= CART VIEW =================
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    if (!cartItems) return;

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

       cartItems.innerHTML += `
    <div class="cart-item-row d-flex align-items-center mb-3 p-2 shadow-sm rounded border bg-white">
        <div class="me-3">
            <img src="${item.image}" class="rounded border"
                 style="width:50px;height:50px;object-fit:cover;">
        </div>

        <div class="flex-grow-1">
            <h6 class="mb-0 fw-bold text-truncate">${item.name}</h6>

            <div class="d-flex align-items-center justify-content-between mt-1">
                <div class="qty-controls d-flex align-items-center bg-light rounded border">
                    <button class="btn btn-sm px-2"
                        onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">−</button>

                    <span class="px-2 fw-bold small">${item.quantity}</span>

                    <button class="btn btn-sm px-2"
                        onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>

                <span class="fw-bold text-primary">
                    $${itemTotal.toFixed(2)}
                </span>
            </div>
        </div>

         <button class="btn btn-link text-danger ms-2 p-0" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash-alt mt-4 ="></i>
        </button>
    </div>
`;

    });

    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// ================= UPDATE QTY =================
function updateCartQuantity(id, qty) {
    if (qty < 1) return removeFromCart(id);

    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity = qty;
        updateCart();
        updateCartCount();
        saveCartToStorage();
    }
}

// ================= SUBMIT ORDER =================
async function submitOrder() {
    if (cart.length === 0) {
        alert("Cart is empty");
        return;
    }

    const csrftoken = getCookie('csrftoken');

    for (const item of cart) {
        await fetch(`${API_BASE_URL}/orders/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            credentials: 'include',
            body: JSON.stringify({
                product_id: item.id,
                order_qty: item.quantity,
                order_price: item.price
            })
        });
    }

    localStorage.removeItem('cart');
    window.location.href = "/HTML/checkout.html"; 
}

// ================= UTILITIES =================
function changeQtyUI(id, delta) {
    const input = document.getElementById(`qty-${id}`);
    input.value = Math.max(0, parseInt(input.value) + delta);
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCart();
    updateCartCount();
    saveCartToStorage();
}

function updateCartCount() {
    const el = document.getElementById('cartCount');
    if (el) el.textContent = cart.reduce((s, i) => s + i.quantity, 0);
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('cart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCart();
        updateCartCount();
    }
}

function getCookie(name) {
    return document.cookie.split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1];
}
