# Aureus Project: AI Voice & Android Standalone Setup

This document serves as a checkpoint for the work completed on January 29, 2026.

## 1. AI Voice Engine Upgrades
The voice input system was significantly upgraded from a basic keyword matcher to a more robust, context-aware parser in `src/components/VoiceInput.tsx`.

### Key Features:
- **Slang Support:** Integrated Indonesian financial slang detection (e.g., *goceng, ceban, jigo, seceng, sejut*).
- **Date Intelligence:** Support for relative date parsing (e.g., "kemarin", "lusa", "2 hari lalu") and specific date mentions ("tanggal 15").
- **Enhanced Categorization:** Expanded dictionary for "Makanan & Minuman", "Transportasi", "Tagihan", and "Belanja" to improve auto-categorization accuracy.
- **Hybrid Engine:** Built a logic bridge to use **Native Android Speech Recognition** when running as an app and standard Web Speech API when in a browser.

## 2. Android Mobile Conversion
The web project was successfully converted into a standalone Android application using **Capacitor**.

### Technical Setup:
- **Capacitor Integration:** Added `@capacitor/core`, `@capacitor/cli`, and `@capacitor/android`.
- **Native Permissions:** Configured `AndroidManifest.xml` with `RECORD_AUDIO` and `INTERNET` permissions.
- **Native Plugins:** Integrated `@capacitor-community/speech-recognition` for high-performance voice processing on mobile hardware.
- **App Identity:** Defined as `com.aureus.moneytracking` with the name "Aureus".

## 3. Automated Cloud Build Workflow (CI/CD)
To bypass the lack of a local Android SDK, a **GitHub Actions** pipeline was established in `.github/workflows/android-build.yml`.

### The Workflow:
- **Environment:** Node.js 22, Java 21 (Zulu), and Android SDK.
- **Process:** Triggers automatically on `git push origin main`.
- **Outcome:** Compiles the project and generates a downloadable `app-debug.apk` in the "Artifacts" section of the GitHub Actions run.

## 4. How to Update the App
To apply changes to the phone app in the future:
1.  **Modify:** Edit files in `src/`.
2.  **Sync:** Run `npm run build` and `npx cap sync android`.
3.  **Deploy:** Run `git push origin main`.
4.  **Download:** Grab the fresh APK from the GitHub Actions tab.

---
**Status:** Functional Prototype Delivered.
**Next Milestone:** Code cleanup or feature expansion (e.g., Export to CSV, Multi-currency support).
