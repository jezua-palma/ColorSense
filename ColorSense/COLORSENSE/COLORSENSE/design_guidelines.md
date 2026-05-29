# ColorSense Design Guidelines

## Authentication & User Accounts
**No authentication required** - ColorSense is a single-user utility app with local-only data storage.

However, include a **Settings/Profile screen** with:
- User-customizable avatar (1 preset avatar showing an accessibility-themed icon)
- Display name field (optional)
- App preferences (theme, text size, voice feedback settings)

## Navigation Architecture

**Tab Navigation** with 3 tabs:
1. **Scan** (Camera) - Center tab, primary action
2. **History** - Left tab
3. **Settings** - Right tab

**Rationale**: The app has 3 distinct feature areas with Scan as the core action positioned centrally.

## Screen Specifications

### 1. Scan Screen (Camera Tab)
**Purpose**: Real-time color detection and scanning

**Layout**:
- **Header**: Transparent header with right button (Flashlight toggle icon)
- **Main Content**: Non-scrollable, full-screen camera preview
- **Floating Elements**:
  - Large color result card (top 25% of screen)
    - Color name in bold, extra-large text
    - Hex code and RGB values in smaller text
    - Color family tag
    - Background fills with detected color
  - Bottom action bar containing:
    - Compare button (left)
    - Voice toggle button (center)
    - Scan/Target reticle button (right, primary)
- **Safe Area**: 
  - Top: headerHeight + Spacing.xl
  - Bottom: tabBarHeight + Spacing.xl

**Components**:
- Camera view (full screen)
- Floating color info card with rounded corners
- Circular action buttons with icons
- Target/crosshair overlay (center of camera view)

### 2. History Screen
**Purpose**: View recently scanned colors

**Layout**:
- **Header**: Default navigation header, title "History", right button (Clear All)
- **Main Content**: Scrollable grid (2 columns)
- **Safe Area**:
  - Top: Spacing.xl
  - Bottom: tabBarHeight + Spacing.xl

**Components**:
- Color tile cards showing:
  - Large color swatch (square, rounded corners)
  - Color name (bold)
  - Hex code (small text)
  - Timestamp
- Empty state: "No colors scanned yet" with icon
- Each tile is tappable to view full details

### 3. Color Detail Modal
**Purpose**: Expanded view of a scanned or historical color

**Layout**: Native modal screen
- **Header**: Modal header with close button (X)
- **Main Content**: Scrollable
- **Safe Area**: Standard modal insets

**Components**:
- Large color preview (top half of visible area)
- Color information card:
  - Color name (heading)
  - Hex code
  - RGB values
  - HSL values
  - Color family
- Action buttons:
  - Speak color name
  - Copy hex code
  - Delete from history (if from history screen)

### 4. Color Comparison Screen
**Purpose**: Compare two colors side-by-side

**Layout**: Stack-only navigation (pushed from Scan screen)
- **Header**: Default navigation header, title "Compare Colors"
- **Main Content**: Non-scrollable
- **Safe Area**: Standard

**Components**:
- Two equal-height color preview sections (split screen vertically)
- Each section shows color name and hex
- Comparison results card (bottom):
  - Similarity percentage
  - Contrast ratio
  - Match indicator (checkmark or X icon)

### 5. Settings Screen
**Purpose**: App configuration and preferences

**Layout**:
- **Header**: Default navigation header, title "Settings"
- **Main Content**: Scrollable form
- **Safe Area**:
  - Top: Spacing.xl
  - Bottom: tabBarHeight + Spacing.xl

**Components**:
- Profile section (avatar + name)
- Settings groups:
  - **Voice Feedback**: Toggle + mode picker (On Tap / Auto / Off)
  - **Accessibility**: Text size slider, High contrast toggle
  - **Display**: Theme picker (Light / Dark / System)
  - **Camera**: Flashlight auto-enable in low light toggle
  - **About**: App version, privacy policy link

## Design System

### Color Palette
**Primary Colors**:
- Primary: #2563EB (Bright Blue - highly visible)
- Secondary: #10B981 (Green - success/confirmation)
- Accent: #F59E0B (Amber - warnings/highlights)

**Neutral Colors**:
- Background Light: #FFFFFF
- Background Dark: #1F2937
- Surface Light: #F3F4F6
- Surface Dark: #374151
- Text Primary Light: #111827
- Text Primary Dark: #F9FAFB
- Text Secondary Light: #6B7280
- Text Secondary Dark: #9CA3AF

**High Contrast Mode** (when enabled):
- Boost all contrast ratios to WCAG AAA standards
- Border widths increase by 2px
- Text increases by 20%

### Typography
**Font**: System default (San Francisco for iOS, Roboto for Android)

**Sizes**:
- **Heading XL**: 32pt, Bold (for color names on scan screen)
- **Heading L**: 24pt, Bold (for section headers)
- **Body Large**: 18pt, Medium (for primary labels)
- **Body**: 16pt, Regular (for descriptions)
- **Caption**: 14pt, Regular (for hex codes, metadata)

**Adjustable**: All text sizes scale based on user preference in Settings (80% to 120%)

### Spacing
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px

### Visual Design
- **Corner Radius**: 12px for cards, 20px for buttons
- **Shadows**: Use ONLY for floating action buttons and color result card:
  - shadowOffset: { width: 0, height: 2 }
  - shadowOpacity: 0.10
  - shadowRadius: 2
- **Icons**: Use Feather icons from @expo/vector-icons
  - Camera, Eye, Volume2 (voice), RotateCw (flashlight), Settings, Grid (history)
- **Touchable Feedback**: All buttons use subtle opacity change (0.7) when pressed

### Accessibility
- Minimum touch target: 44x44 points
- All controls accessible via screen reader with descriptive labels
- Color information NEVER relies on color alone (always include text labels)
- Support VoiceOver/TalkBack navigation

## Required Assets
1. **App Icon**: Camera lens with accessibility symbol overlay
2. **Tab Icons**: 
   - Scan: Camera icon
   - History: Grid icon
   - Settings: Settings/gear icon
3. **Empty State Illustration**: Simple, minimal illustration for empty history
4. **Default Profile Avatar**: Accessibility-themed icon (universal access symbol)

**Important**: Do NOT use emojis. Use standard system icons or Feather icons exclusively. All icons should have a consistent stroke width of 2px.