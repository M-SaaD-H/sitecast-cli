// Chromium detection.
//
// The renderer needs a Chrome/Chromium binary. It accepts the path through the
// CHROME_EXECUTABLE environment variable. This module finds the best available
// binary and exports a helper that sets the variable before rendering.

import { execFileSync } from "child_process";
import { existsSync, readdirSync } from "fs";
import path from "path";
import os from "os";

// Candidates checked in order. The first one that exists wins.
const SYSTEM_CANDIDATES = [
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/snap/bin/chromium",
];

function which(name: string): string | null {
  try {
    const result = execFileSync("which", [name], { encoding: "utf8" });
    return result.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Returns the absolute path to a usable Chrome/Chromium binary, or null if
 * none is found.
 *
 * Search order:
 *   1. CHROME_EXECUTABLE environment variable
 *   2. Known system paths for google-chrome-stable / chromium
 *   3. `which` for common binary names
 *   4. Playwright-managed Chromium in ~/.cache/ms-playwright
 */
export function findChromiumExecutable(): string | null {
  if (process.env.CHROME_EXECUTABLE) {
    return process.env.CHROME_EXECUTABLE;
  }

  // well-known absolute paths.
  for (const candidate of SYSTEM_CANDIDATES) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  const names = [
    "google-chrome-stable",
    "google-chrome",
    "chromium",
    "chromium-browser",
  ];
  for (const name of names) {
    const found = which(name);
    if (found) return found;
  }

  return findPlaywrightChromium();
}

/**
 * Returns true when a usable Chrome/Chromium binary is available.
 */
export function isChromiumAvailable(): boolean {
  return findChromiumExecutable() !== null;
}

/**
 * Finds Playwright's managed Chromium installation.
 * Playwright stores browsers in ~/.cache/ms-playwright/<browser>-<revision>/.
 */
function findPlaywrightChromium(): string | null {
  const cacheDir = path.join(os.homedir(), ".cache", "ms-playwright");
  if (!existsSync(cacheDir)) return null;

  let entries: string[];
  try {
    entries = readdirSync(cacheDir);
  } catch {
    return null;
  }

  // Find the newest chromium directory (they look like "chromium-1148").
  const chromiumDirs = entries
    .filter((e) => e.startsWith("chromium-"))
    .sort()
    .reverse();

  for (const dir of chromiumDirs) {
    const candidates = [
      path.join(cacheDir, dir, "chrome-linux", "chrome"),
      path.join(cacheDir, dir, "chrome-linux64", "chrome"),
    ];
    for (const c of candidates) {
      if (existsSync(c)) return c;
    }
  }

  return null;
}

/**
 * Sets CHROME_EXECUTABLE in the current process environment so the renderer
 * picks up the detected binary. Call before invoking recordWebsite().
 */
export function applyChromiumExecutable(): void {
  if (process.env.CHROME_EXECUTABLE) return;
  const path = findChromiumExecutable();
  if (path) {
    process.env.CHROME_EXECUTABLE = path;
  }
}
