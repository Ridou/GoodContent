const axios = require('axios');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve(__dirname, '..', 'config', 'goodcontent-428917-firebase-adminsdk-yxnqd-0041e990ed.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();

const getSpeechAudio = async (text) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/audio/speech', {
      model: 'tts-1',  // You can choose the appropriate model
      voice: 'alloy',  // You can choose the appropriate voice
      input: text,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY_1}`,  // Using the first API key for TTS
      },
      responseType: 'stream',  // Ensuring we get a stream back
    });

    // Save the streamed audio to a temporary file
    const audioPath = path.join(__dirname, '../tmp/speech.mp3');
    const writer = fs.createWriteStream(audioPath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', async () => {
        try {
          // Upload the file to Firebase Storage
          const destinationPath = `audio/speech-${Date.now()}.mp3`;
          await bucket.upload(audioPath, {
            destination: destinationPath,  // Customize the storage path as needed
            public: true,  // Make the file publicly accessible
            metadata: { cacheControl: 'public, max-age=31536000' },
          });

          // Get the public URL of the uploaded file
          const file = bucket.file(destinationPath);
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-01-2500',  // Set an expiration date far in the future
          });

          resolve(url);
        } catch (uploadError) {
          reject(uploadError);
        }
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error fetching speech audio:', error.response ? error.response.data : error);
    throw error;
  }
};

module.exports = { getSpeechAudio };
