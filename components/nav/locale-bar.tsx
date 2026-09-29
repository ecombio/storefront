"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function UsFlag({ className = "" }: { className?: string }) {
  const h = 27 / 13;
  return (
    <svg
      viewBox="0 0 40 27"
      width="22"
      height="15"
      className={`shrink-0 rounded-[2px] ${className}`}
      aria-hidden="true"
    >
      <rect width="40" height="27" fill="#fff" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} y={i * 2 * h} width="40" height={h} fill="#d80027" />
      ))}
      <rect width="16" height={7 * h} fill="#2e52b2" />
    </svg>
  );
}

function StripeFlag({ colors, dir }: { colors: [string, string, string]; dir: "h" | "v" }) {
  return (
    <svg
      viewBox="0 0 40 27"
      width="22"
      height="15"
      className="shrink-0 rounded-[2px] border border-black/10"
      aria-hidden="true"
    >
      {colors.map((fill, i) =>
        dir === "h" ? (
          <rect key={i} y={i * 9} width="40" height="9" fill={fill} />
        ) : (
          <rect key={i} x={i * (40 / 3)} width={40 / 3 + 0.1} height="27" fill={fill} />
        ),
      )}
    </svg>
  );
}

// Placeholder rows so the list looks like the reference. Replace or trim later.
const COUNTRIES: {
  name: string;
  language: string;
  colors: [string, string, string];
  dir: "h" | "v";
}[] = [
  { name: "Austria", language: "Deutsch", colors: ["#d80027", "#ffffff", "#d80027"], dir: "h" },
  { name: "Belgium", language: "Français", colors: ["#000000", "#ffda44", "#d80027"], dir: "v" },
  { name: "France", language: "Français", colors: ["#0052b4", "#ffffff", "#d80027"], dir: "v" },
];

export function LocaleBar() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // The header hides on scroll, so close the panel with it.
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative flex items-center gap-3">
      <button
        type="button"
        aria-label="Choose location"
        aria-expanded={open}
        aria-controls="location-panel"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-md p-1 hover:opacity-70 transition-opacity"
      >
        <UsFlag />
        <ChevronDown
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <div className="flex items-center gap-2">
        <span className="underline" aria-current="true">
          English
        </span>
        <span aria-hidden="true">|</span>
        <button type="button" title="Coming soon" className="hover:opacity-70 transition-opacity">
          Español
        </button>
      </div>

      {open && (
        <div
          id="location-panel"
          role="dialog"
          aria-label="Choose location"
          className="absolute right-0 top-full z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-background text-sm font-normal shadow-lg"
        >
          {/* Header */}
          <div className="relative flex items-center justify-center px-6 pt-5">
            <h2 className="text-base font-bold">Choose location</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-3 flex size-9 items-center justify-center rounded-full hover:bg-muted"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="px-6 pb-2 pt-4">
            <p className="mb-4 text-muted-foreground">
              Changing your location might affect your delivery address options, price, product
              availability, and currency.
            </p>

            {/* Search (static for now) */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search your country"
                aria-label="Search your country"
                className="h-12 w-full rounded-lg border border-border bg-background pl-3 pr-11 text-sm"
              />
              <Search
                className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Current country */}
          <div className="px-6 pt-3">
            <p className="mb-2 font-bold">Current country &amp; language</p>
            <div className="flex items-center gap-2 py-2">
              <UsFlag />
              <span className="flex-1">United States</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                English
                <ChevronDown className="size-4" aria-hidden="true" />
              </span>
            </div>
            <hr className="my-2 border-border" />
          </div>

          {/* Other countries */}
          <ul className="max-h-44 overflow-y-auto px-6 pb-4">
            {COUNTRIES.map((c) => (
              <li key={c.name} className="flex items-center gap-2 py-2.5">
                <StripeFlag colors={c.colors} dir={c.dir} />
                <span className="flex-1 font-medium">{c.name}</span>
                <span className="text-muted-foreground">{c.language}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
