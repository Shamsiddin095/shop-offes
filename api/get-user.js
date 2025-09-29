import { connectDB } from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Faqat POST usuli ishlaydi' });
  }

  const { tel } = req.body;
  if (!tel) {
    return res.status(400).json({ message: 'Telefon raqam yuborilmadi' });
  }

  try {
    const db = await connectDB();

    // Foydalanuvchini users kolleksiyasidan topamiz
    const user = await db.collection('users').findOne({ tel });

    // Agar foydalanuvchi topilmasa
    if (!user) {
      return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    }

    // Role'ni tekshirish
    if (user.role === 'admin') {
      user.isAdmin = true; // Admin bo'lsa, buni alohida belgilash mumkin
    } else {
      user.isAdmin = false; // Oddiy foydalanuvchi
    }

    // Foydalanuvchi ma'lumotlarini qaytarish
    return res.status(200).json(user);
  } catch (error) {
    console.error('DB xato:', error);
    return res.status(500).json({ message: 'Server xatosi' });
  }
}
