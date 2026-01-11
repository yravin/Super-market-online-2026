    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const roleIndicator = document.getElementById('roleIndicator');
    const notification = document.getElementById('notification');

    // 1. Password Toggle
    document.getElementById('togglePassword').addEventListener('click', function() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

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
            password: passwordInput.value
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (response.ok) {
                notify("ចូលគណនីជោគជ័យ✅", "success");
                // Save token if your API returns one: localStorage.setItem('token', result.token);
                setTimeout(() => {
                    window.location.href = "/HTML/HomePage/index.html"; // Change to your actual landing page
                }, 1500);
            } else {
                notify(result.message || "ពាក្យសម្ងាត់ឬអុីម៉ែលមិនត្រឹមត្រូវ", "error");
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