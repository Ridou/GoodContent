import React from 'react';
import YouTube from 'react-youtube';
import '../styles/Workbench.css';

const Workbench = ({ videoUrl, summary, onGenerateClick }) => {
  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
    },
  };

  return (
    <div className="workbench">
      {videoUrl ? (
        <>
          <YouTube videoId={new URLSearchParams(new URL(videoUrl).search).get('v')} opts={opts} />
          <button onClick={onGenerateClick}>Generate Summary</button>
          {summary && <p>{summary}</p>}
        </>
      ) : (
        <p>No video selected</p>
      )}
    </div>
  );
};

export default Workbench;
