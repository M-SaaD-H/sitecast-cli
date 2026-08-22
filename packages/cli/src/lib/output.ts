// Output path resolution and file-handling utilities.

import path from "path";
import { mkdir, copyFile, unlink, access, constants } from "fs/promises";
import { existsSync } from "fs";

/**
 * Returns the absolute output path for a render operation.
 *
 * If the user did not supply --output, a filename is derived from the current
 * timestamp so repeated runs do not overwrite each other.
 */
export function resolveOutputPath(userPath?: string): string {
  if (userPath) {
    return path.resolve(userPath);
  }
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19);
  return path.resolve(`sitecast-${timestamp}.mp4`);
}

/**
 * Ensures the directory containing the output path exists.
 * Creates it (and any missing parents) if necessary.
 */
export async function ensureOutputDir(outputPath: string): Promise<void> {
  const dir = path.dirname(outputPath);
  await mkdir(dir, { recursive: true });
}

/**
 * Validates the output path before rendering starts.
 *
 * Checks:
 *   - The extension must be .mp4.
 *   - If the file already exists, this function returns false to let the
 *     caller decide whether to overwrite.
 */
export function validateOutputPath(outputPath: string): {
  valid: boolean;
  reason?: string;
  exists: boolean;
} {
  const ext = path.extname(outputPath).toLowerCase();
  if (ext !== ".mp4") {
    return {
      valid: false,
      reason: `Output file must have the .mp4 extension. Got: ${path.basename(outputPath)}`,
      exists: false,
    };
  }
  return { valid: true, exists: existsSync(outputPath) };
}

/**
 * Moves the renderer's temp output to the final destination.
 * Uses copy-then-delete so it works across filesystem boundaries (e.g. /tmp
 * on a tmpfs vs the user's home directory on a separate partition).
 */
export async function moveOutput(
  tempPath: string,
  destPath: string
): Promise<void> {
  await copyFile(tempPath, destPath);
  await unlink(tempPath).catch(() => {
    // Non-fatal. The file is in /tmp and will be cleaned up by the OS.
  });
}

/**
 * Returns a human-readable file size string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Returns a human-readable duration string.
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

/**
 * Checks whether the given directory is writable by attempting to stat it.
 */
export async function isDirectoryWritable(dir: string): Promise<boolean> {
  try {
    await access(dir, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}
