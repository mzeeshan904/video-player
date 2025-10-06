// @ts-ignore
import Hls from 'hls.js';
// @ts-ignore
import dashjs from 'dashjs';

export class StreamingManager {
  private hlsInstance: any = null;
  private dashPlayer: any = null;
  private video: HTMLVideoElement | null = null;
  private errorCallback?: (error: any) => void;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 2000;
  private currentUrl: string = '';
  private currentMimeType: string = '';
  private isRetrying: boolean = false;
  
  // CRITICAL: Track playback state to prevent operations during ads
  private playbackState: 'CONTENT' | 'AD' | 'IDLE' = 'IDLE';
  private isPaused: boolean = false;

  constructor(video: HTMLVideoElement, errorCallback?: (error: any) => void) {
    this.video = video;
    this.errorCallback = errorCallback;
  }
  
  // CRITICAL: Set playback state (called from MediaPlayer)
  public setPlaybackState(state: 'CONTENT' | 'AD' | 'IDLE'): void {
    console.log(`🎬 StreamingManager state: ${this.playbackState} → ${state}`);
    this.playbackState = state;
    
    // CRITICAL: Stop all streaming operations when entering AD state
    if (state === 'AD') {
      this.pauseStreaming();
    } else if (state === 'CONTENT') {
      this.resumeStreaming();
    }
  }
  
  // CRITICAL: Pause streaming (for ads)
  private pauseStreaming(): void {
    if (this.isPaused) return;
    
    console.log('⏸️ Pausing streaming operations (ad playback)');
    this.isPaused = true;
    
    if (this.hlsInstance) {
      try {
        this.hlsInstance.stopLoad();
        console.log('✅ HLS loading stopped for ad');
      } catch (err) {
        console.error('❌ Error stopping HLS:', err);
      }
    }
    
    if (this.dashPlayer) {
      try {
        this.dashPlayer.pause();
        console.log('✅ DASH paused for ad');
      } catch (err) {
        console.error('❌ Error pausing DASH:', err);
      }
    }
  }
  
  // CRITICAL: Resume streaming (after ads)
  private resumeStreaming(): void {
    if (!this.isPaused) return;
    
    console.log('▶️ Resuming streaming operations (content playback)');
    this.isPaused = false;
    
    if (this.hlsInstance) {
      try {
        this.hlsInstance.startLoad();
        console.log('✅ HLS loading resumed');
      } catch (err) {
        console.error('❌ Error resuming HLS:', err);
      }
    }
    
    if (this.dashPlayer) {
      try {
        // DASH.js doesn't have a .play() method - playback is controlled via video element
        // Just log that DASH is ready - the video element will be played by MediaPlayer
        console.log('✅ DASH ready for playback (controlled via video element)');
      } catch (err) {
        console.error('❌ Error in DASH resume:', err);
      }
    }
  }
  
  // CRITICAL: Check if operations are allowed
  private isOperationAllowed(): boolean {
    if (this.playbackState === 'AD') {
      console.warn('⚠️ Streaming operation blocked - AD playback active');
      return false;
    }
    return true;
  }

  public async loadSource(url: string, mimeType?: string): Promise<void> {
    if (!this.video) {
      throw new Error('Video element not available');
    }

    // Store current source for retry purposes
    this.currentUrl = url;
    this.currentMimeType = mimeType || '';
    
    // Reset retry count on new load
    if (!this.isRetrying) {
      this.retryCount = 0;
    }

    // Clean up existing instances
    this.cleanup();

    try {
      // Detect stream type
      const streamType = this.detectStreamType(url, mimeType);

      switch (streamType) {
        case 'hls':
          await this.setupHLS(url);
          break;
        case 'dash':
          await this.setupDASH(url);
          break;
        default:
          // Regular video file
          this.video.src = url;
          break;
      }
      
      // Reset retry flag on success
      this.isRetrying = false;
    } catch (error) {
      console.error('Failed to load streaming source:', error);
      
      // Attempt retry if within limits
      if (this.retryCount < this.maxRetries && !this.isRetrying) {
        await this.retryLoad();
      } else {
        throw error;
      }
    }
  }

