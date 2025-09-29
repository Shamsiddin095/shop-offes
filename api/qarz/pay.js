import { connectDB } from '../db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { mijoz } = req.body;
  if (!mijoz) return res.status(400).json({ message: 'Mijoz nomi kerak' });

  try {
    const db = await connectDB();
    const result = await db.collection('qarzlar').deleteOne({ mijoz });

    if (result.deletedCount > 0) {
      res.status(200).json({ message: `${mijoz} qarzi to‘landi` });
    } else {
      res.status(404).json({ message: 'Bunday mijoz topilmadi' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server xatosi' });
  }
}
