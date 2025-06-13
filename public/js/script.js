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
  const currentTheme = localStorage.getItem('theme') || 'dark';
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// تطبيق الثيم المفضل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  setTheme(localStorage.getItem('theme') || 'dark'); // الافتراضي هو الوضع الليلي
});

// إعداد جسيمات tsParticles للخلفية العامة
tsParticles.load({
  id: "particles-background",
  options: {
    background: {
      color: {
        value: "transparent", // الخلفية الشفافة للجسيمات
      },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onClick: {
          enable: true,
          mode: "push",
        },
        onHover: {
          enable: true,
          mode: "repulse",
        },
      },
      modes: {
        push: {
          quantity: 4,
        },
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: localStorage.getItem('theme') === 'dark' ? "#ffdd00" : "#88ccff", // لون الحروف (يتغير مع الثيم)
      },
      links: {
        color: {
          value: localStorage.getItem('theme') === 'dark' ? "#88ccff" : "#007bff", // لون الخطوط (يتغير مع الثيم)
        },
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 2,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "character", // لجعل الجسيمات تظهر كحروف
        character: {
          value: ["أ", "ل", "أ", "س", "ط", "و", "ر", "ة"], // الحروف التي ستظهر
          font: "Cairo", // الخط المستخدم للحروف
          style: "normal",
          weight: "700" // وزن الخط
        }
      },
      size: {
        value: {
          min: 10,
          max: 20
        },
      },
    },
    detectRetina: true,
  },
});

// إعداد جسيمات tsParticles للطائرة المتحركة (إذا كانت موجودة في main-page.html)
tsParticles.load({
  id: "plane-particles",
  options: {
    fullScreen: { enable: false }, // مهم: لا تجعلها تملأ الشاشة
    background: {
      color: {
        value: "transparent",
      },
    },
    particles: {
      number: {
        value: 0, // لا يوجد جسيمات ثابتة، سنضيفها يدويا
      },
      color: {
        value: "#ffffff", // لون الجسيمات
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: 0.8,
        random: true,
      },
      size: {
        value: 3,
        random: true,
      },
      move: {
        enable: true,
        speed: 3,
        direction: "right", // تتحرك لليمين
        random: false,
        straight: false,
        outModes: {
          default: "out",
        },
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200,
        },
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: false, // لا تتفاعل عند التحويم
        },
        onClick: {
          enable: false, // لا تتفاعل عند النقر
        },
      },
    },
    // تحديد جسيم واحد يمثل الطائرة
    emitters: [{
      direction: "none", // لا يوجد اتجاه محدد للمصدر
      rate: {
        quantity: 1, // جسيم واحد فقط
        delay: 0.1, // تأخير بسيط
      },
      life: {
        count: 0, // لا تموت تلقائيا
        duration: {
          value: 0 // لا يوجد مدة حياة محددة، ستبقى
        },
      },
      position: { // موضع البداية (من اليسار)
        x: 0,
        y: 50, // في منتصف الشاشة تقريبا
      },
      particles: {
        shape: {
          type: "image", // استخدم صورة
          image: {
            src: "https://www.freeiconspng.com/uploads/airplane-png-icon-10.png", // رابط صورة الطائرة
            width: 100,
            height: 100,
          },
        },
        size: {
          value: 50, // حجم الطائرة
        },
        move: {
          speed: 5, // سرعة حركة الطائرة
          direction: "right", // اتجاه حركة الطائرة
          random: false,
          straight: true, // تتحرك في خط مستقيم
          outModes: {
            default: "destroy", // تدمر عند الخروج من الشاشة
          },
        },
      },
    }],
  },
});


// تأثير الكتابة الديناميكي
const dynamicTextElement = document.getElementById('dynamic-text');
const texts = ["بيتك ومطرحك", "مستقبلك يبدأ هنا", "طريقك للتميز"];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 150;
let deletingSpeed = 70;
let delayBetweenTexts = 1500;

function typeEffect() {
  const currentText = texts[textIndex];
  if (isDeleting) {
    dynamicTextElement.textContent = currentText.substring(0, charIndex - 1);
    charIndex--;
  } else {
    dynamicTextElement.textContent = currentText.substring(0, charIndex + 1);
    charIndex++;
  }

  if (!isDeleting && charIndex === currentText.length) {
    typingSpeed = delayBetweenTexts;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    textIndex = (textIndex + 1) % texts.length;
    typingSpeed = 150;
  } else {
    typingSpeed = isDeleting ? deletingSpeed : 150;
  }
  setTimeout(typeEffect, typingSpeed);
}

