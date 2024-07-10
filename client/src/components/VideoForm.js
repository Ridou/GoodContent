import React, { useState } from 'react';

const VideoForm = ({ onAddVideo }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddVideo({ title, description, url });
    setTitle('');
    setDescription('');
    setUrl('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div>
        <label>URL</label>
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
      </div>
      <button type="submit">Add Video</button>
    </form>
  );
};

export default VideoForm;
