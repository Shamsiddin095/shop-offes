import OpenAI from 'openai';
import formidable from 'formidable';
import fs from 'fs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: err.message });

      const file = fs.createReadStream(files.file.filepath);

      try {
        const whisperResp = await openai.audio.transcriptions.create({
          file,
          model: 'whisper-1',
        });

        res.status(200).json({ text: whisperResp.text });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
