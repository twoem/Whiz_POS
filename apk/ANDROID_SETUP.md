# Android SDK Setup Guide for Windows

To build the Android APK, you need the **Android SDK** installed and configured on your machine.

## 1. Install Android Studio (Recommended)
The easiest way to get the SDK is to install Android Studio.
1.  Download and install **Android Studio** from [developer.android.com/studio](https://developer.android.com/studio).
2.  During installation, ensure **"Android SDK"** and **"Android SDK Command-line Tools"** are selected.
3.  Open Android Studio -> More Actions -> **SDK Manager**.
4.  Note the **"Android SDK Location"** at the top of the window.
    - Default: `C:\Users\<YourUsername>\AppData\Local\Android\Sdk`

## 2. Configure Environment Variables
Capacitor needs to know where the SDK is located. You must set the `ANDROID_HOME` environment variable.

1.  Press **Windows Key**, type **"Environment Variables"**, and select **"Edit the system environment variables"**.
2.  Click the **"Environment Variables..."** button at the bottom right.
3.  Under **"User variables"** (top section), click **"New..."**.
4.  **Variable name:** `ANDROID_HOME`
5.  **Variable value:** Path to your SDK (e.g., `C:\Users\JOSPHAT MBURU\AppData\Local\Android\Sdk`).
6.  Click **OK**.

## 3. Update Path (Optional but Recommended)
To run adb and other tools from the terminal:
1.  Find the **"Path"** variable in "User variables" and select **Edit**.
2.  Add these two new entries:
    - `%ANDROID_HOME%\platform-tools`
    - `%ANDROID_HOME%\cmdline-tools\latest\bin`
3.  Click **OK** -> **OK** -> **OK**.

## 4. Setup & Build Project
**Important:** Before opening Android Studio, run the setup script. This fixes compatibility issues with Java 21.

1.  Close and reopen your Command Prompt or PowerShell.
2.  Navigate to the `apk` folder:
    ```bash
    cd apk
    ```
3.  Run the automated setup:
    ```bash
    npm run setup
    ```
    *This command installs dependencies, adds the Android platform, and patches the project to work with your Java version.*

4.  Open the project in Android Studio:
    ```bash
    npx cap open android
    ```
5.  Wait for the "Gradle Sync" to complete. If prompted to update Gradle again, you can accept, but `npm run setup` should have already configured a compatible version.
6.  Click the **Play (Run)** button to build and launch the app on your emulator or device.
