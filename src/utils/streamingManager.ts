// @ts-ignore
import Hls from 'hls.js';
// @ts-ignore
import dashjs from 'dashjs';

export class StreamingManager {
  private hlsInstance: any = null;
  private dashPlayer: any = null;
  private video: HTMLVideoElement | null = null;

  constructor(video: HTMLVideoElement) {
    this.video = video;
  }

  public async loadSource(url: string, mimeType?: string): Promise<void> {
    if (!this.video) {
      throw new Error('Video element not available');
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
    } catch (error) {
      console.error('Failed to load streaming source:', error);
      throw error;
    }
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
        console.error('HLS error:', data);
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, trying to recover...');
              this.hlsInstance.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, trying to recover...');
              this.hlsInstance.recoverMediaError();
              break;
            default:
              console.log('Fatal error, destroying HLS instance');
              this.hlsInstance.destroy();
              break;
          }
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
      
      // Configure DASH player
      this.dashPlayer.updateSettings({
        streaming: {
          enableLowLatencyMode: true,
          lowLatencyEnabled: true,
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
      });

      this.dashPlayer.initialize(this.video, url, false);

      // Handle DASH events
      this.dashPlayer.on(dashjs.MediaPlayer.events.ERROR, (error: any) => {
        console.error('DASH error:', error);
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

  public cleanup(): void {
    if (this.hlsInstance) {
      this.hlsInstance.destroy();
      this.hlsInstance = null;
    }

    if (this.dashPlayer) {
      this.dashPlayer.reset();
      this.dashPlayer = null;
    }
  }
}
