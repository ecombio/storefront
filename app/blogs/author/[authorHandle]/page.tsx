import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArticleTile } from "@/components/blog/article-tile";
import { BlogSubNav } from "@/components/blog/blog-sub-nav";
import { LoadMoreGrid } from "@/components/blog/load-more-grid";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { getAllAuthors, getAuthorArticles } from "@/lib/blog/author-server";
import { getBlogList } from "@/lib/blog/server";
import { collectTags } from "@/lib/blog/tags";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const PLACEHOLDER_HANDLE = "__placeholder__";

export async function generateStaticParams() {
  try {
    const authors = await getAllAuthors();
    return authors.length > 0
      ? authors.map(({ handle }) => ({ authorHandle: handle }))
      : [{ authorHandle: PLACEHOLDER_HANDLE }];
  } catch {
    return [{ authorHandle: PLACEHOLDER_HANDLE }];
  }
}

export async function generateMetadata({
  params,
}: PageProps<"/blogs/author/[authorHandle]">): Promise<Metadata> {
  const { authorHandle } = await params;
  if (authorHandle === PLACEHOLDER_HANDLE) return {};
  const { profile } = await getAuthorArticles(authorHandle);
  if (!profile) notFound();
  const pathname = `/blogs/author/${authorHandle}`;
  const description = profile.bio ?? `Articles by ${profile.name}`;
  return {
    alternates: buildAlternates({ pathname }),
    description,
    openGraph: buildOpenGraph({ description, title: profile.name, type: "website", url: pathname }),
    title: profile.name,
  };
}

async function BlogAuthorContent({ params }: PageProps<"/blogs/author/[authorHandle]">) {
  const { authorHandle } = await params;
  if (authorHandle === PLACEHOLDER_HANDLE) notFound();
  const [{ articles, profile }, blogs] = await Promise.all([
    getAuthorArticles(authorHandle),
    getBlogList(),
  ]);
  if (!profile) notFound();
  const topics = collectTags(articles).slice(0, 12);

  return (
    <Page className="pt-2.5 md:pt-10">
      <Container>
        <Sections className="gap-8">
          <BlogSubNav active="" blogs={blogs} />
          <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <aside className="grid content-start gap-4">
              {profile.photo && (
                <div className="relative size-24 overflow-hidden rounded-full bg-muted">
                  <Image
                    alt={profile.photo.altText}
                    className="object-cover"
                    fill
                    sizes="96px"
                    src={profile.photo.url}
                  />
                </div>
              )}
              <h1 className="font-semibold text-xl uppercase tracking-tight">{profile.name}</h1>
              {profile.role && (
                <p className="text-muted-foreground text-sm uppercase">{profile.role}</p>
              )}
              {profile.bio && (
                <p className="whitespace-pre-line text-muted-foreground text-sm leading-6">
                  {profile.bio}
                </p>
              )}
            </aside>
            <div className="grid content-start gap-8">
              {topics.length > 0 && (
                <section className="grid gap-3">
                  <h2 className="text-xs uppercase tracking-wide">Topics</h2>
                  <ul className="flex flex-wrap gap-2">
                    {topics.map((tag) => (
                      <li key={tag.handle}>
                        <Link
                          className="inline-block border px-3 py-1 text-muted-foreground text-xs hover:text-foreground"
                          href={`/blogs/tag/${tag.handle}`}
                        >
                          {tag.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <section className="grid gap-4">
                <h2 className="text-xs uppercase tracking-wide">Latest from {profile.name}</h2>
                <LoadMoreGrid
                  className="grid gap-x-6 gap-y-10 sm:grid-cols-2"
                  items={articles.map((article) => (
                    <ArticleTile
                      article={article}
                      category={article.blogTitle}
                      key={article.handle}
                    />
                  ))}
                />
              </section>
            </div>
          </div>
        </Sections>
      </Container>
    </Page>
  );
}

export default function BlogAuthorPage(props: PageProps<"/blogs/author/[authorHandle]">) {
  return (
    <Suspense fallback={null}>
      <BlogAuthorContent {...props} />
    </Suspense>
  );
}
