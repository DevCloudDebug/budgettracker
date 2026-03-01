# Personal Budget Tracker - Native Deployment Guide

Congratulations on reaching the final integration! The application now has full offline SQLite storage capabilities, local biometrics, full dynamic theme context (Dark/Light mode switches), a gorgeous professional aesthetic without the static Tailwind dependencies, and a robust `Google Auth` mechanism for onboarding.

## 🚀 Steps to Build and Deploy for iOS via XCode

Since it's built with React Native and Expo, and you've integrated Native-dependent libraries like `@react-native-google-signin/google-signin` and `expo-sqlite`, you will need to prepare a native iOS build folder.

### 1. Generating the iOS directory
Run the following command to generate the native iOS project files:
```bash
npx expo prebuild --platform ios
```
*This command reads your `app.json` and creates an `ios/` folder populated with the necessary Workspace and native setups.*

### 2. Installing CocoaPods
Navigate into the newly created iOS directory to install the native Pods:
```bash
cd ios
pod install
cd ..
```
*Note: If you are on an Apple Silicon device (M1/M2/M3), you may need to run `arch -x86_64 pod install` if you encounter compatibility issues, however recent CocoaPods versions natively support ARM64.*

### 3. Google Sign-In Setup
To ensure the `AuthScreen.tsx` Google Sign in actually authenticates the users:
1. Go to your [Google Cloud Console](https://console.cloud.google.com/).
2. Create an **OAuth 2.0 Client ID** tailored for **iOS**.
3. It will generate an `iOS URL Scheme`. Inside your Xcode target under `Info > URL Types`, add this scheme.
4. Replace the mock variables inside `src/screens/AuthScreen.tsx`:
   ```typescript
   GoogleSignin.configure({
       webClientId: 'YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com', 
       iosClientId: 'YOUR_IOS_CLIENT_ID_HERE.apps.googleusercontent.com',
   });
   ```

### 4. Open in XCode & Run
1. Open the `.xcworkspace` file (not the `.xcodeproj` file) located in your `ios` folder:
   ```bash
   open ios/BudgetApp.xcworkspace
   ```
2. Plug in your physical iOS device via USB, or select an iOS Simulator in XCode.
3. If running on a physical device, ensure you configure your **Code Signing & Capabilities** in XCode (select your Team/Apple Developer ID).
4. Hit the **"Play" (Run)** button in XCode.

## Overview of Added Architecture (Iterations 2 & 3)

- **SQLite Database Support:** The app replaced `AsyncStorage` with `expo-sqlite`, drastically improving scalability and allowing proper relational constraints (`budgets` and cascading deletes on `expenses`).
- **Backup & Restore:** Added logic utilizing `expo-file-system` to snapshot the `.db` file and `expo-sharing` to share it out (e.g., mail, drive). Restoration works via `expo-document-picker`.
- **Biometric Security:** Expo's `local-authentication` ensures that people cannot casually open the app and view finances without device PIN/Biometrics if enabled in Settings.
- **Dynamic Theming:** Gone is the hardcoded gradient array map in `HomeScreen`. The entire layout relies on a robust UI Context that flawlessly drops into sleek grayscales/cards.
- **Google Auth:** Embedded with a clean SSO layout.
- **Support Endpoint:** We've dropped a `Buy the developer a coffee` action trigger inside settings. You can route this directly to a Kofi or BMC sponsor page!

Feel free to commit this locally and use `git push` to transfer it to your MacOS device!
