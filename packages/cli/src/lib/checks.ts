// Environment check helpers used by `sitecast doctor` and the render command's
// preflight step.
//
// Each check returns a CheckResult so the output layer can format it however
// it needs (plain text for `doctor`, a single thrown error for `render`).

import { execFileSync } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import path from "path";
import os from "os";
import { findChromiumExecutable } from "./chromium";
import { currentPlatform, isLinux, platformDisplayName } from "./platform";

export interface CheckResult {
  label: string;
  ok: boolean;
  detail?: string;
  hint?: string;
}

// ---- individual checks -------------------------------------------------------

export function checkLinux(): CheckResult {
  const ok = isLinux();
  return {
    label: "Linux",
    ok,
    detail: ok ? undefined : `Your platform: ${platformDisplayName(currentPlatform())}`,
    hint: ok ? undefined : UNSUPPORTED_PLATFORM_MESSAGE,
  };
}

export function checkNodeVersion(): CheckResult {
  const version = process.version; // e.g. "v24.11.1"
  const major = parseInt(version.slice(1).split(".")[0], 10);
  const ok = major >= 18;
  return {
    label: `Node.js ${version}`,
    ok,
    detail: ok ? undefined : `Requires Node.js 18 or later. Found ${version}.`,
    hint: ok ? undefined : "Install Node.js 18 or later from https://nodejs.org",
  };
}

export function checkFfmpeg(): CheckResult {
  const bin = process.env.FFMPEG_BIN ?? "ffmpeg";
  let version: string | undefined;

  let found = false;
  try {
    const out = execFileSync(bin, ["-version"], { encoding: "utf8" });
    const match = out.match(/ffmpeg version (\S+)/);
    version = match ? match[1] : undefined;
    found = true;
  } catch {
    found = false;
  }

  return {
    label: `FFmpeg${version ? ` (${version})` : ""}`,
    ok: found,
    hint: found
      ? undefined
      : formatInstallHint(
          "FFmpeg",
          "sudo pacman -S ffmpeg",
          "sudo apt install ffmpeg"
        ),
  };
}

export function checkBinary(
  name: string,
  label: string,
  archHint: string,
  ubuntuHint: string
): CheckResult {
  let found = false;
  try {
    execFileSync("which", [name], { stdio: "ignore" });
    found = true;
  } catch {
    found = false;
  }
  return {
    label,
    ok: found,
    hint: found
      ? undefined
      : formatInstallHint(label, archHint, ubuntuHint),
  };
}

export function checkChromium(): CheckResult {
  const path = findChromiumExecutable();
  const ok = path !== null;
  return {
    label: "Chromium",
    ok,
    detail: ok ? path! : undefined,
    hint: ok
      ? undefined
      : [
          "No Chrome or Chromium binary found.",
          "",
          "Option 1 -- install Google Chrome:",
          "  Arch: yay -S google-chrome",
          "  Ubuntu: follow https://google.com/chrome",
          "",
          "Option 2 -- install the Playwright-managed Chromium:",
          "  sitecast setup",
        ].join("\n"),
  };
}

export function checkXvfb(): CheckResult {
  return checkBinary(
    "Xvfb",
    "Xvfb",
    "sudo pacman -S xorg-server-xvfb",
    "sudo apt install xvfb"
  );
}

export function checkXdpyinfo(): CheckResult {
  return checkBinary(
    "xdpyinfo",
    "xdpyinfo",
    "sudo pacman -S xorg-xdpyinfo",
    "sudo apt install x11-utils"
  );
}

export function checkTmpWritable(): CheckResult {
  const dir = os.tmpdir();
  const probe = path.join(dir, `.sitecast-probe-${process.pid}`);
  let ok = false;
  try {
    writeFileSync(probe, "");
    unlinkSync(probe);
    ok = true;
  } catch {
    ok = false;
  }
  return {
    label: `Temp directory writable (${dir})`,
    ok,
    hint: ok
      ? undefined
      : `Cannot write to ${dir}. Check filesystem permissions.`,
  };
}

// Aggregate

export interface EnvironmentReport {
  checks: CheckResult[];
  allOk: boolean;
}

export function runAllChecks(): EnvironmentReport {
  const checks = [
    checkLinux(),
    checkNodeVersion(),
    checkFfmpeg(),
    checkXvfb(),
    checkXdpyinfo(),
    checkChromium(),
    checkTmpWritable(),
  ];
  return { checks, allOk: checks.every(c => c.ok) };
}

// helpers

function formatInstallHint(
  name: string,
  archCmd: string,
  ubuntuCmd: string
): string {
  return [
    `${name} was not found on PATH.`,
    "",
    "Install it with:",
    `  Arch:   ${archCmd}`,
    `  Ubuntu: ${ubuntuCmd}`,
  ].join("\n");
}

const UNSUPPORTED_PLATFORM_MESSAGE = [
  "Sitecast currently supports Linux only.",
  "",
  "If you would like to help demonstrate demand for your platform, please",
  "reach out to the creator on X (https://x.com/_MSaaDH) or by email.",
].join("\n");
