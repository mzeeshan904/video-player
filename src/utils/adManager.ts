import { Ad, AdConfig, MidRollAd, AnalyticsEvent } from '../types';

export class AdManager {
  private preRollAds: Ad[] = [];
  private midRollAds: MidRollAd[] = [];
  private postRollAds: Ad[] = [];
  private currentPreRollIndex = 0;
  private currentPostRollIndex = 0;
  private playedMidRollAds = new Set<string>();
  private onAnalyticsEvent?: (type: AnalyticsEvent['type'], payload?: any) => void;
  
  // PHASE 2: Mid-roll queue for chained ads at the same playAt time
  // Key is floored playAt time (e.g., 25.1s and 25.3s both map to 25)
  // Value is array of ads at that cue point, in order
  private midRollQueue: Map<number, MidRollAd[]> = new Map();
  private playedCues = new Set<number>(); // Track which cues have been played

  constructor(config?: AdConfig, onAnalyticsEvent?: (type: AnalyticsEvent['type'], payload?: any) => void) {
    if (config) {
      this.preRollAds = config.preRoll || [];
      this.midRollAds = config.midRoll || [];
      this.postRollAds = config.postRoll || [];
    }
    this.onAnalyticsEvent = onAnalyticsEvent;
    // Always reset indices when creating new instance
    this.reset();
    // Build mid-roll queue (group ads by playAt time)
    this.buildMidRollQueue();
  }
  
