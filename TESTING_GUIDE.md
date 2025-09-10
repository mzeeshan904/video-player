# 🧪 Custom Media Player - Testing Guide

## 📺 Available Sample Videos & Ads

All sample videos are publicly available from Google's test content repository and other reliable sources. No local files needed!

### 🎬 Main Content Videos
- **Big Buck Bunny** (10 min) - Primary test video
- **Elephant Dream** (11 min) - Secondary test video  
- **Sintel** (15 min) - Longer content for mid-roll testing

### 📺 Ad Videos
- **Pre-roll Ads:** Car, Travel, Entertainment (15-60s)
- **Mid-roll Ads:** Lifestyle, Action, Automotive (15s each)
- **Post-roll Ads:** Tech, Car, Adventure (15s each)

### 🌐 Streaming Content
- **HLS Streams:** Apple test streams with adaptive bitrate
- **DASH Streams:** Industry standard DASH manifests

---

## 🎯 Test Configurations

### 1. **Full Featured Test** ⭐ *Recommended for complete testing*
- **Main Video:** Big Buck Bunny (10 min)
- **Pre-roll:** Car ad with automotive quiz (skip after 5s)
- **Mid-rolls:** 
  - 1 min: Lifestyle ad with preference poll (non-skippable)
  - 3 min: Action ad with discount overlay (skip after 8s)
  - 5 min: Car commercial with CTA button (skip after 5s)
- **Post-roll:** Satisfaction poll (skip after 3s)

### 2. **Quick Test** ⚡ *Fast testing*
- **Main Video:** Elephant Dream
- **Pre-roll:** Simple math quiz (skip after 2s)
- **Mid-roll:** CTA test at 30 seconds (non-skippable)

### 3. **Interactive Ads Showcase** 🎯
- **Main Video:** Sintel
- **Focus:** All interactive ad types
- **Pre-roll:** Entertainment poll (skip after 10s)
- **Mid-rolls:** Quiz at 2min, Overlay at 4min
- **Post-roll:** Technology CTA

### 4. **No Ads (Clean)** 🎥
- **Pure playback testing**
- **Light theme**
- **No advertisements**

### 5. **HLS Streaming** 🌐
- **Apple's test HLS stream**
- **Adaptive bitrate**
- **Pre-roll with streaming quiz**

### 6. **DASH Streaming** 📡
- **DASH adaptive streaming**
- **Quality switching**
- **DASH technology CTA**

### 7. **Automotive Theme** 🚗
- **Car-focused content**
- **Automotive ads only**
- **Product overlays**

---

## 🧪 Testing Scenarios

### Core Player Testing
```
✅ Play/Pause functionality
✅ Volume control (0-100%)
✅ Mute/Unmute toggle
✅ Seek bar functionality
✅ Fullscreen mode
✅ Picture-in-Picture (if supported)
✅ Progress tracking
✅ Time display
✅ Responsive design
```

### Ad System Testing
```
✅ Pre-roll ad playback
✅ Mid-roll ad insertion (at specified times)
✅ Post-roll ad display
✅ Skip button appearance (after timer)
✅ Skip countdown display
✅ Ad progress bar
✅ Ad click detection
✅ Return to main content after ads
```

### Interactive Ads Testing
```
✅ Poll display and interaction
✅ Quiz questions with correct/incorrect feedback
✅ CTA button clicks (opens external links)
✅ Overlay card positioning
✅ Interaction timeout handling
✅ Analytics tracking for interactions
```

### Analytics Testing
```
✅ Play/pause events
✅ Seek events
✅ Volume change events
✅ Fullscreen toggle events
✅ Ad impression tracking
✅ Ad interaction tracking
✅ Error event handling
✅ Buffering state tracking
```

### Mobile Testing
```
✅ Touch controls
✅ Responsive layout
✅ Mobile fullscreen
✅ Touch-friendly button sizes
✅ Mobile Picture-in-Picture
✅ Portrait/landscape orientation
```

