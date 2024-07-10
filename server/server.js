const express = require('express');
const cors = require('cors');
const { fetchShorts } = require('./utils/fetchYouTubeTrending');
const { generateContent } = require('./utils/fetchSummary');
const { bucket } = require('./firebaseConfig');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.get('/fetch-trending', async (req, res) => {
  try {
    const trendingVideos = await fetchShorts();
    res.json(trendingVideos);
  } catch (error) {
    console.error('Error in /fetch-trending endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/generate', upload.single('audio'), async (req, res) => {
  const { videoUrl, title, description } = req.body;
  try {
    const audioFile = req.file;
    const fileName = `${uuidv4()}-${audioFile.originalname}`;
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: audioFile.mimetype,
      },
    });

    blobStream.on('error', (err) => {
      console.error('Error uploading to Firebase Storage:', err);
      res.status(500).json({ error: err.message });
    });

    blobStream.on('finish', async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      const content = await generateContent({ videoUrl, title, description, audioUrl: publicUrl });
      res.json({ summary: content });
    });

    blobStream.end(audioFile.buffer);
  } catch (error) {
    console.error('Error in /generate endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
