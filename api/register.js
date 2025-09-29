import { connectDB } from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '❌ Faqat POST ruxsat etiladi' });
  }

  try {
    const db = await connectDB();
    const users = db.collection('users');

    const { ism, familiya, dukon, telefon, parol } = req.body;

    if (!ism || !familiya || !dukon || !telefon || !parol) {
      return res
        .status(400)
        .json({ message: '❌ Barcha maydonlarni to‘ldiring' });
    }

    // Telefon raqam unikal bo‘lishi kerak
    const existing = await users.findOne({ telefon });
    if (existing) {
      return res
        .status(409)
        .json({ message: '❌ Bu telefon raqam ro‘yxatda mavjud' });
    }

    await users.insertOne({
      ism,
      familiya,
      dukon,
      telefon,
      parol,
      createdAt: new Date(),
    });

    return res
      .status(201)
      .json({ message: '✅ Ro‘yxatdan o‘tish muvaffaqiyatli' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: '❌ Server xatosi' });
  }
}