  /**
   * PHASE 2: Build mid-roll queue
   * Groups ads by playAt time (floored to nearest second) and sorts them
   * Example: [ad1@25.1s, ad2@25.3s] → queue.get(25) = [ad1, ad2]
   */
  private buildMidRollQueue(): void {
    // C1: Stable ordering & coalescing - sort by playAt, then by original index
    const sortedAds = [...this.midRollAds].sort((a, b) => {
      if (Math.abs(a.playAt - b.playAt) <= 0.25) {
        // Within epsilon - treat as same cue, maintain original order
        return this.midRollAds.indexOf(a) - this.midRollAds.indexOf(b);
      }
      return a.playAt - b.playAt;
    });
    
    // Group ads by floored playAt time
    for (const ad of sortedAds) {
      const cuePoint = Math.floor(ad.playAt);
      const queue = this.midRollQueue.get(cuePoint) || [];
      queue.push(ad);
      this.midRollQueue.set(cuePoint, queue);
    }
    
    // Log queue structure for debugging
    if (this.midRollQueue.size > 0) {
      console.log('🔗 Mid-roll queue built:', 
        Array.from(this.midRollQueue.entries()).map(([cue, ads]) => 
          `cue@${cue}s: [${ads.map(a => a.id).join(', ')}]`
        ).join(', ')
      );
    }
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

  /**
   * PHASE 3: Get mid-roll ad with chain information
   * Returns the first ad from a cue queue and metadata about the chain
   */
  public getMidRollAd(currentTime: number): { ad: MidRollAd; chainInfo: { isChained: boolean; chainLength: number; chainIndex: number; cuePoint: number } } | null {
    // Check each cue point in the queue
    for (const [cuePoint, adsAtCue] of Array.from(this.midRollQueue.entries())) {
      if (
        currentTime >= cuePoint &&
        currentTime <= cuePoint + 1 && // 1 second tolerance
        !this.playedCues.has(cuePoint) // Check if this cue has been triggered
      ) {
        // Mark this cue as played
        this.playedCues.add(cuePoint);
        
        // Return the first ad in the queue with chain metadata
        const firstAd = adsAtCue[0];
        const chainInfo = {
          isChained: adsAtCue.length > 1,
          chainLength: adsAtCue.length,
          chainIndex: 0, // This is the first ad in the chain
          cuePoint
        };
        
        this.playedMidRollAds.add(firstAd.id);
        this.trackEvent('ad_start', { 
          adId: firstAd.id, 
          adType: 'midroll', 
          playAt: firstAd.playAt,
          chainInfo 
        });
        
        if (chainInfo.isChained) {
          console.log(`🔗 Ad chain started at cue ${cuePoint}s with ${chainInfo.chainLength} ads: [${adsAtCue.map(a => a.id).join(', ')}]`);
        }
        
        return { ad: firstAd, chainInfo };
      }
    }
    return null;
  }
  
  /**
   * PHASE 4: Get next ad in the current chain
   * Called after an ad completes/skips to check if there are more ads at this cue
   */
  public getNextAdInChain(cuePoint: number, currentChainIndex: number): { ad: MidRollAd; chainInfo: { isChained: boolean; chainLength: number; chainIndex: number; cuePoint: number } } | null {
    const adsAtCue = this.midRollQueue.get(cuePoint);
    if (!adsAtCue) return null;
    
    const nextIndex = currentChainIndex + 1;
    if (nextIndex >= adsAtCue.length) {
      // No more ads in this chain
      console.log(`✅ Ad chain completed at cue ${cuePoint}s (played ${adsAtCue.length} ads)`);
      return null;
    }
    
    const nextAd = adsAtCue[nextIndex];
    const chainInfo = {
      isChained: nextIndex < adsAtCue.length - 1, // More ads after this one?
      chainLength: adsAtCue.length,
      chainIndex: nextIndex,
      cuePoint
    };
    
    this.playedMidRollAds.add(nextAd.id);
    this.trackEvent('ad_start', { 
      adId: nextAd.id, 
      adType: 'midroll', 
      playAt: nextAd.playAt,
      chainInfo,
      isChainContinuation: true
    });
    
    console.log(`🔗 Ad chain continuing: ${nextIndex + 1}/${adsAtCue.length} at cue ${cuePoint}s (${nextAd.id})`);
    
    return { ad: nextAd, chainInfo };
  }

  /**
   * Check for missed mid-roll ads during seek (queue-aware version)
   * Returns the first ad from the first missed cue
   */
  public checkMissedMidRollAds(seekFromTime: number, seekToTime: number): { ad: MidRollAd; chainInfo: { isChained: boolean; chainLength: number; chainIndex: number; cuePoint: number } } | null {
    // Find the first cue that was skipped during seek
    for (const [cuePoint, adsAtCue] of Array.from(this.midRollQueue.entries())) {
      if (
        cuePoint > Math.floor(seekFromTime) && // Cue is after the seek start point
        cuePoint <= Math.floor(seekToTime) && // Cue is before or at the seek end point
        !this.playedCues.has(cuePoint) // Cue hasn't been played yet
      ) {
        // Mark this cue as played
        this.playedCues.add(cuePoint);
        
        const firstAd = adsAtCue[0];
        const chainInfo = {
          isChained: adsAtCue.length > 1,
          chainLength: adsAtCue.length,
          chainIndex: 0,
          cuePoint
        };
        
        this.playedMidRollAds.add(firstAd.id);
        this.trackEvent('ad_start', { 
          adId: firstAd.id, 
          adType: 'midroll', 
          playAt: firstAd.playAt, 
          triggeredBySeek: true,
          chainInfo
        });
        
        if (chainInfo.isChained) {
          console.log(`🔗 Ad chain started (via seek) at cue ${cuePoint}s with ${chainInfo.chainLength} ads`);
        }
        
        return { ad: firstAd, chainInfo };
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
    // AdManager events are now handled by MediaPlayer's enhancedTrackEvent
    // to avoid duplicate analytics calls. This method is kept for compatibility
    // but doesn't call onAnalyticsEvent to prevent duplicates.
    
    // Note: Analytics tracking is now handled in MediaPlayer.tsx via enhancedTrackEvent
    // when ad events occur (handleAdStart, handleAdComplete, etc.)
  }

  public reset(): void {
    this.currentPreRollIndex = 0;
    this.currentPostRollIndex = 0;
    this.playedMidRollAds.clear();
    this.playedCues.clear(); // PHASE 2: Clear played cues on reset
  }
}
