# 🧪 **NPM Package Testing Guide**

Your custom media player package can be tested in multiple ways. Here's a comprehensive guide:

## **Method 1: Local Development Testing** ⚡

### **1. Current Demo Testing**
```bash
# Start the development server
npm start

# Visit: http://localhost:3000
# Test all features: ads, seeking, fullscreen, etc.
```

### **2. Build Package Testing**
```bash
# Build the library
npm run build

# Check build output
ls -la dist/

# Verify TypeScript declarations
find dist/ -name "*.d.ts" | head -5
```

---

## **Method 2: Local Package Installation** 📦

### **1. Create Test Package**
```bash
# Create a tarball (without publishing)
npm pack

# This creates: your-org-custom-media-player-1.0.0.tgz
```

### **2. Test in New Project**
```bash
# Create a new test project
cd /tmp
npx create-react-app test-media-player --template typescript
cd test-media-player

# Install your local package
npm install /path/to/your/package/your-org-custom-media-player-1.0.0.tgz

# Install peer dependencies
npm install react@^18.2.0 react-dom@^18.2.0
```

### **3. Test the Package**
Create `/tmp/test-media-player/src/App.tsx`:
```tsx
import React from 'react';
import { MediaPlayer, PlayerConfig } from '@your-org/custom-media-player';

const config: PlayerConfig = {
  src: {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video',
    mimeType: 'video/mp4'
  },
  ads: {
    preRoll: [
      {
        id: 'test-ad',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: 15,
        skippable: true,
        skipAfter: 5
      }
    ]
  },
  ui: {
    theme: 'dark',
    autoplay: true,
    muted: true
  },
  analytics: {
    enabled: true,
    onEvent: (event) => console.log('Analytics:', event)
  }
};

function App() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#000', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', textAlign: 'center' }}>
        Testing NPM Package
      </h1>
      <div style={{ width: '800px', height: '450px', margin: '0 auto' }}>
        <MediaPlayer config={config} />
      </div>
    </div>
  );
}

export default App;
```

```bash
# Start the test app
npm start
```

---

## **Method 3: NPM Link Testing** 🔗

### **1. Link Your Package**
```bash
# In your package directory
cd /Users/apple/Desktop/localPlayer/custom-player
npm link

# Create test project
cd /tmp
npx create-react-app link-test --template typescript
cd link-test

# Link to your package
npm link @your-org/custom-media-player
npm install react@^18.2.0 react-dom@^18.2.0
```

### **2. Test Development Changes**
```bash
# Make changes to your package
cd /Users/apple/Desktop/localPlayer/custom-player
# Edit src/components/MediaPlayer.tsx
npm run build

# Changes are immediately available in linked project
cd /tmp/link-test
npm start
```

---

## **Method 4: Publish to NPM Test Registry** 🚀

### **1. Test Registry Setup**
```bash
# Use npm test registry (verdaccio)
npx verdaccio

# In another terminal, configure npm
npm config set registry http://localhost:4873
npm adduser --registry http://localhost:4873
```

### **2. Publish and Test**
```bash
npm publish --registry http://localhost:4873
```

---

## **Method 5: GitHub Packages Testing** 📋

### **1. Publish to GitHub**
```bash
# Set up .npmrc
echo "@your-org:registry=https://npm.pkg.github.com" > .npmrc

# Publish
npm publish
```

---

## **Testing Checklist** ✅

### **Core Functionality**
- [ ] Video playback starts
- [ ] Controls work (play, pause, volume, fullscreen)
- [ ] Progress bar seeking
- [ ] Mobile responsiveness

### **Ad System**
- [ ] Pre-roll ads play before content
- [ ] Skip button appears after timer
- [ ] Mid-roll ads insert at correct times
- [ ] Post-roll ads play after content
- [ ] Ad sequence with replay works

### **Interactive Features**
- [ ] Interactive polls during ads
- [ ] CTA buttons work
- [ ] Analytics events fire
- [ ] Click-to-play/pause on video

### **Advanced Features**
- [ ] Picture-in-Picture mode
- [ ] Fullscreen functionality
- [ ] Seek-aware ad insertion
- [ ] Error handling

### **Package Integration**
- [ ] TypeScript types work correctly
- [ ] CSS styles are applied
- [ ] No console errors
- [ ] Tree-shaking works (check bundle size)

---

## **Common Issues & Solutions** 🔧

### **Issue: CSS Not Loading**
```tsx
// Make sure to import CSS in your app
import '@your-org/custom-media-player/dist/index.css';
```

### **Issue: TypeScript Errors**
```bash
# Check peer dependencies
npm ls react react-dom
```

### **Issue: Module Not Found**
```bash
# Verify package structure
npm pack --dry-run
```

---

## **Performance Testing** ⚡

### **Bundle Size Check**
```bash
# Analyze bundle size in test project
npm install --save-dev webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js
```

### **Loading Performance**
```javascript
// Add to test app
console.time('MediaPlayer Load');
// After component loads
console.timeEnd('MediaPlayer Load');
```

---

## **Automated Testing** 🤖

### **Jest Testing**
Create test in your package:
```tsx
// src/components/__tests__/MediaPlayer.test.tsx
import { render } from '@testing-library/react';
import MediaPlayer from '../MediaPlayer';

test('renders media player', () => {
  const config = {
    src: { url: 'test.mp4', type: 'video', mimeType: 'video/mp4' },
    ui: { theme: 'dark' }
  };
  render(<MediaPlayer config={config} />);
});
```

```bash
npm test
```

---

## **Quick Start Test Commands** 🚀

```bash
# 1. Build and validate package
npm run build
npm pack --dry-run

# 2. Create test project
cd /tmp && npx create-react-app test-player --template typescript

# 3. Install and test
cd test-player
npm install /path/to/package.tgz
# Copy test App.tsx code above
npm start
```

**Your package is ready for comprehensive testing!** 🎉
