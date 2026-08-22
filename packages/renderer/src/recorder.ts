/**
 * Main recording orchestrator.
 *
 * Animation-first recording sequence:
 *   1. Allocate an isolated Xvfb display from the pool
 *   2. Start Xvfb (virtual X11 display, Wayland-compatible via XWayland)
 *   3. Launch Chrome (pointing at the Xvfb display)
 *   4. Start FFmpeg x11grab capture, recording begins NOW on the blank tab
 *   5. Navigate to the target URL, all page-load animations are captured
 *   6. Wait for the load event + animationSettleMs grace period
 *   7. Run the natural human-like scroll session
 *   8. Stop FFmpeg cleanly (stdin 'q', await exit)
 *   9. Tear down Chrome -> Xvfb -> release display
 *  10. Move the output file to permanent storage
 */

import { spawn } from "child_process";
import type { ChildProcess } from "child_process";
import os from "os";
import path from "path";
import fs from "fs/promises";
import { chromium } from "playwright";
import { acquireDisplay, releaseDisplay } from "./displayPool";
import { startRecording, stopRecording } from "./ffmpeg";
import { runScrollSession } from "./scroller";
import type { RecordingJob, RecordingResult, RecordingOptions } from "./types";

const CHROME_EXECUTABLE =
  process.env.CHROME_EXECUTABLE ?? "/usr/bin/google-chrome-stable";

// Milliseconds to wait after xdpyinfo reports Xvfb is ready before launching Chrome
const XVFB_READY_POLL_INTERVAL_MS = 200;
const XVFB_READY_TIMEOUT_MS = 15_000;

const DEFAULT_ARGS = [
  // Force X11 mode so Chrome works inside the Xvfb display on Wayland
  "--ozone-platform=x11",
  // Disable features that can interfere with smooth rendering in a VM display
  "--disable-dev-shm-usage",
  "--disable-software-rasterizer",
  // Ensure animations run at full speed — not throttled for background tabs
  "--disable-background-timer-throttling",
  "--disable-renderer-backgrounding",
  "--disable-backgrounding-occluded-windows",
  // Keep a consistent window size matching the FFmpeg capture resolution
  "--window-position=0,0",
  "--hide-scrollbars",
  // To use GTK themes
  "--gtk-version=3"
  // // For full screen mode
  // "--kiosk",
  // `--window-size=${VIEWPORT_WIDTH},${VIEWPORT_HEIGHT}`,
  // // For dark mode
  // "--force-dark-mode"
]

