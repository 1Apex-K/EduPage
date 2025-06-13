// الوظائف المتعلقة بتغيير الثيم (الوضع الليلي/النهاري)
function setTheme(mode) {
  document.body.className = mode;
  localStorage.setItem('theme', mode);
  document.getElementById('theme-icon').textContent = mode === 'dark' ? '😴' : '😊';

  // تحديث لون الجسيمات في tsParticles بناءً على الثيم
  const particlesBgInstance = tsParticles.dom().find(item => item.id === "particles-background");
  if (particlesBgInstance && particlesBgInstance.length > 0) {
    const instance = particlesBgInstance[0];
    instance.options.particles.color.value = mode === 'dark' ? "#ffdd00" : "#88ccff"; // أصفر في الليلي، أزرق في النهاري
    instance.options.links.color.value = mode === 'dark' ? "#88ccff" : "#007bff"; // أزرق في الليلي، أزرق أغمق في النهاري
    instance.refresh(); // لتطبيق التغيير فوراً
  }

  const planeParticlesInstance = tsParticles.dom().find(item => item.id === "plane-particles");
  if (planeParticlesInstance && planeParticlesInstance.length > 0) {
    // يمكنك تعديل ألوان أو خصائص الطائرة هنا إذا كانت تتحكم فيها tsParticles
  }
}

// تبديل الثيم بين الوضع الليلي والنهاري
function toggleTheme() {
  const currentTheme = localStorage.getItem('theme') || 'light';
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// تهيئة tsParticles عند تحميل الصفحة
window.onload = function() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);

  tsParticles.load({
    id: "particles-background",
    options: {
      particles: {
        number: { value: 80 },
        color: { value: savedTheme === 'dark' ? "#ffdd00" : "#88ccff" },
        links: {
          enable: true,
          distance: 150,
          color: savedTheme === 'dark' ? "#88ccff" : "#007bff",
          opacity: 0.4,
          width: 1,
        },
        move: { enable: true, speed: 2 },
      },
      interactivity: {
        events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } },
        modes: { repulse: { distance: 100 }, push: { quantity: 4 } },
      },
      background: { color: { value: "transparent" } },
    },
  });

  // كود Type Effect للصفحة الرئيسية (main-page.html)
  const dynamicTextElement = document.getElementById('dynamic-text');
  if (dynamicTextElement) {
    const phrases = [
      "بوابتك نحو التفوق 🚀",
      "طريقك إلى النجاح 🌟",
      "رفيقك في رحلة العلم 💡",
      "خطوتك الأولى نحو التميز ✨",
      "الأساس المتين لنجاحك 📚"
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    let deletingSpeed = 50;
    let pauseBeforeDeleting = 1500;
    let pauseBeforeTyping = 700;

    function typeEffect() {
      const currentPhrase = phrases[phraseIndex];
      if (isDeleting) {
        dynamicTextElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
      } else {
        dynamicTextElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
      }

      let currentTypingSpeed = isDeleting ? deletingSpeed : typingSpeed;

      if (!isDeleting && charIndex === currentPhrase.length) {
        currentTypingSpeed = pauseBeforeDeleting;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        currentTypingSpeed = pauseBeforeTyping;
      }

      setTimeout(typeEffect, currentTypingSpeed);
    }
    typeEffect();
  }
};

// **1. وظيفة التحقق من المصادقة (Authentication Check)**
function checkAuthentication() {
    const token = localStorage.getItem('userToken');

    if (!token) {
        // إذا لم يكن هناك token، قم بتوجيه المستخدم إلى صفحة تسجيل الدخول
        console.warn('No token found. Redirecting to login page.');
        window.location.href = 'login.html'; // تم التعديل هنا
        return false;
    }
    // في مرحلة لاحقة، يمكننا إضافة تحقق هنا لإرسال التوكن إلى الواجهة الخلفية
    // للتحقق من صلاحيته (إذا انتهت صلاحيته مثلاً)
    return true;
}

// **2. وظيفة تسجيل الخروج (Logout)**
function logout() {
    localStorage.removeItem('userToken'); // إزالة الـ token
    window.location.href = 'login.html'; // توجيه المستخدم لصفحة تسجيل الدخول (تم التعديل هنا)
    alert('تم تسجيل الخروج بنجاح.');
}

