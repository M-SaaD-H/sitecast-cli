/**
 * Manages allocation of Xvfb virtual display numbers.
 *
 * Each concurrent recording job needs its own isolated X11 display so that
 * Xvfb processes and FFmpeg captures don't interfere with each other.
 * Display numbers start at XVFB_DISPLAY_START (default 99) and increment by 1
 * per slot. If all slots are busy, acquireDisplay() waits rather than throwing.
 */

const DISPLAY_START = parseInt(process.env.XVFB_DISPLAY_START ?? "99", 10);
const MAX_WORKERS = parseInt(process.env.MAX_CONCURRENT_WORKERS ?? "3", 10);

// Set of display numbers currently in use
const inUse = new Set<number>();

// Queue of resolve callbacks waiting for a free display
const waitQueue: Array<(display: number) => void> = [];

/**
 * Returns the next available display number.
 * If all displays are busy, waits until one is released.
 */
export function acquireDisplay(): Promise<number> {
  return new Promise((resolve) => {
    const display = findFreeDisplay();
    if (display !== null) {
      inUse.add(display);
      resolve(display);
    } else {
      // Park this request until releaseDisplay() finds room
      waitQueue.push(resolve);
    }
  });
}

/**
 * Returns a display number back to the pool.
 * Wakes up any waiting acquireDisplay() calls in FIFO order.
 */
export function releaseDisplay(display: number): void {
  inUse.delete(display);

  if (waitQueue.length > 0) {
    const next = waitQueue.shift()!;
    const newDisplay = findFreeDisplay();
    if (newDisplay !== null) {
      inUse.add(newDisplay);
      next(newDisplay);
    } else {
      // Should never happen — we just freed one — but push back to be safe
      waitQueue.unshift(next);
    }
  }
}

function findFreeDisplay(): number | null {
  for (let i = 0; i < MAX_WORKERS; i++) {
    const candidate = DISPLAY_START + i;
    if (!inUse.has(candidate)) {
      return candidate;
    }
  }
  return null;
}
