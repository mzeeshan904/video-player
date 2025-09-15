# 🧪 **Media Player Testing Suite**

## **📋 Quick Start Testing Guide**

### **1. 🚀 Run the Test Applications**

```bash
# Start the comprehensive test runner
npm start

# Or run specific test files
# COMPREHENSIVE_TEST_RUNNER.tsx - Main test interface
# DASH_HLS_TEST.tsx - Streaming protocol tests
# DRM_TEST.tsx - DRM protected content tests
```

### **2. 📁 Test Files Overview**

| File | Purpose | What It Tests |
|------|---------|---------------|
| `COMPREHENSIVE_TEST_RUNNER.tsx` | Main test interface | System capabilities, quick tests, navigation |
| `DASH_HLS_TEST.tsx` | Streaming protocols | HLS, DASH, adaptive bitrate, quality switching |
| `DRM_TEST.tsx` | Protected content | Widevine, PlayReady, FairPlay, license acquisition |

---

## **🎯 Testing Categories**

### **📱 HLS (HTTP Live Streaming) Tests**

#### **Test URLs:**
- **Apple Basic:** `https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8`
- **Apple Advanced:** `https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8`
- **JW Player:** `https://playertest.longtailvideo.com/adaptive/captions/playlist.m3u8`

#### **Expected Behavior:**
- ✅ **Safari/iOS:** Native HLS support (no hls.js needed)
- ✅ **Chrome/Firefox/Edge:** Uses hls.js library
- ✅ **Quality switching:** Multiple bitrates available
- ✅ **Seeking:** Smooth seeking across segments

### **📡 DASH (Dynamic Adaptive Streaming) Tests**

#### **Test URLs:**
- **Big Buck Bunny:** `https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd`
- **Tears of Steel:** `https://dash.akamaized.net/dash264/TestCases/2c/qualcomm/1/MultiResMPEG2.mpd`
- **Live Stream:** `https://livesim.dashif.org/livesim/testpic_2s/Manifest.mpd`

#### **Expected Behavior:**
- ✅ **All Modern Browsers:** Uses dash.js library
- ✅ **Adaptive bitrate:** Automatic quality adjustment
- ✅ **Buffer management:** Efficient buffering strategy
- ✅ **Error recovery:** Network and media error handling

### **🔐 DRM (Digital Rights Management) Tests**

#### **Widevine Tests:**
- **Basic:** `https://storage.googleapis.com/shaka-demo-assets/angel-one-widevine/dash.mpd`
- **Advanced:** `https://storage.googleapis.com/shaka-demo-assets/sintel-widevine/dash.mpd`
- **License Server:** `https://cwip-shaka-proxy.appspot.com/no_auth`

#### **PlayReady Tests:**
- **Test Stream:** Microsoft PlayReady test content
- **Browser Support:** Edge, Windows browsers primarily

#### **FairPlay Tests:**
- **Test Stream:** `https://fps.ezdrm.com/demo/video/ezdrm.m3u8`
- **Browser Support:** Safari, iOS browsers only
- **Certificate Required:** FairPlay needs certificate URL

---

## **🔍 Browser Compatibility Testing**

### **✅ Supported Browsers & Features**

| Browser | HLS | DASH | Widevine | PlayReady | FairPlay |
|---------|-----|------|----------|-----------|-----------|
| **Chrome** | hls.js | ✅ | ✅ | ❌ | ❌ |
| **Firefox** | hls.js | ✅ | ✅ | ❌ | ❌ |
| **Safari** | Native | ✅ | ❌ | ❌ | ✅ |
| **Edge** | hls.js | ✅ | ✅ | ✅ | ❌ |
| **iOS Safari** | Native | ❌ | ❌ | ❌ | ✅ |
| **Android Chrome** | hls.js | ✅ | ✅ | ❌ | ❌ |

### **🔧 Required Browser Features**

```javascript
// Check these capabilities in browser console:
✅ MediaSource Extensions: 'MediaSource' in window
✅ Encrypted Media Extensions: 'requestMediaKeySystemAccess' in navigator
✅ Picture-in-Picture: 'pictureInPictureEnabled' in document
✅ Fullscreen API: 'requestFullscreen' in HTMLElement.prototype
✅ HTTPS Context: location.protocol === 'https:'
```

---

## **📊 Testing Procedures**

### **🎬 Step 1: Basic Functionality**

1. **Load the test runner**
2. **Check system capabilities** (green checkmarks)
3. **Test basic MP4 playback** first
4. **Verify player controls** work properly
5. **Test fullscreen and PiP** if supported

### **📡 Step 2: Streaming Protocols**

#### **HLS Testing:**
```bash
1. Select HLS test from DASH_HLS_TEST.tsx
2. Click play and verify playback starts
3. Open browser console for hls.js logs
4. Test quality switching in settings menu
5. Test seeking to different positions
6. Monitor for any error messages
```

#### **DASH Testing:**
```bash
1. Select DASH test from DASH_HLS_TEST.tsx
2. Verify manifest loads successfully
3. Check adaptive bitrate behavior
4. Test quality manual switching
5. Verify smooth playback transitions
6. Monitor buffer health in console
```

### **🔐 Step 3: DRM Testing**

