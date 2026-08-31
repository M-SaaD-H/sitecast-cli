// Tests for output path utilities.

import { test } from "node:test";
import assert from "node:assert/strict";
import { validateOutputPath, formatBytes, formatDuration } from "../src/lib/output";

test("validateOutputPath accepts .mp4 extensions", () => {
  const r = validateOutputPath("/tmp/video.mp4");
  assert.equal(r.valid, true);
});

test("validateOutputPath rejects non-.mp4 extensions", () => {
  const r = validateOutputPath("/tmp/video.mkv");
  assert.equal(r.valid, false);
  assert.ok(r.reason?.includes(".mp4"));
});

test("validateOutputPath rejects no extension", () => {
  const r = validateOutputPath("/tmp/video");
  assert.equal(r.valid, false);
});

test("formatBytes shows bytes below 1 KB", () => {
  assert.equal(formatBytes(500), "500 B");
});

test("formatBytes shows KB between 1 KB and 1 MB", () => {
  assert.ok(formatBytes(2048).includes("KB"));
});

test("formatBytes shows MB at 1 MB and above", () => {
  assert.ok(formatBytes(1024 * 1024 * 5).includes("MB"));
});

test("formatDuration shows seconds only below 1 minute", () => {
  assert.equal(formatDuration(45), "45s");
});

test("formatDuration shows minutes and seconds", () => {
  assert.equal(formatDuration(125), "2m 5s");
});
