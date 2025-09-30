import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    try {
      const gptResp = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              "Siz foydalanuvchi gapini o'qib, ingliz tilidagi zamonni aniqlaysiz va o'zbek tarjimasini berasiz. Natija quyidagi formatda bo'lsin: 'Zamon: ... | Tarjima: ...'",
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
