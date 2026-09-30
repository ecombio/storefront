"use client";

import { useEffect } from "react";

// Publishes article reading progress (0 to 1) as --reading-progress on <html>.
// The header renders the actual bar. data-reading tells it an article is on screen.
export function ReadingProgress({
  targetSelector = "[data-article-body]",
}: {
  targetSelector?: string;
}) {
  useEffect(() => {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    const root = document.documentElement;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress =
        total <= 0 ? (rect.top <= 0 ? 1 : 0) : Math.min(1, Math.max(0, -rect.top / total));
      root.style.setProperty("--reading-progress", String(progress));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    root.dataset.reading = "";
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(target);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      delete root.dataset.reading;
      root.style.removeProperty("--reading-progress");
    };
  }, [targetSelector]);

  return null;
}
