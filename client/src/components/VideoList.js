import React, { useState } from 'react';
import YouTube from 'react-youtube';
import '../styles/VideoList.css';

const VideoList = ({ videos }) => {
  const [currentVideoId, setCurrentVideoId] = useState(null);

  const handleThumbnailClick = (videoUrl) => {
    const urlParams = new URLSearchParams(new URL(videoUrl).search);
    const videoId = urlParams.get('v');
    setCurrentVideoId(videoId);
  };

  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
    },
  };

  return (
    <div>
      <h2>Video List</h2>
      <ul>
        {videos.map((video, index) => (
          <li key={index}>
            <h3>{video.title}</h3>
            <p>Channel: {video.channelTitle}</p>
            <p>Views: {video.viewCount}</p>
            <p>Likes: {video.likeCount}</p>
            <p>Comments: {video.commentCount}</p>
            <p>Published: {new Date(video.publishedAt).toLocaleDateString()}</p>
            <p>Tags: {video.tags ? video.tags.join(', ') : 'No tags'}</p>
            {currentVideoId === video.url.split('v=')[1] ? (
              <YouTube videoId={currentVideoId} opts={opts} />
            ) : (
              <div className="thumbnail-container" onClick={() => handleThumbnailClick(video.url)}>
                <img className="thumbnail" src={video.thumbnail} alt={video.title} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VideoList;
