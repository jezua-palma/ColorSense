# ColorSense

## Overview

ColorSense is a web-based color detection application designed to help people with color blindness identify colors in their environment using their device's camera. The app provides instant color detection with voice feedback for accessibility and maintains a history of scanned colors. Built with Expo SDK 54 for React Native, the app is optimized for web browsers where it can detect colors automatically without any API keys or external services.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **Long-Press Detection**: 300ms hold required for tap detection with 15px movement tolerance and animated progress indicator to prevent accidental triggers
- **CIEDE2000 Color Matching**: Upgraded from ΔE76 to CIEDE2000 algorithm for industry-standard perceptual color accuracy
- **Lab-Space K-Means Clustering**: Capture mode now uses k=8 Lab-space k-means (up to 25 iterations) for high-fidelity color composition analysis
- **Dual Scan Modes**: Two detection modes - "Tap" for quick single-color detection and "Capture" for detailed color composition analysis
- **Enhanced Tap-to-Detect**: Multi-frame sampling (3 samples) with confidence-weighted averaging for maximum accuracy and consistency
- **Stability Threshold**: Colors within CIEDE2000 ΔE 15 of previous detection are locked to prevent fluctuation on same objects
- **Color Confidence Indicator**: Shows detection confidence percentage based on color uniformity in sampled area
- **Expanded Color Database**: 725 comprehensive named colors across 12 families (Black, Gray, Blue, Cyan/Teal, Green, Yellow, Orange, Brown, Red, Pink, Purple, White) with W3C standard names and precomputed LAB values for accurate matching
- **Gaussian-Weighted Sampling**: 20px radius with σ=8.0 for robust color estimation resistant to noise
- **History for Both Modes**: Tap entries show single color, Capture entries show color composition bars with percentages
- **Custom Color Palette System**: Users can define their own custom colors and the app matches against this personalized palette

## System Architecture

### Frontend Architecture

**Framework**: React Native with Expo (SDK 54)
- **Rationale**: Expo provides a managed workflow that simplifies development across platforms
- **Web Focus**: Primary platform is web browsers for automatic color detection
- **UI Library**: Custom themed components built on React Native primitives
- **Animation**: React Native Reanimated for performant, smooth animations throughout the app
- **Gesture Handling**: React Native Gesture Handler for native touch interactions

**Navigation Structure**: React Navigation v7 with bottom tab navigation
- **Architecture**: Three-tab layout (History, Scan, Settings) with nested stack navigators
- **Rationale**: Tab navigation provides quick access to core features, with Scan as the central action positioned in the middle tab
- **Navigation Hierarchy**:
  - `MainTabNavigator` (bottom tabs)
    - `HistoryStackNavigator` → History list, Color detail modal
    - `ScanStackNavigator` → Camera scan, Compare colors, Color detail modal
    - `SettingsStackNavigator` → Settings configuration, Manage Palette screen

**Theming System**: Custom theme provider with light/dark mode support
- **Implementation**: `useTheme` hook provides centralized theme access
- **Design Tokens**: Standardized spacing, typography, border radius, and color palettes
- **Platform Adaptation**: iOS uses blur effects for tab bar and headers; Android uses solid backgrounds

**Component Architecture**:
- **Screen Components**: Specialized scroll views (`ScreenScrollView`, `ScreenKeyboardAwareScrollView`, `ScreenFlatList`) that handle safe areas and tab bar heights automatically
- **Themed Components**: `ThemedText` and `ThemedView` automatically adapt to light/dark mode
- **Reusable UI**: `Button`, `Card`, `HeaderTitle`, `Spacer` components for consistent design
- **Error Handling**: `ErrorBoundary` component catches rendering errors with development-friendly error display

### Data Layer

**Local Storage**: AsyncStorage for app data and settings
- **Rationale**: No authentication required; all data stored locally on device
- **Data Stored**:
  - Color history (up to 50 entries with both tap and capture types)
  - User settings (voice feedback preferences)
  - Custom color palette (user-defined colors for matching)

**Data Models**:
```typescript
ColorHistoryItem: { 
  id, hex, name, family, timestamp, 
  type: "tap" | "capture",
  paletteMatch?: { name, confidence },
  captureData?: { dominantColors: ColorComposition[], totalPixelsAnalyzed }
}
ColorComposition: { hex, name, family, percentage, rgb }
AppSettings: { voiceFeedbackEnabled, voiceFeedbackMode, flashlightAutoEnable }
PaletteColor: { id, name, hex, rgb: {r, g, b}, notes?, createdAt }
ColorMatch: { color: PaletteColor, distance: number, confidence: 'exact'|'close'|'different' }
```

