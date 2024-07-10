// services/textToSpeechService.js
import axios from 'axios';

export const getSpeechAudio = async (text) => {
  const response = await axios.post('/api/text-to-speech', { text });
  return response.data.audioUrl;
};
