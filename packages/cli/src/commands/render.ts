// Usage: sitecast render <url>
//
// Renders a website as an MP4 video using the local Sitecast renderer.
//
// Lifecycle:
//   1. Validate the URL.
//   2. Run environment preflight (same checks as `sitecast doctor`).
//   3. Resolve and validate the output path.
//   4. Apply the detected Chromium binary.
//   5. Invoke the renderer.
//   6. Move the temp output to the final destination.
//   7. Print a summary.

import { Command } from "commander";
import { randomUUID } from "crypto";
import { recordWebsite } from "@sitecast/renderer";
import { runAllChecks } from "../lib/checks";
import { applyChromiumExecutable } from "../lib/chromium";
import {
  resolveOutputPath,
  ensureOutputDir,
  validateOutputPath,
  moveOutput,
  formatBytes,
  formatDuration,
} from "../lib/output";
import { status, error, setVerbose, isVerbose } from "../lib/logger";
import { isLinux, platformDisplayName, currentPlatform } from "../lib/platform";

// Default recording options. These match the renderer's typical use case and
// are exposed as CLI flags so users can adjust them without needing to know
// about the internal RecordingOptions structure.
const DEFAULTS = {
  width: 1280,
  height: 720,
  fps: 30,
  browserFrame: true,
  darkMode: false,
  animationSettleMs: 1500,
  pauseAtTopMs: 1000,
  pauseAtBottomMs: 2000,
};

interface RenderOptions {
  output?: string;
  width: number;
  height: number;
  fps: number;
  browserFrame: boolean;
  darkMode: boolean;
  verbose: boolean;
  animationSettleMs: number;
  pauseAtTopMs: number;
  pauseAtBottomMs: number;
}

function intArg(value: string): number {
  const n = parseInt(value, 10);
  if (isNaN(n) || n <= 0) throw new Error(`Expected a positive integer, got: ${value}`);
  return n;
}

export const render = new Command()
  .name("render <url>")
  .description("Record a website as an MP4 video")
  .option("-o, --output <path>", "Output file path (default: ./sitecast-<timestamp>.mp4)")
  .option("--width <px>", "Viewport width in pixels", intArg, DEFAULTS.width)
  .option("--height <px>", "Viewport height in pixels", intArg, DEFAULTS.height)
  .option("--fps <n>", "Recording frame rate", intArg, DEFAULTS.fps)
  .option("--no-browser-frame", "Record without the browser chrome (fullscreen/kiosk mode)", DEFAULTS.browserFrame)
  .option("--dark-mode", "Enable dark color scheme", DEFAULTS.darkMode)
  .option("-v, --verbose", "Print FFmpeg and Playwright output")
  .option("--animation-settle <ms>", "Wait after navigation before scrolling", intArg, DEFAULTS.animationSettleMs)
  .option("--pause-top <ms>", "Pause at top of page in ms", intArg, DEFAULTS.pauseAtTopMs)
  .option("--pause-bottom <ms>", "Pause at bottom of page in ms", intArg, DEFAULTS.pauseAtBottomMs)
  .action(runRender);


