"use client";

import { type ReactNode, useEffect, useState } from "react";

export type ProductTab = { id: string; label: string; content: ReactNode };

// Tabs act as a table of contents: every panel is stacked on the page, and a tab scrolls to its panel.
export function ProductTabs({ tabs }: { tabs: ProductTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const ids = tabs.map((t) => t.id).join(",");

  useEffect(() => {
    const panels = ids
      .split(",")
      .map((id) => document.getElementById(`panel-${id}`))
      .filter((el): el is HTMLElement => el !== null);
    if (panels.length < 2) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id.replace("panel-", ""));
        }
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    for (const panel of panels) observer.observe(panel);
    return () => observer.disconnect();
  }, [ids]);

  if (tabs.length === 0) return null;

  const go = (id: string) => {
    setActive(id);
    document.getElementById(`panel-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="grid gap-10" data-slot="product-tabs">
      <nav
        aria-label="Product details"
        className="sticky top-[var(--header-offset,0px)] z-20 border-b border-border bg-background"
        style={{ transition: "var(--header-offset-transition, none)" }}
      >
        <div className="flex gap-6 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-current={tab.id === active ? "true" : undefined}
              onClick={() => go(tab.id)}
              className={`-mb-px shrink-0 cursor-pointer border-b-2 py-3 text-sm font-semibold whitespace-nowrap ${
                tab.id === active
                  ? "border-foreground text-foreground"
                  : "border-transparent text-foreground/60 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
      {tabs.map((tab) => (
        <div key={tab.id} id={`panel-${tab.id}`} className="scroll-mt-28">
          {tab.content}
        </div>
      ))}
    </section>
  );
}
