import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArticleTile, formatArticleDate } from "@/components/blog/article-tile";
import { BlogSubNav } from "@/components/blog/blog-sub-nav";
import { LoadMoreGrid } from "@/components/blog/load-more-grid";
import { TagChips } from "@/components/blog/tag-chips";
import { Container } from "@/components/ui/container";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { getBlog, getBlogList } from "@/lib/blog/server";
import { collectTags } from "@/lib/blog/tags";
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
  const featured = blog.articles.slice(0, 5);
  const tags = collectTags(blog.articles).slice(0, 12);

  return (
    <Page className="pt-2.5 md:pt-10">
      <Container>
        <Sections className="gap-8">
          <BlogSubNav active={blog.handle} blogs={blogs} />
          <h1 className="font-semibold text-4xl uppercase tracking-tight md:text-6xl">
            {blog.title}
          </h1>
          <TagChips tags={tags} />

          {hero ? (
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
              <div className="grid content-start gap-10">
                <section className="grid gap-4">
                  <h2 className="text-xs uppercase tracking-wide">The latest</h2>
                  <Link className="relative aspect-square overflow-hidden" href={heroHref}>
                    {hero.image ? (
                      <Image
                        alt={hero.image.altText}
                        className="object-cover"
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        src={hero.image.url}
                      />
                    ) : (
                      <ImagePlaceholder className="size-full bg-muted" />
                    )}
                  </Link>
                  <div className="grid gap-2">
                    <p className="text-muted-foreground text-xs">{blog.title}</p>
                    <h3 className="font-semibold text-2xl uppercase tracking-tight md:text-4xl">
                      <Link className="hover:underline" href={heroHref}>
                        {hero.title}
                      </Link>
                    </h3>
                    <time className="text-muted-foreground text-xs" dateTime={hero.publishedAt}>
                      {formatArticleDate(hero.publishedAt)}
                    </time>
                  </div>
                </section>

                {rest.length > 0 && (
                  <LoadMoreGrid
                    className="grid gap-x-6 gap-y-10 sm:grid-cols-2"
                    items={rest.map((article) => (
                      <ArticleTile article={article} category={blog.title} key={article.handle} />
                    ))}
                  />
                )}
              </div>

              <aside className="grid content-start gap-6">
                <h2 className="text-xs uppercase tracking-wide">Featured</h2>
                <ol className="grid gap-8">
                  {featured.map((article, index) => (
                    <li className="grid gap-2" key={article.handle}>
                      <span className="font-semibold text-4xl">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <Link
                        className="font-medium text-sm uppercase hover:underline"
                        href={`/blogs/articles/${article.handle}`}
                      >
                        {article.title}
                      </Link>
                      <span className="text-muted-foreground text-xs">{blog.title}</span>
                    </li>
                  ))}
                </ol>
              </aside>
            </div>
          ) : (
            <p className="text-muted-foreground">No articles found.</p>
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
