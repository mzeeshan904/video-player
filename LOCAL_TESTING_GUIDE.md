# 🧪 **Complete Local Testing Guide**

## **🎯 Currently Available Tests**

### **✅ Method 1: Live Vite Test** (ACTIVE)
**URL:** http://localhost:5173  
**Status:** 🟢 Running  
**What:** Tests your package as an installed npm module

```bash
# Already running in /tmp/test-player
# Just visit: http://localhost:5173
```

---

### **🎬 Method 2: Original Demo App**
**URL:** http://localhost:3000  
**What:** Tests your source code directly (not as package)

```bash
# In your main project directory
cd /Users/apple/Desktop/localPlayer/custom-player
npm start
# Visit: http://localhost:3000
```

---

### **📦 Method 3: NPM Link Testing**
**Purpose:** Test package without creating files

```bash
# 1. Link your package globally
cd /Users/apple/Desktop/localPlayer/custom-player
npm link

# 2. Create new test project
cd /tmp
npx create-react-app link-test --template typescript
cd link-test

# 3. Link to your package
npm link custom-media-player
npm install react@^18.2.0 react-dom@^18.2.0

# 4. Use package in src/App.tsx
# (Copy code from SIMPLE_TEST.md)

# 5. Start test
npm start
```

---

### **🔄 Method 4: Fresh Package Test** 
**Purpose:** Test exactly like a real user would

```bash
# 1. Build fresh package
cd /Users/apple/Desktop/localPlayer/custom-player
npm run build
npm pack

# 2. Create new test project
cd /tmp
npm create vite@latest fresh-test -- --template react-ts
cd fresh-test
npm install

# 3. Install your package
npm install /Users/apple/Desktop/localPlayer/custom-player/custom-media-player-1.0.0.tgz

# 4. Copy test code and run
npm run dev
```

---

### **⚡ Method 5: Quick Test Script**
**Purpose:** Automated testing

```bash
# Run the automated test script
cd /Users/apple/Desktop/localPlayer/custom-player
./test-package.sh
```

---

## **🎯 What to Test in Each Method**

### **Core Functionality:**
- [ ] Video loads and plays
- [ ] Pre-roll ad plays automatically
- [ ] Interactive poll appears (bottom-left)
- [ ] Skip button works after timer
- [ ] Main content plays after ad
- [ ] Mid-roll ad inserts at 30 seconds
- [ ] All controls work (play, pause, seek, volume, fullscreen)
- [ ] Click video to play/pause
- [ ] Picture-in-Picture mode

### **Package-Specific (Methods 1, 3, 4, 5):**
- [ ] Package imports correctly
- [ ] TypeScript types work
- [ ] CSS styles load
- [ ] No console errors
- [ ] Analytics events fire

### **Development Testing (Method 2):**
- [ ] Hot reloading works
- [ ] Source maps available
- [ ] Development features accessible

---

## **📊 Current Status**

### **🟢 Active Tests:**
1. **Vite Test:** http://localhost:5173 ✅
2. **Original Demo:** Starting... ⏳

### **⚡ Quick Start Options:**

#### **For Package Testing:**
```bash
# Visit active test
open http://localhost:5173
```

#### **For Source Code Testing:**
```bash
# Start original demo
cd /Users/apple/Desktop/localPlayer/custom-player
npm start
# Visit: http://localhost:3000
```

#### **For Fresh Package Test:**
```bash
# Create completely new test
./test-package.sh
```

---

## **🔧 Troubleshooting**

### **If Vite test has issues:**
```bash
cd /tmp/test-player
npm run dev
```

### **If original demo won't start:**
```bash
cd /Users/apple/Desktop/localPlayer/custom-player
npm install
npm start
```

### **If package imports fail:**
```bash
# Check package exists
ls -la custom-media-player-1.0.0.tgz

# Rebuild if needed
npm run build
npm pack
```

---

## **✅ Success Indicators**

### **Package Working Correctly:**
- ✅ No import errors
- ✅ Video player renders
- ✅ Pre-roll ad plays
- ✅ Interactive elements function
- ✅ All controls work
- ✅ Analytics events in console
- ✅ TypeScript intellisense works

### **Ready for Publishing When:**
- ✅ All test methods work
- ✅ No console errors
- ✅ Performance is good
- ✅ Mobile responsive
- ✅ Cross-browser compatible

---

## **🎬 Test These Specific Features:**

### **Ad System:**
1. **Pre-roll:** Should play 15s ad, skip after 3s
2. **Interactive Poll:** Vote on "How is this working?"
3. **Skip Button:** Appears after countdown
4. **Mid-roll:** Inserts at 30 seconds into main content
5. **Replay:** Complete cycle and test restart

### **Player Controls:**
1. **Play/Pause:** Click video or button
2. **Seek:** Drag progress bar
3. **Volume:** Adjust slider
4. **Fullscreen:** Enter/exit fullscreen
5. **PiP:** Picture-in-Picture mode

### **Interactive Features:**
1. **Polls:** Vote and see results
2. **CTAs:** Click call-to-action buttons
3. **Analytics:** Check console for events
4. **Responsive:** Test different screen sizes

**Choose any method above to test your package locally!** 🚀
