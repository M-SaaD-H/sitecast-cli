# Renderer API reference

Notes written while researching `packages/renderer` before building the CLI.
This document describes what the renderer does, how to call it, what it needs
from the environment, and what changes are required to make it usable locally.

## Public API

The package exports a single function from `src/index.ts`:

```ts
import { recordWebsite } from "@sitecast/renderer";

const result = await recordWebsite(job);
```

### Input

```ts
interface RecordingJob {
  jobId: string;        // caller-generated unique ID
  url: string;          // page to record
  options: RecordingOptions;
}

interface RecordingOptions {
  viewport: {
    width: number;
    height: number;
  };
  fps?: number;         // recording frame rate, default 30
  enableDarkMode?: boolean;
  showBrowserFrame?: boolean;
  scroll: ScrollOptions;
}

interface ScrollOptions {
  animationSettleMs: number;  // wait after navigation before scrolling
  pauseAtTopMs: number;       // hold at top before first scroll
  pauseAtBottomMs: number;    // hold at bottom before stopping
}
```

### Output

```ts
interface RecordingResult {
  jobId: string;
  outputPath: string;       // absolute path to the recorded MP4
  durationSeconds: number;
  fileSizeBytes: number;
}
```

The file at `outputPath` is in `/tmp`. The caller is responsible for moving or
copying it to a permanent location.

## Rendering sequence

1. Acquire a display number from the pool (`acquireDisplay()`).
2. Spawn `Xvfb :<n> -screen 0 <W>x<H>x24 -ac +extension GLX`.
3. Poll `xdpyinfo` until Xvfb accepts connections (up to 15 s).
4. Create a temp Chrome user-data-dir at `/tmp/sitecast-profile-<jobId>`.
5. Launch Chrome via `playwright.chromium.launchPersistentContext()` with
   `headless: false` pointing at the Xvfb display.
6. Navigate to the URL and wait for the `load` event.
7. Start FFmpeg `x11grab` capture from `:<display>+0,0`.
8. Run the human-like scroll session.
9. Stop FFmpeg cleanly (write `q` to stdin, wait for exit).
10. Close browser, remove the Chrome user-data-dir.
11. Release the display back to the pool.

Cleanup runs in a `finally` block, so Xvfb and FFmpeg are killed even when an
error is thrown.

## System dependencies

| Binary | Variable to override | Fallback |
|--------|---------------------|---------|
| `google-chrome-stable` | `CHROME_EXECUTABLE` | `/usr/bin/google-chrome-stable` |
| `ffmpeg` | `FFMPEG_BIN` | `ffmpeg` on PATH |
| `Xvfb` | none | `Xvfb` on PATH |
| `xdpyinfo` | none | `xdpyinfo` on PATH |

All must be present before calling `recordWebsite`.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `CHROME_EXECUTABLE` | `/usr/bin/google-chrome-stable` | Chrome binary path |
| `FFMPEG_BIN` | `ffmpeg` | FFmpeg binary path |
| `XVFB_DISPLAY_START` | `99` | First virtual display number |
| `MAX_CONCURRENT_WORKERS` | `1` | Display pool size |
| `DISPLAY` | set internally | Set by the renderer for each job |

## Coupling to the web application

The renderer has no coupling to the web application, database, Redis, or any
cloud service. It operates entirely on the local filesystem and spawns local
processes.

The only thing the old cloud worker did was:
- Generate a `jobId` and pass it to `recordWebsite`.
- Upload `result.outputPath` to cloud storage.
- Delete the local temp file.

The CLI handles these steps locally: generate a `jobId`, call `recordWebsite`,
move the output file to the user-requested destination.

## Required renderer changes for CLI use

The following changes are needed before the CLI can call the renderer:

1. Remove `publicUrl` from `RecordingResult`. That field was only meaningful
   when a cloud worker uploaded the file. The CLI does not upload anything.

2. Add `fps?: number` to `RecordingOptions`. The renderer currently hardcodes
   30 fps in `ffmpeg.ts`. Exposing it lets the CLI support `--fps`.

3. Change `MAX_CONCURRENT_WORKERS` default from 3 to 1. The pool was sized for
   parallel cloud workers. A local CLI runs one job at a time.

These changes are small and do not alter the rendering logic.

## Notes on Playwright and Chrome

The renderer uses `chromium.launchPersistentContext()` with a custom
`executablePath`. It does not use Playwright's own managed browser by default.

Supported Chrome sources, in preference order:

1. `CHROME_EXECUTABLE` environment variable.
2. `google-chrome-stable` on PATH.
3. `google-chrome` on PATH.
4. `chromium` or `chromium-browser` on PATH.
5. Playwright-managed Chromium at `~/.cache/ms-playwright/`.

If none of these are present, `sitecast setup` can install Playwright's
bundled Chromium with `playwright install chromium`.

## Xvfb display pool

`displayPool.ts` manages a set of display numbers for concurrent recording
jobs. For CLI use, only one display is ever needed. The pool still works
correctly with `MAX_CONCURRENT_WORKERS=1`; it just uses display `:99` and
releases it when the job finishes.

## FFmpeg recording

FFmpeg captures from the Xvfb display using `x11grab`. Output is encoded with
`libx264` at CRF 23, preset `fast`, pixel format `yuv420p`.

FFmpeg is stopped by writing `q` to its stdin, which triggers a clean mux.
SIGKILL is never sent because it would corrupt the MP4 container. A 15-second
timeout falls back to SIGTERM.
