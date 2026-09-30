"use client";

import { useState, type ReactNode } from "react";

export interface LoadMoreGridProps {
  className?: string;
  items: ReactNode[];
  pageSize?: number;
}

export function LoadMoreGrid({ className, items, pageSize = 6 }: LoadMoreGridProps) {
  const [visible, setVisible] = useState(pageSize);
  const shown = Math.min(visible, items.length);

  return (
    <>
      <div className={className}>{items.slice(0, visible)}</div>
      {items.length > 0 && (
        <div className="grid justify-items-center gap-3">
          {visible < items.length && (
            <button
              className="bg-foreground px-6 py-3 font-medium text-background text-xs"
              onClick={() => setVisible((count) => count + pageSize)}
              type="button"
            >
              Load More
            </button>
          )}
          <p className="text-muted-foreground text-xs">
            Viewing 1 - {shown} of {items.length} articles
          </p>
        </div>
      )}
    </>
  );
}
