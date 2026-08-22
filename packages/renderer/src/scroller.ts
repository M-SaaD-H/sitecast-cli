/**
 * Scroll engine for the recording session.
 *
 * Designed to mimic a real human browsing a webpage:
 *   1. Section-by-Section Reading: Scrolls down one viewport at a time, pausing to read.
 *   2. Natural Scroll Physics: Uses a lerp (linear interpolation) function to create
 *      an ease-out effect. A swipe starts fast and gently decelerates to a stop.
 *   3. Variable Reading Speed: Section pause durations are randomized across three tiers
 *      to simulate skimming (1.5-3s), normal reading (3-5s), and deep reading (5-8s).
 *   4. Variable Scroll Momentum: The easing factor varies randomly per section so some
 *      swipes are aggressive and others are gentle.
 *   5. Infinite Scroll / Lazy-load Awareness: Dynamically re-measures the page height
 *      on every iteration and after pausing at the bottom. If new content loads (like
 *      a Twitter feed), the "human" continues scrolling.
 */

import type { Page } from "playwright";
import type { ScrollOptions } from "./types";

// Lerp factor: what fraction of remaining distance to cover each frame
const BASE_EASING_FACTOR = 0.06;

// Target frame rate for the scroll animation
const SCROLL_FPS = 30;

export async function runScrollSession(
  page: Page,
  options: ScrollOptions
): Promise<void> {
  await sleep(options.animationSettleMs);
  await sleep(options.pauseAtTopMs);

  const viewportHeight: number = await page.evaluate(() => window.innerHeight);

  // Check if the page is scrollable at all
  const initialMaxScroll = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight
  );
  if (initialMaxScroll <= 0) {
    await sleep(3000);
    return;
  }

  // Section-by-section loop.
  // We re-measure scrollHeight on every iteration so we correctly handle pages
  // that lazy-load more content as you scroll
  let currentScrollY = 0;
  let sectionIndex = 1;

  while (true) {
    // Re-measure the live scrollable height each iteration
    const liveScrollHeight: number = await page.evaluate(
      () => document.documentElement.scrollHeight
    );
    const liveMaxScroll = liveScrollHeight - viewportHeight;

    // Target is the next viewport-height boundary, clamped to the live maximum
    const targetY = Math.min(sectionIndex * viewportHeight, liveMaxScroll);

    // If we're already at or past the target (can happen when lazy content
    // hasn't loaded yet and the previous scroll overshot slightly), advance
    // without scrolling to avoid a duplicate pause.
    if (targetY <= currentScrollY + 1) {
      // Check whether we've genuinely reached the bottom (allow 2px margin for fractional pixels)
      if (currentScrollY >= liveMaxScroll - 2) break;
      sectionIndex++;
      continue;
    }

    // Slightly vary easing factor per section
    const easingFactor = BASE_EASING_FACTOR * (0.7 + Math.random() * 0.6);
    await smoothScrollTo(page, targetY, easingFactor);
    currentScrollY = targetY;

    // Check if we've reached the bottom after scrolling (allow 2px margin)
    const afterMaxScroll: number = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight
    );
    let atBottom = currentScrollY >= afterMaxScroll - 2;

    // Always pause to read after a section
    await sleep(sectionPauseMs());

    if (atBottom) {
      // Re-measure in case the pause allowed lazy content/infinite scroll to load
      const finalMaxScroll = await page.evaluate(
        () => document.documentElement.scrollHeight - window.innerHeight
      );
      if (currentScrollY >= finalMaxScroll - 2) {
        break;
      }
      // Content grew while we were paused. Continue the loop.
      atBottom = false;
    }

    sectionIndex++;
  }

  await sleep(options.pauseAtBottomMs);
}

/**
 * Returns a randomised pause duration that feels human:
 *   - 60% of sections: quick read (1–2s)
 *   - 25% of sections: normal read (2–3s)
 *   - 15% of sections: long read (3–8s)
 */
function sectionPauseMs(): number {
  const r = Math.random();
  if (r < 0.6) {
    return 1000 + Math.random() * 1000;   // 1–2s
  } else if (r < 0.85) {
    return 2000 + Math.random() * 1000;   // 2–3s
  } else {
    return 3000 + Math.random() * 5000;   // 3–5s
  }
}

/**
 * Eases the scroll position toward targetY using a lerp approach.
 * Feels like ease-out (fast at first, then gently settles at the target).
 * Throttled to SCROLL_FPS so the animation is smooth on the recording.
 */
async function smoothScrollTo(
  page: Page,
  targetY: number,
  easingFactor: number
): Promise<void> {
  await page.evaluate(
    ({ targetY, easingFactor, frameBudget }: { targetY: number; easingFactor: number; frameBudget: number }) => {
      return new Promise<void>((resolve) => {
        let lastTime = 0;
        let lastScrollY: number | null = null;
        let stuckFrames = 0;

        const tick = (timestamp: number) => {
          // Throttle to target FPS
          if (timestamp - lastTime < frameBudget) {
            requestAnimationFrame(tick);
            return;
          }
          lastTime = timestamp;

          const current = window.scrollY;
          const distance = targetY - current;

          if (lastScrollY !== null && current === lastScrollY) {
            stuckFrames++;
          } else {
            stuckFrames = 0;
          }

          // Settled - snap to target and resolve
          // OR if we hit a physical boundary and couldn't
          // scroll any further for 3 consecutive frames
          if (Math.abs(distance) <= 1 || stuckFrames >= 3) {
            window.scrollTo(0, targetY);
            resolve();
            return;
          }
          lastScrollY = current;

          // Lerp step: fraction of remaining distance, clamped to [1.5, 8] px
          // This gives a natural ease-out: fast start, gentle deceleration
          const step =
            Math.sign(distance) *
            Math.min(Math.max(Math.abs(distance * easingFactor), 1.5), 8);

          window.scrollBy(0, step);
          requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      });
    },
    { targetY, easingFactor, frameBudget: 1000 / SCROLL_FPS }
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
