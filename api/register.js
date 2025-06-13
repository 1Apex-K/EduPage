// api/register.js

// استيراد المكتبات الضرورية
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// تهيئة اتصال قاعدة البيانات Supabase
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

// دالة معالجة الطلبات (Serverless Function Handler)
module.exports = async (req, res) => {
    // CORS Headers (مهم جداً للسماح للواجهة الأمامية بالاتصال)
    res.setHeader('Access-Control-Allow-Origin', '*'); // السماح لأي نطاق بالوصول (يمكنك تحديد نطاق Netlify الخاص بك لاحقاً)
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // السماح بطلبات POST و OPTIONS
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // السماح برأس Content-Type

    // معالجة طلبات OPTIONS (لـ Preflight requests)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // التأكد من أن الطلب هو POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

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

        // 2. التحقق من قوة كلمة المرور
        if (password.length < 6) {
            return res.status(400).json({ message: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل.' });
        }

        // 3. التحقق مما إذا كان رقم الهاتف موجوداً بالفعل
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
};