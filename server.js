// 1. استيراد المكتبات الضرورية
require('dotenv').config(); // تحميل متغيرات البيئة من ملف .env (لاستخدامها محلياً)
const express = require('express'); // إطار عمل Express.js
const { Pool } = require('pg'); // للاتصال بقاعدة بيانات PostgreSQL
const bcrypt = require('bcryptjs'); // لتشفير كلمات المرور
const jwt = require('jsonwebtoken'); // لإنشاء رموز JWT للمصادقة
const cors = require('cors'); // للسماح لطلبات الواجهة الأمامية (front-end) بالوصول للخادم

// 2. تهيئة تطبيق Express
const app = express();
const PORT = process.env.PORT || 5000; // قراءة المنفذ من متغيرات البيئة، أو استخدام 5000 كافتراضي
const JWT_SECRET = process.env.JWT_SECRET; // قراءة مفتاح JWT السري

// تهيئة مجلد 'public' لتقديم الملفات الثابتة (الواجهة الأمامية)
// في Vercel، لا تحتاج لـ `app.use(express.static('public'));` داخل serverless function
// لأن Vercel يتعامل مع ملفات `public` بشكل منفصل.
// ولكن إذا كنت تختبر محلياً كـ Node.js app، فستحتاجها.
// لأغراض Vercel serverless function، هذا الجزء سيتم إزالته أو تجاهله.

// 3. Middlewares (برامج وسيطة)
app.use(cors()); // تفعيل CORS للسماح بالطلبات من نطاقات مختلفة
app.use(express.json()); // تفعيل تحليل طلبات JSON (لاستقبال البيانات المرسلة من الواجهة الأمامية)

// 4. تكوين اتصال قاعدة البيانات PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,        // اسم المستخدم لقاعدة بيانات Supabase (غالباً postgres)
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false // هام لـ Supabase لتجاوز خطأ الشهادة
    }
});

// 5. مسار تسجيل المستخدمين الجدد
app.post('/api/register', async (req, res) => {
    const { first_name, last_name, phone_number, parent_phone_number, governorate, grade, password } = req.body;

    // 1. التحقق من صحة البيانات المدخلة
    if (!first_name || !last_name || !phone_number || !parent_phone_number || !governorate || !grade || !password) {
        return res.status(400).json({ message: 'الرجاء إدخال جميع الحقول المطلوبة.' });
    }

    // 2. التحقق من طول كلمة المرور (على الأقل 6 أحرف)
    if (password.length < 6) {
        return res.status(400).json({ message: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.' });
    }

    try {
        // 3. التحقق مما إذا كان رقم الهاتف مسجلاً بالفعل
        const existingUser = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'رقم الهاتف هذا مسجل بالفعل. الرجاء تسجيل الدخول أو استخدام رقم آخر.' });
        }

        // 4. تشفير كلمة المرور
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. حفظ المستخدم الجديد في قاعدة البيانات
        const newUser = await pool.query(
            `INSERT INTO users (first_name, last_name, phone_number, parent_phone_number, governorate, grade, password)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, first_name, last_name, phone_number`,
            [first_name, last_name, phone_number, parent_phone_number, governorate, grade, hashedPassword]
        );

        // 6. إرسال رد النجاح
        res.status(201).json({
            message: 'تم إنشاء الحساب بنجاح!',
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).json({ message: 'حدث خطأ أثناء التسجيل. الرجاء المحاولة مرة أخرى لاحقاً.' });
    }
});

// 6. مسار تسجيل الدخول للمستخدمين
app.post('/api/login', async (req, res) => {
    const { phone_number, password } = req.body;

    // 1. التحقق من وجود البيانات
    if (!phone_number || !password) {
        return res.status(400).json({ message: 'الرجاء إدخال رقم الهاتف وكلمة المرور.' });
    }

    try {
        // 2. البحث عن المستخدم في قاعدة البيانات
        const result = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
        const foundUser = result.rows[0];

        if (!foundUser) {
            return res.status(401).json({ message: 'رقم الهاتف أو كلمة المرور غير صحيحة.' });
        }

        // 3. مقارنة كلمة المرور المدخلة بكلمة المرور المشفرة
        const isMatch = await bcrypt.compare(password, foundUser.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'رقم الهاتف أو كلمة المرور غير صحيحة.' });
        }

        // 4. إنشاء رمز JWT (JSON Web Token)
        const token = jwt.sign(
            { id: foundUser.id, phone_number: foundUser.phone_number },
            JWT_SECRET,
            { expiresIn: '1h' } // انتهاء صلاحية الرمز بعد ساعة واحدة
        );

        // 5. إرسال الرمز ومعلومات المستخدم
        res.status(200).json({
            message: 'تم تسجيل الدخول بنجاح!',
            token: token,
            user: {
                id: foundUser.id,
                first_name: foundUser.first_name,
                last_name: foundUser.last_name,
                phone_number: foundUser.phone_number
            }
        });

    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى لاحقاً.' });
    }
});

// 7. مسار محمي (يتطلب مصادقة JWT) - مثال
app.get('/api/protected', async (req, res) => {
    try {
        // التحقق من وجود الرمز في رأس الطلب (Authorization header)
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'الوصول مرفوض. لا يوجد رمز مصادقة.' });
        }

        // التحقق من صحة الرمز
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // إضافة معلومات المستخدم إلى كائن الطلب

        // إذا كان الرمز صحيحاً، يمكننا إرسال بيانات محمية
        res.status(200).json({ message: 'تم الوصول إلى بيانات محمية بنجاح!', user: req.user });

    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ message: 'الرمز غير صالح أو منتهي الصلاحية.' });
    }
});

// تصدير تطبيق Express كـ Serverless Function
module.exports = app;