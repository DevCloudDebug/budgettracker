# Mac OS / Native Deployment Migration TODOs

Welcome to the MacOS migration! To transition this application flawlessly onto your MacBook and configure all the native integrations for an actual Xcode / iOS test, work through this checklist.

## 🔑 Phase 1: Authentication Configuration 
* [ ] **Google Cloud Platform:** Set up a new project in your [Google Cloud Console](https://console.cloud.google.com/).
* [ ] **OAuth Consent Screen:** Configure the Consent screen (External), requiring basic scopes (`.../auth/userinfo.email`).
* [ ] **Web Client ID:** Create an OAuth 2.0 Web Client ID. Note down this key.
* [ ] **iOS Client ID:** Create an OAuth 2.0 iOS Client ID targeting your specific bundle identifier (e.g. `com.yourname.budgettracker`). Note down the key AND the provided **iOS URL Scheme**.
* [ ] **Update AuthScreen.tsx:** Navigate to `BudgetApp/src/screens/AuthScreen.tsx` and paste the Client IDs into `GoogleSignin.configure({ ... })`.
* [ ] **Update app.json:** Place the iOS URL scheme into `expo.ios.infoPlist.CFBundleURLTypes` within your app package config.

## 💰 Phase 2: Actioning "Buy Me A Coffee"
* [ ] **Generate a Link:** Get a donation short-link from Kofi, BuyMeACoffee, or Patreon.
* [ ] **Update SettingsScreen:** Look in `BudgetApp/src/screens/SettingsScreen.tsx` around line `126` (`Alert.alert(...)`). Swap the placeholder `Alert` for a native URL call using `expo-linking`: 
  ```typescript
  import * as Linking from 'expo-linking';
  // Inside the TouchableOpacity onPress:
  Linking.openURL('https://ko-fi.com/yourhandle');
  ```

## 🖥 Phase 3: Mac OS Compilation Setup
* [ ] **Install Dev Tools:** Ensure your MacOS device has `Node`, `Watchman`, and the latest version of `Xcode` installed.
* [ ] **Repository Pull:** Clone this project onto your Mac (via the GitHub steps completed).
* [ ] **Dependency Retrieval:** Run `npm install` inside the project folder.
* [ ] **Prebuild the App:** Run `npx expo prebuild --platform ios`. This ejects all necessary native shells for your database and Google SDK requirements.
* [ ] **Install Pods:** `cd ios` and run `pod install` (or `arch -x86_64 pod install` if encountering architecture failures on M-series chips).
* [ ] **Open Workspace:** `cd ..` back to the root and type `open ios/BudgetApp.xcworkspace`.

## 📱 Phase 4: Run It Native!
* [ ] **Code Signing:** With Xcode open, select your App's target under "Signing & Capabilities", check "Automatically manage signing" and input your personal Apple ID/Team.
* [ ] **Compile & Launch:** Plug your physical iPhone into your Mac, select it from the top device dropdown in Xcode, and press the prominent **"Play"** icon. Watch the app install locally!
