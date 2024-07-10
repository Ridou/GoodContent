import axios from 'axios';

export const generateContentFromVideo = async (video) => {
  try {
    const response = await axios.post('http://localhost:5000/generate', {
      videoUrl: video.url,
      title: video.title,
      description: video.description,
    });
    return response.data; // Return the entire response data
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};