document.addEventListener('DOMContentLoaded', () => {
    const messageDiv = document.getElementById('message');

    // --- كود معالجة نموذج التسجيل (register.html) ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const phoneNumber = document.getElementById('phoneNumber').value;
            const parentPhoneNumber = document.getElementById('parentPhoneNumber').value;
            const governorate = document.getElementById('governorate').value;
            const grade = document.getElementById('grade').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                messageDiv.textContent = 'كلمة السر وتأكيد كلمة السر غير متطابقين.';
                messageDiv.style.color = 'red';
                return;
            }

            messageDiv.textContent = 'جاري إنشاء الحساب...';
            messageDiv.style.color = '#ffdd00';

            try {
                const response = await fetch('http://localhost:3000/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        first_name: firstName,
                        last_name: lastName,
                        phone_number: phoneNumber,
                        parent_phone_number: parentPhoneNumber,
                        governorate: governorate,
                        grade: grade,
                        password: password,
                        confirm_password: confirmPassword
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.textContent = data.message;
                    messageDiv.style.color = 'green';
                    setTimeout(() => {
                        window.location.href = 'login.html'; // تم التعديل هنا (التوجيه لصفحة تسجيل الدخول بعد التسجيل)
                    }, 2000);
                } else {
                    messageDiv.textContent = data.message || 'حدث خطأ غير معروف أثناء التسجيل.';
                    messageDiv.style.color = 'red';
                }
            } catch (error) {
                console.error('Error during fetch (register):', error);
                messageDiv.textContent = 'فشل الاتصال بالخادم. الرجاء التأكد من تشغيله.';
                messageDiv.style.color = 'red';
            }
        });
    }

    // --- كود معالجة نموذج تسجيل الدخول (login.html) ---
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const phoneNumber = document.getElementById('phoneNumber').value;
            const password = document.getElementById('password').value;

            messageDiv.textContent = 'جاري تسجيل الدخول...';
            messageDiv.style.color = '#ffdd00';

            try {
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ phone_number: phoneNumber, password: password })
                });

                const data = await response.json();

                if (response.ok) {
                    messageDiv.textContent = data.message;
                    messageDiv.style.color = 'green';
                    if (data.token) {
                        localStorage.setItem('userToken', data.token);
                    }
                    setTimeout(() => {
                        window.location.href = 'main-page.html';
                    }, 2000);
                } else {
                    messageDiv.textContent = data.message || 'رقم الهاتف أو كلمة المرور غير صحيحة.'; // رسالة خطأ أو افتراضية
                    messageDiv.style.color = 'red';
                }
            } catch (error) {
                console.error('Error during fetch (login):', error);
                messageDiv.textContent = 'فشل الاتصال بالخادم. الرجاء التأكد من تشغيله.';
                messageDiv.style.color = 'red';
            }
        });
    }

    // **3. استدعاء checkAuthentication وتحديث الأزرار عند تحميل الصفحات المحمية**
    const currentPath = window.location.pathname;
    // تم تحديث قائمة الصفحات المحمية لتشمل main-page.html و home.html فقط
    const protectedPages = ['/main-page.html', '/home.html'];

    if (protectedPages.some(page => currentPath.endsWith(page))) {
        checkAuthentication(); // تحقق من المصادقة أولاً

        // تحديث أزرار تسجيل الدخول/الخروج في main-page.html
        const authButton = document.getElementById('authButton');
        const registerButton = document.querySelector('.top-btn.register-btn'); // زر "أنشئ حسابك"

        if (authButton) { // هذا الجزء خاص بـ main-page.html
            const token = localStorage.getItem('userToken');
            if (token) {
                authButton.classList.remove('login-btn');
                authButton.classList.add('logout-btn');
                authButton.innerHTML = '<span class="btn-icon">🚪</span> تسجيل الخروج';
                authButton.onclick = logout; // استدعاء دالة تسجيل الخروج
                if (registerButton) {
                    registerButton.style.display = 'none'; // إخفاء زر التسجيل إذا كان المستخدم مسجلاً دخوله
                }
            } else {
                authButton.classList.add('login-btn');
                authButton.classList.remove('logout-btn');
                authButton.innerHTML = '<span class="btn-icon">➡️</span> سجّل دخولك';
                authButton.onclick = () => { location.href = 'login.html'; }; // التوجيه لـ login.html
                if (registerButton) {
                    registerButton.style.display = ''; // إظهار زر التسجيل
                }
            }
        }
    }
});