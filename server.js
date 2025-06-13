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
app.use(express.static('public'));

// 3. Middlewares (برامج وسيطة)
app.use(cors()); // تفعيل CORS للسماح بالطلبات من نطاقات مختلفة
app.use(express.json()); // تفعيل تحليل طلبات JSON (لاستقبال البيانات المرسلة من الواجهة الأمامية)

// 4. تكوين اتصال قاعدة البيانات PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,        // اسم المستخدم لقاعدة بيانات Supabase (غالباً postgres)
    host: process.env.DB_HOST,        // اسم المضيف من Connection String في Supabase
    database: process.env.DB_DATABASE,    // اسم قاعدة البيانات (غالباً postgres)
    password: process.env.DB_PASSWORD,    // كلمة المرور القوية التي أنشأتها لـ Supabase
    port: process.env.DB_PORT,        // المنفذ (غالباً 6543 لـ pooler في Supabase، أو 5432)
    ssl: {
        rejectUnauthorized: true // تفعيل التحقق من شهادة SSL للاتصال الآمن
    }
});

// اختبار الاتصال بقاعدة البيانات عند بدء تشغيل السيرفر
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release(); // release the client back to the pool
        if (err) {
            return console.error('Error executing query', err.stack);
        }
        console.log('Database connected at:', result.rows[0].now);
    });
});

// 5. مسار تسجيل المستخدمين الجدد
app.post('/register', async (req, res) => {
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

        // 1. التحقق من تطابق كلمات المرور
        if (password !== confirm_password) {
            return res.status(400).json({ message: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين.' });
        }

        // 2. التحقق من قوة كلمة المرور (يمكنك إضافة منطق أكثر تعقيداً هنا)
        if (password.length < 6) {
            return res.status(400).json({ message: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.' });
        }

        // 3. التحقق مما إذا كان رقم الهاتف موجوداً بالفعل
        const existingUser = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'رقم الهاتف هذا مسجل بالفعل. الرجاء تسجيل الدخول أو استخدام رقم آخر.' });
        }

        // 4. تشفير كلمة المرور
        const salt = await bcrypt.genSalt(10); // saltRounds (عدد جولات التشفير) كلما زاد الرقم، زاد الأمان، ولكن زاد الوقت المستغرق
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

// 6. مسار تسجيل الدخول
app.post('/login', async (req, res) => {
    try {
        const { phone_number, password } = req.body;

        // 1. البحث عن المستخدم برقم الهاتف
        const user = await pool.query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'رقم الهاتف أو كلمة المرور غير صحيحة.' });
        }

        const foundUser = user.rows[0];

        // 2. مقارنة كلمة المرور المشفرة
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'رقم الهاتف أو كلمة المرور غير صحيحة.' });
        }

        // 3. إنشاء رمز JWT
        const token = jwt.sign(
            { id: foundUser.id, phone_number: foundUser.phone_number },
            JWT_SECRET, { expiresIn: '1h' } // الرمز صالح لمدة ساعة واحدة
        );

        // 4. إرسال الرمز كاستجابة
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
app.get('/protected', async (req, res) => {
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
        res.status(401).json({ message: 'رمز مصادقة غير صالح أو منتهي الصلاحية.' });
    }
});


// 8. تشغيل الخادم
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Backend URL: http://localhost:${PORT}`);
});