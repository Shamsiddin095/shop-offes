import { connectDB } from '../db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { mijoz, telefon, summa } = req.body;

  if (!mijoz || !telefon || !summa) {
    return res.status(400).json({ message: "Ma'lumotlar yetarli emas" });
  }

  try {
    const db = await connectDB();

    // Agar mijoz avvaldan mavjud bo'lsa, qarz summasini qo'shamiz
    const existing = await db.collection('qarzlar').findOne({ mijoz });

    if (existing) {
      await db.collection('qarzlar').updateOne(
        { _id: existing._id },
        {
          $inc: { summa: Number(summa) },
          $push: { history: { summa: Number(summa), date: new Date() } },
        },
      );
    } else {
      await db.collection('qarzlar').insertOne({
        mijoz,
        telefon,
        summa: Number(summa),
        history: [{ summa: Number(summa), date: new Date() }],
        createdAt: new Date(),
      });
    }

    res.status(200).json({ message: 'Qarz qo‘shildi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server xatosi' });
  }
}
