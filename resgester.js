    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const roleIndicator = document.getElementById('roleIndicator');
    const notification = document.getElementById('notification');

    // 1. Password Toggle
    // 1. Primary Password Toggle
const togglePassword = document.getElementById('togglePassword');
if (togglePassword) {
    togglePassword.addEventListener('click', function() {
        // Toggle the type attribute
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle the icon classes
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
}

// 2. Confirm Password Toggle
// Note: Ensure your HTML has an element with id="toggleConfirmPassword"
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
if (toggleConfirmPassword && confirmPasswordInput) {
    toggleConfirmPassword.addEventListener('click', function() {
        // Toggle the type attribute for confirmPasswordInput
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
        
        // Toggle the icon classes
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
}
    // 2. Dynamic Role Detection (UI Polish)
    emailInput.addEventListener('input', (e) => {
        if (e.target.value.toLowerCase().includes('admin')) {
            roleIndicator.textContent = "Administrator Mode";
            roleIndicator.classList.add('admin-mode');
            loginBtn.classList.add('admin-btn');
        } else {
            roleIndicator.textContent = "Standard User";
            roleIndicator.classList.remove('admin-mode');
            loginBtn.classList.remove('admin-btn');
        }
    });

    // 3. Notification Logic
    function notify(msg, type) {
        notification.textContent = msg;
        notification.className = `notification show ${type}`;
        setTimeout(() => notification.classList.remove('show'), 3000);
    }

    // 4. Login Submission Logic
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // UI Loading State
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        spinner.style.display = 'block';

        const loginData = {
            email: emailInput.value,
            password: passwordInput.value,
            confirm : confirmPasswordInput.value
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (response.ok) {
                notify("បង្កេីតគណនីជោគជ័យ✅", "success");
                // Save token if your API returns one: localStorage.setItem('token', result.token);
                setTimeout(() => {
                    window.location.href = "./index.html"; // Change to your actual landing page
                }, 1500);
            } else {
                notify(result.message || "Invalid credentials", "error");
            }

        } catch (error) {
            console.error("API Error:", error);
            notify("សូមបញ្ចូលពាក្យសម្ងាត់និងអុីម៉ែលឪ្យបានត្រឹមត្រូវ", "error");
        } finally {
            // Restore UI State
            loginBtn.disabled = false;
            btnText.style.display = 'block';
            spinner.style.display = 'none';
        }
    });