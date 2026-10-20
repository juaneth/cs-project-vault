# 🚀 CS Projects Vault (Desktop & Web)

A monochrome Computer Science Systems & Architecture Vault built with **React 18**, **Tailwind CSS**, and **shadcn/ui**, packaged as a native **Electron macOS desktop application** with background persistence, auto-launch on login, and custom app icons.

Designed completely with Google Antigravity as a quick personal project I needed built to manage my local projects and keep on track with what I want to build.

---

## ⚡ Native macOS Desktop App

- **Installed App Location**: `~/Applications/CS Projects Vault.app`
- **Spotlight & Launchpad**: Searchable by typing `CS Projects Vault` in Spotlight (`Cmd+Space`).
- **Auto-Launch at System Login**: Automatically starts on login in the background.
- **Background Tray Persistence**: Closes to the menu bar with status icon and quick actions (`New Project`, `Launch on Login`, `Quit`).
- **Window Controls**: Traffic lights properly aligned and spaced with zero content overlap.

---

## 🏃 Commands

### Build & Install to Applications Folder
```bash
# Builds production distribution, packages the .app bundle, and installs to ~/Applications
npm run build:app
```

### Run in Development
```bash
# Vite dev server + Electron with hot module reload
npm run electron:dev
```

### Run Web Version
```bash
npm run dev
# -> http://localhost:5173/
```
