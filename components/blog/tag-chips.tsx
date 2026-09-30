import Link from "next/link";

import type { BlogTag } from "@/lib/blog/tags";

export interface TagChipsProps {
  active?: string;
  tags: BlogTag[];
}

export function TagChips({ active, tags }: TagChipsProps) {
  if (tags.length === 0) return null;
  return (
    <nav aria-label="Article tags" className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          aria-current={tag.handle === active ? "page" : undefined}
          className={
            tag.handle === active
              ? "border border-foreground bg-foreground px-3 py-1.5 text-background text-xs"
              : "border px-3 py-1.5 text-muted-foreground text-xs hover:border-foreground hover:text-foreground"
          }
          href={`/blogs/tag/${tag.handle}`}
          key={tag.handle}
        >
          {tag.label}
        </Link>
      ))}
    </nav>
  );
}
