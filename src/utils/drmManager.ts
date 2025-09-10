import { DRMConfig } from '../types';

export class DRMManager {
  private mediaKeys: MediaKeys | null = null;
  private keySession: MediaKeySession | null = null;

  async setupDRM(video: HTMLVideoElement, config: DRMConfig): Promise<void> {
    try {
      // Check if EME is supported
      if (!navigator.requestMediaKeySystemAccess) {
        throw new Error('Encrypted Media Extensions not supported');
      }

      let keySystem: string;
      let keySystemConfig: MediaKeySystemConfiguration;

      switch (config.type) {
        case 'widevine':
          keySystem = 'com.widevine.alpha';
          keySystemConfig = {
            initDataTypes: ['cenc'],
            audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }],
            videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }],
          };
          break;
        case 'playready':
          keySystem = 'com.microsoft.playready';
          keySystemConfig = {
            initDataTypes: ['cenc'],
            audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }],
            videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }],
          };
          break;
        case 'fairplay':
          keySystem = 'com.apple.fps.1_0';
          keySystemConfig = {
            initDataTypes: ['skd'],
            audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }],
            videoCapabilities: [{ contentType: 'video/mp4; codecs="avc1.42E01E"' }],
          };
          break;
        default:
          throw new Error(`Unsupported DRM type: ${config.type}`);
      }

      // Request access to the key system
      const keySystemAccess = await navigator.requestMediaKeySystemAccess(
        keySystem,
        [keySystemConfig]
      );

      // Create media keys
      this.mediaKeys = await keySystemAccess.createMediaKeys();

      // Set media keys on video element
      await video.setMediaKeys(this.mediaKeys);

      // Set up encrypted event listener
      video.addEventListener('encrypted', (event) => {
        this.handleEncrypted(event, config);
      });

      console.log(`DRM ${config.type} initialized successfully`);
    } catch (error) {
      console.error('DRM setup failed:', error);
      throw error;
    }
  }

  private async handleEncrypted(event: MediaEncryptedEvent, config: DRMConfig): Promise<void> {
    try {
      if (!this.mediaKeys) {
        throw new Error('Media keys not initialized');
      }

      // Create key session
      this.keySession = this.mediaKeys.createSession();

      // Set up message event listener for license requests
      this.keySession.addEventListener('message', (messageEvent) => {
        this.handleMessage(messageEvent, config);
      });

      // Generate request
      if (event.initData) {
        await this.keySession.generateRequest(event.initDataType, event.initData);
      }
    } catch (error) {
      console.error('Failed to handle encrypted event:', error);
      throw error;
    }
  }

  private async handleMessage(event: MediaKeyMessageEvent, config: DRMConfig): Promise<void> {
    try {
      const message = event.message;
      let licenseRequest: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          ...config.headers,
        },
        body: message,
      };

      // Special handling for FairPlay
      if (config.type === 'fairplay' && config.certificateUrl) {
        // For FairPlay, we need to get the certificate first
        const certResponse = await fetch(config.certificateUrl);
        await certResponse.arrayBuffer(); // Certificate handling would go here
        
        // Modify the request for FairPlay
        licenseRequest = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...config.headers,
          },
          body: JSON.stringify({
            spc: Array.from(new Uint8Array(message)),
            assetId: this.extractAssetId(event.target as MediaKeySession),
          }),
        };
      }

      // Request license from server
      const response = await fetch(config.licenseUrl, licenseRequest);
      
      if (!response.ok) {
        throw new Error(`License request failed: ${response.status}`);
      }

      const license = await response.arrayBuffer();

      // Update session with license
      if (this.keySession) {
        await this.keySession.update(license);
        console.log('License updated successfully');
      }
    } catch (error) {
      console.error('Failed to handle license message:', error);
      throw error;
    }
  }

  private extractAssetId(session: MediaKeySession): string {
    // Extract asset ID for FairPlay - this is implementation specific
    // In a real implementation, this would extract the asset ID from the session
    return 'default-asset-id';
  }

  public cleanup(): void {
    if (this.keySession) {
      this.keySession.close();
      this.keySession = null;
    }
    this.mediaKeys = null;
  }
}
