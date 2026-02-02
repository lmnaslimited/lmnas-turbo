const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const input = process.argv[2];
const branch = process.argv[3] || 'main';

if (!input) {
    console.error('\x1b[31mError: Please provide either an app name or a full repository URL.\x1b[0m');
    process.exit(1);
}

// Check if the input is a URL (app URL) or an app name
const isUrl = input.startsWith('http://') || input.startsWith('https://');
const appName = isUrl ? path.basename(input, '.git') : input;
const appRepoUrl = isUrl ? input : `https://github.com/lmnaslimited/${appName}.git`; // Constructs the repo URL if only app name is given
const appFolder = path.join(__dirname, 'apps', appName);

function cloneApp(appRepoUrl, appFolder, branch) {
    if (!fs.existsSync(appFolder)) {
        console.log(`\x1b[36mCloning ${appName} (${branch}) from ${appRepoUrl}...\x1b[0m`);
        execSync(
            `git clone --branch ${branch} --single-branch ${appRepoUrl} ${appFolder}`,
            { stdio: 'inherit' }
        );
        console.log(`\x1b[32mSuccessfully cloned ${appName} into the apps folder.\x1b[0m`);
    } else {
        console.log(`\x1b[33m${appName} exists. Fetching and pulling ${branch}...\x1b[0m`);
        execSync(`git -C ${appFolder} fetch origin ${branch}`, { stdio: 'inherit' });
        execSync(`git -C ${appFolder} checkout ${branch}`, { stdio: 'inherit' });
        execSync(`git -C ${appFolder} pull origin ${branch}`, { stdio: 'inherit' });
        console.log(`\x1b[32mSuccessfully updated ${appName}.\x1b[0m`);
    }
}

try {
    cloneApp(appRepoUrl, appFolder, branch);
    console.log(`\x1b[36mRunning pnpm install...\x1b[0m`);
    execSync(`pnpm install`, { stdio: 'inherit' });
    console.log(`\x1b[32mDependencies installed successfully.\x1b[0m`);
} catch (error) {
    console.error(`\x1b[31mFailed for ${appName}. Check repo/branch name.\x1b[0m`);
    process.exit(1);
}
