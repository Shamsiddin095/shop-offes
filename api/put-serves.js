import { connectDB } from './db.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const db = await connectDB();
      const zaprafka = req.body;
      const collection = db.collection('zaprafkalar');

      // 👇 Tekshirish: shu admin allaqachon xizmat yaratganmi?
      const oldService = await collection.findOne({
        createdBy: zaprafka.createdBy,
      });
      if (oldService) {
        return res
          .status(400)
          .json({ message: '❌ Siz allaqachon bir hizmat yaratgansiz' });
      }

      const result = await collection.insertOne(zaprafka);
      res
        .status(201)
        .json({ message: '✅ Hizmat yaratildi', id: result.insertedId });
    } catch (err) {
      res.status(500).json({ message: 'Server xatosi', error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
