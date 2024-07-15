const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();
const { getSpeechAudio } = require('./fetchSpeech');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const API_KEYS = [
  process.env.OPENAI_API_KEY_1,
  process.env.OPENAI_API_KEY_2,
];

let apiKeyIndex = 0;

const getApiKey = () => {
  const key = API_KEYS[apiKeyIndex];
  apiKeyIndex = (apiKeyIndex + 1) % API_KEYS.length;
  return key;
};

const transcribeAudio = async (audioUrl) => {
  try {
    const audioResponse = await axios.get(audioUrl, { responseType: 'stream' });
    const form = new FormData();
    form.append('file', audioResponse.data, 'audio.mp3');
    form.append('model', 'whisper-1');

    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${getApiKey()}`,
      },
    });
    return response.data.text;
  } catch (error) {
    console.error('Error transcribing audio with Whisper:', error.response ? error.response.data : error);
    throw error;
  }
};

const toneInstructions = {
  dramatic: 'You are a professional translator. Translate as best as possible maintaining the context...',
  informative: 'You are a professional translator. Be informative and provide a detailed explanation. Translate as best as possible maintaining the context...',
  humorous: 'You are a professional translator. Be humorous and add some witty comments. Translate as best as possible maintaining the context...',
  emotional: 'You are a professional translator. Be emotional and emphasize the feelings. Translate as best as possible maintaining the context...',
};

const generateSummary = async (transcription, tone) => {
  try {
    const toneInstruction = toneInstructions[tone] || toneInstructions.dramatic;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: toneInstruction },
        { role: 'user', content: `Video transcription: ${transcription}` },
      ],
      max_tokens: 150,
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getApiKey()}`,
      },
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary with ChatGPT:', error.response ? error.response.data : error);
    throw error;
  }
};

const separateAudioFiles = async (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const command = `spleeter separate -i "${inputPath.replace(/\\/g, '\\\\')}" -o "${outputPath.replace(/\\/g, '\\\\')}"`;
    exec(command, (error, stdout, stderr) => {
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

const combineAudio = async (backgroundPath, voicePath, outputPath) => {
  return new Promise((resolve, reject) => {
    exec(`ffmpeg -i ${backgroundPath} -i ${voicePath} -filter_complex "[0:a][1:a]amerge=inputs=2[a]" -map "[a]" -ac 2 ${outputPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error combining audio: ${error.message}`);
        reject(error);
      } else {
        console.log(`Audio combination output: ${stdout}`);
        resolve();
      }
    });
  });
};

const generateContent = async ({ videoUrl, title, description, audioUrl, tone }) => {
  try {
    console.log('Starting audio transcription...', audioUrl);
    const transcription = await transcribeAudio(audioUrl);
    console.log('Transcription completed. Generating summary...', transcription);
    const summary = await generateSummary(transcription, tone);
    console.log('Summary generated. Fetching speech audio...', summary);
    const speechAudioUrl = await getSpeechAudio(summary);
    console.log('Speech audio fetched. Generating final content...', speechAudioUrl);

    // Here you would add the logic to combine the video with the new audio
    const audioFilePath = path.join(__dirname, '../tmp/audio.mp3');
    const backgroundPath = path.join(__dirname, '../tmp/background.wav');
    const voicePath = path.join(__dirname, '../tmp/voice.wav');
    const outputPath = path.join(__dirname, '../tmp/combined_audio.mp3');

    await separateAudioFiles(audioFilePath, path.join(__dirname, '../tmp'));
    await combineAudio(backgroundPath, voicePath, outputPath);

    return { summary, speechAudioUrl };
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};

module.exports = { generateContent, separateAudioFiles, combineAudio };