export async function recordWebsite(job: RecordingJob): Promise<RecordingResult> {
  const display = await acquireDisplay();

  let xvfbProc: ChildProcess | null = null;
  let ffmpegHandle: ReturnType<typeof startRecording> | null = null;
  let browserContext: Awaited<ReturnType<typeof chromium.launchPersistentContext>> | null = null;
  let recordedDurationSeconds = 0;
  const tempPath = path.join(os.tmpdir(), `sitecast-${job.jobId}.mp4`);

  const args = constructChromiumArgs(job.options);

  try {
    const resolution = `${job.options.viewport.width}x${job.options.viewport.height}`;

    // Start Xvfb
    xvfbProc = spawnXvfb(display, resolution);
    await waitForXvfb(display);

    // Launch Chrome via Playwright
    // We use launchPersistentContext so we get a real user-data-dir, which
    // enables Chrome to render sites exactly as a user would see them.
    const userDataDir = path.join(os.tmpdir(), `sitecast-profile-${job.jobId}`);
    await fs.mkdir(userDataDir, { recursive: true });

    const displayEnv = `:${display}`;
    browserContext = await chromium.launchPersistentContext(userDataDir, {
      executablePath: CHROME_EXECUTABLE,
      headless: false,
      chromiumSandbox: false,
      // Set viewport to null so Playwright inherits the browser window's size.
      // This is required for --kiosk and full-screen flags to actually take effect
      // without Playwright restricting the web content into a letterboxed viewport.
      viewport: job.options.showBrowserFrame ? job.options.viewport : null,
      colorScheme: job.options.enableDarkMode ? "dark" : "light",
      env: {
        ...process.env,
        DISPLAY: displayEnv,
        GTK_THEME: job.options.enableDarkMode ? "Adwaita:dark" : "Adwaita:light"
      },
      args: args,
      ignoreDefaultArgs: ["--enable-automation"],
    });

    const page = browserContext.pages()[0] ?? await browserContext.newPage();

    // esbuild/tsx injects a `__name` helper into functions. We must define it globally
    // inside the browser so that transpiled `page.evaluate()` closures do not throw ReferenceError.
    await browserContext.addInitScript(`
      window.__name = function (fn, name) {
        Object.defineProperty(fn, "name", { value: name, configurable: true });
        return fn;
      };
    `);

    await page.goto(job.url, {
      waitUntil: "load",
      timeout: 60_000,
    });
    await page.emulateMedia({ colorScheme: job.options.enableDarkMode ? "dark" : "light" });

    ffmpegHandle = startRecording(displayEnv, tempPath, resolution, job.options.fps);
    const recordingStart = Date.now();

    await sleep(500);

    await runScrollSession(page, job.options.scroll);
    
    recordedDurationSeconds = (Date.now() - recordingStart) / 1000;
    await stopRecording(ffmpegHandle);
    ffmpegHandle = null;

    await browserContext.close();
    browserContext = null;

    // Clean up the temporary user-data-dir (non-fatal if it fails)
    await fs.rm(userDataDir, { recursive: true, force: true }).catch(() => { });

  } finally {
    // Guaranteed cleanup regardless of where an error occurred
    if (ffmpegHandle) {
      await stopRecording(ffmpegHandle).catch(() => {
        ffmpegHandle!.process.kill("SIGTERM");
      });
    }
    if (browserContext) {
      await browserContext.close().catch(() => { });
    }
    if (xvfbProc && !xvfbProc.killed) {
      xvfbProc.kill("SIGTERM");
    }
    releaseDisplay(display);
  }

  const { size } = await fs.stat(tempPath);

  return {
    jobId: job.jobId,
    outputPath: tempPath,
    durationSeconds: recordedDurationSeconds,
    fileSizeBytes: size,
  };
}

/* ========================= Helpers ========================= */

function constructChromiumArgs(options: RecordingOptions): string[] {
  const args = [...DEFAULT_ARGS];

  args.push(`--window-size=${options.viewport.width},${options.viewport.height}`);
  
  if (options.enableDarkMode) {
    args.push("--force-dark-mode");
  } else {
    args.push("--force-light-mode");
  }
  
  if (!options.showBrowserFrame) {
    args.push("--kiosk");
  }

  return args;
}

// Spawns a child process running Xvfb on the given display.
function spawnXvfb(display: number, resolution: string): ChildProcess {
  const proc = spawn(
    "Xvfb",
    [`:${display}`, "-screen", "0", `${resolution}x24`, "-ac", "+extension", "GLX"],
    {
      stdio: ["ignore", "pipe", "pipe"],
      detached: false,
    }
  );

  proc.stderr?.on("data", (chunk: Buffer) => {
    process.stderr.write(`[xvfb:${display}] ${chunk.toString()}`);
  });

  return proc;
}

// Polls xdpyinfo until Xvfb accepts connections on the given display.
// This is more reliable than a fixed sleep because Xvfb startup time varies.
async function waitForXvfb(display: number): Promise<void> {
  const deadline = Date.now() + XVFB_READY_TIMEOUT_MS;
  const displayStr = `:${display}`;

  while (Date.now() < deadline) {
    const ready = await new Promise<boolean>((resolve) => {
      const check = spawn("xdpyinfo", ["-display", displayStr], {
        stdio: "ignore",
        env: { ...process.env, DISPLAY: displayStr },
      });
      check.on("close", (code) => resolve(code === 0));
      check.on("error", () => resolve(false));
    });

    if (ready) return;
    await sleep(XVFB_READY_POLL_INTERVAL_MS);
  }

  throw new Error(
    `Xvfb :${display} did not become ready within ${XVFB_READY_TIMEOUT_MS}ms`
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
