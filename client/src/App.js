import React, { useEffect, useState } from 'react';
import { getTrendingVideos } from './services/videoService';
import VideoList from './components/VideoList';
import Workbench from './components/Workbench';
import { generateContentFromVideo } from './services/chatGPTService';
import './App.css';

function App() {
  const [videos, setVideos] = useState([]);
  const [workbenchVideo, setWorkbenchVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState('');

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

  const handleWorkbenchClick = (video) => {
    console.log('Selected video for workbench:', video);
    setWorkbenchVideo(video);
    setSummary(''); // Clear the summary when a new video is selected
  };

  const handleGenerateClick = async () => {
    if (workbenchVideo) {
      console.log('Generating summary for video:', workbenchVideo);
      try {
        const response = await generateContentFromVideo(workbenchVideo);
        console.log('Generated summary:', response);
        setSummary(response.summary); // Set the generated summary
      } catch (error) {
        console.error('Error generating content:', error);
      }
    }
  };

  return (
    <div className="App">
      <h1>Good Content</h1>
      {error && <p>{error}</p>}
      <button onClick={fetchTrendingShorts} disabled={loading}>
        {loading ? 'Loading...' : 'Generate New Videos'}
      </button>
      <Workbench
        videoUrl={workbenchVideo ? workbenchVideo.url : null}
        summary={summary}
        onGenerateClick={handleGenerateClick}
      />
      <VideoList videos={videos} onWorkbenchClick={handleWorkbenchClick} />
    </div>
  );
}

export default App;
