# Sitecast CLI

The command-line interface for Sitecast. Record websites as MP4 videos on your local machine using a real Chromium browser and FFmpeg.

## Requirements

- Linux (Ubuntu 20.04+, Debian, Arch Linux, Fedora, WSL2)
- Node.js 18 or later
- FFmpeg (with libx264 support)
- Xvfb (virtual X11 display server)
- xdpyinfo
- Google Chrome or Chromium

## Installation

```bash
npm install -g sitecast
```

## Setup & Diagnostics

After installing, verify your environment has all the necessary dependencies:

```bash
sitecast doctor
```

If `sitecast doctor` reports missing tools, install them using your package manager:

**Ubuntu / Debian**
```bash
sudo apt update && sudo apt install ffmpeg xvfb x11-utils chromium-browser
```

**Arch Linux**
```bash
sudo pacman -S ffmpeg xorg-server-xvfb xorg-xdpyinfo chromium
```

If you prefer not to install the system Chromium, you can install a Playwright-managed version:
```bash
sitecast setup
```

## Usage

### `sitecast render`

Record a website and output it as an MP4 file.

```bash
sitecast render <url> [options]
```

#### Options

| Option | Default | Description |
|--------|---------|-------------|
| `-o, --output <path>` | `./sitecast-<timestamp>.mp4` | Output file path |
| `--width <px>` | `1280` | Viewport width in pixels |
| `--height <px>` | `720` | Viewport height in pixels |
| `--fps <n>` | `30` | Recording frame rate |
| `--no-browser-frame` | `false` | Record without the browser UI (kiosk mode) |
| `--dark-mode` | `false` | Enable dark color scheme |
| `-v, --verbose` | `false` | Print FFmpeg and Playwright output |

#### Examples

```bash
# Basic render
sitecast render https://example.com

# Save to a specific location
sitecast render https://example.com --output ~/videos/demo.mp4

# High quality: 1080p at 60 fps
sitecast render https://example.com --width 1920 --height 1080 --fps 60

# Dark mode and no browser frame
sitecast render https://example.com --dark-mode --no-browser-frame
```

### `sitecast doctor`

Checks your environment for all required dependencies (FFmpeg, Xvfb, Chrome, etc.) and reports their status.

### `sitecast setup`

Downloads a compatible Chromium build to `~/.cache/ms-playwright/`. This is useful if you don't have (or don't want to use) the system Chrome installation.

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `CHROME_EXECUTABLE` | Auto-detected | Override the Chrome binary path |
| `FFMPEG_BIN` | `ffmpeg` | Override the FFmpeg binary path |
| `XVFB_DISPLAY_START` | `99` | First virtual display number to use |
