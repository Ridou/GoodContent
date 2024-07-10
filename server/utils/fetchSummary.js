const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const ytdl = require('ytdl-core');
const admin = require('firebase-admin');
require('dotenv').config();

const API_KEYS = [
  process.env.OPENAI_API_KEY_1,
  process.env.OPENAI_API_KEY_2
];

let apiKeyIndex = 0;

const getApiKey = () => {
  const key = API_KEYS[apiKeyIndex];
  apiKeyIndex = (apiKeyIndex + 1) % API_KEYS.length;
  return key;
};

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require('./path/to/your/serviceAccountKey.json')),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const bucket = admin.storage().bucket();

const downloadAudio = async (videoUrl) => {
  try {
    const audioPath = './audio.mp3'; // Temporary file to store the audio
    await new Promise((resolve, reject) => {
      ytdl(videoUrl, { filter: 'audioonly' })
        .pipe(fs.createWriteStream(audioPath))
        .on('finish', resolve)
        .on('error', reject);
    });

    // Upload the file to Firebase Storage
    const [file] = await bucket.upload(audioPath, {
      destination: `audio/${Date.now()}-audio.mp3`,
      metadata: {
        contentType: 'audio/mpeg'
      }
    });

    // Get the public URL of the uploaded file
    const audioUrl = await file.getSignedUrl({
      action: 'read',
      expires: '03-17-2025'
    });

    fs.unlinkSync(audioPath); // Clean up the temporary audio file

    return audioUrl[0];
  } catch (error) {
    console.error('Error downloading audio:', error);
    throw new Error('Audio download failed.');
  }
};

const transcribeAudio = async (audioUrl) => {
  try {
    const audioResponse = await axios.get(audioUrl, { responseType: 'stream' });
    const form = new FormData();
    form.append('file', audioResponse.data, { filename: 'audio.mp3' });
    form.append('model', 'whisper-1');

    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${getApiKey()}`,
        },
      }
    );
    return response.data.text;
  } catch (error) {
    console.error('Error transcribing audio with Whisper:', error.response ? error.response.data : error);
    throw error;
  }
};

const generateSummary = async (transcription) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Summarize the following video content in English. Do not repeat the description, just react to the video.'
          },
          {
            role: 'user',
            content: `Video transcription: ${transcription}`
          }
        ],
        max_tokens: 150
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getApiKey()}`,
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary with ChatGPT:', error.response ? error.response.data : error);
    throw error;
  }
};

const generateContent = async ({ videoUrl, title, description }) => {
  try {
    console.log('Starting audio download...', videoUrl);
    const audioUrl = await downloadAudio(videoUrl);
    console.log('Audio downloaded. Starting transcription...', audioUrl);
    const transcription = await transcribeAudio(audioUrl);
    console.log('Transcription completed. Generating summary...', transcription);
    const summary = await generateSummary(transcription);
    console.log('Summary generated.');
    return summary;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};

module.exports = { generateContent };
