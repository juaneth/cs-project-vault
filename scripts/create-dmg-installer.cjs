const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const rootDir = path.resolve(__dirname, '..')
const releaseDir = path.join(rootDir, 'release')
const appName = 'CS Projects Vault'
const appBundlePath = path.join(releaseDir, `${appName}.app`)
const stagingDir = path.join(releaseDir, 'dmg-staging')
const dmgOutputPath = path.join(releaseDir, 'CS-Projects-Vault-Installer.dmg')

console.log('==> Step 1: Checking application bundle...')
if (!fs.existsSync(appBundlePath)) {
  console.log('App bundle not found, building first...')
  execSync('node scripts/build-macos-app.cjs', { cwd: rootDir, stdio: 'inherit' })
}

console.log('==> Step 2: Preparing DMG staging directory...')
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true })
}
fs.mkdirSync(stagingDir, { recursive: true })

// Copy app bundle into staging
console.log('Copying app to staging...')
execSync(`cp -R "${appBundlePath}" "${stagingDir}/"`, { stdio: 'inherit' })

// Create /Applications symlink for classic macOS drag-to-install experience
console.log('Creating /Applications drag-and-drop symlink...')
execSync(`ln -s /Applications "${stagingDir}/Applications"`, { stdio: 'inherit' })

// Add quick installation text instructions
fs.writeFileSync(
  path.join(stagingDir, 'INSTRUCTIONS.txt'),
  `==========================================
 CS Projects Vault — macOS Installation
==========================================

1. Drag 'CS Projects Vault' into the 'Applications' shortcut.
2. Open Spotlight (Cmd + Space) and search for 'CS Projects Vault'.
3. The app will launch and stay available in your menu bar tray.

Enjoy!
`
)

console.log('==> Step 3: Generating compressed Apple Disk Image (.dmg)...')
if (fs.existsSync(dmgOutputPath)) {
  fs.rmSync(dmgOutputPath, { force: true })
}

try {
  execSync(
    `/usr/bin/hdiutil create \
      -volname "${appName} Installer" \
      -srcfolder "${stagingDir}" \
      -ov -format UDZO \
      "${dmgOutputPath}"`,
    { stdio: 'inherit' }
  )

  // Clean up temporary staging directory
  fs.rmSync(stagingDir, { recursive: true, force: true })

  const stats = fs.statSync(dmgOutputPath)
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(1)

  console.log('\n======================================================')
  console.log('🎉 macOS DMG Installer created successfully!')
  console.log(`📁 Installer Path: ${dmgOutputPath}`)
  console.log(`📦 File Size: ${sizeMb} MB`)
  console.log('======================================================\n')
} catch (err) {
  console.error('Error generating DMG installer:', err.message)
  process.exit(1)
}
