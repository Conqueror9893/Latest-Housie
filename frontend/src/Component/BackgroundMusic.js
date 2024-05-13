import React, { useState, useEffect } from "react";

const BackgroundMusic = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio(src));
  const [volume] = useState(0.10); // Set default volume to 0.5

  useEffect(() => {
    audio.volume = volume;
  }, [volume, audio]);

  const togglePlay = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      <div onClick={togglePlay}>
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="48"
            height="48"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M6 5h2v14H6V5zm10 0h2v14h-2V5z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="48"
            height="48"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default BackgroundMusic;
