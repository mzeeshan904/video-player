import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { PlayerConfig } from '../types';
import { usePlayerState } from '../hooks/usePlayerState';
import { usePictureInPicture } from '../hooks/usePictureInPicture';
import { DRMManager } from '../utils/drmManager';
import { AdManager } from '../utils/adManager';
import { StreamingManager } from '../utils/streamingManager';
import PlayerControls from './PlayerControls';
import AdOverlay from './AdOverlay';
import InteractiveAdOverlay from './InteractiveAdOverlay';
import ReplayOverlay from './ReplayOverlay';
import './MediaPlayer.css';

interface MediaPlayerProps {
  config: PlayerConfig;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ config }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drmManagerRef = useRef<DRMManager>();
  const adManagerRef = useRef<AdManager>();
  const streamingManagerRef = useRef<StreamingManager>();
  const isInitializedRef = useRef<boolean>(false);
  const resumeTimeRef = useRef<number>(0);
  const { state, updateState, trackEvent } = usePlayerState(config.analytics?.onEvent);
  const { isPiPSupported, isPiPActive, togglePiP } = usePictureInPicture(videoRef);

  // Initialize managers only once using useMemo
  useMemo(() => {
    if (!drmManagerRef.current) {
      drmManagerRef.current = new DRMManager();
    }
    if (!adManagerRef.current) {
      adManagerRef.current = new AdManager(config.ads, trackEvent);
    }
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps = only runs once

  // Initialize streaming manager when video element is ready
  useEffect(() => {
    if (videoRef.current && !streamingManagerRef.current) {
      streamingManagerRef.current = new StreamingManager(videoRef.current);
    }
  }, []);

  // Setup video element and load source
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const setupVideo = async () => {
      try {
        // Setup DRM if configured
        if (config.src.drm) {
          await drmManagerRef.current?.setupDRM(video, config.src.drm);
        }

        // Set video source (use streaming manager for HLS/DASH)
        if (streamingManagerRef.current) {
          await streamingManagerRef.current.loadSource(config.src.url, config.src.mimeType);
        } else {
          video.src = config.src.url;
        }

        // Apply UI config
        if (config.ui) {
          video.autoplay = config.ui.autoplay || false;
          video.muted = config.ui.muted || false;
          video.loop = config.ui.loop || false;
          updateState({ volume: video.volume, muted: video.muted });
        }

        // Check for pre-roll ads (only on first initialization)
        if (!isInitializedRef.current) {
          isInitializedRef.current = true;
          const preRollAd = adManagerRef.current?.getPreRollAd();
          if (preRollAd) {
            updateState({ currentAd: preRollAd, adProgress: 0 });
            video.src = preRollAd.url;
            video.load();
            video.play().catch(() => {}); // Auto-play may be blocked
          } else {
            // No pre-roll ads, start main content
            updateState({ playbackPhase: 'content' });
            if (streamingManagerRef.current) {
              streamingManagerRef.current.loadSource(config.src.url, config.src.mimeType);
            } else {
              video.src = config.src.url;
            }
            video.load();
          }
        }

      } catch (error) {
        updateState({ error: (error as Error).message });
        trackEvent('error', { error: (error as Error).message });
      }
    };

    setupVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.src, config.ui]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      updateState({ duration: video.duration });
    };

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const previousTime = state.previousTime;
      
      // Detect if this is a seek (jump in time > 1 second)
      const isSeek = Math.abs(currentTime - previousTime) > 1;
      
      updateState({ currentTime, previousTime: currentTime });

      // Handle different phases
      if (state.playbackPhase === 'content' && !state.currentAd) {
        // We're in main content, update main content time and check for mid-roll ads
        updateState({ mainContentTime: currentTime });
        
        if (adManagerRef.current) {
          let midRollAd = null;
          
          if (isSeek) {
            // Check for missed mid-roll ads during seek
            // console.log('🎯 Seek detected from', previousTime, 'to', currentTime, '- checking for missed ads');
            midRollAd = adManagerRef.current.checkMissedMidRollAds(previousTime, currentTime);
          } else {
            // Normal time progression - check for regular mid-roll ads
            midRollAd = adManagerRef.current.getMidRollAd(currentTime);
          }
          
          if (midRollAd) {
            // Store current main content time before switching to ad
            console.log('🎬 STORING mainContentTime before mid-roll:', currentTime);
            // Store resume time in a ref to avoid state race conditions
            resumeTimeRef.current = currentTime;
            updateState({ 
              currentAd: midRollAd,
              mainContentTime: currentTime,
              adProgress: 0
            });
            video.pause();
            video.src = midRollAd.url;
            video.load();
            if (state.isPlaying) {
              // Wait for load to complete before playing
              const playAfterLoad = async () => {
                await new Promise(resolve => {
                  const onLoadedData = () => {
                    video.removeEventListener('loadeddata', onLoadedData);
                    resolve(undefined);
                  };
                  video.addEventListener('loadeddata', onLoadedData);
                });
                await video.play().catch((error: any) => {});
              };
              playAfterLoad();
            }
          }
        }
      }

      // Handle ad progress and skip button (for any ad)
      if (state.currentAd) {
        const adProgress = Math.min((currentTime / state.currentAd.duration) * 100, 100);
        updateState({ adProgress });

        // Check if ad should end based on current time vs ad duration
        if (currentTime >= state.currentAd.duration && state.isPlaying) {
          // Ad has reached its end time, trigger ended event manually
          video.pause();
          handleEnded();
        }

        if (state.currentAd.skippable && state.currentAd.skipAfter) {
          const showSkip = currentTime >= state.currentAd.skipAfter;
          updateState({ showSkipButton: showSkip });
        }
      }
    };

    const handlePlay = () => {
      updateState({ isPlaying: true, buffering: false });
      trackEvent('play', { currentTime: video.currentTime });
    };

    const handlePause = () => {
      updateState({ isPlaying: false });
      trackEvent('pause', { currentTime: video.currentTime });
    };

    const handleVolumeChange = () => {
      updateState({ volume: video.volume, muted: video.muted });
      trackEvent('volumechange', { volume: video.volume, muted: video.muted });
    };

    const handleSeeking = () => {
      updateState({ buffering: true });
    };

    const handleSeeked = () => {
      const currentTime = video.currentTime;
      updateState({ buffering: false });
      trackEvent('seek', { currentTime });
      
      // Update previous time to current time after seek to prevent false seek detection
      updateState({ previousTime: currentTime });
    };

    const handleWaiting = () => {
      updateState({ buffering: true });
      trackEvent('buffering_start');
    };

    const handleCanPlay = () => {
      updateState({ buffering: false });
      trackEvent('buffering_end');
    };

    const handleEnded = async () => {
      if (state.currentAd) {
        // Ad ended
        adManagerRef.current?.onAdComplete(state.currentAd.id);
        
        if (state.playbackPhase === 'preroll') {
          // Check for more pre-roll ads
          const nextPreRollAd = adManagerRef.current?.getPreRollAd();
          if (nextPreRollAd) {
            updateState({ currentAd: nextPreRollAd, showSkipButton: false, adProgress: 0 });
            video.src = nextPreRollAd.url;
            video.load();
            // Wait for load to complete before playing
            await new Promise(resolve => {
              const onLoadedData = () => {
                video.removeEventListener('loadeddata', onLoadedData);
                resolve(undefined);
              };
              video.addEventListener('loadeddata', onLoadedData);
            });
            await video.play().catch(error => {});
          } else {
            // All pre-roll ads done, start main content
            updateState({ 
              currentAd: null, 
              showSkipButton: false, 
              playbackPhase: 'content' 
            });
            if (streamingManagerRef.current) {
              streamingManagerRef.current.loadSource(config.src.url, config.src.mimeType);
            } else {
              video.src = config.src.url;
            }
            video.load();
            // Wait for load to complete before setting time and playing
            await new Promise(resolve => {
              const onLoadedData = () => {
                video.removeEventListener('loadeddata', onLoadedData);
                resolve(undefined);
              };
              video.addEventListener('loadeddata', onLoadedData);
            });
            video.currentTime = state.mainContentTime; // Resume from where we were
            await video.play().catch(error => {});
          }
        } else if (state.playbackPhase === 'content') {
          // Mid-roll ad completed, return to main content
          const resumeTime = resumeTimeRef.current;
          console.log('✅ COMPLETING mid-roll, resumeTime from ref:', resumeTime);
          updateState({ currentAd: null, showSkipButton: false });
          if (streamingManagerRef.current) {
            streamingManagerRef.current.loadSource(config.src.url, config.src.mimeType);
          } else {
            video.src = config.src.url;
          }
          video.load();
          // Wait for load to complete before setting time and playing
          await new Promise(resolve => {
            const onLoadedData = () => {
              video.removeEventListener('loadeddata', onLoadedData);
              resolve(undefined);
            };
            video.addEventListener('loadeddata', onLoadedData);
          });
          // Ensure we resume from the correct time
          console.log('🎯 SETTING video.currentTime to:', resumeTime);
          video.currentTime = resumeTime;
          console.log('✅ ACTUAL video.currentTime after setting:', video.currentTime);
          trackEvent('seek', { currentTime: resumeTime, reason: 'midroll_complete_resume' });
          await video.play().catch(error => {});
        } else if (state.playbackPhase === 'postroll') {
          // Check for more post-roll ads
          const nextPostRollAd = adManagerRef.current?.getPostRollAd();
          if (nextPostRollAd) {
            updateState({ currentAd: nextPostRollAd, showSkipButton: false, adProgress: 0 });
            video.src = nextPostRollAd.url;
            video.load();
            // Wait for load to complete before playing
            await new Promise(resolve => {
              const onLoadedData = () => {
                video.removeEventListener('loadeddata', onLoadedData);
                resolve(undefined);
              };
              video.addEventListener('loadeddata', onLoadedData);
            });
            await video.play().catch(error => {});
          } else {
            // All post-roll ads done
            updateState({ isPlaying: false, currentAd: null, showReplay: true });
            trackEvent('complete', { reason: 'all_ads_finished' });
          }
        }
      } else {
        // Main content ended, start post-roll
        const postRollAd = adManagerRef.current?.getPostRollAd();
        if (postRollAd) {
          updateState({ 
            currentAd: postRollAd, 
            showSkipButton: false, 
            playbackPhase: 'postroll',
            adProgress: 0
          });
          video.src = postRollAd.url;
          video.load();
          // Wait for load to complete before playing
          await new Promise(resolve => {
            const onLoadedData = () => {
              video.removeEventListener('loadeddata', onLoadedData);
              resolve(undefined);
            };
            video.addEventListener('loadeddata', onLoadedData);
          });
          await video.play().catch(error => {});
        } else {
          // No post-roll ads, video is complete - show replay
          updateState({ isPlaying: false, showReplay: true });
          trackEvent('complete', { reason: 'main_content_ended' });
        }
      }
    };

    const handleError = () => {
      const error = video.error?.message || 'Unknown video error';
      updateState({ error, buffering: false });
      trackEvent('error', { error });
    };

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.src, state.currentAd, state.isPlaying, updateState, trackEvent]);

  // Player control handlers
  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (state.isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }, [state.isPlaying]);

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
  }, []);

  const handleVolumeChange = useCallback((volume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume;
  }, []);

  const handleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
  }, []);

  const handleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!state.fullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [state.fullscreen]);

  const handleSkipAd = useCallback(async () => {
    if (!state.currentAd) return;

    adManagerRef.current?.onAdSkip(state.currentAd.id);
    
    const video = videoRef.current;
    if (video) {
      // Ensure pause completes before proceeding
      try {
        video.pause();
        // Wait a bit to ensure pause is processed
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (state.playbackPhase === 'preroll') {
          // Check for more pre-roll ads
          const nextPreRollAd = adManagerRef.current?.getPreRollAd();
          if (nextPreRollAd) {
            updateState({ currentAd: nextPreRollAd, showSkipButton: false, adProgress: 0 });
            video.src = nextPreRollAd.url;
            video.load();
            // Wait for load to complete before playing
            await new Promise(resolve => {
              const onLoadedData = () => {
                video.removeEventListener('loadeddata', onLoadedData);
                resolve(undefined);
              };
              video.addEventListener('loadeddata', onLoadedData);
            });
            await video.play().catch(error => {});
          } else {
            // All pre-roll ads done, start main content
            updateState({ 
              currentAd: null, 
              showSkipButton: false, 
              playbackPhase: 'content' 
            });
            if (streamingManagerRef.current) {
              streamingManagerRef.current.loadSource(config.src.url, config.src.mimeType);
            } else {
              video.src = config.src.url;
            }
            video.load();
            // Wait for load to complete before setting time and playing
            await new Promise(resolve => {
              const onLoadedData = () => {
                video.removeEventListener('loadeddata', onLoadedData);
                resolve(undefined);
              };
              video.addEventListener('loadeddata', onLoadedData);
            });
            video.currentTime = state.mainContentTime;
            await video.play().catch(error => {});
          }
        } else if (state.playbackPhase === 'content') {
          // Mid-roll ad skipped, return to main content
          const resumeTime = resumeTimeRef.current;
          console.log('⏭️ SKIPPING mid-roll, resumeTime from ref:', resumeTime);
          updateState({ currentAd: null, showSkipButton: false });
          if (streamingManagerRef.current) {
            streamingManagerRef.current.loadSource(config.src.url, config.src.mimeType);
          } else {
            video.src = config.src.url;
          }
          video.load();
          // Wait for load to complete before setting time and playing
          await new Promise(resolve => {
            const onLoadedData = () => {
              video.removeEventListener('loadeddata', onLoadedData);
              resolve(undefined);
            };
            video.addEventListener('loadeddata', onLoadedData);
          });
          // Ensure we resume from the correct time
          console.log('🎯 SETTING video.currentTime to:', resumeTime);
          video.currentTime = resumeTime;
          console.log('✅ ACTUAL video.currentTime after setting:', video.currentTime);
          trackEvent('seek', { currentTime: resumeTime, reason: 'midroll_skip_resume' });
          await video.play().catch(error => {});
        } else if (state.playbackPhase === 'postroll') {
          // Check for more post-roll ads
          const nextPostRollAd = adManagerRef.current?.getPostRollAd();
          if (nextPostRollAd) {
            updateState({ currentAd: nextPostRollAd, showSkipButton: false, adProgress: 0 });
            video.src = nextPostRollAd.url;
            video.load();
            // Wait for load to complete before playing
            await new Promise(resolve => {
              const onLoadedData = () => {
                video.removeEventListener('loadeddata', onLoadedData);
                resolve(undefined);
              };
              video.addEventListener('loadeddata', onLoadedData);
            });
            await video.play().catch(error => {});
          } else {
            // All post-roll ads done
            updateState({ isPlaying: false, currentAd: null, showSkipButton: false, showReplay: true });
            trackEvent('complete', { reason: 'all_ads_skipped' });
          }
        }
      } catch (error) {
        trackEvent('error', { error: (error as Error).message });
      }
    }
  }, [state.currentAd, state.playbackPhase, state.mainContentTime, config.src, updateState, trackEvent]);

  const handleAdClick = useCallback((url?: string) => {
    if (!state.currentAd) return;

    adManagerRef.current?.onAdClick(state.currentAd.id, url);
    
    if (url) {
      window.open(url, '_blank');
    }
  }, [state.currentAd]);

  const handleInteractiveAdAction = useCallback((action: string, data: any) => {
    if (!state.currentAd) return;

    adManagerRef.current?.onAdInteraction(state.currentAd.id, action, data);
  }, [state.currentAd]);

  const handleReplay = useCallback(() => {
    
    // Reset all managers and state
    adManagerRef.current?.reset();
    isInitializedRef.current = false; // Reset initialization flag for replay
    resumeTimeRef.current = 0; // Reset resume time
    updateState({
      showReplay: false,
      currentAd: null,
      isPlaying: false,
      currentTime: 0,
      mainContentTime: 0,
      previousTime: 0,
      playbackPhase: 'preroll',
      showSkipButton: false,
      interactiveAdActive: false,
      error: null
    });

    // Start over with pre-roll ads
    const video = videoRef.current;
    if (video) {
      const preRollAd = adManagerRef.current?.getPreRollAd();
      if (preRollAd) {
        updateState({ currentAd: preRollAd, adProgress: 0 });
        video.src = preRollAd.url;
        video.load();
        video.play().catch(error => {});
      } else {
        // No pre-roll ads, start main content
        updateState({ playbackPhase: 'content' });
        if (streamingManagerRef.current) {
          streamingManagerRef.current.loadSource(config.src.url, config.src.mimeType);
        } else {
          video.src = config.src.url;
        }
        video.load();
        video.currentTime = 0;
        video.play().catch(error => {});
      }
    }

    trackEvent('replay', { timestamp: Date.now() });
  }, [config.src, updateState, trackEvent]);

  const [clickIndicator, setClickIndicator] = useState<{ show: boolean; icon: string }>({ show: false, icon: '' });

  const handleVideoClick = useCallback((event: React.MouseEvent) => {
    // Prevent click from bubbling to controls
    event.stopPropagation();
    
    // Show click indicator for both ads and content
    const newPlayState = !state.isPlaying;
    setClickIndicator({ show: true, icon: newPlayState ? '▶️' : '⏸️' });
    
    // Hide indicator after animation
    setTimeout(() => {
      setClickIndicator({ show: false, icon: '' });
    }, 300);
    
    // Toggle play/pause for both ads and content
    handlePlayPause();
  }, [state.isPlaying, handlePlayPause]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      updateState({ fullscreen: !!document.fullscreenElement });
      trackEvent('fullscreen', { fullscreen: !!document.fullscreenElement });
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [updateState, trackEvent]);

  // Cleanup
  useEffect(() => {
    return () => {
      drmManagerRef.current?.cleanup();
      streamingManagerRef.current?.cleanup();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`media-player ${state.fullscreen ? 'fullscreen' : ''} ${config.ui?.theme || 'dark'}`}
    >
      <div className="video-container" onClick={handleVideoClick}>
        <video
          ref={videoRef}
          className="video-element"
          playsInline
          preload="metadata"
        />
        
        {state.buffering && (
          <div className="buffering-overlay">
            <div className="spinner"></div>
          </div>
        )}

        {clickIndicator.show && (
          <div className="click-indicator">
            {clickIndicator.icon}
          </div>
        )}

        {state.error && (
          <div className="error-overlay">
            <div className="error-message">
              <h3>Playback Error</h3>
              <p>{state.error}</p>
            </div>
          </div>
        )}

        {state.currentAd && (
          <AdOverlay
            ad={state.currentAd}
            progress={state.adProgress}
            showSkipButton={state.showSkipButton}
            onSkip={handleSkipAd}
            onClick={handleAdClick}
            isPlaying={state.isPlaying}
            onPlayPause={handlePlayPause}
          />
        )}

        {state.currentAd?.interactive && (
          <InteractiveAdOverlay
            ad={state.currentAd}
            onAction={handleInteractiveAdAction}
          />
        )}

        {state.showReplay && (
          <ReplayOverlay onReplay={handleReplay} />
        )}
      </div>

      {(config.ui?.showControls !== false) && !state.currentAd && (
        <PlayerControls
          state={state}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onMute={handleMute}
          onFullscreen={handleFullscreen}
          onPictureInPicture={togglePiP}
          isPiPSupported={isPiPSupported}
          isPiPActive={isPiPActive}
          isAd={!!state.currentAd}
        />
      )}
    </div>
  );
};

export default MediaPlayer;