#### **Prerequisites:**
- ✅ **HTTPS required** (DRM doesn't work on HTTP)
- ✅ **Modern browser** with EME support
- ✅ **Correct DRM system** for your browser

#### **Widevine Testing (Chrome/Firefox/Edge):**
```bash
1. Load DRM_TEST.tsx
2. Click "Test DRM Systems" button
3. Select Widevine test
4. Click play and wait for license acquisition
5. Monitor console for DRM events:
   - "DRM setup successful"
   - "License acquired"
   - "Protected content playing"
6. Test seeking and quality switching
```

#### **FairPlay Testing (Safari/iOS):**
```bash
1. Use Safari or iOS device
2. Select FairPlay test
3. Verify certificate loads
4. Test license acquisition
5. Confirm protected playback
```

---

## **🐛 Common Issues & Solutions**

### **🔴 Streaming Issues**

| Issue | Cause | Solution |
|-------|-------|----------|
| **HLS not playing on Chrome** | hls.js not loading | Check console for library errors |
| **DASH infinite buffering** | Network/manifest issue | Verify DASH URL accessibility |
| **Quality switching not working** | MSE not supported | Check MediaSource Extensions support |
| **Seeking breaks playback** | Segment alignment issue | Normal behavior in some streams |

### **🔐 DRM Issues**

| Issue | Cause | Solution |
|-------|-------|----------|
| **License acquisition failed** | Wrong license server | Verify license URL and headers |
| **DRM not supported error** | Browser compatibility | Use correct DRM for browser |
| **HTTPS required error** | HTTP context | Serve content over HTTPS |
| **Certificate error (FairPlay)** | Missing certificate | Provide valid certificate URL |

### **🌐 Browser-Specific Issues**

#### **Safari:**
- ✅ **HLS works natively** (no hls.js needed)
- ❌ **DASH limited support** (newer versions improving)
- ✅ **FairPlay DRM only**

#### **Chrome:**
- ✅ **Best DASH support**
- ✅ **Widevine DRM**
- ✅ **hls.js for HLS**

#### **Firefox:**
- ✅ **Good DASH support**
- ✅ **Widevine DRM**
- ⚠️ **hls.js compatibility** (some versions have issues)

---

## **📝 Testing Checklist**

### **✅ Pre-Test Setup**
- [ ] HTTPS server running
- [ ] All test URLs accessible
- [ ] Browser console open for monitoring
- [ ] Network tab open for debugging

### **✅ Basic Tests**
- [ ] MP4 video plays correctly
- [ ] Controls work (play, pause, seek, volume)
- [ ] Fullscreen functionality
- [ ] Picture-in-Picture (if supported)
- [ ] Responsive design on mobile

### **✅ Streaming Tests**
- [ ] HLS stream loads and plays
- [ ] DASH stream loads and plays  
- [ ] Quality switching works
- [ ] Adaptive bitrate responds to network
- [ ] Seeking works in streams
- [ ] Error recovery functions

### **✅ DRM Tests**
- [ ] DRM system detection works
- [ ] License acquisition succeeds
- [ ] Protected content plays
- [ ] Seeking works with DRM
- [ ] Error handling for failed licenses

### **✅ Cross-Browser Tests**
- [ ] Chrome (Widevine, DASH, HLS.js)
- [ ] Firefox (Widevine, DASH, HLS.js)
- [ ] Safari (FairPlay, native HLS)
- [ ] Edge (PlayReady, Widevine, DASH)
- [ ] Mobile browsers (iOS Safari, Android Chrome)

---

## **🚀 Performance Testing**

### **📈 Metrics to Monitor**
- **Load Time:** Time to first frame
- **Buffer Health:** Seconds of content buffered
- **Quality Switches:** Frequency and timing
- **Error Rate:** Network and playback errors
- **Memory Usage:** Browser memory consumption
- **CPU Usage:** Processing overhead

### **🔧 Browser Developer Tools**
```bash
# Performance monitoring:
1. Open Chrome DevTools → Performance tab
2. Start recording before playing video
3. Monitor:
   - JavaScript execution time
   - Memory allocation
   - Network requests
   - Frame rate consistency

# Network analysis:
1. Open Network tab in DevTools
2. Filter by Media to see video requests
3. Monitor:
   - Segment download times
   - Failed requests
   - Bandwidth utilization
```

---

## **📞 Support & Debugging**

### **🔍 Console Logging**
Each test configuration includes comprehensive logging:
- **🎬 Playback events:** play, pause, seek, ended
- **📡 Streaming events:** manifest loaded, quality changed
- **🔐 DRM events:** license acquired, protection status
- **❌ Error events:** network errors, DRM failures

### **🐛 Debug Information**
```javascript
// Access debug info in browser console:
console.log('Player state:', window.playerState);
console.log('Streaming info:', window.streamingManager);
console.log('DRM status:', window.drmManager);
```

### **📧 Reporting Issues**
When reporting issues, include:
1. **Browser and version**
2. **Operating system**
3. **Test configuration used**
4. **Console error messages**
5. **Network conditions**
6. **Steps to reproduce**

---

**🎯 Ready to test? Start with `COMPREHENSIVE_TEST_RUNNER.tsx` for guided testing experience!**
