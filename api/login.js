import { connectDB } from "./db.js"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Faqat POST usuli ishlaydi" })
  }

  const { tel, parol } = req.body

  if (!tel || !parol) {
    return res.status(400).json({ message: "Telefon va parol kerak" })
  }

  try {
    const db = await connectDB()

    const user = await db.collection("users").findOne({ tel, parol })

    if (!user) {
      return res.status(401).json({ message: "Telefon yoki parol noto‘g‘ri" })
    }

    return res.status(200).json({ message: "Kirish muvaffaqiyatli", user })
  } catch (error) {
    console.error("DB xato:", error)
    return res.status(500).json({ message: "Server xatosi" })
  }
}
