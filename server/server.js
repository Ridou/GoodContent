const express = require('express');
const cors = require('cors');
const { fetchShorts } = require('./utils/fetchYouTubeTrending');
const { generateContent } = require('./utils/fetchSummary');
const { bucket } = require('./firebaseConfig');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const youtubedl = require('youtube-dl-exec');
const { exec } = require('child_process');
const axios = require('axios');

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

const ensureTmpDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const uploadToFirebase = async (filePath) => {
  const fileName = path.basename(filePath);
  const blob = bucket.file(fileName);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: 'audio/wav',
    },
  });

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath).pipe(blobStream)
      .on('error', (err) => {
        console.error('Error uploading to Firebase Storage:', err);
        reject(err);
      })
      .on('finish', async () => {
        await blob.makePublic();
        resolve(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
      });
  });
};

const downloadFromFirebase = async (url, dest) => {
  const writer = fs.createWriteStream(dest);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

const separateAudioFiles = async (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const command = `spleeter separate -p spleeter:2stems -o ${outputPath} ${inputPath}`;
    console.log(`Executing command: ${command}`);
    exec(command, { shell: true }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error separating audio: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        reject(error);
      } else {
        console.log(`stdout: ${stdout}`);
        resolve();
      }
    });
  });
};

app.post('/generate', async (req, res) => {
  const { videoUrl, title, description } = req.body;
  try {
    const audioFileName = `${uuidv4()}.mp3`;
    const audioFilePath = path.join(__dirname, 'tmp', audioFileName);
    const separatedAudioPath = path.join(__dirname, 'tmp', uuidv4());

    // Ensure the tmp directory exists
    ensureTmpDirectory(path.join(__dirname, 'tmp'));

    // Download audio using youtube-dl
    await youtubedl(videoUrl, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: audioFilePath,
    });

    console.log(`Audio file downloaded: ${audioFilePath}`);

    // Upload audio to Firebase
    const audioUrl = await uploadToFirebase(audioFilePath);
    console.log(`Audio file uploaded to Firebase: ${audioUrl}`);

    // Download audio from Firebase to local path
    const localAudioPath = path.join(__dirname, 'tmp', `${uuidv4()}.mp3`);
    await downloadFromFirebase(audioUrl, localAudioPath);
    console.log(`Audio file downloaded from Firebase: ${localAudioPath}`);

    // Separate audio using Spleeter
    await separateAudioFiles(localAudioPath, separatedAudioPath);

    // Validate separated audio files paths
    const vocalSubPath = path.basename(localAudioPath, path.extname(localAudioPath));
    const vocalPath = path.join(separatedAudioPath, vocalSubPath, 'vocals.wav');
    const accompanimentPath = path.join(separatedAudioPath, vocalSubPath, 'accompaniment.wav');

    console.log(`Vocal path: ${vocalPath}`);
    console.log(`Accompaniment path: ${accompanimentPath}`);

    if (!fs.existsSync(vocalPath) || !fs.existsSync(accompanimentPath)) {
      throw new Error('Failed to separate audio files.');
    }

    const vocalUrl = await uploadToFirebase(vocalPath);
    const accompanimentUrl = await uploadToFirebase(accompanimentPath);

    console.log(`Vocal URL: ${vocalUrl}`);
    console.log(`Accompaniment URL: ${accompanimentUrl}`);

    res.json({
      message: 'Audio separation and upload successful.',
      vocalUrl,
      accompanimentUrl,
    });

    // Clean up the local files
    fs.unlinkSync(audioFilePath);
    fs.unlinkSync(localAudioPath);
    fs.unlinkSync(vocalPath);
    fs.unlinkSync(accompanimentPath);
  } catch (error) {
    console.error('Error in /generate endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
