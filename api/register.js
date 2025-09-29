import { connectDB } from './db.js';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = await connectDB();
    const { ism, tel, parol, mashina, texpasport, role } = req.body;

    if (!ism || !tel || !parol || !role) {
      return res
        .status(400)
        .json({ message: 'Barcha majburiy maydonlar kiritilishi kerak' });
    }

    // Admin uchun mashina va texpasport talab qilinmaydi
    if (role !== 'admin' && (!mashina || !texpasport)) {
      return res.status(400).json({
        message: 'Mashina va texpasport majburiy foydalanuvchi uchun',
      });
    }

    // Takrorlanishni tekshirish
    let exists;
    if (role === 'admin') {
      // Admin faqat telefon raqam bo‘yicha tekshiriladi
      exists = await db.collection('users').findOne({ tel });
    } else {
      // Oddiy user tel, mashina va texpasport bo‘yicha tekshiriladi
      exists = await db.collection('users').findOne({
        $or: [{ tel }, { mashina }, { texpasport }],
      });
    }

    if (exists) {
      return res.status(409).json({
        message:
          role === 'admin'
            ? 'Bu telefon raqam bilan admin allaqachon mavjud'
            : 'Bu telefon raqam, mashina raqami yoki texpasport raqami bilan foydalanuvchi allaqachon mavjud',
      });
    }

    // Parolni xeshlash
    const hashedPassword = await bcrypt.hash(parol, 10);

    // Yangi foydalanuvchini qo‘shish
    const newUser = {
      ism,
      tel,
      parol: hashedPassword,
      role,
      mashina: role === 'admin' ? '' : mashina,
      texpasport: role === 'admin' ? '' : texpasport,
      balance: 0,
      createdAt: new Date(),
    };

    await db.collection('users').insertOne(newUser);

    return res
      .status(201)
      .json({ message: 'Foydalanuvchi muvaffaqiyatli ro‘yxatdan o‘tdi' });
  } catch (error) {
    console.error('❌ Register error:', error);
    return res.status(500).json({ message: 'Server xatosi' });
  }
}
