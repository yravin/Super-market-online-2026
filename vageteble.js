// ==========================================
// AEON ONLINE SHOPPING - COMPLETE JS
// ==========================================

let products = []; // Global storage for all products from API
let cart = [];     // Shopping cart items
const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * 1. INITIALIZATION & EVENT LISTENERS
 */
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();         // Fetch products from server
    loadCartFromStorage();  // Load saved cart items

    // Setup Search Logic
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }

    // Setup Checkout Logic
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', submitOrder);
    }
});

/**
 * 2. PRODUCT DATA LOADING
 */
async function loadProducts() {
    try {
        const res = await fetch(`${API_BASE_URL}/category/Vegetable/`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
        
        // Map data to match our UI object structure
        products = data.map(p => ({
            id: p.id || 0,
            name: p.name || 'ផលិតផល',
            price: parseFloat(p.price) || 0,
            image: p.image && p.image.startsWith('/') ? `${API_BASE_URL}${p.image}` : (p.image || 'https://via.placeholder.com/150'),
            unit: p.unit || 'pcs',
            stock: p.stock || 0
        }));
        
        // Initial display of all products
        renderProductList(products);
    } catch (err) {
        console.error("Load Error:", err);
    }
}
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    // Filter the original product list based on name
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm)
    );

    renderProductList(filtered);
}

function renderProductList(items) {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <p class="text-muted">រកមិនឃើញទំនិញដែលអ្នកចង់បានទេ...</p>
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
                    <h5 class="product-title text-truncate" title="${p.name}">${p.name}</h5>
                    <div class="qty-wrapper my-2 d-flex justify-content-center align-items-center">
                        <button class="btn btn-sm btn-outline-secondary" onclick="changeQtyUI(${p.id}, -1)">−</button>
                        <input type="text" id="qty-${p.id}" value="0" readonly class="text-center mx-2 border-0" style="width: 40px;">
                        <button class="btn btn-sm btn-outline-secondary" onclick="changeQtyUI(${p.id}, 1)">+</button>
                    </div>
                    <button class="add-cart-btn btn btn-primary w-100" onclick="addToCart(${p.id})">
                        <i class="fas fa-cart-plus me-1"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

/**
 * 4. CART MANAGEMENT
 */
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const qtyInput = document.getElementById(`qty-${id}`);
    const qty = parseInt(qtyInput.value);

    if (qty < 1) {
        alert("សូមជ្រើសចំនួនមុន (Please select quantity)");
        return;
    }

    const exist = cart.find(i => i.id === id);
    if (exist) {
        exist.quantity += qty;
    } else {
        cart.push({ ...product, quantity: qty });
    }

    updateCart();
    updateCartCount();
    saveCartToStorage();

    // Reset UI quantity to zero after adding
    qtyInput.value = 0;
    showToast(`បានបន្ថែម ${product.name} ទៅក្នុងរទេះ`);
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    if (!cartItems) return;

    cartItems.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-shopping-basket fa-3x opacity-25 mb-3"></i>
                <p class="text-muted">មិនមានទំនិញក្នុងរទេះទេ</p>
            </div>`;
        cartTotal.textContent = `$0.00`;
        return;
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        cartItems.innerHTML += `
            <div class="cart-item-row d-flex align-items-center mb-3 p-2 shadow-sm rounded border bg-white">
                <div class="me-3">
                    <img src="${item.image}" class="rounded border" style="width: 50px; height: 50px; object-fit: cover;">
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-0 fw-bold text-truncate" style="max-width: 130px;">${item.name}</h6>
                    <div class="d-flex align-items-center justify-content-between mt-1">
                        <div class="qty-controls d-flex align-items-center bg-light rounded border">
                            <button class="btn btn-sm px-2 py-0" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span class="px-2 fw-bold small">${item.quantity}</span>
                            <button class="btn btn-sm px-2 py-0" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                        <span class="fw-bold text-primary">$${itemTotal.toFixed(2)}</span>
                    </div>
                </div>
                <button class="btn btn-link text-danger ms-2 p-0" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash-alt mt-4"></i>
                </button>
            </div>`;
    });

    cartTotal.textContent = `$${total.toFixed(2)}`;
}

function updateCartQuantity(id, newQty) {
    if (newQty < 1) {
        removeFromCart(id);
        return;
    }
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity = newQty;
        updateCart();
        saveCartToStorage();
        updateCartCount();
    }
}

/**
 * 5. ORDER SUBMISSION
 */
async function submitOrder() {
    if (cart.length === 0) {
        alert("រទេះរបស់អ្នកនៅទំនេរ (Your cart is empty)");
        return;
    }

    const csrftoken = getCookie('csrftoken'); 

    // បញ្ជូនទិន្នន័យទៅ Server (Loop orders)
    for (const item of cart) {
        const orderData = {
            product_id: item.id,
            order_qty: item.quantity,
            order_price: item.price
        };

        try {
            const response = await fetch(`${API_BASE_URL}/orders/`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken 
                },
                credentials: 'include',
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorDetail = await response.json();
                console.error("Error Detail:", errorDetail);
                alert("ការបញ្ជាទិញបរាជ័យ!");
                return;
            }
        } catch (err) {
            console.error("Network Error:", err);
        }
    }

    // --- ចំណុចផ្លាស់ប្តូរ ---
    // កុំទាន់លុប cart = []; និង localStorage.removeItem("cart"); នៅទីនេះ
    // គ្រាន់តែប្តូរទៅកាន់ទំព័រ Checkout
    window.location.href = "./chackout.html"; 
}

// អនុគមន៍ជំនួយសម្រាប់ទាញយក CSRF Token ពី Cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
function changeQtyUI(id, delta) {
    const input = document.getElementById(`qty-${id}`);
    if (!input) return;
    let val = parseInt(input.value) + delta;
    input.value = val < 0 ? 0 : val;
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCart();
    updateCartCount();
    saveCartToStorage();
}

function updateCartCount() {
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
}

function saveCartToStorage() { localStorage.setItem('cart', JSON.stringify(cart)); }

function loadCartFromStorage() {
    const saved = localStorage.getItem('cart');
    if (saved) { 
        cart = JSON.parse(saved); 
        updateCart(); 
        updateCartCount(); 
    }
}

function showToast(msg) {
    console.log("Toast Notification:", msg); 
    // You can replace this with a real Toast library like SweetAlert2
}