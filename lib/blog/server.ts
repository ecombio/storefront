import { cacheLife, cacheTag } from "next/cache";

import type { Blog, BlogArticle } from "@/lib/blog/types";
import type { CommerceLocale } from "@/lib/config/types";
import { fetchBlog, fetchBlogArticle } from "@/lib/shopify/operations/blogs/server";
import { fetchCollectionArticles } from "@/lib/shopify/operations/collections/server";

export async function getBlog(params: {
  handle: string;
  limit?: number;
  locale?: CommerceLocale;
}): Promise<Blog | undefined> {
  "use cache";
  cacheLife("max");
  cacheTag("articles", "blogs", `blog-${params.handle}`);

  return fetchBlog(params);
}

export async function getBlogArticle(params: {
  articleHandle: string;
  blogHandle: string;
  locale?: CommerceLocale;
}): Promise<BlogArticle | undefined> {
  "use cache";
  cacheLife("max");
  cacheTag(
    "articles",
    "blogs",
    `article-${params.blogHandle}-${params.articleHandle}`,
    `blog-${params.blogHandle}`,
  );

  return fetchBlogArticle(params);
}

export async function getCollectionArticles(params: {
  handle: string;
  locale?: CommerceLocale;
}): Promise<BlogArticle[]> {
  "use cache";
  cacheLife("max");
  cacheTag("articles", "collections", `collection-${params.handle}`);

  return fetchCollectionArticles(params);
}
