import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { text } = req.body;

    if (!text) return res.status(400).json({ error: 'Matn topilmadi' });

    try {
      const gptResp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Siz foydalanuvchining matnini tahlil qilasiz.',
          },
          { role: 'user', content: text },
        ],
      });

      const output = gptResp.choices[0].message.content;

      res.status(200).json({ output });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
