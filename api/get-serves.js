import { connectDB } from "./db.js"

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const db = await connectDB()
      const zaprafkalar = await db.collection("zaprafkalar").find({}).toArray()
      res.status(200).json(zaprafkalar)
    } catch (err) {
      res.status(500).json({ message: "Server xatosi" })
    }
  } else res.status(405).json({ message: "Method not allowed" })
}
