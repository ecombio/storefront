import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArticleCard } from "@/components/blog/article-card";
import { BlogSubNav } from "@/components/blog/blog-sub-nav";
import { Container } from "@/components/ui/container";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { getBlog, getBlogList } from "@/lib/blog/server";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";
import { getShopifySitemapPage } from "@/lib/seo/server";

const PLACEHOLDER_HANDLE = "__placeholder__";

export async function generateStaticParams() {
  try {
    const { items } = await getShopifySitemapPage("BLOG", 1);
    const handles = items.map((item) => item.handle);
    return handles.length > 0
      ? handles.map((categoryHandle) => ({ categoryHandle }))
      : [{ categoryHandle: PLACEHOLDER_HANDLE }];
  } catch {
    return [{ categoryHandle: PLACEHOLDER_HANDLE }];
  }
}

export async function generateMetadata({
  params,
}: PageProps<"/blogs/category/[categoryHandle]">): Promise<Metadata> {
  const { categoryHandle } = await params;
  if (categoryHandle === PLACEHOLDER_HANDLE) return {};
  const blog = await getBlog({ handle: categoryHandle });
  if (!blog) notFound();
  const pathname = `/blogs/category/${blog.handle}`;
  return {
    alternates: buildAlternates({ pathname }),
    description: blog.seo.description,
    openGraph: buildOpenGraph({
      description: blog.seo.description,
      title: blog.seo.title,
      type: "website",
      url: pathname,
    }),
    title: blog.seo.title,
  };
}

async function BlogCategoryContent({ params }: PageProps<"/blogs/category/[categoryHandle]">) {
  const { categoryHandle } = await params;
  if (categoryHandle === PLACEHOLDER_HANDLE) notFound();
  const blog = await getBlog({ handle: categoryHandle });
  if (!blog) notFound();

  const blogs = await getBlogList();
  const [hero, ...rest] = blog.articles;
  const heroHref = hero ? `/blogs/articles/${hero.handle}` : "";

  return (
    <Page className="pt-2.5 md:pt-10">
      <Container>
        <Sections className="gap-8">
          <BlogSubNav active={blog.handle} blogs={blogs} />
          <h1 className="text-3xl uppercase sm:text-4xl md:text-5xl">{blog.title}</h1>

          {hero ? (
            <section className="grid gap-4">
              <h2 className="text-sm uppercase tracking-wide">The latest</h2>
              <Link className="relative aspect-3/2 overflow-hidden rounded-xl" href={heroHref}>
                {hero.image ? (
                  <Image
                    alt={hero.image.altText}
                    className="object-cover"
                    fill
                    priority
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    src={hero.image.url}
                  />
                ) : (
                  <ImagePlaceholder className="size-full bg-muted" />
                )}
              </Link>
              <div className="grid gap-2">
                <p className="text-muted-foreground text-sm">{blog.title}</p>
                <h3 className="font-medium text-2xl uppercase tracking-tight md:text-4xl">
                  <Link className="hover:underline" href={heroHref}>
                    {hero.title}
                  </Link>
                </h3>
              </div>
            </section>
          ) : (
            <p className="text-muted-foreground">No articles found.</p>
          )}

          {rest.length > 0 && (
            <div className="grid gap-10 md:grid-cols-2">
              {rest.map((article) => (
                <ArticleCard article={article} key={article.handle} />
              ))}
            </div>
          )}
        </Sections>
      </Container>
    </Page>
  );
}

export default function BlogCategoryPage(props: PageProps<"/blogs/category/[categoryHandle]">) {
  return (
    <Suspense fallback={null}>
      <BlogCategoryContent {...props} />
    </Suspense>
  );
}
