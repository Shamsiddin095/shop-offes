import { connectDB } from "./db.js"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Faqat POST usuli ishlaydi" })
  }

  const { tel, mashina, texpasport } = req.body

  if (!tel && !mashina && !texpasport) {
    return res.status(400).json({ message: "Kamida bitta maydon kerak" })
  }

  try {
    const db = await connectDB()
    const collection = db.collection("users")

    // Foydalanuvchini tekshirish har bir maydon bo‘yicha
    const existingTel = tel ? await collection.findOne({ tel }) : null
    const existingMashina = mashina
      ? await collection.findOne({ mashina })
      : null
    const existingTexpasport = texpasport
      ? await collection.findOne({ texpasport })
      : null

    // Javobni tayyorlash
    const response = {
      telExists: existingTel ? true : false,
      mashinaExists: existingMashina ? true : false,
      texpasportExists: existingTexpasport ? true : false,
    }

    if (
      response.telExists ||
      response.mashinaExists ||
      response.texpasportExists
    ) {
      // Qaysi maydon mavjudligini aniqlash
      let message = "Ushbu ma'lumot allaqachon mavjud: "
      const existingFields = []
      if (response.telExists) existingFields.push("telefon raqam")
      if (response.mashinaExists) existingFields.push("mashina raqami")
      if (response.texpasportExists) existingFields.push("texpasport raqami")
      message += existingFields.join(", ")

      return res.status(200).json({ exists: true, message, fields: response })
    } else {
      return res
        .status(200)
        .json({ exists: false, message: "Foydalanuvchi topilmadi" })
    }
  } catch (error) {
    console.error("DB xato:", error)
    return res.status(500).json({ message: "Server xatosi" })
  }
}
