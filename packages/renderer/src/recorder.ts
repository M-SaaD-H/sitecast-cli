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
import type { Browser, BrowserContext, Page } from "playwright";
import { acquireDisplay, releaseDisplay } from "./displayPool";
import { startRecording, stopRecording } from "./ffmpeg";
import { runScrollSession } from "./scroller";
import type { RecordingJob, RecordingResult, RecordingOptions } from "./types";

const CHROME_EXECUTABLE =
  process.env.CHROME_EXECUTABLE ?? "/usr/bin/google-chrome-stable";

// Milliseconds to wait after xdpyinfo reports Xvfb is ready before launching Chrome
const XVFB_READY_POLL_INTERVAL_MS = 200;
const XVFB_READY_TIMEOUT_MS = 15_000;

// Base port for Chrome remote debugging; display number is added for isolation.
const CHROME_DEBUG_BASE_PORT = 9200;
const CHROME_DEBUG_TIMEOUT_MS = 15_000;

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
  "--gtk-version=3",
];

export async function recordWebsite(job: RecordingJob): Promise<RecordingResult> {
  const display = await acquireDisplay();

  let xvfbProc: ChildProcess | null = null;
  let ffmpegHandle: ReturnType<typeof startRecording> | null = null;
  let chromeProc: ChildProcess | null = null;
  let browser: Browser | null = null;
  let browserContext: BrowserContext | null = null;
  let recordedDurationSeconds = 0;
  const tempPath = path.join(os.tmpdir(), `sitecast-${job.jobId}.mp4`);

  const disableSandbox = shouldDisableChromiumSandbox();
  const chromeArgs = constructChromiumArgs(job.options, disableSandbox);

  try {
    const resolution = `${job.options.viewport.width}x${job.options.viewport.height}`;

    // Start Xvfb
    xvfbProc = spawnXvfb(display, resolution);
    await waitForXvfb(display);

    const userDataDir = path.join(os.tmpdir(), `sitecast-profile-${job.jobId}`);
    await fs.mkdir(userDataDir, { recursive: true });

    const displayEnv = `:${display}`;

    const debugPort = CHROME_DEBUG_BASE_PORT + display;
    chromeProc = spawnChrome({
      url: job.url,
      userDataDir,
      debugPort,
      displayEnv,
      chromeArgs,
      darkMode: job.options.enableDarkMode ?? false,
    });

    await waitForChromeDevTools(debugPort);

    browser = await chromium.connectOverCDP(`http://127.0.0.1:${debugPort}`);
    browserContext = browser.contexts()[0];
    if (!browserContext) {
      throw new Error("Chrome did not expose a browser context over CDP");
    }

    const page = browserContext.pages()[0] ?? (await browserContext.newPage());

    if (job.options.showBrowserFrame) {
      await page.setViewportSize(job.options.viewport);
    }

    await page.waitForLoadState("load", { timeout: 60_000 });
    await installScrollHelper(page);
    await page.emulateMedia({
      colorScheme: job.options.enableDarkMode ? "dark" : "light",
    });

    ffmpegHandle = startRecording(displayEnv, tempPath, resolution, job.options.fps);
    const recordingStart = Date.now();

    await sleep(500);

    await runScrollSession(page, job.options.scroll);

    recordedDurationSeconds = (Date.now() - recordingStart) / 1000;
    await stopRecording(ffmpegHandle);
    ffmpegHandle = null;

    await browser.close();
    browser = null;
    browserContext = null;
    chromeProc = null;

    // Clean up the temporary user-data-dir (non-fatal if it fails)
    await fs.rm(userDataDir, { recursive: true, force: true }).catch(() => {});

  } finally {
    // Guaranteed cleanup regardless of where an error occurred
    if (ffmpegHandle) {
      await stopRecording(ffmpegHandle).catch(() => {
        ffmpegHandle!.process.kill("SIGTERM");
      });
    }
    if (browser) {
      await browser.close().catch(() => {});
    } else if (browserContext) {
      await browserContext.close().catch(() => {});
    }
    if (chromeProc && !chromeProc.killed) {
      chromeProc.kill("SIGTERM");
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

function spawnChrome(options: {
  url: string;
  userDataDir: string;
  debugPort: number;
  displayEnv: string;
  chromeArgs: string[];
  darkMode: boolean;
}): ChildProcess {
  const args = [
    ...options.chromeArgs,
    `--user-data-dir=${options.userDataDir}`,
    `--remote-debugging-port=${options.debugPort}`,
    "--no-first-run",
    options.url,
  ];

  const proc = spawn(CHROME_EXECUTABLE, args, {
    env: buildChromeEnv(options.displayEnv, options.darkMode),
    stdio: ["ignore", "pipe", "pipe"],
  });

  proc.stderr?.on("data", (chunk: Buffer) => {
    process.stderr.write(`[chrome] ${chunk.toString()}`);
  });

  return proc;
}

function buildChromeEnv(displayEnv: string, darkMode: boolean): NodeJS.ProcessEnv {
  return {
    ...process.env,
    DISPLAY: displayEnv,
    GTK_THEME: darkMode ? "Adwaita:dark" : "Adwaita",
    GTK_APPLICATION_PREFER_DARK_THEME: darkMode ? "1" : "0",
  };
}

async function waitForChromeDevTools(port: number): Promise<void> {
  const deadline = Date.now() + CHROME_DEBUG_TIMEOUT_MS;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {
      // Chrome is still starting.
    }
    await sleep(XVFB_READY_POLL_INTERVAL_MS);
  }

  throw new Error(
    `Chrome did not expose DevTools on port ${port} within ${CHROME_DEBUG_TIMEOUT_MS}ms`
  );
}

async function installScrollHelper(page: Page): Promise<void> {
  // esbuild/tsx injects a `__name` helper into functions. We must define it globally
  // inside the browser so that transpiled `page.evaluate()` closures do not throw ReferenceError.
  await page.evaluate(() => {
    const w = window as typeof window & {
      __name?: (fn: (...args: unknown[]) => unknown, name: string) => unknown;
    };
    w.__name = function (fn, name) {
      Object.defineProperty(fn, "name", { value: name, configurable: true });
      return fn;
    };
  });
}

function shouldDisableChromiumSandbox(): boolean {
  if (process.env.SITECAST_NO_SANDBOX === "1") return true;
  // Chrome refuses to use its sandbox when launched as root.
  return typeof process.getuid === "function" && process.getuid() === 0;
}

function constructChromiumArgs(
  options: RecordingOptions,
  disableSandbox: boolean
): string[] {
  const args = [...DEFAULT_ARGS];
  // Chrome's sandbox needs user namespaces on Linux. When disabled (root, Docker,
  // etc.) pass --no-sandbox, which shows a yellow warning in the recorded video.
  // --test-type suppresses that banner for tool/automation use.
  if (disableSandbox) {
    args.push("--no-sandbox", "--test-type");
  }

  args.push(`--window-size=${options.viewport.width},${options.viewport.height}`);

  // Page content follows emulateMedia(); these flags keep the native browser
  // chrome aligned on Linux, where Chrome otherwise mirrors the host dark theme.
  const disabledFeatures = ["DevToolsDebuggingRestrictions"];
  const enabledFeatures: string[] = [];
  if (options.enableDarkMode) {
    args.push("--force-dark-mode");
    enabledFeatures.push("WebUIDarkMode");
  } else {
    args.push("--force-light-mode");
    disabledFeatures.push("WebUIDarkMode");
  }
  args.push(`--disable-features=${disabledFeatures.join(",")}`);
  if (enabledFeatures.length > 0) {
    args.push(`--enable-features=${enabledFeatures.join(",")}`);
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
