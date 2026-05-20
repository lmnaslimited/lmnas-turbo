const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const input = process.argv[2]
const branch = process.argv[3] || 'main'

if (!input) {
  console.error(
    '\x1b[31mError: Please provide either an app name or a full repository URL.\x1b[0m'
  )
  process.exit(1)
}

// Check if the input is a URL (app URL) or an app name
const isUrl =
  input.startsWith('http://') || input.startsWith('https://')

const appName = isUrl
  ? path.basename(input, '.git')
  : input

const appRepoUrl = isUrl
  ? input
  : `https://github.com/lmnaslimited/${appName}.git`

const appFolder = path.join(__dirname, 'apps', appName)

function cloneApp(appRepoUrl, appFolder, branch) {
  if (!fs.existsSync(appFolder)) {
    console.log(
      `\x1b[36mCloning ${appName} repository from ${appRepoUrl} (branch: ${branch})...\x1b[0m`
    )

    execSync(
      `git clone --branch ${branch} ${appRepoUrl} ${appFolder}`,
      { stdio: 'inherit' }
    )

    console.log(
      `\x1b[32mSuccessfully cloned ${appName} into the apps folder.\x1b[0m`
    )
  } else {
    console.log(
      `\x1b[33m${appName} repository already exists, updating branch ${branch}...\x1b[0m`
    )

    execSync(`git -C ${appFolder} fetch origin`, {
      stdio: 'inherit',
    })

    execSync(`git -C ${appFolder} checkout ${branch}`, {
      stdio: 'inherit',
    })

    execSync(`git -C ${appFolder} pull origin ${branch}`, {
      stdio: 'inherit',
    })

    console.log(
      `\x1b[32mSuccessfully updated ${appName} repository.\x1b[0m`
    )
  }
}

try {
  cloneApp(appRepoUrl, appFolder, branch)

  console.log(
    `\x1b[36mRunning pnpm install in the current directory...\x1b[0m`
  )

  execSync(`pnpm install`, { stdio: 'inherit' })

  console.log(
    `\x1b[32mSuccessfully installed dependencies in the current directory.\x1b[0m`
  )
} catch (error) {
  console.error(
    `\x1b[31mFailed to clone, update, or install dependencies for ${appName}. Please check the app name, branch, or repository URL.\x1b[0m`
  )

  process.exit(1)
}