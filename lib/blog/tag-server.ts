import { getBlog, getBlogList } from "@/lib/blog/server";
import { collectTags, tagToHandle, type BlogTag } from "@/lib/blog/tags";
import type { BlogArticle } from "@/lib/blog/types";

export async function getAllArticles(): Promise<BlogArticle[]> {
  const blogs = await getBlogList();
  const loaded = await Promise.all(blogs.map(({ handle }) => getBlog({ handle })));
  return loaded
    .flatMap((blog) => blog?.articles ?? [])
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export async function getAllTags(): Promise<BlogTag[]> {
  return collectTags(await getAllArticles());
}

export async function getTaggedArticles(
  tagHandle: string,
): Promise<{ articles: BlogArticle[]; label: string | undefined }> {
  const articles = await getAllArticles();
  const tagged = articles.filter((a) => a.tags.some((t) => tagToHandle(t) === tagHandle));
  const label = collectTags(tagged).find((t) => t.handle === tagHandle)?.label;
  return { articles: tagged, label };
}