document.addEventListener('DOMContentLoaded', () => {
    typeEffect(); // بدء تأثير الكتابة عند تحميل الصفحة

    // 🚨 هام جداً: هذا الرابط سيتم تحديثه تلقائياً بواسطة Vercel.
    // عند التطوير المحلي، يمكنك استخدام '/api' إذا كنت تستخدم Vercel Dev.
    // عند النشر، سيكون مسار الـ API هو '/api/'.
    const backendBaseUrl = '';

    // --- ربط نماذج HTML بـ Backend API ---

    // 1. التعامل مع نموذج التسجيل (register.html)
    const registerForm = document.getElementById('registerForm');
    const registerMessageDiv = registerForm ? registerForm.querySelector('#message') : null;

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const phoneNumber = document.getElementById('phoneNumber').value;
            const parentPhoneNumber = document.getElementById('parentPhoneNumber').value;
            const governorate = document.getElementById('governorate').value;
            const grade = document.getElementById('grade').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // تحقق بسيط من تطابق كلمات المرور في الواجهة الأمامية
            if (password !== confirmPassword) {
                if (registerMessageDiv) {
                    registerMessageDiv.textContent = 'كلمة المرور وتأكيد كلمة المرور غير متطابقين.';
                    registerMessageDiv.style.color = 'red';
                }
                return;
            }

            try {
                const response = await fetch(`${backendBaseUrl}/api/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        first_name: firstName,
                        last_name: lastName,
                        phone_number: phoneNumber,
                        parent_phone_number: parentPhoneNumber,
                        governorate: governorate,
                        grade: grade,
                        password: password
                    }) // لا ترسل confirm_password إلى الـ backend
                });

                const data = await response.json();

                if (response.ok) {
                    if (registerMessageDiv) {
                        registerMessageDiv.textContent = data.message;
                        registerMessageDiv.style.color = 'green';
                    }
                    // 🚨 بعد التسجيل بنجاح، التوجيه لصفحة تسجيل الدخول (login.html)
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    if (registerMessageDiv) {
                        registerMessageDiv.textContent = data.message || 'حدث خطأ غير معروف أثناء التسجيل.';
                        registerMessageDiv.style.color = 'red';
                    }
                }
            } catch (error) {
                console.error('Error during fetch:', error);
                if (registerMessageDiv) {
                    registerMessageDiv.textContent = 'فشل الاتصال بالخادم. الرجاء التأكد من تشغيله.';
                    registerMessageDiv.style.color = 'red';
                }
            }
        });
    }

    // 2. التعامل مع نموذج تسجيل الدخول (login.html)
    const loginForm = document.getElementById('loginForm');
    const loginMessageDiv = loginForm ? loginForm.querySelector('#message') : null;

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const phoneNumber = document.getElementById('phoneNumber').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(`${backendBaseUrl}/api/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        phone_number: phoneNumber,
                        password: password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    if (loginMessageDiv) {
                        loginMessageDiv.textContent = data.message;
                        loginMessageDiv.style.color = 'green';
                    }
                    localStorage.setItem('userToken', data.token);
                    localStorage.setItem('userName', data.user.first_name); // حفظ الاسم
                    setTimeout(() => {
                        window.location.href = 'home.html'; // التوجيه للصفحة الرئيسية بعد تسجيل الدخول
                    }, 1000);
                } else {
                    if (loginMessageDiv) {
                        loginMessageDiv.textContent = data.message || 'رقم الهاتف أو كلمة المرور غير صحيحة.';
                        loginMessageDiv.style.color = 'red';
                    }
                }
            } catch (error) {
                console.error('Error during login:', error);
                if (loginMessageDiv) {
                    loginMessageDiv.textContent = 'فشل الاتصال بالخادم. الرجاء التأكد من تشغيله.';
                    loginMessageDiv.style.color = 'red';
                }
            }
        });
    }

    // 3. وظيفة تسجيل الخروج (تُستخدم في home.html وزر تسجيل الخروج في index.html)
    window.logout = function() { // جعلها global لتكون متاحة من HTML
        localStorage.removeItem('userToken');
        localStorage.removeItem('userName');
        // 🚨 بعد تسجيل الخروج، التوجيه لصفحة تسجيل الدخول (login.html)
        window.location.href = 'login.html';
    };

    // 4. التحقق من المصادقة عند تحميل الصفحات المحمية
    // (فقط home.html هي المحمية، index.html/main-page.html لم تعد تتطلب مصادقة لكونها landing)
    async function checkAuthentication() {
        const token = localStorage.getItem('userToken');
        if (!token) {
            // 🚨 إذا لم يكن هناك توكن، أعد التوجيه لصفحة تسجيل الدخول (login.html)
            window.location.href = 'login.html';
            return false;
        }

        try {
            const response = await fetch(`${backendBaseUrl}/api/protected`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // إذا كان التوكن غير صالح أو منتهي الصلاحية، قم بتسجيل الخروج
                logout();
                return false;
            }
            return true;

        } catch (error) {
            console.error('Error checking authentication:', error);
            logout(); // في حالة وجود خطأ بالاتصال، قم بتسجيل الخروج
            return false;
        }
    }

    // تشغيل التحقق عند تحميل الصفحات المحمية
    const currentPath = window.location.pathname;
    const protectedPages = ['/home.html']; // فقط home.html هي المحمية الآن

    if (protectedPages.some(page => currentPath.endsWith(page))) {
        checkAuthentication();

        // تحديث الاسم في صفحة home.html
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) {
            const userName = localStorage.getItem('userName');
            if (userName) {
                userNameDisplay.textContent = `أهلاً بك, ${userName}!`;
            } else {
                // في حال عدم وجود اسم، أعد التوجيه لصفحة تسجيل الدخول
                window.location.href = 'login.html';
            }
        }
    }

    // 5. تحديث زر تسجيل الدخول/الخروج في index.html (صفحة الهبوط)
    const authButton = document.getElementById('authButton');
    const registerButton = document.querySelector('.top-btn.register-btn'); // زر "أنشئ حسابك"

    if (authButton) { // هذا الجزء خاص بـ index.html (صفحة الهبوط)
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
}); // نهاية DOMContentLoaded