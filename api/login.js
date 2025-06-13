// api/login.js

// استيراد المكتبات الضرورية
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

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
            process.env.JWT_SECRET, { expiresIn: '1h' } // الرمز صالح لمدة ساعة واحدة
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
};