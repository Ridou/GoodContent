import React, { useEffect, useState } from 'react';
import { getTrendingVideos } from './services/videoService';
import VideoList from './components/VideoList';
import VideoForm from './components/VideoForm';

function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrendingShorts = async () => {
    setLoading(true);
    try {
      const response = await getTrendingVideos();
      setVideos(response);
    } catch (error) {
      console.error('Error fetching trending videos:', error);
      setError('Failed to fetch trending videos.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrendingShorts();
  }, []);

  const handleAddVideo = async (videoData) => {
    // You can implement this function if you want to allow adding custom videos.
  };

  return (
    <div className="App">
      <h1>Good Content</h1>
      {error && <p>{error}</p>}
      <button onClick={fetchTrendingShorts} disabled={loading}>
        {loading ? 'Loading...' : 'Generate New Videos'}
      </button>
      <VideoForm onAddVideo={handleAddVideo} />
      <VideoList videos={videos} />
    </div>
  );
}

export default App;
