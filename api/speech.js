import OpenAI from 'openai';
import { IncomingForm } from 'formidable';
import fs from 'fs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: err.message });
      try {
        const fileStream = fs.createReadStream(files.file.filepath);

        const whisperResp = await openai.audio.transcriptions.create({
          file: fileStream,
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
