import { Ad, AdConfig, MidRollAd, AnalyticsEvent } from '../types';

export class AdManager {
  private preRollAds: Ad[] = [];
  private midRollAds: MidRollAd[] = [];
  private postRollAds: Ad[] = [];
  private currentPreRollIndex = 0;
  private currentPostRollIndex = 0;
  private playedMidRollAds = new Set<string>();
  private onAnalyticsEvent?: (type: AnalyticsEvent['type'], payload?: any) => void;

  constructor(config?: AdConfig, onAnalyticsEvent?: (type: AnalyticsEvent['type'], payload?: any) => void) {
    if (config) {
      this.preRollAds = config.preRoll || [];
      this.midRollAds = config.midRoll || [];
      this.postRollAds = config.postRoll || [];
    }
    this.onAnalyticsEvent = onAnalyticsEvent;
    // Always reset indices when creating new instance
    this.reset();
  }

  public getPreRollAd(): Ad | null {
    if (this.currentPreRollIndex < this.preRollAds.length) {
      const ad = this.preRollAds[this.currentPreRollIndex];
      this.currentPreRollIndex++;
      this.trackEvent('ad_start', { adId: ad.id, adType: 'preroll', adIndex: this.currentPreRollIndex });
      return ad;
    }
    return null;
  }

  public hasMorePreRollAds(): boolean {
    return this.currentPreRollIndex < this.preRollAds.length;
  }

  public getMidRollAd(currentTime: number): MidRollAd | null {
    for (const ad of this.midRollAds) {
      if (
        currentTime >= ad.playAt &&
        currentTime <= ad.playAt + 1 && // 1 second tolerance
        !this.playedMidRollAds.has(ad.id)
      ) {
        this.playedMidRollAds.add(ad.id);
        this.trackEvent('ad_start', { adId: ad.id, adType: 'midroll', playAt: ad.playAt });
        return ad;
      }
    }
    return null;
  }

  public checkMissedMidRollAds(seekFromTime: number, seekToTime: number): MidRollAd | null {
    // Find any mid-roll ads that were skipped during seek
    for (const ad of this.midRollAds) {
      if (
        ad.playAt > seekFromTime && // Ad is after the seek start point
        ad.playAt <= seekToTime && // Ad is before or at the seek end point
        !this.playedMidRollAds.has(ad.id) // Ad hasn't been played yet
      ) {
        this.playedMidRollAds.add(ad.id);
        this.trackEvent('ad_start', { adId: ad.id, adType: 'midroll', playAt: ad.playAt, triggeredBySeek: true });
        return ad;
      }
    }
    return null;
  }

  public getPostRollAd(): Ad | null {
    if (this.currentPostRollIndex < this.postRollAds.length) {
      const ad = this.postRollAds[this.currentPostRollIndex];
      this.currentPostRollIndex++;
      this.trackEvent('ad_start', { adId: ad.id, adType: 'postroll', adIndex: this.currentPostRollIndex });
      return ad;
    }
    return null;
  }

  public hasMorePostRollAds(): boolean {
    return this.currentPostRollIndex < this.postRollAds.length;
  }

  public onAdComplete(adId: string): void {
    this.trackEvent('ad_complete', { adId });
  }

  public onAdSkip(adId: string): void {
    this.trackEvent('ad_skip', { adId });
  }

  public onAdClick(adId: string, url?: string): void {
    this.trackEvent('ad_click', { adId, url });
  }

  public onAdInteraction(adId: string, interactionType: string, data: any): void {
    this.trackEvent('ad_interaction', { adId, interactionType, data });
    
    // Store interaction in localStorage to avoid repeating
    this.storeInteraction(adId, interactionType, data);
  }

  private storeInteraction(adId: string, interactionType: string, data: any): void {
    try {
      const key = `ad_interaction_${adId}`;
      const existing = localStorage.getItem(key);
      const interactions = existing ? JSON.parse(existing) : [];
      
      interactions.push({
        type: interactionType,
        data,
        timestamp: Date.now(),
      });
      
      localStorage.setItem(key, JSON.stringify(interactions));
    } catch (error) {
      console.warn('Failed to store ad interaction:', error);
    }
  }

  public hasInteracted(adId: string, interactionType?: string): boolean {
    try {
      const key = `ad_interaction_${adId}`;
      const existing = localStorage.getItem(key);
      if (!existing) return false;
      
      const interactions = JSON.parse(existing);
      if (!interactionType) {
        return interactions.length > 0;
      }
      
      return interactions.some((i: any) => i.type === interactionType);
    } catch (error) {
      console.warn('Failed to check ad interaction:', error);
      return false;
    }
  }

  private trackEvent(type: AnalyticsEvent['type'], payload?: any): void {
    if (this.onAnalyticsEvent) {
      this.onAnalyticsEvent(type, payload);
    }
  }

  public reset(): void {
    this.currentPreRollIndex = 0;
    this.currentPostRollIndex = 0;
    this.playedMidRollAds.clear();
  }
}