---

## 📊 Analytics Events Reference

Monitor the browser console to see these events:

| Event Type | When Triggered | Data Included |
|------------|---------------|---------------|
| `play` | Video starts | Current time |
| `pause` | Video pauses | Current time |
| `seek` | User seeks | New time position |
| `volumechange` | Volume/mute change | Volume level, mute state |
| `fullscreen` | Fullscreen toggle | Fullscreen state |
| `ad_start` | Ad begins | Ad ID, type (preroll/midroll/postroll) |
| `ad_complete` | Ad finishes | Ad ID |
| `ad_skip` | User skips ad | Ad ID |
| `ad_click` | Ad clicked | Ad ID, URL (if any) |
| `ad_interaction` | Interactive engagement | Ad ID, interaction type, data |
| `buffering_start` | Video starts buffering | - |
| `buffering_end` | Video stops buffering | - |
| `error` | Playback error | Error details |

---

## 🎮 Testing Instructions

### Quick Start Testing (5 minutes)
1. Select **"Quick Test"** configuration
2. Play video and wait for 2-second skip timer
3. Skip pre-roll ad
4. Wait for mid-roll at 30 seconds
5. Interact with CTA button
6. Check console for analytics events

### Full Feature Testing (15 minutes)
1. Select **"Full Featured Test"** configuration
2. Start video and interact with pre-roll quiz
3. Wait for mid-roll ads at 1, 3, and 5 minute marks
4. Test different interactive elements:
   - Answer quiz questions
   - Participate in polls
   - Click CTA buttons
   - Observe overlay cards
5. Complete video to see post-roll
6. Review console logs for complete analytics

### Interactive Ads Deep Dive
1. Select **"Interactive Ads Showcase"**
2. Test each interaction type:
   - **Poll:** Vote on options, see results
   - **Quiz:** Answer questions, get feedback
   - **CTA:** Click buttons (opens example.com links)
   - **Overlay:** Notice positioned content cards

### Streaming Technology Testing
1. Try **"HLS Streaming"** - Apple's adaptive stream
2. Try **"DASH Streaming"** - Industry standard
3. Monitor network tab for segment loading
4. Test quality adaptation (if network throttling available)

---

## 🐛 Common Issues & Solutions

### Ad Videos Not Loading
- **Issue:** External video URLs may occasionally be slow
- **Solution:** Wait a moment or refresh the page
- **Fallback:** Check network connection

### Interactive Elements Not Responding
- **Issue:** Touch/click not registering
- **Solution:** Ensure full page load before testing
- **Check:** Browser console for any errors

### Analytics Not Showing
- **Issue:** Console events not appearing
- **Solution:** Open browser developer tools (F12)
- **Ensure:** Console tab is visible

### Mobile Testing Issues
- **Issue:** Controls too small on mobile
- **Solution:** The player auto-adjusts for touch devices
- **Note:** Some features may differ on mobile browsers

---

## 🎯 Testing Checklist

### Before Testing
- [ ] Browser developer tools open (Console tab visible)
- [ ] Stable internet connection
- [ ] Audio enabled (for sound testing)

### During Testing
- [ ] Test each configuration
- [ ] Interact with all ad types
- [ ] Check responsive behavior
- [ ] Monitor analytics events
- [ ] Test error scenarios (network disconnect)

### After Testing
- [ ] Review console logs
- [ ] Test on different devices/browsers
- [ ] Verify all features working
- [ ] Check performance (smooth playback)

---

## 🚀 Next Steps

Once you've tested the sample configurations:

1. **Customize Videos:** Replace URLs in `src/config/sampleVideos.ts` with your own content
2. **Modify Ads:** Update ad configurations in `src/config/testConfigurations.ts`
3. **Analytics Integration:** Connect to your analytics service in the config
4. **DRM Testing:** Add your DRM license servers for protected content
5. **Production Build:** Run `npm run build` for optimized production version

Happy Testing! 🎉
