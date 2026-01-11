// ============================== Configuration ================================
const TELEGRAM_BOT_TOKEN = '8455978510:AAFSHfpz_gEWuWfbVbc8KXpz7xJGubbScHk'; 
const TELEGRAM_CHAT_ID = '7831405898'; 

const QR_CODES = {
    aba: '/QRABA.jpg', 
    paypal: 'https://qrcodedynamic.com/themes/altum/assets/images/qr_code.svg'
};

const PAYMENT_INFO = {
    aba: {
        title: "Scan ABA QR Code",
        instruction: "សូមបើកកម្មវិធី ABA Mobile ដើម្បីស្កេនបង់ប្រាក់។",
        accountInfo: "Account: 123 456 789\nName: YOUR STORE NAME"
    },
    paypal: {
        title: "Pay with PayPal",
        instruction: "Scan this QR code with PayPal app or use email.",
        accountInfo: "PayPal ID: payment@yourstore.com"
    }
};

// មុខងារបង្ហាញផ្ទាំង QR Code
function showQRCode(type) {
    if (type === 'card') return; 

    const info = PAYMENT_INFO[type];
    const modal = document.getElementById('paymentModal');
    
    // បង្ហាញ Modal ជាមុនសិន
    if (QR_CODES[type]) {
        document.getElementById('modalTitle').innerText = info.title;
        document.getElementById('modalQR').src = QR_CODES[type];
        document.getElementById('modalInstruction').innerText = info.instruction;
        document.getElementById('modalAccount').innerText = info.accountInfo;
        
        modal.style.display = 'flex';

        // ប្រើ setTimeout ដើម្បីឱ្យ Modal លោតចេញមកសិន ទើបលោត Confirm តាមក្រោយ
        setTimeout(() => {
            const userConfirmed = confirm(`សូមស្កេន QR Code ដើម្បីបង់ប្រាក់តាម ${type.toUpperCase()}\n\nតើអ្នកបានបង់ប្រាក់រួចរាល់ហើយឬនៅ?`);
            
            if (userConfirmed) {
                alert("សូមអរគុណ! សូមចុចប៊ូតុង Complete Purchase ដើម្បីបញ្ចប់ការកុម្ម៉ង់។");
                closeModal();
            }
        }, 500); // រង់ចាំ 0.5 វិនាទី
    }
}

function closeModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// អនុគមន៍ជ្រើសរើសវិធីបង់ប្រាក់
function selectPayment(element, type) {
    document.querySelectorAll('.payment-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    const radio = element.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
    
    // ហៅមុខងារបង្ហាញ QR
    showQRCode(type);
}

document.addEventListener('DOMContentLoaded', function() {
    const productContainer = document.getElementById('product-container');
    const finalTotalDisp = document.getElementById('final-total');
    const checkoutForm = document.getElementById('checkoutForm');
    const submitBtn = document.getElementById('submitBtn');

    // ១. ទាញទិន្នន័យទំនិញពី LocalStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // បង្ហាញបញ្ជីទំនិញក្នុង Order Summary
    function displayCartSummary() {
        if (cart.length === 0) {
            if (productContainer) productContainer.innerHTML = '<p style="text-align:center; color:gray; padding: 20px;">មិនមានទំនិញក្នុងកន្ត្រកទេ</p>';
            if (finalTotalDisp) finalTotalDisp.textContent = "$0.00";
            return;
        }

        let totalRunningSum = 0;
        productContainer.innerHTML = ''; 

        cart.forEach(item => {
            const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
            totalRunningSum += itemTotal;
            
            const productHTML = `
                <div class="item-row" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:15px;">
                    <div style="display:flex; align-items:center;">
                        <img src="${item.image}" style="width:40px; height:40px; border-radius:8px; object-fit:cover; margin-right:10px; border:1px solid #ddd;">
                        <div>
                            <div style="font-weight:600; font-size:0.85rem;">${item.name}</div>
                            <div style="font-size:0.75rem; color:gray;">Qty: ${item.quantity}</div>
                        </div>
                    </div>
                    <span style="font-weight:600;">$${itemTotal.toFixed(2)}</span>
                </div>
            `;
            productContainer.insertAdjacentHTML('beforeend', productHTML);
        });

        if (finalTotalDisp) finalTotalDisp.textContent = `$${totalRunningSum.toFixed(2)}`;
    }

    displayCartSummary();

    // ២. ការផ្ញើវិក្កយបត្រ (Telegram + Backend)
    checkoutForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (cart.length === 0) {
            alert("សូមជ្រើសរើសទំនិញមុននឹងទូទាត់!");
            return;
        }

        // រៀបចំទិន្នន័យ Payload
        const payload = {
            custommer: document.getElementById('custommer').value, 
            tel: document.getElementById('tel').value,
            email: document.getElementById('email').value,
            city: document.getElementById('city').value,
            total_price: finalTotalDisp.textContent.replace('$', '').trim(),
            payment_method: document.querySelector('input[name="paymentType"]:checked').value,
            items: cart 
        };

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // --- ផ្នែកផ្ញើទៅ Telegram ---
        let msg = `<b>🛒 ការកុម្ម៉ង់ថ្មី (New Order)</b>\n\n`;
        msg += `👤 អតិថិជន: <b>${payload.custommer}</b>\n`;
        msg += `📞 លេខទូរសព្ទ: <code>${payload.tel}</code>\n`;
        msg += `📍 ទីក្រុង: ${payload.city}\n`;
        msg += `💳 បង់ប្រាក់: ${payload.payment_method.toUpperCase()}\n\n`;
        msg += `<b>🛍 បញ្ជីទំនិញ:</b>\n`;
        cart.forEach((i, index) => {
            msg += `${index + 1}. ${i.name} (x${i.quantity}) = $${(i.price * i.quantity).toFixed(2)}\n`;
        });
        msg += `\n<b>💰 សរុបរួម: $${payload.total_price}</b>`;

        try {
            // ១. ផ្ញើទៅ Telegram
            const telegramPromise = fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: msg,
                    parse_mode: 'HTML'
                })
            });

            // ២. ផ្ញើទៅ Django
            const djangoPromise = fetch('http://127.0.0.1:8000/chackout/', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            // រង់ចាំការងារទាំងពីរ
            const [telRes, djangoRes] = await Promise.all([telegramPromise, djangoPromise]);

            if (telRes.ok || djangoRes.ok) {
                alert("✅ ការកុម្ម៉ង់ជោគជ័យ សារបានផ្ញើទៅកាន់ អរគុណសម្រាប់ការកម្មង់");
                localStorage.removeItem('cart'); 
                window.location.href = "/HTML/HomePage/index.html"; 
            } else {
                alert("❌ មានបញ្ហាក្នុងការផ្ញើទិន្នន័យ!");
            }

        } catch (err) {
            console.error("Error:", err);
            alert("ការកុម្ម៉ង់ត្រូវបានផ្ញើចេញ!"); 
            localStorage.removeItem('cart');
            window.location.href = "/HTML/HomePage/index.html";
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Complete Purchase <i class="fas fa-arrow-right"></i>';
        }
    });
});