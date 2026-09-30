import type { BlogArticle } from "@/lib/blog/types";

export interface BlogTag {
  count: number;
  handle: string;
  label: string;
}

export function tagToHandle(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function collectTags(articles: BlogArticle[]): BlogTag[] {
  const map = new Map<string, BlogTag>();
  for (const article of articles) {
    for (const label of article.tags) {
      const handle = tagToHandle(label);
      if (!handle) continue;
      const existing = map.get(handle);
      if (existing) existing.count += 1;
      else map.set(handle, { count: 1, handle, label });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
