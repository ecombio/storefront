"use client";

import { cn } from "cn";
import { LayoutGridIcon, ListIcon, SlidersHorizontalIcon } from "lucide-react";
import { createContext, type ReactNode, useContext, useState } from "react";

import { CollectionActiveFilterCountBadge } from "./collection-browse-provider";

const FILTER_SIDEBAR_ID = "collection-filter-sidebar";

// --header-offset / --header-offset-transition are published by NavScrollBehavior: the header's
// visible height (0px while hidden) and the matching `top` transition, so these follow the header.
// The sidebar sits below the sticky toolbar (about 4rem tall). It reuses the sheet's tweaks
// (no scroll fade, no bottom padding); the "Filters" title is hidden because the toggle
// button replaces it, and the Reset chip stays.
const SIDEBAR_BASE =
  "lg:sticky lg:top-[calc(var(--header-offset,0px)_+_4.5rem)] lg:max-h-[calc(100vh_-_var(--header-offset,0px)_-_5.5rem)] lg:[transition:var(--header-offset-transition,none)] lg:self-start lg:overflow-y-auto lg:pr-2 [&_[data-slot=filter-sidebar-scroll-fade]]:hidden [&_[data-slot=filter-sidebar]]:overflow-y-visible [&_[data-slot=filter-sidebar]>div]:!pb-0 [&_[data-slot=filter-sidebar-header]>h2]:hidden [&_[data-slot=filter-sidebar-header]:not(:has(button))]:hidden";

const TOOLBAR_CLASS =
  "sticky top-[var(--header-offset,0px)] z-20 border-b border-border bg-background py-3 [transition:var(--header-offset-transition,none)]";

export type BrowseView = "grid" | "list";

const FilterSidebarContext = createContext<{
  collapsed: boolean;
  setView: (view: BrowseView) => void;
  toggle: () => void;
  view: BrowseView;
} | null>(null);

// Falls back to "grid" outside the collection layout (e.g. the search page).
export function useBrowseView(): BrowseView {
  return useContext(FilterSidebarContext)?.view ?? "grid";
}

export function FilterSidebarLayout({
  children,
  sidebar,
  toolbar,
}: {
  children: ReactNode;
  sidebar: ReactNode;
  toolbar: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [view, setView] = useState<BrowseView>("grid");

  return (
    <FilterSidebarContext
      value={{ collapsed, setView, toggle: () => setCollapsed((value) => !value), view }}
    >
      <div data-collapsed={collapsed} data-view={view} className="group/browse flex flex-col gap-5">
        <div className={TOOLBAR_CLASS}>{toolbar}</div>
        <div
          className={cn(
            "lg:grid lg:gap-10",
            collapsed ? "lg:grid-cols-1" : "lg:grid-cols-[16rem_minmax(0,1fr)]",
          )}
        >
          <aside
            id={FILTER_SIDEBAR_ID}
            className={cn(SIDEBAR_BASE, collapsed ? "hidden" : "hidden lg:block")}
          >
            {sidebar}
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </FilterSidebarContext>
  );
}

// Same look as the mobile "Filters" button; on desktop it collapses/expands the sidebar.
export function FilterSidebarToggle() {
  const context = useContext(FilterSidebarContext);
  if (!context) return null;
  const { collapsed, toggle } = context;

  return (
    <button
      type="button"
      aria-controls={FILTER_SIDEBAR_ID}
      aria-expanded={!collapsed}
      className="hidden cursor-pointer items-center gap-2 text-sm font-medium lg:flex"
      onClick={toggle}
    >
      <SlidersHorizontalIcon className="size-4" />
      <span>Filters</span>
      <CollectionActiveFilterCountBadge />
    </button>
  );
}

const VIEW_OPTIONS = [
  { Icon: LayoutGridIcon, label: "Grid view", value: "grid" },
  { Icon: ListIcon, label: "List view", value: "list" },
] as const;

export function ViewToggle() {
  const context = useContext(FilterSidebarContext);
  if (!context) return null;
  const { setView, view } = context;

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <span className="hidden sm:inline">View as:</span>
      <div role="group" aria-label="View as" className="flex items-center gap-1.5">
        {VIEW_OPTIONS.map(({ Icon, label, value }) => (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={view === value}
            className={cn(
              "flex size-9 cursor-pointer items-center justify-center rounded-full border transition-colors",
              view === value
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:bg-accent",
            )}
            onClick={() => setView(value)}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
