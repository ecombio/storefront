import type { AuthorProfile, BlogArticle } from "@/lib/blog/types";
import type { ShopifyArticle, ShopifyBlog } from "@/lib/shopify/transforms/blogs/types";

function transformAuthorProfile(meta: ShopifyArticle["authorProfile"]): AuthorProfile | undefined {
  const ref = meta?.reference;
  const name = ref?.name?.value;
  if (!ref || !name) return undefined;
  const image = ref.photo?.reference?.image;
  return {
    bio: ref.bio?.value ?? undefined,
    handle: ref.handle,
    name,
    photo: image
      ? {
          altText: image.altText ?? name,
          height: image.height ?? 0,
          url: image.url,
          width: image.width ?? 0,
        }
      : undefined,
    role: ref.role?.value ?? undefined,
  };
}

export function transformArticle(article: ShopifyArticle, blog: ShopifyBlog): BlogArticle {
  return {
    author: article.authorV2?.name,
    authorProfile: transformAuthorProfile(article.authorProfile),
    blogHandle: blog.handle,
    blogTitle: blog.title,
    body: article.contentHtml,
    excerpt: article.excerpt ?? article.content,
    handle: article.handle,
    image: article.image
      ? {
          altText: article.image.altText ?? article.title,
          height: article.image.height ?? 0,
          url: article.image.url,
          width: article.image.width ?? 0,
        }
      : null,
    publishedAt: article.publishedAt,
    seo: {
      description: article.seo?.description ?? article.excerpt ?? article.content,
      title: article.seo?.title ?? article.title,
    },
    tags: article.tags ?? [],
    title: article.title,
  };
}
