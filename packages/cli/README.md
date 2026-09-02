# Sitecast

Record any website as an MP4 video on your local machine.

Sitecast opens the page in a real headed Chromium instance, scrolls through
it naturally, and records the output with FFmpeg. Everything runs locally.
No cloud account, no API key, no data leaves your machine.

## Requirements

- Linux (only Linux is supported at this time)
- Node.js 18 or later
- FFmpeg
- Xvfb (virtual X11 display server)
- xdpyinfo
- Google Chrome or Chromium (see [Setup](#setup) below)

## Installation

```bash
npm install -g sitecast
```

## Setup

After installing, check that your environment has everything the renderer needs:

```bash
sitecast doctor
```

Example output on a ready system:

```
Sitecast environment

  [ok] Linux
  [ok] Node.js v24.11.1
  [ok] FFmpeg (n8.1.2)
  [ok] Xvfb
  [ok] xdpyinfo
  [ok] Chromium
  [ok] Temp directory writable (/tmp)

Ready to render.
```

If `sitecast doctor` reports a missing Chrome or Chromium, you have two options:

**Option 1 - Install system Chrome (recommended)**

On Arch Linux:
```bash
yay -S google-chrome
```

On Ubuntu:
Follow the installation guide at https://google.com/chrome, or install
Chromium:
```bash
sudo apt install chromium-browser
```

**Option 2 - Install the Playwright-managed Chromium**

```bash
sitecast setup
```

This downloads a Chromium build that Playwright has verified compatibility
with. It is installed to `~/.cache/ms-playwright/` and does not affect your
system Chrome installation.

### System dependencies

If `sitecast doctor` reports missing system tools:

**Arch Linux**

```bash
sudo pacman -S ffmpeg xorg-server-xvfb xorg-xdpyinfo
```

**Ubuntu / Debian**

```bash
sudo apt install ffmpeg xvfb x11-utils
```

## Usage

Record a website:

```bash
sitecast render https://example.com
```

The video is saved to `./sitecast-<timestamp>.mp4` in the current directory.

### Options

| Option                   | Description                                         | Default                                 |
|--------------------------|-----------------------------------------------------|-----------------------------------------|
| `-o, --output <path>`    | Output file path                                    | `./sitecast-<timestamp>.mp4`            |
| `--width <px>`           | Viewport width in pixels                            | `1280`                                  |
| `--height <px>`          | Viewport height in pixels                           | `720`                                   |
| `--fps <n>`              | Recording frame rate                                | `30`                                    |
| `--no-browser-frame`     | Record without the browser chrome (kiosk mode)      |                                         |
| `--dark-mode`            | Enable dark color scheme                            |                                         |
| `-v, --verbose`          | Print FFmpeg and Playwright output                  |                                         |

**Usage:**  
```
sitecast render <url> [options]
```

### Examples

```bash
# Basic render
sitecast render https://example.com

# Save to a specific file
sitecast render https://example.com --output ~/videos/demo.mp4

# 1080p at 60 fps
sitecast render https://example.com --width 1920 --height 1080 --fps 60

# Dark mode, no browser chrome
sitecast render https://example.com --dark-mode --no-browser-frame

# Show full renderer output for debugging
sitecast render https://example.com --verbose
```

## Output

The recording starts as soon as the virtual display opens, so all page-load
animations are captured. Sitecast then scrolls through the page at a natural
human-like pace and stops at the bottom.

The output file is an MP4 encoded with libx264 at CRF 23 (near-lossless for
most screen content) with yuv420p pixel format for broad player compatibility.

## Troubleshooting

### Missing FFmpeg

Install FFmpeg from your package manager. On Arch: `sudo pacman -S ffmpeg`.
On Ubuntu: `sudo apt install ffmpeg`. Run `sitecast doctor` to confirm.

### Missing Xvfb

Xvfb provides the virtual X11 display that Chromium and FFmpeg use. On Arch:
`sudo pacman -S xorg-server-xvfb`. On Ubuntu: `sudo apt install xvfb`.

### Missing Chromium

Run `sitecast setup` to install the Playwright-managed Chromium, or install
Google Chrome from your system package manager and run `sitecast doctor` again.

### Permissions

If `sitecast doctor` reports that `/tmp` is not writable, check that your
user has write access to the system temporary directory. The renderer creates
temporary files there during recording and cleans them up on exit.

### Browser launch failures

Run `sitecast render <url> --verbose` to see Playwright's full output. Common
causes are a missing Xvfb display, an incompatible Chrome version, or missing
shared libraries. The `sitecast doctor` output usually points to the issue.

### Unsupported platform

Sitecast currently supports Linux only. If you are on macOS or Windows and
would like to help demonstrate demand for your platform, reach out on
[X](https://x.com/_MSaaDH) or by [email](mailto:mohd.saadhaider@gmail.com).

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `CHROME_EXECUTABLE` | auto-detected | Override the Chrome binary path |
| `FFMPEG_BIN` | `ffmpeg` | Override the FFmpeg binary path |
| `XVFB_DISPLAY_START` | `99` | First virtual display number |
