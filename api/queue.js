import { connectDB } from './db.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const type = req.query.type; // type=take, sell, buy, leave

  try {
    const db = await connectDB();
    const collection = db.collection('zaprafkalar');
    const users = db.collection('users');

    if (type === 'take') {
      const { userId, ism, zaprafkaId, kalonkaId, mashina, rusum, rang } =
        req.body;

      if (!userId || !zaprafkaId || !kalonkaId || !mashina || !rusum || !rang) {
        return res
          .status(400)
          .json({ message: 'Kerakli maydonlar to‘liq yuborilmadi' });
      }

      const zaprafka = await collection.findOne({
        _id: new ObjectId(zaprafkaId),
      });
      if (!zaprafka)
        return res.status(404).json({ message: 'Zaprafka topilmadi' });

      const kalonkaIndex = zaprafka.kalonkalar.findIndex(
        (k) => k.kalonka_id === kalonkaId,
      );
      if (kalonkaIndex === -1)
        return res.status(404).json({ message: 'Kalonka topilmadi' });

      // eski navbatlarni olib tashlash
      zaprafka.kalonkalar.forEach((k) => {
        k.navbat = k.navbat.filter((n) => n.userId !== userId);
      });

      // yangi navbat
      const navbatEntry = {
        userId,
        ism,
        mashina,
        rusum,
        rang,
        timestamp: new Date(),
      };
      zaprafka.kalonkalar[kalonkaIndex].navbat.push(navbatEntry);

      await collection.updateOne(
        { _id: new ObjectId(zaprafkaId) },
        { $set: { kalonkalar: zaprafka.kalonkalar } },
      );

      // Navbat raqamini hisoblaymiz
      const navbatRaqami = zaprafka.kalonkalar[kalonkaIndex].navbat.length;

      return res.status(200).json({
        message: 'Navbatga muvaffaqiyatli qo‘shildingiz',
        navbat: navbatEntry,
        navbatRaqami, // shu property frontendda ishlatiladi
      });
    } else if (type === 'next') {
      const { zaprafkaId, kalonkaId } = req.body;
      if (!zaprafkaId || !kalonkaId) {
        return res
          .status(400)
          .json({ message: 'Kerakli maydonlar yuborilmadi' });
      }

      const zaprafka = await collection.findOne({
        _id: new ObjectId(zaprafkaId),
      });
      if (!zaprafka)
        return res.status(404).json({ message: 'Zaprafka topilmadi' });

      const kalonkaIndex = zaprafka.kalonkalar.findIndex(
        (k) => k.kalonka_id === kalonkaId,
      );
      if (kalonkaIndex === -1)
        return res.status(404).json({ message: 'Kalonka topilmadi' });

      if (
        !Array.isArray(zaprafka.kalonkalar[kalonkaIndex].navbat) ||
        zaprafka.kalonkalar[kalonkaIndex].navbat.length === 0
      ) {
        return res.status(400).json({ message: "Navbat bo'sh" });
      }

      // 1-navbat foydalanuvchisini olib tashlash
      zaprafka.kalonkalar[kalonkaIndex].navbat.shift();

      await collection.updateOne(
        { _id: new ObjectId(zaprafkaId) },
        { $set: { kalonkalar: zaprafka.kalonkalar } },
      );

      return res.status(200).json({ message: "Keyingi navbatga o'tildi" });
    } else if (type === 'leave') {
      const { userId, zaprafkaId, kalonkaId } = req.body;
      if (!userId || !zaprafkaId || !kalonkaId) {
        return res
          .status(400)
          .json({ message: 'Kerakli maydonlar to‘liq yuborilmadi' });
      }

      const zaprafka = await collection.findOne({
        _id: new ObjectId(zaprafkaId),
      });
      if (!zaprafka)
        return res.status(404).json({ message: 'Zaprafka topilmadi' });

      const kalonkaIndex = zaprafka.kalonkalar.findIndex(
        (k) => k.kalonka_id === kalonkaId,
      );
      if (kalonkaIndex === -1)
        return res.status(404).json({ message: 'Kalonka topilmadi' });

      // pull navbat va navbatSotuv
      if (Array.isArray(zaprafka.kalonkalar[kalonkaIndex].navbat)) {
        zaprafka.kalonkalar[kalonkaIndex].navbat = zaprafka.kalonkalar[
          kalonkaIndex
        ].navbat.filter((n) => n.userId !== userId);
      }
      if (Array.isArray(zaprafka.kalonkalar[kalonkaIndex].navbatSotuv)) {
        zaprafka.kalonkalar[kalonkaIndex].navbatSotuv = zaprafka.kalonkalar[
          kalonkaIndex
        ].navbatSotuv.filter((n) => n.userId !== userId);
      }

      await collection.updateOne(
        { _id: new ObjectId(zaprafkaId) },
        { $set: { kalonkalar: zaprafka.kalonkalar } },
      );

      return res
        .status(200)
        .json({ message: 'Navbatdan muvaffaqiyatli chiqildi' });
    } else {
      return res.status(400).json({ message: 'Noma’lum operatsiya turi' });
    }
  } catch (err) {
    console.error('❌ queue error:', err);
    return res.status(500).json({ message: 'Server xatosi' });
  }
}
