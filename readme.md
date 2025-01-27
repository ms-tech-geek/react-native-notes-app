# React Native Notes App

A note-taking application built with React Native

## Prerequisites

Before you begin, ensure you have installed:

- Node.js (v14 or newer)
- npm or yarn
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd react-native-notes
```

2. Install dependencies:
```bash
npm install
```

3. iOS specific setup:
```bash
cd ios
pod install
cd ..
```

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)

2. Enable Authentication and Realtime Database in Firebase Console

3. Add your apps:
   - For Android: Add Android app and download `google-services.json`
   - For iOS: Add iOS app and download `GoogleService-Info.plist`

4. Place configuration files:
   - Android: Place `google-services.json` in `android/app/`
   - iOS: Place `GoogleService-Info.plist` in your Xcode project

5. Update `firebase.config.js` with your Firebase configuration:
```javascript
export default {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "YOUR_DATABASE_URL"
};
```

## Running the App

### Android
```bash
npx react-native run-android
```

### iOS
```bash
npx react-native run-ios
```

## Usage Guide

### Authentication
1. Launch the app
2. Create a new account or log in with existing credentials
3. Use email and password for authentication

### Managing Notes
- Create Note: Tap the '+' FAB button
- Edit Note: Tap any note from the list
- Save Note: Tap the save icon in the FAB menu
- Export to PDF: Tap the PDF icon in the FAB menu
- Search Notes: Use the search bar at the top of the notes list

### Offline Usage
- The app works offline automatically
- Changes are saved locally and synced when online
- No additional setup required for offline functionality

## Project Structure

```
src/
├── screens/
│   ├── LoginScreen.tsx     # User authentication
│   ├── NotesListScreen.tsx # Notes listing and search
│   └── EditNoteScreen.tsx  # Note creation and editing
├── navigation/
│   └── AppNavigator.tsx    # Navigation configuration
└── App.tsx                 # Main application component
```

## Troubleshooting

### Common Issues

1. Build fails on iOS
```bash
cd ios
pod install
cd ..
```

2. Android build issues
- Clean the project:
```bash
cd android
./gradlew clean
cd ..
```

3. Metro bundler issues
```bash
npm start -- --reset-cache
```

