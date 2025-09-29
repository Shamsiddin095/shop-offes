import { connectDB } from '../db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = await connectDB();
    const qarzlar = await db.collection('qarzlar').find().toArray();
    res.status(200).json(qarzlar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server xatosi' });
  }
}
