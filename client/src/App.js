import React, { useEffect, useState } from 'react';
import { getTrendingVideos } from './services/videoService';
import VideoList from './components/VideoList';
import VideoForm from './components/VideoForm';

function App() {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await getTrendingVideos();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching trending videos:', error);
        setError('Failed to fetch trending videos.');
      }
    };

    fetchVideos();
  }, []);

  const handleAddVideo = async (videoData) => {
    // You can implement this function if you want to allow adding custom videos.
  };

  return (
    <div className="App">
      <h1>Good Content</h1>
      {error && <p>{error}</p>}
      <VideoForm onAddVideo={handleAddVideo} />
      <VideoList videos={videos} />
    </div>
  );
}

export default App;
