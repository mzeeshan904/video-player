import React, { useState, useCallback, useEffect } from 'react';

export const usePictureInPicture = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);

  useEffect(() => {
    // Check if Picture-in-Picture is supported
    setIsPiPSupported('pictureInPictureEnabled' in document);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => {
      setIsPiPActive(true);
    };

    const handleLeavePiP = () => {
      setIsPiPActive(false);
    };

    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, [videoRef]);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !isPiPSupported) return;

    try {
      if (isPiPActive) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('Picture-in-Picture error:', error);
    }
  }, [videoRef, isPiPSupported, isPiPActive]);

  return {
    isPiPSupported,
    isPiPActive,
    togglePiP,
  };
};
