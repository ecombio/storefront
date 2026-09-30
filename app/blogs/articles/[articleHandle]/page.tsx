import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArticlePage } from "@/components/blog/article-page";
import { getArticleByHandle, getBlog } from "@/lib/blog/server";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";
import { getShopifySitemapPage } from "@/lib/seo/server";

const PLACEHOLDER_HANDLE = "__placeholder__";

export async function generateStaticParams() {
  try {
    const { items } = await getShopifySitemapPage("BLOG", 1);
    const blogs = await Promise.all(
      items.map((item) => getBlog({ handle: item.handle, limit: 50 })),
    );
    const handles = blogs.flatMap((blog) => blog?.articles.map((article) => article.handle) ?? []);

    return handles.length > 0
      ? handles.map((articleHandle) => ({ articleHandle }))
      : [{ articleHandle: PLACEHOLDER_HANDLE }];
  } catch {
    return [{ articleHandle: PLACEHOLDER_HANDLE }];
  }
}

export async function generateMetadata({
  params,
}: PageProps<"/blogs/articles/[articleHandle]">): Promise<Metadata> {
  const { articleHandle } = await params;
  if (articleHandle === PLACEHOLDER_HANDLE) return {};
  const article = await getArticleByHandle({ articleHandle });
  if (!article) notFound();
  const pathname = `/blogs/articles/${article.handle}`;
  const images = article.image
    ? [
        {
          alt: article.image.altText,
          height: article.image.height,
          url: article.image.url,
          width: article.image.width,
        },
      ]
    : ["/og-default.png"];
  return {
    alternates: buildAlternates({ pathname }),
    description: article.seo.description,
    openGraph: buildOpenGraph({
      description: article.seo.description,
      images,
      title: article.seo.title,
      type: "article",
      url: pathname,
    }),
    title: article.seo.title,
    twitter: {
      card: "summary_large_image",
      description: article.seo.description,
      images,
      title: article.seo.title,
    },
  };
}

async function BlogArticleContent({ params }: PageProps<"/blogs/articles/[articleHandle]">) {
  const { articleHandle } = await params;
  if (articleHandle === PLACEHOLDER_HANDLE) notFound();
  const article = await getArticleByHandle({ articleHandle });
  if (!article) notFound();
  return <ArticlePage article={article} />;
}

export default function BlogArticleByHandlePage(
  props: PageProps<"/blogs/articles/[articleHandle]">,
) {
  return (
    <Suspense fallback={null}>
      <BlogArticleContent {...props} />
    </Suspense>
  );
}
