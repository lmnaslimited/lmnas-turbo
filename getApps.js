const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const input = process.argv[2];

if (!input) {
    console.error('\x1b[31mError: Please provide either an app name or a full repository URL.\x1b[0m');
    process.exit(1);
}

// Check if the input is a URL (app URL) or an app name
const isUrl = input.startsWith('http://') || input.startsWith('https://');
const appName = isUrl ? path.basename(input, '.git') : input;
const appRepoUrl = isUrl ? input : `https://github.com/lmnaslimited/${appName}.git`; // Constructs the repo URL if only app name is given
const appFolder = path.join(__dirname, 'apps', appName);

function cloneApp(appRepoUrl, appFolder) {
    if (!fs.existsSync(appFolder)) {
        console.log(`\x1b[36mCloning ${appName} repository from ${appRepoUrl}...\x1b[0m`);
        execSync(`git clone ${appRepoUrl} ${appFolder}`, { stdio: 'inherit' });
        console.log(`\x1b[32mSuccessfully cloned ${appName} into the apps folder.\x1b[0m`);
    } else {
        console.log(`\x1b[33m${appName} repository already exists, pulling latest changes...\x1b[0m`);
        execSync(`git -C ${appFolder} pull`, { stdio: 'inherit' });
        console.log(`\x1b[32mSuccessfully updated ${appName} repository.\x1b[0m`);
    }
}

try {
    cloneApp(appRepoUrl, appFolder);
    console.log(`\x1b[36mRunning npm install in the current directory...\x1b[0m`);
    execSync(`npm install`, { stdio: 'inherit' });
    console.log(`\x1b[32mSuccessfully installed dependencies in the current directory.\x1b[0m`);
} catch (error) {
    console.error(`\x1b[31mFailed to clone, update, or install dependencies for ${appName}. Please check the app name or the repository URL.\x1b[0m`);
    process.exit(1);
}
