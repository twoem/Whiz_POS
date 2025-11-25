# Building the APK: Low-RAM & Online Options

You asked for alternatives to Android Studio, specifically options that are **online** or use **less RAM**.

## 1. Best Online Tool: GitHub Actions (Zero RAM)
I have set up a **Cloud Build** workflow for you. You don't need to install anything on your computer.

### How it works:
1.  Push your code to GitHub.
2.  Go to the **"Actions"** tab in your repository.
3.  Click on the **"Build Android APK"** workflow.
4.  When finished, you can download the `whiz-pos-debug.apk` directly from the "Artifacts" section.

**Why this is best:**
*   **RAM Usage:** 0GB on your machine.
*   **Setup:** None required.
*   **Cost:** Free for public repositories (and generous free tier for private).

## 2. Low-RAM Local Option: VS Code + CLI
If you want to build locally but **Android Studio is too heavy**, you can use the Command Line Interface (CLI).

### Prerequisites:
*   Install **VS Code** (Lightweight Editor).
*   Install **Java (JDK 17)**.
*   Install **Android Command Line Tools** (You don't need the full Android Studio GUI).

### How to build:
Open your terminal (VS Code terminal) and run:

```bash
cd apk
npm run build
npx cap sync
cd android
./gradlew assembleDebug
```

**Why this is better:**
*   Android Studio uses 2-4GB+ RAM just to open.
*   The Gradle CLI uses significantly less RAM to build the app.

## 3. Online Development Environments (Project IDX)
If you want to *code* and *preview* online:
*   **Google Project IDX (idx.google.com):** An online IDE that includes Android Emulators in the cloud.
*   **StackBlitz:** Good for the React part, but cannot run the native Android build.

---

**Recommendation:** Use **VS Code** for coding (lightweight) and **GitHub Actions** for building the APK (cloud-based).
