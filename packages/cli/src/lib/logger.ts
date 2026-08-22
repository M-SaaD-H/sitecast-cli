// Logger provides simple status output for the CLI.
//
// By default only status lines are printed. When verbose mode is active,
// all output including FFmpeg and Playwright logs is shown.

let _verbose = false;

export function setVerbose(value: boolean): void {
  _verbose = value;
}

export function isVerbose(): boolean {
  return _verbose;
}

export function status(message: string): void {
  process.stdout.write(message + "\n");
}

export function verbose(message: string): void {
  if (_verbose) {
    process.stdout.write(message + "\n");
  }
}

export function error(message: string): void {
  process.stderr.write(message + "\n");
}

export function warn(message: string): void {
  process.stderr.write("warning: " + message + "\n");
}
