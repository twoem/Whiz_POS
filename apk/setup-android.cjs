const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command) {
    try {
        console.log(`> ${command}`);
        execSync(command, { stdio: 'inherit', cwd: __dirname });
    } catch (error) {
        console.error(`Command failed: ${command}`);
    }
}

function fixGradle() {
    const wrapperPath = path.join(__dirname, 'android', 'gradle', 'wrapper', 'gradle-wrapper.properties');

    if (fs.existsSync(wrapperPath)) {
        let content = fs.readFileSync(wrapperPath, 'utf8');

        // Force upgrade to 8.5 regardless of current version to ensure Java 21 compatibility
        // Regex looks for distributionUrl=...gradle-x.x.x-all.zip (or bin.zip)
        const versionMatch = content.match(/gradle-(\d+\.\d+(?:\.\d+)?)-(all|bin)\.zip/);

        if (versionMatch) {
            const currentVersion = versionMatch[1];
            console.log(`Current Gradle Version: ${currentVersion}`);

            // We recommend 8.5 for Java 21
            const targetVersion = '8.5';

            if (currentVersion !== targetVersion) {
                console.log(`Upgrading Gradle from ${currentVersion} to ${targetVersion} for Java 21 support...`);
                content = content.replace(/gradle-\d+\.\d+(?:\.\d+)?-(all|bin)\.zip/, `gradle-${targetVersion}-all.zip`);
                fs.writeFileSync(wrapperPath, content);
                console.log('✅ Gradle wrapper updated successfully.');
            } else {
                console.log('Gradle is already at version 8.5.');
            }
        } else {
            console.log('Could not detect Gradle version in wrapper properties. Attempting to force write...');
            // Fallback: simple string replace of the distributionUrl line
            if (content.includes('distributionUrl=')) {
                 content = content.replace(/distributionUrl=.+/, 'distributionUrl=https\\://services.gradle.org/distributions/gradle-8.5-all.zip');
                 fs.writeFileSync(wrapperPath, content);
                 console.log('✅ Gradle wrapper updated (forced).');
            }
        }
    } else {
        console.log('⚠️ Gradle wrapper file not found at:', wrapperPath);
        console.log('Android platform might not be fully generated yet.');
    }
}

// 1. Install dependencies
console.log('Step 1: Installing dependencies...');
runCommand('npm install');

// 2. Build web assets
console.log('\nStep 2: Building web assets...');
runCommand('npm run build');

// 3. Add Android platform (if not exists)
const androidDir = path.join(__dirname, 'android');
if (!fs.existsSync(androidDir)) {
    console.log('\nStep 3: Adding Android platform...');
    runCommand('npx cap add android');
} else {
    console.log('\nStep 3: Android platform already exists. Syncing...');
    runCommand('npx cap sync android');
}

// 4. Fix Gradle for Java 21
console.log('\nStep 4: Checking and Fixing Gradle compatibility...');
fixGradle();

console.log('\n✅ Setup Complete!');
console.log('IMPORTANT: If Android Studio is currently open, please CLOSE it and RE-OPEN it to pick up the Gradle changes.');
console.log('Then run: npx cap open android');
