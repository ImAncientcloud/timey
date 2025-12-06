# Timezone Clock App - Features

## Overview
A customizable world clock app for Android (and iOS) with a secret settings activation feature.

## Main Features

### 1. Real-Time Clock Display
- Large, easy-to-read time display with **seconds** (updates every second)
- Shows current date in full format (e.g., "Saturday, Dec 6, 2025")
- Displays selected timezone name
- Default: **Black background with white text**

### 2. Secret Settings Activation (6-Tap Feature)
- Tap anywhere on the screen **6 times within 2 seconds** to open settings
- Visual tap counter appears showing progress (e.g., "3 / 6")
- Tap counter automatically resets after 2 seconds of inactivity

### 3. World Timezone Selection
- Comprehensive list of 23 major world timezones including:
  - **European**: UTC, GMT (London), CET (Paris), EET (Athens), MSK (Moscow)
  - **Middle East/Asia**: GST (Dubai), PKT (Karachi), IST (India)
  - **East Asia/Pacific**: CST (Beijing), JST (Tokyo), AEST (Sydney), NZST (Auckland)
  - **Americas**: HST (Hawaii), PST (LA), MST (Denver), CST (Chicago), EST (New York)
  - **South America**: BRT (São Paulo), ART (Buenos Aires)
- Shows UTC offset for each timezone (e.g., UTC+5, UTC-8)
- Scrollable list with selection highlight
- Time automatically updates when timezone changes

### 4. Custom Background Image
- **Upload Image**: Choose any image from your photo library
- Images stored as base64 for reliability
- **Reset Default**: Return to black background anytime
- Background persists across app restarts

### 5. Persistent Settings
- All preferences saved using AsyncStorage:
  - Selected timezone
  - Custom background image
- Settings automatically load when app starts
- No need to reconfigure after closing the app

## Technical Details

### Permissions Required
- **Media Library Access**: Required for uploading custom background images
- Permission request appears automatically when needed

### Time Accuracy
- Updates every 1 second for accurate time display
- Timezone calculations based on UTC offsets
- Date changes automatically at midnight in selected timezone

### UI/UX Features
- Clean, minimalist design
- Large touch targets for easy interaction
- Smooth modal animations
- Dark theme optimized for readability
- Text shadows for visibility on any background

## How to Use

### Viewing Time
- Simply open the app to see the current time in your selected timezone
- Time updates automatically with seconds precision

### Changing Timezone
1. Tap the screen 6 times quickly (within 2 seconds)
2. Watch for the tap counter to track progress
3. Settings modal will open automatically
4. Scroll through timezone list
5. Tap your desired timezone
6. Tap "Close" to return to clock display

### Customizing Background
1. Open settings (6 taps)
2. Tap "Upload Image" button
3. Grant photo library permission if prompted
4. Select an image from your gallery
5. Image will be set as background
6. Tap "Reset Default" anytime to return to black background

## App Structure

```
/app/frontend/
├── app/
│   └── index.tsx          # Main app component with all features
├── package.json           # Dependencies (expo-image-picker, AsyncStorage)
└── .env                   # Environment configuration
```

## Dependencies
- **expo-image-picker**: For background image selection
- **@react-native-async-storage/async-storage**: For persistent storage
- **expo-status-bar**: For status bar styling
- All standard React Native and Expo libraries

## Platform Support
- ✅ Android (primary target)
- ✅ iOS (fully compatible)
- ✅ Web (for testing and preview)

## Future Enhancement Ideas
- 12/24 hour format toggle
- Multiple timezone comparison (side-by-side)
- Alarm/timer features
- Custom color themes
- Favorite timezones quick-switch
- Widget support
