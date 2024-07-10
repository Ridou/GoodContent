import axios from 'axios';

export const getTrendingVideos = async () => {
  try {
    const response = await axios.get('http://localhost:5000/fetch-trending');
    console.log('Fetched trending videos:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    throw error;
  }
};
