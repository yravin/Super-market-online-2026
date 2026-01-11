let cart = JSON.parse(localStorage.getItem('cart') || '[]');

document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
    document.querySelector('.btn-checkout')?.addEventListener('click', () => {
        if(cart.length === 0) return alert('Cart is empty!');
        localStorage.setItem('cart', JSON.stringify(cart));
        window.location.href = '/HTML/Checkout/checkout.html';
    });
});

function addToCart(id, qty) {
    const product = window.products?.find(p => p.id === id);
    if(!product) return alert('Product not found!');
    const exist = cart.find(i => i.id === id);
    if(exist) exist.quantity += qty;
    else cart.push({...product, quantity: qty});
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

function updateCartDisplay() {
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    if(!container) return;
    container.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.quantity;
        const div = document.createElement('div');
        div.className = 'cart-item d-flex justify-content-between align-items-center p-2 border-bottom';
        div.innerHTML = `
            <span>${item.name} x ${item.quantity}</span>
            <span>$${(item.price*item.quantity).toFixed(2)} 
                <button class="btn btn-sm btn-link text-danger" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </span>`;
        container.appendChild(div);
    });
    totalEl.textContent = `$${total.toFixed(2)}`;
}
