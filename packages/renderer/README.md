# Renderer

The core rendering engine for Sitecast. This package uses Playwright to open a webpage, scroll through it at a natural human-like pace, and capture the virtual X11 display output via FFmpeg.

It is designed to be a pure renderer: it knows nothing about HTTP queues, databases, or cloud storage. It simply takes a recording job and outputs an MP4 file.

## Installation

This package is intended for internal use within the Sitecast monorepo, but can be used as a standalone dependency if you have the required system dependencies (Linux, Xvfb, FFmpeg).

```bash
npm install @sitecast/renderer
```

## API Reference

### `recordWebsite(job: RecordJob): Promise<RecordResult>`

Records a website and returns the path to the generated MP4 file.

#### Parameters

- `job`: An object containing the recording parameters.
  - `url` (string): The URL to record.
  - `width` (number): Viewport width.
  - `height` (number): Viewport height.
  - `fps` (number): Recording framerate.
  - `outputPath` (string): Absolute path where the temporary MP4 will be saved.
  - `noBrowserFrame` (boolean, optional): If true, runs the browser in kiosk mode.
  - `darkMode` (boolean, optional): If true, forces the `prefers-color-scheme: dark` media feature.
  - `verbose` (boolean, optional): If true, logs Playwright and FFmpeg debug output to stdout.

#### Returns

- A Promise that resolves to an object containing:
  - `outputPath` (string): The absolute path to the generated MP4 file.

#### Example

```typescript
import { recordWebsite } from '@sitecast/renderer';

const result = await recordWebsite({
  url: 'https://example.com',
  width: 1280,
  height: 720,
  fps: 30,
  outputPath: '/tmp/sitecast-output.mp4',
  noBrowserFrame: true,
  darkMode: true
});

console.log(`Video saved to: ${result.outputPath}`);
```

## How it works

1. Starts a virtual X11 display using `Xvfb`.
2. Launches a headed Chromium instance via Playwright on the virtual display.
3. Spawns an `ffmpeg` process to capture the X11 screen (using `x11grab`).
4. Performs a programmatic, natural-looking scroll from the top to the bottom of the page.
5. Stops the recording, cleans up the browser and virtual display, and resolves with the path to the MP4.
