const express = require('express');
const cors = require('cors');
const { fetchShorts } = require('./utils/fetchYouTubeTrending');
const { generateContent } = require('./utils/fetchSummary');
const { bucket } = require('./firebaseConfig');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const youtubedl = require('youtube-dl-exec');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/fetch-trending', async (req, res) => {
  try {
    const trendingVideos = await fetchShorts();
    res.json(trendingVideos);
  } catch (error) {
    console.error('Error in /fetch-trending endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/generate', async (req, res) => {
  const { videoUrl, title, description } = req.body;
  try {
    const audioFileName = `${uuidv4()}.mp3`;
    const audioFilePath = path.join(__dirname, 'tmp', audioFileName);

    // Ensure the tmp directory exists
    if (!fs.existsSync(path.join(__dirname, 'tmp'))) {
      fs.mkdirSync(path.join(__dirname, 'tmp'));
    }

    // Download audio using youtube-dl
    await youtubedl(videoUrl, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: audioFilePath,
    });

    // Check if the file is correctly downloaded
    if (!fs.existsSync(audioFilePath) || fs.statSync(audioFilePath).size === 0) {
      throw new Error('Failed to download audio file.');
    }

    // Upload audio to Firebase Storage
    const blob = bucket.file(audioFileName);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: 'audio/mpeg',
      },
    });

    fs.createReadStream(audioFilePath).pipe(blobStream);

    blobStream.on('error', (err) => {
      console.error('Error uploading to Firebase Storage:', err);
      res.status(500).json({ error: err.message });
    });

    blobStream.on('finish', async () => {
      // Make the file publicly accessible
      await blob.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${audioFileName}`;
      const content = await generateContent({ videoUrl, title, description, audioUrl: publicUrl });
      console.log('Generated summary:', content); // Log the summary
      res.json({ summary: content });

      // Clean up the local file
      fs.unlinkSync(audioFilePath);
    });

  } catch (error) {
    console.error('Error in /generate endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
