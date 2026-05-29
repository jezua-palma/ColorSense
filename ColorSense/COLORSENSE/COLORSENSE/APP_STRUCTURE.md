# ColorSense App Structure

## App Structure Overview

```
ColorSense/
├── App.tsx                 ← Entry point (wraps everything)
├── navigation/             ← How you move between screens
│   ├── MainTabNavigator    ← Bottom tabs: History | Scan | Settings
│   ├── HistoryStackNavigator
│   ├── ScanStackNavigator
│   └── SettingsStackNavigator
├── screens/                ← What you see on each page
│   ├── ScanScreen          ← Main camera & color detection
│   ├── HistoryScreen       ← List of past scanned colors
│   ├── SettingsScreen      ← Voice toggle, manage palette
│   ├── ColorDetailScreen   ← Detailed view of a single color
│   ├── CompareScreen       ← Compare two colors side-by-side
│   └── ManagePaletteScreen ← Create custom color palette
├── utils/                  ← Behind-the-scenes logic
│   ├── colorUtils.ts       ← 725-color database & matching algorithms
│   ├── storage.ts          ← Saves history & settings locally
│   └── palette.ts          ← Custom palette management
└── components/             ← Reusable UI pieces (buttons, cards, etc.)
```

## How the App Flows

### 1. When You Open the App

```
App.tsx loads → Shows loading spinner → Opens MainTabNavigator → Lands on Scan tab
```

### 2. Scan Screen (Main Feature)

The heart of the app with two detection modes:

**Tap Mode (Default)**
```
Hold finger on screen (300ms) 
    → Camera takes 3 quick photos
    → Samples colors in 20px radius around tap
    → Matches against 725-color database using CIEDE2000
    → Shows color name + speaks it aloud (if voice on)
    → Saves to history
```

**Capture Mode**
```
Tap the capture button
    → Takes one high-quality photo
    → Crops to center 65% of frame
    → Runs k-means clustering (finds up to 8 distinct colors)
    → Shows color composition bars with percentages
    → Speaks the breakdown aloud
    → Saves to history
```

### 3. History Screen

```
Shows all your past scans
    → Tap entries show single color swatch
    → Capture entries show composition bars
    → Tap any entry → Opens ColorDetailScreen with full info
```

### 4. Settings Screen

```
Voice Feedback toggle (on/off) → Saved automatically
Manage Palette button → Opens ManagePaletteScreen
    → Add custom colors for matching
    → Delete colors you don't need
```

### 5. Color Detail Screen

```
Shows: Color swatch, hex code, color family
Actions: Copy hex, compare with another color
```

## Key Data Flow

```
Camera Capture
     ↓
extractColorAtPosition() ← Samples pixels with Gaussian weighting
     ↓
getColorFromRgb() ← Converts to LAB, finds closest named color
     ↓
speakColor() ← Announces the color name
     ↓
addColorToHistory() ← Saves to AsyncStorage
```

## Technical Details

### Color Detection Pipeline

**Tap Detection**
1. Require 300ms long-press with 15px movement tolerance
2. Show animated hold indicator with progress ring
3. Take 3 consecutive camera frames
4. Sample 20px radius around tap with Gaussian weighting (σ=8.0)
5. Combine weighted average with median filtering
6. Lock to previous color if within CIEDE2000 ΔE 15 threshold

**Capture Analysis**
1. Capture single high-quality frame
2. Crop to center 65% to match visible capture frame area
3. Downsample to 150px max for performance
4. Convert all pixels to CIE LAB color space
5. Run k=8 k-means clustering with CIEDE2000 distance (up to 25 iterations)
6. De-duplicate near-identical centroids (ΔE < 15)
7. Show top 8 distinct colors with normalized percentages

### Color Database

- 725 W3C standard named colors
- Organized into 12 color families: Black, Gray, Blue, Cyan/Teal, Green, Yellow, Orange, Brown, Red, Pink, Purple, White
- All colors have precomputed LAB values for fast matching
- Uses CIEDE2000 algorithm for industry-standard perceptual accuracy

### Storage

- AsyncStorage for local data persistence
- Stores: Color history (up to 50 entries), User settings, Custom palette
- No server or database required - everything stays on device

## Platform Support

- **Web** (Primary): Full feature support - both Tap and Capture modes work
- **iOS/Android**: Camera preview works, shows message to use web version for detection
