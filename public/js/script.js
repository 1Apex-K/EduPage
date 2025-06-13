// script.js

// 🚨 هام جداً: قم بتغيير هذا الرابط إلى رابط الـ Backend الخاص بك بعد نشره على Railway/Cyclic
// ستجد هذا الرابط في لوحة تحكم Railway بعد نجاح النشر.
// مثال: 'https://your-app-name.up.railway.app'
const backendBaseUrl = 'http://localhost:5000'; // استخدم هذا مؤقتاً للتطوير المحلي

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
  const currentTheme = localStorage.getItem('theme') || 'dark'; // الوضع الافتراضي ليلى
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

// تطبيق الثيم المحفوظ عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    // إذا لم يكن هناك ثيم محفوظ، استخدم الوضع الليلي كافتراضي
    setTheme('dark');
  }

  // تهيئة tsParticles للخلفية العامة (الحروف العربية)
  tsParticles.load({
    id: "particles-background",
    options: {
      particles: {
        number: {
          value: 100,
          density: {
            enable: true,
            value_area: 800
          }
        },
        color: {
          value: "#ffdd00" // لون مبدئي، سيتغير بناءً على الثيم
        },
        shape: {
          type: "char", // نوع الجسيمات هو حروف
          character: [
            {
              value: ["ا", "ل", "أ", "س", "ط", "و", "ر", "ة"], // الحروف العربية
              font: "Cairo",
              style: "",
              weight: "400"
            }
          ]
        },
        opacity: {
          value: 0.5,
          random: false,
          anim: {
            enable: false
          }
        },
        size: {
          value: 16,
          random: true,
          anim: {
            enable: false
          }
        },
        links: {
          enable: true,
          distance: 150,
          color: "#88ccff", // لون مبدئي، سيتغير بناءً على الثيم
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 1,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "grab"
          },
          onclick: {
            enable: true,
            mode: "push"
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 1
            }
          },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 8,
            speed: 3
          },
          repulse: {
            distance: 200,
            duration: 0.4
          },
          push: {
            particles_nb: 4
          },
          remove: {
            particles_nb: 2
          }
        }
      },
      retina_detect: true,
      background: {
        color: "transparent" // الخلفية ستكون من الـ body
      }
    }
  });


  // تهيئة tsParticles للطائرة المتحركة (إذا كانت موجودة في main-page.html)
  const planeParticlesDiv = document.getElementById('plane-particles');
  if (planeParticlesDiv) {
    tsParticles.load({
      id: "plane-particles",
      options: {
        particles: {
          number: {
            value: 1, // جسيم واحد يمثل الطائرة
            density: {
              enable: false
            }
          },
          color: {
            value: "#ff4500" // لون الطائرة
          },
          shape: {
            type: "image",
            image: {
              src: "https://www.freeiconspng.com/uploads/airplane-png-picture-25.png", // رابط صورة الطائرة
              width: 100,
              height: 100
            }
          },
          opacity: {
            value: 1,
            random: false,
            anim: {
              enable: false
            }
          },
          size: {
            value: 50, // حجم الطائرة
            random: false,
            anim: {
              enable: false
            }
          },
          move: {
            enable: true,
            speed: 2, // سرعة الطائرة
            direction: "right", // اتجاه الحركة
            random: false,
            straight: true,
            out_mode: "bounce", // تعود عندما تصل للنهاية
            bounce: false,
            attract: {
              enable: false
            }
          }
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: {
              enable: false
            },
            onclick: {
              enable: false
            },
            resize: false
          }
        },
        retina_detect: false
      }
    });
  }

  // لتشغيل تأثير الكتابة الديناميكي في main-page.html
  const dynamicTextElement = document.getElementById('dynamic-text');
  if (dynamicTextElement) {
    const phrases = [
      "بوابتك للمستقبل 🎓",
      "معك خطوة بخطوة 🚀",
      "خطوتك الأولى نحو التميز ✨",
      "الأساس المتين لنجاحك 📚"
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100; // سرعة الكتابة (أقل يعني أسرع)
    let deletingSpeed = 50; // سرعة المسح
    let pauseBeforeDeleting = 1500; // وقت التوقف قبل المسح (بالمللي ثانية)
    let pauseBeforeTyping = 700; // وقت التوقف قبل الكتابة التالية

    function typeEffect() {
      const currentPhrase = phrases[phraseIndex];
      if (isDeleting) {
        // حذف الحروف
        dynamicTextElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
      } else {
        // كتابة الحروف
        dynamicTextElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
      }

      let currentTypingSpeed = isDeleting ? deletingSpeed : typingSpeed;

      if (!isDeleting && charIndex === currentPhrase.length) {
        // تم الانتهاء من كتابة الجملة، توقف ثم ابدأ المسح
        currentTypingSpeed = pauseBeforeDeleting;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        // تم الانتهاء من مسح الجملة، توقف ثم ابدأ كتابة الجملة التالية
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length; // الانتقال للجملة التالية
        currentTypingSpeed = pauseBeforeTyping;
      }

      setTimeout(typeEffect, currentTypingSpeed);
    }
    typeEffect(); // بدء التأثير
  }

  // --- ربط نماذج HTML بـ Backend API ---

  // 1. التعامل مع نموذج التسجيل (register.html)
  const registerForm = document.getElementById('registerForm');
  const registerMessageDiv = registerForm ? registerForm.querySelector('#message') : null;

  if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
          e.preventDefault(); // منع الإرسال الافتراضي للصفحة

          const firstName = document.getElementById('firstName').value;
          const lastName = document.getElementById('lastName').value;
          const phoneNumber = document.getElementById('phoneNumber').value;
          const parentPhoneNumber = document.getElementById('parentPhoneNumber').value;
          const governorate = document.getElementById('governorate').value;
          const grade = document.getElementById('grade').value;
          const password = document.getElementById('password').value;
          const confirmPassword = document.getElementById('confirmPassword').value;

          try {
              const response = await fetch(`${backendBaseUrl}/register`, {
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
                      password: password,
                      confirm_password: confirmPassword
                  })
              });

              const data = await response.json(); // تحليل الرد كـ JSON

              if (response.ok) { // إذا كان الرد ناجحًا (حالة 2xx)
                  registerMessageDiv.textContent = data.message;
                  registerMessageDiv.style.color = 'green'; // لون أخضر للنجاح
                  // يمكنك هنا توجيه المستخدم إلى صفحة تسجيل الدخول أو الصفحة الرئيسية
                  setTimeout(() => {
                      window.location.href = 'index.html'; // أو main-page.html بعد تسجيل الدخول
                  }, 2000); // الانتقال بعد ثانيتين
              } else { // إذا كان الرد خطأ (حالة 4xx أو 5xx)
                  registerMessageDiv.textContent = data.message || 'حدث خطأ غير معروف أثناء التسجيل.';
                  registerMessageDiv.style.color = 'red'; // لون أحمر للخطأ
              }
          } catch (error) {
              console.error('Error during fetch:', error);
              registerMessageDiv.textContent = 'فشل الاتصال بالخادم. الرجاء التأكد من تشغيله.';
              registerMessageDiv.style.color = 'red';
          }
      });
  }

  // 2. التعامل مع نموذج تسجيل الدخول (index.html)
  const loginForm = document.getElementById('loginForm');
  const loginMessageDiv = loginForm ? loginForm.querySelector('#message') : null;

  if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          const phoneNumber = document.getElementById('phoneNumber').value;
          const password = document.getElementById('password').value;

          try {
              const response = await fetch(`${backendBaseUrl}/login`, {
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
                  loginMessageDiv.textContent = data.message;
                  loginMessageDiv.style.color = 'green';
                  localStorage.setItem('userToken', data.token); // حفظ الرمز
                  localStorage.setItem('userName', data.user.first_name); // حفظ الاسم
                  setTimeout(() => {
                      window.location.href = 'home.html'; // التوجيه للصفحة الرئيسية
                  }, 1000);
              } else {
                  loginMessageDiv.textContent = data.message || 'حدث خطأ غير معروف أثناء تسجيل الدخول.';
                  loginMessageDiv.style.color = 'red';
              }
          } catch (error) {
              console.error('Error during login:', error);
              loginMessageDiv.textContent = 'فشل الاتصال بالخادم. الرجاء التأكد من تشغيله.';
              loginMessageDiv.style.color = 'red';
          }
      });
  }

  // 3. وظيفة تسجيل الخروج
  function logout() {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userName');
      window.location.href = 'index.html'; // التوجيه لصفحة تسجيل الدخول
  }

  // 4. التحقق من المصادقة عند تحميل الصفحات المحمية
  async function checkAuthentication() {
      const token = localStorage.getItem('userToken');
      if (!token) {
          // إذا لم يكن هناك توكن، أعد التوجيه لصفحة تسجيل الدخول
          window.location.href = 'index.html';
          return false;
      }

      try {
          // محاولة التحقق من التوكن مع الخادم
          const response = await fetch(`${backendBaseUrl}/protected`, {
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
          // إذا كان التوكن صالحاً، لا تفعل شيئاً أو يمكنك عرض رسالة ترحيب
          return true;

      } catch (error) {
          console.error('Error checking authentication:', error);
          logout(); // في حالة وجود خطأ بالاتصال، قم بتسجيل الخروج
          return false;
      }
  }

  // تشغيل التحقق عند تحميل الصفحات المحمية
  const currentPath = window.location.pathname;
  const protectedPages = ['/main-page.html', '/home.html']; // قائمة بالصفحات التي تتطلب مصادقة

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
              authButton.onclick = () => { location.href = 'index.html'; }; // التوجيه لـ login.html
              if (registerButton) {
                  registerButton.style.display = ''; // إظهار زر التسجيل
              }
          }
      }
  }

  // تحديث الاسم في صفحة home.html
  const userNameDisplay = document.getElementById('userNameDisplay');
  if (userNameDisplay) {
      const userName = localStorage.getItem('userName');
      if (userName) {
          userNameDisplay.textContent = `أهلاً بك, ${userName}!`;
      } else {
          // في حال عدم وجود اسم، أعد التوجيه لصفحة تسجيل الدخول
          window.location.href = 'index.html';
      }
  }

}); // نهاية DOMContentLoaded