async function runRender(url: string, opts: RenderOptions): Promise<void> {
  if (opts.verbose) setVerbose(true);

  // Silence FFmpeg and Playwright stderr unless --verbose is active
  if (!isVerbose()) suppressChildProcessNoise();

  // Platform check first
  if (!isLinux()) {
    const platform = platformDisplayName(currentPlatform());
    error(`Sitecast currently supports Linux only.`);
    error(`Your platform: ${platform}`);
    error("");
    error(
      "If you would like to help demonstrate demand for your platform, reach"
    );
    error("out on X (https://x.com/_MSaaDH) or by email.");
    process.exit(1);
  }

  const parsedUrl = parseUrl(url);
  if (!parsedUrl) {
    error(`Invalid URL: ${url}`);
    error("Provide a full URL including the scheme, for example:");
    error("  sitecast render https://example.com");
    process.exit(1);
  }

  // Environment preflight
  status("Checking environment...");
  const { checks, allOk } = runAllChecks();
  if (!allOk) {
    const failed = checks.filter((c) => !c.ok);
    error("");
    error("Environment check failed. Missing requirements:");
    for (const c of failed) {
      error(`  - ${c.label}`);
      if (c.hint) {
        const indented = c.hint
          .split("\n")
          .map((l) => "    " + l)
          .join("\n");
        error(indented);
      }
      error("");
    }
    error("Run `sitecast doctor` for a full report.");
    process.exit(1);
  }

  // Resolve and validate the output path
  const outputPath = resolveOutputPath(opts.output);
  const validation = validateOutputPath(outputPath);
  if (!validation.valid) {
    error(`Invalid output path: ${validation.reason}`);
    process.exit(1);
  }

  try {
    await ensureOutputDir(outputPath);
  } catch (err) {
    error(`Cannot create output directory: ${(err as Error).message}`);
    process.exit(1);
  }

  const {
    width,
    height,
    fps,
    animationSettleMs,
    pauseAtTopMs,
    pauseAtBottomMs
  } = opts;

  // Apply the detected Chrome binary.
  applyChromiumExecutable();

  const jobId = randomUUID();

  // Register signal handlers so cleanup runs on Ctrl+C.
  let renderDone = false;
  const cleanup = () => {
    if (!renderDone) {
      // The renderer's finally block handles Xvfb/FFmpeg teardown.
      // We just need to let the process exit normally so that block runs.
      process.exit(130);
    }
  };
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  // Run the renderer.
  status("Starting virtual display...");

  let result: Awaited<ReturnType<typeof recordWebsite>>;
  try {
    result = await recordWebsite({
      jobId,
      url: parsedUrl.toString(),
      options: {
        viewport: { width, height },
        fps,
        enableDarkMode: opts.darkMode,
        showBrowserFrame: opts.browserFrame,
        scroll: {
          animationSettleMs,
          pauseAtTopMs,
          pauseAtBottomMs,
        },
      },
    });
  } catch (err) {
    error("");
    error("Render failed.");
    if (isVerbose()) {
      error((err as Error).stack ?? String(err));
    } else {
      error((err as Error).message ?? String(err));
      error("");
      error("Run with --verbose for full output.");
    }
    process.exit(1);
  } finally {
    renderDone = true;
  }

  // Move output to the destination.
  try {
    await moveOutput(result.outputPath, outputPath);
  } catch (err) {
    error(`Failed to write output file: ${(err as Error).message}`);
    error(`The raw recording may still be at: ${result.outputPath}`);
    process.exit(1);
  }

  // Print summary.
  const duration = formatDuration(result.durationSeconds);
  const size = formatBytes(result.fileSizeBytes);
  status("");
  status(`Video saved to: ${outputPath}`);
  status(`Duration: ${duration}  Size: ${size}`);
  status("");
}

// helpers
function parseUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u;
  } catch {
    // If there's no scheme, try adding https:// and parsing again.
    try {
      return new URL("https://" + raw);
    } catch {
      return null;
    }
  }
}



/**
 * When not in verbose mode, redirect stderr of child processes (FFmpeg,
 * Playwright, Xvfb) to /dev/null so they don't pollute the user's terminal.
 *
 * The renderer writes child process output directly to process.stderr. The
 * cleanest way to suppress it without modifying the renderer is to temporarily
 * swap out the write function on the stderr stream.
 */
function suppressChildProcessNoise(): void {
  const originalWrite = process.stderr.write.bind(process.stderr);

  // Patterns that indicate the line came from a child process prefixed by the
  // renderer's "[ffmpeg:...]" or "[xvfb:...]" tags.
  const childPrefixes = ["[ffmpeg:", "[xvfb:", "[playwright:"];

  process.stderr.write = (
    ...args: unknown[]
  ): boolean => {
    const chunk = args[0];
    if (typeof chunk === "string" && childPrefixes.some((p) => chunk.startsWith(p))) {
      return true; // suppress
    }

    if (Buffer.isBuffer(chunk)) {
      const str = chunk.toString();
      if (childPrefixes.some((p) => str.startsWith(p))) return true;
    }

    return (originalWrite as (...a: unknown[]) => boolean)(...args);
  };
}
