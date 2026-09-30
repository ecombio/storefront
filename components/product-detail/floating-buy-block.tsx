"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

// Sticks to the bottom of the screen; the shadow shows only while it's floating over content.
export function FloatingBuyBlock({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFloating(entry.intersectionRatio < 1),
      { rootMargin: "0px 0px -1px 0px", threshold: [1] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      id="primary-buy-buttons"
      ref={ref}
      data-floating={floating}
      className="sticky bottom-0 z-10 -ml-2 pl-2 [clip-path:inset(-24px_0_0_0)] border-t border-transparent bg-background pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] data-[floating=true]:border-border/50 data-[floating=true]:shadow-[0_-8px_16px_-4px_rgb(0_0_0/0.12)]"
    >
      {children}
    </div>
  );
}
