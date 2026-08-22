/**
 * FFmpeg process wrapper for x11grab screen recording.
 *
 * Captures from an Xvfb virtual display at 30fps using libx264.
 * The stop function sends 'q' to stdin for a clean mux, never SIGKILL,
 * which would corrupt the MP4 container.
 */

import { spawn } from "child_process";
import type { FFmpegProcess } from "./types";

const FFMPEG_BIN = process.env.FFMPEG_BIN ?? "ffmpeg";
const RECORDING_FPS = 30;
// Maximum time to wait for FFmpeg to finish muxing after sending 'q'
const STOP_TIMEOUT_MS = 15_000;

/**
 * Starts an FFmpeg x11grab recording from the given Xvfb display.
 * Returns immediately, recording happens asynchronously in the child process.
 */
export function startRecording(
  display: string,
  outputPath: string,
  resolution: string,
): FFmpegProcess {
  const args = [
    "-y", // overwrite without prompting
    // Input: x11grab from the virtual display
    "-f", "x11grab",
    "-r", String(RECORDING_FPS),
    "-s", resolution,
    "-draw_mouse", "0",
    "-i", `${display}+0,0`,
    // Encoding: libx264, visually lossless quality, fast preset, yuv420p for
    // broad player compatibility
    "-vcodec", "libx264",
    "-crf", "23",
    "-preset", "fast",
    "-pix_fmt", "yuv420p",
    outputPath,
  ];

  const proc = spawn(FFMPEG_BIN, args, {
    stdio: ["pipe", "pipe", "pipe"],
    // Prevent FFmpeg from inheriting the host display — it reads from x11grab
    env: { ...process.env, DISPLAY: display },
  });

  // Surface FFmpeg stderr for debugging without polluting stdout
  proc.stderr?.on("data", (chunk: Buffer) => {
    process.stderr.write(`[ffmpeg:${display}] ${chunk.toString()}`);
  });

  return { process: proc, outputPath };
}

/**
 * Gracefully stops an FFmpeg recording by sending 'q' to its stdin.
 * Waits for the process to exit and flush the MP4 container.
 * Falls back to SIGTERM after STOP_TIMEOUT_MS if the process hangs.
 */
export function stopRecording(proc: FFmpegProcess): Promise<void> {
  return new Promise((resolve, reject) => {
    const { process: ffmpeg } = proc;

    const timeout = setTimeout(() => {
      // Fallback: SIGTERM (not SIGKILL) to give FFmpeg one last chance to flush
      ffmpeg.kill("SIGTERM");
      reject(
        new Error(
          `FFmpeg did not exit within ${STOP_TIMEOUT_MS}ms, sent SIGTERM`
        )
      );
    }, STOP_TIMEOUT_MS);

    ffmpeg.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0 || code === 255) {
        // FFmpeg exits with 255 when killed by signal after 'q' -> still valid
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    // 'q' triggers a clean shutdown and container finalization
    ffmpeg.stdin?.write("q\n");
    ffmpeg.stdin?.end();
  });
}