  private async retryLoad(): Promise<void> {
    this.retryCount++;
    this.isRetrying = true;
    
    console.log(`🔄 Retrying streaming load (attempt ${this.retryCount}/${this.maxRetries})...`);
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
    
    try {
      await this.loadSource(this.currentUrl, this.currentMimeType);
    } catch (error) {
      if (this.retryCount >= this.maxRetries) {
        console.error('❌ Max retries reached, attempting fallback...');
        this.isRetrying = false;
        await this.attemptGracefulFallback();
      }
    }
  }

  private async attemptGracefulFallback(): Promise<void> {
    console.log('🔄 Attempting graceful fallback for streaming content...');
    
    if (!this.video) return;
    
    try {
      // Try native browser playback as fallback
      const streamType = this.detectStreamType(this.currentUrl, this.currentMimeType);
      
      if (streamType === 'hls') {
        // For HLS, try native support (Safari)
        if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
          console.log('📺 Fallback: Using native HLS support');
          this.video.src = this.currentUrl;
          return;
        }
      } else if (streamType === 'dash') {
        // For DASH, show error message but don't reload
        console.error('❌ DASH playback failed and no fallback available');
        this.showErrorMessage('Unable to play DASH content. Please try a different browser or check your network connection.');
      }
      
      // Notify parent of fallback attempt
      if (this.errorCallback) {
        this.errorCallback({
          type: 'streaming_fallback',
          source: streamType,
          message: 'Using fallback playback method'
        });
      }
    } catch (error) {
      console.error('❌ Fallback failed:', error);
      
      // Final error callback
      if (this.errorCallback) {
        this.errorCallback({
          type: 'streaming_fatal',
          source: 'fallback',
          details: error
        });
      }
    }
  }

  private showErrorMessage(message: string): void {
    // Create error message overlay
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 30px 40px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      z-index: 10002;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      max-width: 450px;
      text-align: center;
      border: 2px solid #f44336;
    `;
    
    errorDiv.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
        <span style="font-size: 32px; margin-right: 12px;">⚠️</span>
        <strong style="font-size: 20px;">Playback Error</strong>
      </div>
      <div style="font-size: 15px; line-height: 1.6; opacity: 0.95; margin-bottom: 20px;">
        ${message}
      </div>
      <button style="
        background: #f44336;
        color: white;
        border: none;
        padding: 10px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
      ">Close</button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Handle close button
    const closeBtn = errorDiv.querySelector('button');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      });
    }
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 10000);
  }

  private detectStreamType(url: string, mimeType?: string): 'hls' | 'dash' | 'regular' {
    if (mimeType) {
      if (mimeType.includes('application/x-mpegURL') || mimeType.includes('application/vnd.apple.mpegurl')) {
        return 'hls';
      }
      if (mimeType.includes('application/dash+xml')) {
        return 'dash';
      }
    }

    // Detect by URL extension or pattern
    if (url.includes('.m3u8') || url.includes('playlist.m3u8')) {
      return 'hls';
    }
    if (url.includes('.mpd') || url.includes('manifest.mpd')) {
      return 'dash';
    }

    return 'regular';
  }

  private async analyzeDASHManifest(url: string): Promise<void> {
    try {
      console.log('🔍 Analyzing DASH manifest for stream structure...');
      
      // Fetch and parse the DASH manifest
      const response = await fetch(url);
      const manifestText = await response.text();
      
      // Parse XML manifest
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(manifestText, 'text/xml');
      
      // Check for parsing errors
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        console.warn('⚠️ DASH manifest parsing error, proceeding with default settings');
        return;
      }
      
      // Analyze adaptation sets
      const adaptationSets = xmlDoc.querySelectorAll('AdaptationSet');
      let videoAdaptationSets = 0;
      let audioAdaptationSets = 0;
      let multiplexedSets = 0;
      
      adaptationSets.forEach(adaptationSet => {
        const mimeType = adaptationSet.getAttribute('mimeType');
        const contentType = adaptationSet.getAttribute('contentType');
        
        // Check representations within this adaptation set
        const representations = adaptationSet.querySelectorAll('Representation');
        let hasVideo = false;
        let hasAudio = false;
        
        representations.forEach(representation => {
          const repMimeType = representation.getAttribute('mimeType') || mimeType;
          const repContentType = representation.getAttribute('contentType') || contentType;
          const width = representation.getAttribute('width');
          const height = representation.getAttribute('height');
          const audioSamplingRate = representation.getAttribute('audioSamplingRate');
          
          // Detect video characteristics
          if (repMimeType?.includes('video') || repContentType === 'video' || width || height) {
            hasVideo = true;
          }
          
          // Detect audio characteristics  
          if (repMimeType?.includes('audio') || repContentType === 'audio' || audioSamplingRate) {
            hasAudio = true;
          }
        });
        
        // Classify adaptation set
        if (hasVideo && hasAudio) {
          multiplexedSets++;
          console.warn('⚠️ Found multiplexed adaptation set (video + audio combined)');
        } else if (hasVideo) {
          videoAdaptationSets++;
        } else if (hasAudio) {
          audioAdaptationSets++;
        }
      });
      
      // Analyze results and provide feedback
      const isCompliantStructure = multiplexedSets === 0 && videoAdaptationSets > 0 && audioAdaptationSets > 0;
      const isMultiplexedStructure = multiplexedSets > 0;
      
      if (isCompliantStructure) {
        console.log('✅ DASH Manifest Analysis: Compliant structure detected');
        console.log(`📊 Structure: ${videoAdaptationSets} video tracks, ${audioAdaptationSets} audio tracks (separated)`);
      } else if (isMultiplexedStructure) {
        console.warn('⚠️ DASH Manifest Analysis: Non-compliant multiplexed structure detected');
        console.warn('📊 Structure: Contains combined audio/video tracks (multiplexed)');
        console.warn('🔧 Recommendation: Re-encode with separated audio/video tracks for better performance');
        console.warn('📺 Playback: Will attempt to play but may experience issues during quality switching');
        
        // Show user-friendly warning
        this.showMultiplexedWarning();
        
        // Configure DASH player for multiplexed content tolerance
        if (this.dashPlayer) {
          this.dashPlayer.updateSettings({
            streaming: {
              abr: {
                autoSwitchBitrate: {
                  video: false, // Disable auto-switching for multiplexed content
                  audio: false,
                },
              },
              buffer: {
                bufferToKeep: 60, // Larger buffer for stability
                bufferPruningInterval: 60,
              },
            },
          });
        }
      } else {
        console.log('📊 DASH Manifest Analysis: Structure unclear, proceeding with default settings');
      }
      
    } catch (error) {
      console.warn('⚠️ Could not analyze DASH manifest:', error);
      console.log('📺 Proceeding with default DASH settings');
    }
  }

  private showMultiplexedWarning(): void {
    // Create a temporary warning overlay
    const warningDiv = document.createElement('div');
    warningDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ff9800, #f57c00);
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 350px;
      border-left: 4px solid #ff5722;
    `;
    
    warningDiv.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 18px; margin-right: 8px;">⚠️</span>
        <strong>DASH Content Notice</strong>
      </div>
      <div style="font-size: 13px; line-height: 1.4; opacity: 0.95;">
        This video uses multiplexed DASH streams (audio/video combined). 
        For optimal performance, consider re-encoding with separated tracks.
      </div>
      <div style="margin-top: 10px; font-size: 12px; opacity: 0.8;">
        Playback will continue normally.
      </div>
    `;
    
    document.body.appendChild(warningDiv);
    
    // Auto-remove warning after 8 seconds
    setTimeout(() => {
      if (warningDiv.parentNode) {
        warningDiv.parentNode.removeChild(warningDiv);
      }
    }, 8000);
    
    // Allow manual dismissal
    warningDiv.addEventListener('click', () => {
      if (warningDiv.parentNode) {
        warningDiv.parentNode.removeChild(warningDiv);
      }
    });
  }

  private handleMultiplexedDASHContent(): void {
    console.warn('🔧 Handling multiplexed DASH content...');
    
    // Show warning to user
    this.showMultiplexedWarning();
    
    // Try to reconfigure DASH player for better compatibility
    if (this.dashPlayer) {
      try {
        // Reset and reconfigure with basic supported settings only
        this.dashPlayer.updateSettings({
          streaming: {
            abr: {
              autoSwitchBitrate: {
                video: false,
                audio: false,
              },
            },
            buffer: {
              bufferToKeep: 90,
              bufferPruningInterval: 90,
            },
          },
        });
        
        console.log('✅ DASH player reconfigured for multiplexed content tolerance');
      } catch (error) {
        console.warn('⚠️ Could not reconfigure DASH player:', error);
      }
    }
  }


  private async setupHLS(url: string): Promise<void> {
    if (!this.video) return;

    // Check if HLS is natively supported (Safari)
    if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('Using native HLS support');
      this.video.src = url;
      return;
    }

    // Use hls.js for other browsers
    if (Hls.isSupported()) {
      console.log('Using hls.js for HLS playback');
      
      this.hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      this.hlsInstance.loadSource(url);
      this.hlsInstance.attachMedia(this.video);

      // Handle HLS events
      this.hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest parsed');
      });

      this.hlsInstance.on(Hls.Events.ERROR, (event: any, data: any) => {
        // CRITICAL: Block ALL errors during ad playback (prevent content interference)
        if (this.playbackState === 'AD') {
          console.log('🚫 HLS error during AD playback - BLOCKED:', {
            details: data.details,
            fatal: data.fatal,
            state: this.playbackState
          });
          return; // CRITICAL: Don't process ANY errors during ads
        }
        
        // CRITICAL: Check for buffer errors FIRST, regardless of fatal flag
        const isBufferError = data.details === 'bufferAppendError' || 
                             data.details === 'bufferAddCodecError' ||
                             data.details === 'bufferSeekOverHole' ||
                             data.details === 'bufferFullError' ||
                             data.details === 'bufferStalledError' ||
                             data.details === 'bufferNudgeOnStall' ||
                             data.details === 'bufferAppendingError';
        
        // For buffer errors, use HLS internal recovery ONLY, never propagate to player
        if (isBufferError) {
          // CRITICAL: Check if error is already resolved by HLS.js
          const isResolved = data.errorAction?.resolved === true;
          
          // Only log unresolved or fatal buffer errors to reduce console spam
          if (!isResolved || data.fatal) {
            console.warn('🔧 HLS buffer error:', {
              details: data.details,
              fatal: data.fatal,
              resolved: isResolved,
              hasVideo: data.frag?._streams?.video !== null,
              timestamp: new Date().toISOString()
            });
          }
          
          // For fatal buffer errors, try HLS media recovery
          if (data.fatal && data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            console.log('🔄 Fatal buffer error - attempting HLS media recovery...');
            try {
              this.hlsInstance.recoverMediaError();
              console.log('✅ HLS media recovery initiated');
            } catch (err) {
              console.error('❌ HLS media recovery failed:', err);
            }
          }
          
          // CRITICAL: Never propagate buffer errors to player - they cause state corruption
          // Silent return for resolved errors to avoid log spam
          return;
        }
        
        // Handle other fatal errors (network, manifest, etc.)
        if (data.fatal) {
          console.error('❌ HLS fatal error:', {
            type: data.type,
            details: data.details,
            fatal: data.fatal
          });
          
          // Try to recover from fatal errors internally first
          let recovered = false;
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('🔄 Network error detected, attempting recovery...');
              this.hlsInstance.startLoad();
              recovered = true;
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('🔄 Media error detected, attempting recovery...');
              this.hlsInstance.recoverMediaError();
              recovered = true;
              break;
            default:
              // Unrecoverable error type
              console.error('❌ Unrecoverable HLS error type');
              break;
          }
          
          // Only notify parent if we couldn't recover AND it's truly unrecoverable
          // DON'T use retry mechanism during active playback - it causes state issues
          if (!recovered) {
            console.error('❌ HLS recovery failed, notifying parent player...');
            if (this.errorCallback) {
              this.errorCallback({
                type: 'streaming_fatal',
                source: 'hls',
                details: data,
                message: 'HLS playback failed - unrecoverable error'
              });
            }
            // Don't destroy yet - let parent decide
          }
        } else {
          // Log non-fatal, non-buffer errors for debugging
          console.warn('HLS non-fatal error (handled internally):', {
            type: data.type,
            details: data.details
          });
        }
      });

      this.hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (event: any, data: any) => {
        console.log('HLS quality level switched to:', data.level);
      });

    } else {
      throw new Error('HLS is not supported in this browser');
    }
  }

  private async setupDASH(url: string): Promise<void> {
    if (!this.video) return;

    if (dashjs.supportsMediaSource()) {
      console.log('Using dash.js for DASH playback');
      
      this.dashPlayer = dashjs.MediaPlayer().create();
      
      // First, analyze the DASH manifest to check for multiplexed streams
      await this.analyzeDASHManifest(url);
      
      // Configure DASH player with ONLY universally supported settings
      // NOTE: Low-latency mode is ONLY enabled if explicitly requested via config
      const dashConfig: any = {
        streaming: {
          // Only use well-supported, universally available settings
          abr: {
            autoSwitchBitrate: {
              video: true,
              audio: true,
            },
          },
          buffer: {
            bufferToKeep: 30,
            bufferPruningInterval: 30,
          },
        },
      };
      
      // CRITICAL: Only enable low-latency mode if explicitly configured
      // Standard DASH streams don't support LL-DASH and will show warnings
      // Leave undefined for standard DASH to avoid any warnings
      // To enable: pass config with streaming.lowLatency = true
      // if (config.streaming?.lowLatency === true) {
      //   dashConfig.streaming.enableLowLatencyMode = true;
      // }
      
      this.dashPlayer.updateSettings(dashConfig);

      this.dashPlayer.initialize(this.video, url, false);

      // Handle DASH events
      this.dashPlayer.on(dashjs.MediaPlayer.events.ERROR, (error: any) => {
        // CRITICAL: Block ALL errors during ad playback (prevent content interference)
        if (this.playbackState === 'AD') {
          console.log('🚫 DASH error during AD playback - BLOCKED:', {
            code: error.error?.code,
            message: error.error?.message,
            state: this.playbackState
          });
          return; // CRITICAL: Don't process ANY errors during ads
        }
        
        // Check for multiplexed representation error
        const isMultiplexedError = error.error && (
          error.error.message?.includes('Multiplexed representations are intentionally not supported') ||
          error.error.message?.includes('multiplexed') ||
          error.error.message?.includes('not compliant with the DASH-AVC/264 guidelines')
        );
        
        if (isMultiplexedError) {
          console.warn('⚠️ DASH multiplexed content detected via error:', error.error.message);
          this.handleMultiplexedDASHContent();
          
          // If DASH.js completely rejects the content, try fallback after retries
          if (error.error.message?.includes('intentionally not supported')) {
            console.log('🔄 DASH multiplexed content not supported, attempting retry/fallback...');
            if (this.retryCount < this.maxRetries) {
              this.retryLoad().catch(err => {
                console.error('❌ DASH retry failed, attempting fallback:', err);
                this.attemptGracefulFallback();
              });
            } else {
              this.attemptGracefulFallback();
            }
          }
          return; // Don't propagate multiplexed errors as they're handled internally
        }
        
        // Filter out non-critical DASH errors that shouldn't affect playback
        const isBufferError = error.error && (
          error.error.message?.includes('SourceBuffer') ||
          error.error.message?.includes('buffer') ||
          error.error.message?.includes('appendBuffer') ||
          error.error.message?.includes('MediaSource') ||
          error.error.message?.includes('removed from the parent') ||
          error.error.message?.includes('getAllBufferRanges') ||
          error.error.message?.includes('stall') ||  // CRITICAL: Add stalled detection
          error.error.message?.includes('Stalled') ||
          error.error.code === 'BUFFER_APPEND_ERROR' ||
          error.error.code === 'BUFFER_FULL_ERROR' ||
          error.error.code === 'BUFFER_SEEK_OVER_HOLE' ||
          error.error.code === 'BUFFER_STALLED_ERROR' ||  // CRITICAL: Add stalled code
          error.error.code === 'BUFFER_NUDGE_ON_STALL'
        );
        
        if (isBufferError) {
          // Log buffer errors but don't interfere with playback logic
          console.log('🔧 DASH buffer error detected (auto-handling):', {
            code: error.error?.code,
            message: error.error?.message,
            data: error.error?.data,
            timestamp: new Date().toISOString()
          });
          console.log('ℹ️ DASH buffer error - player will auto-recover, state preserved');
          return; // Don't propagate buffer errors to player logic
        }
        
        // CRITICAL: Check for unsupported settings warnings (like enableLowLatencyMode)
        const isUnsupportedSettingWarning = error.error && (
          error.error.message?.includes('is not supported') ||
          error.error.message?.includes('enableLowLatencyMode') ||
          error.error.message?.includes('Settings parameter') ||
          error.error.message?.includes('parameter not supported')
        );
        
        if (isUnsupportedSettingWarning) {
          console.warn('⚠️ DASH setting not supported (non-fatal):', error.error?.message || error.error);
          console.log('ℹ️ Player will continue with standard DASH playback');
          return; // CRITICAL: Don't propagate setting warnings - they don't affect playback
        }
        
        // Check for capability/representation filtering 
        const isCapabilityError = error.error && (
          error.error.message?.includes('AdaptationSet has been removed') ||
          error.error.message?.includes('no supported Representation') ||
          error.error.message?.includes('CapabilitiesFilter') ||
          error.error.message?.includes('filterUnsupportedFeatures') ||
          error.error.code === 'CAPABILITY_MEDIASOURCE_ERROR' ||
          error.error.code === 'MANIFEST_LOADER_PARSING_FAILURE'
        );

        if (isCapabilityError) {
          console.warn('🎯 DASH compatibility warning (player will continue with available streams):', error.error?.message || error.error);
          console.warn('This is normal for manifests with mixed codec support - playback should continue normally');
          return; // Don't treat capability filtering as a fatal error
        }
        
        // For truly critical DASH errors, only notify after retries exhausted
        console.error('DASH critical error:', error);
        
        if (this.retryCount < this.maxRetries) {
          console.log('🔄 Attempting DASH retry...');
          this.retryLoad().catch(err => {
            console.error('❌ DASH retry failed:', err);
          });
        } else {
          // Notify main player only after all retries exhausted
          console.error('❌ DASH recovery failed after retries, notifying parent player...');
          if (this.errorCallback && error.error && error.error.code) {
            this.errorCallback({
              type: 'streaming_fatal',
              source: 'dash',
              details: error,
              message: 'DASH playback failed after retry attempts'
            });
          }
        }
      });

      this.dashPlayer.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, (event: any) => {
        console.log('DASH quality changed:', event);
      });

    } else {
      throw new Error('DASH is not supported in this browser');
    }
  }

  public getAvailableQualities(): Array<{ id: string; label: string; bitrate?: number }> {
    const qualities: Array<{ id: string; label: string; bitrate?: number }> = [];

    if (this.hlsInstance) {
      const levels = this.hlsInstance.levels;
      levels.forEach((level: any, index: number) => {
        qualities.push({
          id: index.toString(),
          label: `${level.height}p`,
          bitrate: level.bitrate,
        });
      });
    }

    if (this.dashPlayer) {
      const bitrateInfoList = this.dashPlayer.getBitrateInfoListFor('video');
      bitrateInfoList.forEach((info: any, index: number) => {
        qualities.push({
          id: index.toString(),
          label: `${info.height}p`,
          bitrate: info.bitrate,
        });
      });
    }

    return qualities;
  }

  public setQuality(qualityId: string): void {
    if (this.hlsInstance) {
      const levelIndex = parseInt(qualityId);
      this.hlsInstance.currentLevel = levelIndex;
    }

    if (this.dashPlayer) {
      const qualityIndex = parseInt(qualityId);
      this.dashPlayer.setQualityFor('video', qualityIndex);
    }
  }

  public enableAutoQuality(): void {
    if (this.hlsInstance) {
      this.hlsInstance.currentLevel = -1; // Auto
    }

    if (this.dashPlayer) {
      this.dashPlayer.updateSettings({
        streaming: {
          abr: {
            autoSwitchBitrate: {
              video: true,
            },
          },
        },
      });
    }
  }

  public async cleanup(): Promise<void> {
    try {
      // Enhanced cleanup to prevent SourceBuffer conflicts during ad transitions
      console.log('🧹 Starting StreamingManager cleanup...');
      
      // CRITICAL: Set to IDLE immediately to stop all streaming operations
      this.setPlaybackState('IDLE');
      
      if (this.hlsInstance) {
        // CRITICAL: Stop all loading and pending operations first
        console.log('🛑 Stopping HLS operations...');
        
        // Stop loading immediately to prevent new buffer operations
        this.hlsInstance.stopLoad();
        
        // Remove all event listeners to prevent further callbacks
        this.hlsInstance.off(Hls.Events.ERROR);
        this.hlsInstance.off(Hls.Events.MANIFEST_PARSED);
        this.hlsInstance.off(Hls.Events.LEVEL_SWITCHED);
        
        // Wait for any pending buffer operations to complete or cancel
        // This is critical to prevent "SourceBuffer removed" errors
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Gracefully detach media before destroying
        if (this.video && this.hlsInstance.media === this.video) {
          this.video.pause(); // Pause before detaching
          
          try {
            this.hlsInstance.detachMedia();
            console.log('✅ HLS media detached');
          } catch (err) {
            console.warn('⚠️ HLS detach warning (non-critical):', err);
          }
        }
        
        // Destroy HLS instance
        this.hlsInstance.destroy();
        this.hlsInstance = null;
        console.log('✅ HLS instance destroyed');
      }

      if (this.dashPlayer) {
        // Gracefully reset DASH player
        console.log('🛑 Stopping DASH operations...');
        this.dashPlayer.reset();
        this.dashPlayer = null;
        console.log('✅ DASH player reset');
      }
      
      // Enhanced video element cleanup to prevent SourceBuffer issues
      if (this.video) {
        this.video.pause();
        
        // Clear any blob URLs
        if (this.video.src && this.video.src.startsWith('blob:')) {
          URL.revokeObjectURL(this.video.src);
        }
        
        // Force clear all sources and reload to reset SourceBuffers
        this.video.removeAttribute('src');
        if (this.video.srcObject) {
          this.video.srcObject = null;
        }
        this.video.load(); // This resets the MediaSource and SourceBuffers
        
        // Wait for load to complete the reset
        await new Promise(resolve => setTimeout(resolve, 50));
        
        console.log('✅ Video element cleaned');
      }
      
      console.log('✅ StreamingManager cleanup complete');
    } catch (error) {
      // Ignore cleanup errors during transitions - they're usually harmless
      console.warn('StreamingManager cleanup warning (non-critical):', error);
    }
  }
}

