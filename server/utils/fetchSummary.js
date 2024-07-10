import axios from 'axios';

export const getShortSummary = async (shortId) => {
  const response = await axios.post('/api/chatgpt/summary', { shortId });
  return response.data.summary;
};
