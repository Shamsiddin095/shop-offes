import { connectDB } from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '❌ Faqat POST ruxsat etiladi' });
  }

  try {
    const db = await connectDB();
    const users = db.collection('users');

    const { telefon, parol } = req.body;

    if (!telefon || !parol) {
      return res
        .status(400)
        .json({ message: '❌ Telefon va parol kiritish shart' });
    }

    const user = await users.findOne({ telefon });

    if (!user) {
      return res.status(404).json({ message: '❌ Foydalanuvchi topilmadi' });
    }

    if (user.parol !== parol) {
      return res.status(401).json({ message: '❌ Parol noto‘g‘ri' });
    }

    // Agar hammasi to‘g‘ri bo‘lsa
    return res.status(200).json({
      message: '✅ Kirish muvaffaqiyatli',
      user: {
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
