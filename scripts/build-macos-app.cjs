const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const rootDir = path.resolve(__dirname, '..')
const releaseDir = path.join(rootDir, 'release')
const appName = 'CS Projects Vault'
const appBundleName = `${appName}.app`
const targetAppPath = path.join(releaseDir, appBundleName)
const userAppsDir = path.join(process.env.HOME || '/Users/juaneth', 'Applications')
const systemAppsDir = '/Applications'

console.log('==> Step 1: Building frontend distribution bundle...')
execSync('npm run build', { cwd: rootDir, stdio: 'inherit' })

console.log('==> Step 2: Generating macOS app icon...')
execSync('node electron/generate-app-icon.cjs', { cwd: rootDir, stdio: 'inherit' })

console.log('==> Step 3: Packaging native macOS .app bundle...')
if (fs.existsSync(targetAppPath)) {
  fs.rmSync(targetAppPath, { recursive: true, force: true })
}
fs.mkdirSync(releaseDir, { recursive: true })

const electronDistApp = path.join(rootDir, 'node_modules/electron/dist/Electron.app')
if (!fs.existsSync(electronDistApp)) {
  throw new Error(`Electron template app not found at: ${electronDistApp}`)
}

// Copy template Electron.app to release folder
execSync(`cp -R "${electronDistApp}" "${targetAppPath}"`, { stdio: 'inherit' })

const contentsDir = path.join(targetAppPath, 'Contents')
const macOSDir = path.join(contentsDir, 'MacOS')
const resourcesDir = path.join(contentsDir, 'Resources')
const appPayloadDir = path.join(resourcesDir, 'app')

// Rename executable
const origExec = path.join(macOSDir, 'Electron')
const newExec = path.join(macOSDir, appName)
if (fs.existsSync(origExec)) {
  fs.renameSync(origExec, newExec)
}

// Replace application icons
const icnsSource = path.join(rootDir, 'electron/assets/icon.icns')
if (fs.existsSync(icnsSource)) {
  fs.copyFileSync(icnsSource, path.join(resourcesDir, 'electron.icns'))
  fs.copyFileSync(icnsSource, path.join(resourcesDir, 'app.icns'))
}

// Remove default_app.asar
const defaultAppAsar = path.join(resourcesDir, 'default_app.asar')
if (fs.existsSync(defaultAppAsar)) {
  fs.rmSync(defaultAppAsar, { force: true })
}

// Create app payload
fs.mkdirSync(appPayloadDir, { recursive: true })

// Copy package.json, dist, and electron directories
fs.copyFileSync(path.join(rootDir, 'package.json'), path.join(appPayloadDir, 'package.json'))
execSync(`cp -R "${path.join(rootDir, 'dist')}" "${path.join(appPayloadDir, 'dist')}"`, { stdio: 'inherit' })
execSync(`cp -R "${path.join(rootDir, 'electron')}" "${path.join(appPayloadDir, 'electron')}"`, { stdio: 'inherit' })

// Update Info.plist using macOS native plutil
const infoPlist = path.join(contentsDir, 'Info.plist')
try {
  execSync(`plutil -remove ElectronAsarIntegrity "${infoPlist}" 2>/dev/null || true`)
  execSync(`plutil -replace CFBundleDisplayName -string "${appName}" "${infoPlist}"`)
  execSync(`plutil -replace CFBundleName -string "${appName}" "${infoPlist}"`)
  execSync(`plutil -replace CFBundleExecutable -string "${appName}" "${infoPlist}"`)
  execSync(`plutil -replace CFBundleIdentifier -string "com.cs.vault" "${infoPlist}"`)
  execSync(`plutil -replace CFBundleIconFile -string "electron.icns" "${infoPlist}"`)
} catch (err) {
  console.warn('Notice while updating Info.plist:', err.message)
}

// Ad-hoc code sign so Apple Silicon runs smoothly
console.log('==> Step 4: Signing application binary...')
try {
  execSync(`codesign --force --deep --sign - "${targetAppPath}"`, { stdio: 'inherit' })
  console.log('Application signed successfully!')
} catch (err) {
  console.warn('Codesign warning:', err.message)
}

console.log(`\n==> Step 5: Installing to Applications folder...`)
fs.mkdirSync(userAppsDir, { recursive: true })
const installedUserAppPath = path.join(userAppsDir, appBundleName)

if (fs.existsSync(installedUserAppPath)) {
  fs.rmSync(installedUserAppPath, { recursive: true, force: true })
}
execSync(`cp -R "${targetAppPath}" "${installedUserAppPath}"`, { stdio: 'inherit' })
console.log(`✓ Installed to: ${installedUserAppPath}`)

// Attempt system /Applications install if permitted
const installedSystemAppPath = path.join(systemAppsDir, appBundleName)
try {
  if (fs.existsSync(installedSystemAppPath)) {
    fs.rmSync(installedSystemAppPath, { recursive: true, force: true })
  }
  execSync(`cp -R "${targetAppPath}" "${installedSystemAppPath}" 2>/dev/null`)
  console.log(`✓ Also installed to: ${installedSystemAppPath}`)
} catch {
  console.log(`(Installed in ~/Applications. To also copy to /Applications, run: sudo cp -R "${targetAppPath}" /Applications)`)
}

console.log('\n========================================')
console.log('🎉 CS Projects Vault build & install complete!')
console.log(`Application Location: ${installedUserAppPath}`)
console.log('========================================\n')
