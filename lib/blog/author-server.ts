import { getBlogArticle } from "@/lib/blog/server";
import { getAllArticles } from "@/lib/blog/tag-server";
import { tagToHandle } from "@/lib/blog/tags";
import type { AuthorProfile, BlogArticle } from "@/lib/blog/types";

export interface BlogAuthor {
  count: number;
  handle: string;
  name: string;
}

// The Author metaobject's handle wins; posts without a profile fall back to the staff name.
function authorKey(article: BlogArticle): string | undefined {
  if (article.authorProfile?.handle) return article.authorProfile.handle;
  return article.author ? tagToHandle(article.author) : undefined;
}

export async function getAllAuthors(): Promise<BlogAuthor[]> {
  const map = new Map<string, BlogAuthor>();
  for (const article of await getAllArticles()) {
    const handle = authorKey(article);
    const name = article.authorProfile?.name ?? article.author;
    if (!handle || !name) continue;
    const existing = map.get(handle);
    if (existing) existing.count += 1;
    else map.set(handle, { count: 1, handle, name });
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function getAuthorArticles(authorHandle: string): Promise<{
  articles: BlogArticle[];
  profile: AuthorProfile | undefined;
}> {
  const articles = (await getAllArticles()).filter((a) => authorKey(a) === authorHandle);
  const newest = articles[0];
  if (!newest) return { articles: [], profile: undefined };

  // List queries only carry the handle and name, so load the newest full article for the rest.
  const full = await getBlogArticle({
    articleHandle: newest.handle,
    blogHandle: newest.blogHandle,
  });
  const name = newest.authorProfile?.name ?? newest.author;
  return { articles, profile: full?.authorProfile ?? (name ? { name } : undefined) };
}
