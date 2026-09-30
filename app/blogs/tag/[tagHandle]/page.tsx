import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArticleTile } from "@/components/blog/article-tile";
import { BlogSubNav } from "@/components/blog/blog-sub-nav";
import { LoadMoreGrid } from "@/components/blog/load-more-grid";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { getBlogList } from "@/lib/blog/server";
import { getAllTags, getTaggedArticles } from "@/lib/blog/tag-server";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const PLACEHOLDER_HANDLE = "__placeholder__";

export async function generateStaticParams() {
  try {
    const tags = await getAllTags();
    return tags.length > 0
      ? tags.map(({ handle }) => ({ tagHandle: handle }))
      : [{ tagHandle: PLACEHOLDER_HANDLE }];
  } catch {
    return [{ tagHandle: PLACEHOLDER_HANDLE }];
  }
}

export async function generateMetadata({
  params,
}: PageProps<"/blogs/tag/[tagHandle]">): Promise<Metadata> {
  const { tagHandle } = await params;
  if (tagHandle === PLACEHOLDER_HANDLE) return {};
  const { label } = await getTaggedArticles(tagHandle);
  if (!label) notFound();
  const pathname = `/blogs/tag/${tagHandle}`;
  const description = `Articles tagged ${label}`;
  return {
    alternates: buildAlternates({ pathname }),
    description,
    openGraph: buildOpenGraph({ description, title: label, type: "website", url: pathname }),
    title: label,
  };
}

async function BlogTagContent({ params }: PageProps<"/blogs/tag/[tagHandle]">) {
  const { tagHandle } = await params;
  if (tagHandle === PLACEHOLDER_HANDLE) notFound();
  const [{ articles, label }, blogs] = await Promise.all([
    getTaggedArticles(tagHandle),
    getBlogList(),
  ]);
  if (!label) notFound();

  return (
    <Page className="pt-2.5 md:pt-10">
      <Container>
        <Sections className="gap-8">
          <BlogSubNav active="" blogs={blogs} />
          <h1 className="font-semibold text-4xl uppercase tracking-tight md:text-6xl">{label}</h1>
          <section className="grid gap-4">
            <h2 className="text-xs uppercase tracking-wide">The latest</h2>
            <LoadMoreGrid
              className="grid gap-x-6 gap-y-10 sm:grid-cols-2"
              items={articles.map((article) => (
                <ArticleTile article={article} category={article.blogTitle} key={article.handle} />
              ))}
            />
          </section>
        </Sections>
      </Container>
    </Page>
  );
}

export default function BlogTagPage(props: PageProps<"/blogs/tag/[tagHandle]">) {
  return (
    <Suspense fallback={null}>
      <BlogTagContent {...props} />
    </Suspense>
  );
}
