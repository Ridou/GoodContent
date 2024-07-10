import React, { useState } from 'react';
import '../styles/VideoList.css';

const VideoList = ({ videos, onWorkbenchClick }) => {
  const [currentVideoId, setCurrentVideoId] = useState(null);

  const handleThumbnailClick = (videoUrl) => {
    const urlParams = new URLSearchParams(new URL(videoUrl).search);
    const videoId = urlParams.get('v');
    setCurrentVideoId(videoId);
  };

  return (
    <div>
      <h2>Video List</h2>
      <ul>
        {videos.map((video, index) => (
          <li key={index} className="video-item">
            <div className="thumbnail-container" onClick={() => handleThumbnailClick(video.url)}>
              <img className="thumbnail" src={video.thumbnail} alt={video.title} />
            </div>
            <div className="video-details">
              <h3>{video.title}</h3>
              <p>Channel: {video.channelTitle}</p>
              <p>Views: {video.viewCount}</p>
              <p>Likes: {video.likeCount}</p>
              <p>Comments: {video.commentCount}</p>
              <p>Published: {new Date(video.publishedAt).toLocaleDateString()}</p>
              <p>Tags: {video.tags ? video.tags.join(', ') : 'No tags'}</p>
              <button onClick={() => onWorkbenchClick(video)}>Workbench</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VideoList;