### Core Features

**Color Detection System** (Web-Only):
- **Tap Mode**: Long-press (300ms) with multi-frame sampling and Gaussian weighting for consistent single-color detection
- **Capture Mode**: Lab-space k-means clustering (k=8) for high-fidelity color composition analysis
- **Color Matching**: CIEDE2000 algorithm for industry-standard perceptual color accuracy
- **Stability**: Similar colors locked to prevent fluctuation (CIEDE2000 ΔE < 15 threshold)
- **Color Mapping**: 725 named colors database with precomputed LAB values for fast matching
- **Color Analysis**: CIE LAB perceptual matching, HSL conversion, color family classification
- **Platform Note**: Native iOS/Android displays message to use web version

**Tap Detection Pipeline**:
1. Require 300ms long-press with 15px movement tolerance (prevents accidental triggers)
2. Show animated hold indicator with progress ring during press
3. Take 3 consecutive camera frames after successful hold
4. Sample 20px radius around tap with Gaussian weighting (σ=8.0)
5. Combine weighted average with median filtering for noise resistance
6. Lock to previous color if within CIEDE2000 ΔE 15 threshold for consistency

**Capture Analysis Pipeline**:
1. Capture single high-quality frame
2. Crop to center 65% to match visible capture frame area
3. Downsample to 150px max for performance
4. Convert all pixels to CIE LAB color space
5. Run k=8 k-means clustering with CIEDE2000 distance (up to 25 iterations)
6. De-duplicate near-identical centroids (ΔE < 15)
7. Show top 8 distinct colors with normalized percentages

**Camera Integration**: Expo Camera with full-screen preview
- **Permissions**: Handles camera permission requests with user-friendly prompts
- **Features**: Flashlight toggle, tap-to-scan interaction, capture button for analysis mode
- **Image Processing**: Captures and processes image data to extract RGB values

**Accessibility Features**:
- **Voice Feedback**: Expo Speech integration for audio color announcements
- **Haptic Feedback**: Tactile responses for all interactive elements
- **High Contrast**: Automatic text color adjustment based on background luminance
- **Large Touch Targets**: Generous button sizes for easier interaction
- **Capture Voice**: Announces "Image contains: X% ColorA, Y% ColorB, Z% ColorC"

**Comparison Feature**:
- Side-by-side color comparison with similarity percentage
- Contrast ratio calculation for accessibility compliance
- Visual match indicator

### State Management

**Approach**: Local state with React hooks (useState, useEffect, useCallback)
- **Rationale**: Application state is simple and screen-scoped; no need for global state management
- **Screen-Level State**: Each screen manages its own data (settings, history, scan results)
- **Shared State**: Theme and screen insets provided via custom hooks
- **Performance**: useFocusEffect ensures data freshness when navigating between screens

### Animation Strategy

**Library**: React Native Reanimated v4
- **Use Cases**: Button press animations, card transitions, color result display, mode toggle
- **Spring Physics**: Natural-feeling animations with configurable damping and stiffness
- **Performance**: Runs on UI thread for 60fps animations

### Type Safety

**TypeScript Configuration**:
- Strict mode enabled for maximum type safety
- Path aliases (@/*) for clean imports
- Navigation type safety with typed param lists for each stack

## External Dependencies

### Expo SDK Modules

**Core Expo Packages**:
- `expo-camera`: Camera access and image capture
- `expo-speech`: Text-to-speech for voice feedback
- `expo-haptics`: Haptic/vibration feedback
- `expo-clipboard`: Copy color codes to clipboard
- `expo-blur`: iOS blur effects for UI elements
- `expo-font`: Custom font loading
- `expo-image`: Optimized image component
- `expo-image-manipulator`: Image processing utilities

**Navigation Libraries**:
- `@react-navigation/native`: Core navigation framework
- `@react-navigation/native-stack`: Native stack navigator
- `@react-navigation/bottom-tabs`: Tab navigation
- `@react-navigation/elements`: Shared navigation elements

**UI Enhancement**:
- `react-native-reanimated`: High-performance animations
- `react-native-gesture-handler`: Native gesture recognition
- `react-native-safe-area-context`: Safe area handling
- `react-native-keyboard-controller`: Keyboard-aware views
- `@shopify/react-native-skia`: Advanced graphics (available but not actively used)

### Platform Support

**Web** (Primary): Full feature support - both Tap and Capture modes work automatically
**iOS**: Camera preview works, but shows message to use web version for color detection
**Android**: Camera preview works, but shows message to use web version for color detection

### Development Tools

- **ESLint**: Code quality with Expo config and Prettier integration
- **Babel**: Module resolution with path aliases
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
