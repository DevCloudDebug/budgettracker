# 🔐 Google Authentication Setup Guide (React Native / Expo)

Since you are used to building .NET APIs with JWT authentication, you'll feel right at home with the **theory** of how Google Auth works. The missing link right now is the native ecosystem configuration. 

Because I am an AI, I cannot physically log into your Google Account to create the unique security keys required for your app. However, the app's code is already completely set up to accept these keys! 

Here is exactly how Google Auth works in a mobile app, and the exact steps you need to take to make that button work "for real."

## 🧠 How it Works (The Theory)
1. **The Native Trigger:** When a user taps "Continue with Google," your app asks the device's OS (iOS/Android) to pop up the native Google login modal.
2. **The Handshake:** Google verifies the user, and hands your mobile app an **ID Token** (which is actually just a JWT!).
3. **Local or Backend Use:** 
   - *Local App (Like ours):* The app decodes the token to get the user's name, email, and profile picture, and saves them locally.
   - *.NET Backend Flow:* Your app sends this `idToken` to your .NET API. Your .NET API uses Google's public keys to verify the token isn't forged. If it's valid, your .NET API generates its *own* custom JWT, sends it back to the phone, and logs the user in.

---

## 🛠️ Step-by-Step Setup (What you need to do)

To make the button work, you need to tell Google that your app exists so they can give you **Client IDs**.

### Step 1: Google Cloud Console
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a **New Project** (e.g., "Budget Tracker").
3. Search for **OAuth consent screen** in the search bar. Set it up as "External" (or Internal if you have a Google Workspace), fill out the required App Name and Support Email, and save.

### Step 2: Generate Client IDs
You need to generate specific IDs for each platform. Go to **Credentials -> Create Credentials -> OAuth client ID**.

**1. Create the Web Client ID (Required for Expo / Backend)**
- Choose **Web application** as the type.
- Name it "Budget App Web".
- *Important:* You need this ID even if you are only building a mobile app. It's the master ID.
- Copy the **Client ID** generated.

**2. Create the iOS Client ID**
- Choose **iOS** as the type.
- You will need a Bundle ID (e.g., `com.yourname.budgetapp`). You configure this in your `app.json` under `ios.bundleIdentifier`.
- Copy this **Client ID** as well.
- *Note:* Google will also provide an **iOS URL Scheme**. You must paste this into your `app.json` inside the `expo.ios.infoPlist.CFBundleURLTypes` array for the redirect to work cleanly.

**3. Create the Android Client ID (If you plan to deploy to Android)**
- Choose **Android** as the type.
- Provide your Package Name (e.g., `com.yourname.budgetapp`) and your SHA-1 certificate fingerprint from your keystore.

### Step 3: Insert the Keys into the Code!

Now that you have your keys, open your codebase and go to **`src/screens/AuthScreen.tsx`**.

Look at the very top of the file:
```typescript
GoogleSignin.configure({
    webClientId: 'PASTE_YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com', 
    iosClientId: 'PASTE_YOUR_IOS_CLIENT_ID_HERE.apps.googleusercontent.com',
});
```
Paste the keys you generated from Step 2 directly into those fields.

### Step 4: Rebuild for Native
Because `react-native-google-signin` requires actual native OS code to pop open the security browser, **it will not work in standard Expo Go on your web browser.**

To test it properly you must compile the native app using Xcode or an Android Emulator:
1. Run `npx expo prebuild` to generate the native folders.
2. Open the `ios/` folder in Xcode and hit the Play button to load it onto your physical iPhone.
3. Tap the Google button, and you will see the authentic native Google login prompt appear!
