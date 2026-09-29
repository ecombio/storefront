"use client";

import { cn } from "cn";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

// Horizontally scrollable region with soft edge fades: the right fade shows while more content
// is off-screen, the left fade appears after scrolling. No visible scrollbar.
//
// The fades are zero-width sticky spacers INSIDE the scroller (not a `relative` wrapper), so
// absolutely positioned dropdowns inside the content still anchor to the outer <nav>.
// `className` styles the scroller (e.g. "min-w-0 flex-1"); `innerClassName` styles the content row.
export function ScrollFade({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft > 4,
      end: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (inner) observer.observe(inner);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [update]);

  const fade = "pointer-events-none absolute inset-y-0 w-10 from-background to-transparent";

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <div aria-hidden="true" className="sticky left-0 z-10 w-0 shrink-0 self-stretch">
        <div
          className={cn(
            fade,
            "left-0 bg-gradient-to-r bg-linear-to-r transition-opacity duration-200",
            edges.start ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
      <div ref={innerRef} className={cn("flex shrink-0 items-center", innerClassName)}>
        {children}
      </div>
      <div aria-hidden="true" className="sticky right-0 z-10 w-0 shrink-0 self-stretch">
        <div
          className={cn(
            fade,
            "right-0 bg-gradient-to-l bg-linear-to-l transition-opacity duration-200",
            edges.end ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    </div>
  );
}
