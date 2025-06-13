// api/protected.js

// استيراد المكتبات الضرورية
const jwt = require('jsonwebtoken');

// دالة معالجة الطلبات (Serverless Function Handler)
module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // التحقق من وجود الرمز في رأس الطلب (Authorization header)
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'الوصول مرفوض. لا يوجد رمز مصادقة.' });
        }

        // التحقق من صحة الرمز
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // لا نحتاج لتعيين req.user لأن هذه وظيفة فردية، يمكن استخدام decoded مباشرة.

        // إذا كان الرمز صحيحاً، يمكننا إرسال بيانات محمية
        res.status(200).json({ message: 'تم الوصول إلى بيانات محمية بنجاح!', user: decoded });

    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ message: 'رمز مصادقة غير صالح أو منتهي الصلاحية.' });
    }
};