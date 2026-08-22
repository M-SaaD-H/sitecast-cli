/**
 * Public API for rendering engine
 *
 * The renderer records a website as an MP4 video.
 * It knows nothing about HTTP, queues, databases, or cloud storage.
 *
 * Usage:
 *   const result = await recordWebsite(job);
 *   // result.outputPath is the local temp MP4 path
 *   // Caller is responsible for persisting / uploading the file
 */

export { recordWebsite } from "./recorder";
