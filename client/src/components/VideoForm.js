import React, { useState } from 'react';

const VideoForm = ({ onAddVideo }) => {
  const [videoData, setVideoData] = useState({
    title: '',
    url: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVideoData({
      ...videoData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddVideo(videoData);
    setVideoData({ title: '', url: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title:</label>
        <input
          type="text"
          name="title"
          value={videoData.title}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>URL:</label>
        <input
          type="text"
          name="url"
          value={videoData.url}
          onChange={handleChange}
        />
      </div>
      <button type="submit">Add Video</button>
    </form>
  );
};

export default VideoForm;
