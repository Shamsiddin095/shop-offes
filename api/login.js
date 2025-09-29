import { connectDB } from './db.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '❌ Faqat POST ruxsat etiladi' });
  }

  try {
    const db = await connectDB();
    const users = db.collection('users');

    const { telefon, parol } = req.body;

    if (!telefon || !parol) {
      return res.status(400).json({ message: '❌ Telefon va parol kerak' });
    }

    // 👤 Telefon orqali foydalanuvchini topamiz
    const user = await users.findOne({ telefon });
    if (!user) {
      return res
        .status(401)
        .json({ message: '❌ Telefon yoki parol noto‘g‘ri' });
    }

    // 🔑 Parolni solishtirish (kiritilgan va DB dagi hash)
    const isMatch = await bcrypt.compare(parol, user.parol);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: '❌ Telefon yoki parol noto‘g‘ri' });
    }

    // ✅ Parol to‘g‘ri bo‘lsa userni qaytaramiz
    return res.status(200).json({
      message: '✅ Kirish muvaffaqiyatli',
      user: {
        id: user._id,
        ism: user.ism,
        familiya: user.familiya,
        dukon: user.dukon,
        telefon: user.telefon,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: '❌ Server xatosi' });
  }
}
