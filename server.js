// 1. استيراد المكتبات الضرورية
require('dotenv').config(); // لتحميل متغيرات البيئة من ملف .env
const express = require('express'); // إطار عمل Express.js
const { Pool } = require('pg'); // للاتصال بقاعدة بيانات PostgreSQL
const bcrypt = require('bcryptjs'); // لتشفير كلمات المرور
const jwt = require('jsonwebtoken'); // لإنشاء رموز JWT للمصادقة
const cors = require('cors'); // للسماح لطلبات الواجهة الأمامية (front-end) بالوصول للخادم

// 2. تهيئة تطبيق Express
const app = express();
const PORT = process.env.PORT || 3000; // استخدام المنفذ 3000 ليتوافق مع الواجهة الأمامية
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // مفتاح سري لـ JWT (قم بتغييره في .env لمزيد من الأمان)

// 3. Middlewares (برامج وسيطة)
// لخدمة الملفات الثابتة (HTML, CSS, JavaScript) من مجلد 'public'
app.use(express.static('public'));

app.use(cors()); // تفعيل CORS
app.use(express.json()); // تفعيل تحليل طلبات JSON

// 4. تكوين اتصال قاعدة البيانات PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// اختبار اتصال قاعدة البيانات
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to PostgreSQL database!');
    release();
});

// **جديد: Middleware للتحقق من الـ JWT Token**
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expects "Bearer TOKEN"

    if (token == null) {
        return res.status(401).json({ message: 'غير مصرح لك بالوصول (لا يوجد توكن).' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // إذا كان التوكن غير صالح أو انتهت صلاحيته
            return res.status(403).json({ message: 'التوكن غير صالح أو انتهت صلاحيته.' });
        }
        req.user = user; // أضف بيانات المستخدم المستخلصة من التوكن إلى كائن الطلب
        next(); // تابع إلى المسار التالي (المسار المحمي)
    });
}


// 5. نقاط نهاية API (API Endpoints)

// مسار التسجيل (Register)
app.post('/api/register', async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            phone_number,
            parent_phone_number,
            governorate,
            grade,
            password,
            confirm_password
        } = req.body;

        if (!first_name || !last_name || !phone_number || !parent_phone_number || !governorate || !grade || !password || !confirm_password) {
            return res.status(400).json({ message: 'الرجاء إدخال جميع الحقول المطلوبة.' });
        }

        if (password !== confirm_password) {
            return res.status(400).json({ message: 'كلمة السر وتأكيد كلمة السر غير متطابقين.' });
        }

        const existingUser = await pool.query('SELECT id FROM users WHERE phone_number = $1', [phone_number]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'رقم الهاتف هذا مسجل بالفعل. الرجاء تسجيل الدخول أو استخدام رقم آخر.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            `INSERT INTO users (first_name, last_name, phone_number, parent_phone_number, governorate, grade, password)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, first_name, last_name, phone_number`,
            [first_name, last_name, phone_number, parent_phone_number, governorate, grade, hashedPassword]
        );

        res.status(201).json({
            message: 'تم إنشاء الحساب بنجاح!',
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).json({ message: 'حدث خطأ أثناء التسجيل. الرجاء المحاولة مرة أخرى لاحقاً.' });
    }
});

// مسار تسجيل الدخول (Login)
app.post('/api/login', async (req, res) => {
    try {
        const { phone_number, password } = req.body;

        if (!phone_number || !password) {
            return res.status(400).json({ message: 'الرجاء إدخال رقم الهاتف وكلمة المرور.' });
        }

        const user = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);

        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'رقم الهاتف أو كلمة المرور غير صحيحة.' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({ message: 'رقم الهاتف أو كلمة المرور غير صحيحة.' });
        }

        const token = jwt.sign({ id: user.rows[0].id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'تم تسجيل الدخول بنجاح!', token });

    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى لاحقاً.' });
    }
});

// مثال لمسار محمي - يمكن للمستخدمين المصادق عليهم فقط الوصول إليه
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // ID المستخدم يأتي من التوكن بعد التحقق
        const userProfile = await pool.query('SELECT id, first_name, last_name, phone_number, governorate, grade FROM users WHERE id = $1', [userId]);

        if (userProfile.rows.length === 0) {
            // نظرياً، هذا لا يجب أن يحدث إذا كان الـ ID من توكن صالح
            return res.status(404).json({ message: 'المستخدم غير موجود.' });
        }
        res.status(200).json(userProfile.rows[0]);
    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        res.status(500).json({ message: 'حدث خطأ أثناء جلب بيانات المستخدم.' });
    }
});


// مسار افتراضي لخدمة index.html عند الوصول للمسار الجذري
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


// 6. تشغيل الخادم
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access Landing Page at: http://localhost:${PORT}`);
    console.log(`Access Login Page at: http://localhost:${PORT}/login.html`); // تم التعديل هنا
    console.log(`Access Registration Page at: http://localhost:${PORT}/register.html`);
    console.log(`Access Main Page at: http://localhost:${PORT}/main-page.html (requires login)`);
    console.log(`Access Home Page at: http://localhost:${PORT}/home.html (requires login)`);
});