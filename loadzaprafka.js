// loadZaprafkalar.js
import { connectDB } from "./api/db";
import zaprafkalarData from "./zaprafkalar.json" assert { type: "json" }; // JSON fayl

async function loadZaprafkalar() {
  try {
    const db = await connectDB();
    const collection = db.collection("zaprafkalar");

    // Collectionni tozalash (agar eski ma'lumotlar bo'lsa)
    await collection.deleteMany({});
    console.log("Collection tozalandi");

    // JSON faylni yuklash
    const result = await collection.insertMany(zaprafkalarData.zaprafkalar);
    console.log(`${result.insertedCount} zaprafka documentlari qo‘shildi`);

    process.exit(0);
  } catch (err) {
    console.error("Xatolik yuz berdi:", err);
    process.exit(1);
  }
}

loadZaprafkalar();
