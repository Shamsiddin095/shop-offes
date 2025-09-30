// pages/api/speech.js
import nextConnect from 'next-connect';
import multer from 'multer';
import fs from 'fs';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Multer konfiguratsiyasi (temp folder /tmp/ da saqlaydi)
const upload = multer({ dest: '/tmp/' });

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(500).json({ error: `Server xatolik: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  },
});

apiRoute.use(upload.single('file')); // RN FormData key: 'file'

apiRoute.post(async (req, res) => {
  try {
    const filePath = req.file.path; // multer temp fayl
    const fileStream = fs.createReadStream(filePath);

    const whisperResp = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
    });

    res.status(200).json({ text: whisperResp.text });

    // Temp faylni o'chirish
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export const config = { api: { bodyParser: false } };
export default apiRoute;
