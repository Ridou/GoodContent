const axios = require('axios');
const FormData = require('form-data');
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

const transcribeAudio = async (audioUrl) => {
  try {
    const audioResponse = await axios.get(audioUrl, { responseType: 'stream' });
    const form = new FormData();
    form.append('file', audioResponse.data, 'audio.mp3');
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
            content: 'Be dramatic like if it was a trailer for a movie in explaining the following content from a foreign language into English. This transcription is from the audio of a short video and we need to explain the video with this information in the time alotted, so take into account that some language are slower or faster communicating than English when creating a script. Please make it short and concise. Do not repeat the description, just react to the video as if you were a curious person/viewer that is always facinated.'
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

const generateContent = async ({ videoUrl, title, description, audioUrl }) => {
  try {
    console.log('Starting audio transcription...', audioUrl);
    const transcription = await transcribeAudio(audioUrl);
    console.log('Transcription completed. Generating summary...', transcription);
    const summary = await generateSummary(transcription);
    console.log('Summary generated.', summary);
    return summary;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};

module.exports = { generateContent };
