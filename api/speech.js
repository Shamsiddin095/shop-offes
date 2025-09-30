import { IncomingForm } from 'formidable';
import fs from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Vercel uchun bodyParser o‘chirib qo‘yiladi
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Form parsing failed' });
    }

    if (!files.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    try {
      // Read uploaded file as stream
      const fileStream = fs.createReadStream(files.file.filepath);

      const whisperResp = await openai.audio.transcriptions.create({
        file: fileStream,
        model: 'whisper-1',
      });

      res.status(200).json({ text: whisperResp.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Whisper transcription failed' });
    }
  });
}
