import type { ChildProcess } from "child_process";

export interface FFmpegProcess {
  process: ChildProcess;
  outputPath: string;
}

export interface ScrollOptions {
  animationSettleMs: number;
  pauseAtTopMs: number;
  pauseAtBottomMs: number;
}

export interface RecordingOptions {
  viewport: {
    width: number;
    height: number;
  };
  fps?: number;
  enableDarkMode?: boolean;
  showBrowserFrame?: boolean;
  scroll: ScrollOptions;
}

export interface RecordingJob {
  jobId: string;
  url: string;
  options: RecordingOptions;
}

export interface RecordingResult {
  jobId: string;
  outputPath: string;
  durationSeconds: number;
  fileSizeBytes: number;
}
