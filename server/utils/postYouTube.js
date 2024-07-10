import axios from 'axios';

export const uploadVideo = async (videoFile, title, description) => {
  const formData = new FormData();
  formData.append('video', videoFile);
  formData.append('title', title);
  formData.append('description', description);

  const response = await axios.post('/api/youtube/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
