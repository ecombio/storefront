import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { ArticleBody } from "@/components/blog/article-body";
import { AuthorCard } from "@/components/blog/author-card";
import { BackToTop } from "@/components/blog/back-to-top";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { RelatedArticles } from "@/components/blog/related-articles";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import {
  addHeadingIds,
  parseBody,
  type BodyHeading,
  type BodySegment,
} from "@/lib/blog/shortcodes";
import type { BlogArticle } from "@/lib/blog/types";
import { shopConfig } from "@/lib/config";

export interface ArticlePageProps {
  article: BlogArticle;
}

// Same rule as the guide: lowercase, "&" -> "and", non-alphanumerics -> "-".
function tagHandle(tag: string) {
  return tag
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ArticlePage({ article }: ArticlePageProps) {
  const publishedAt = new Intl.DateTimeFormat(shopConfig.localization.locale, {
    dateStyle: "long",
  }).format(new Date(article.publishedAt));

  const headings: BodyHeading[] = [];
  const segments: BodySegment[] = parseBody(article.body ?? "").map((segment) =>
    segment.type === "html" ? { ...segment, html: addHeadingIds(segment.html, headings) } : segment,
  );
  const contents = headings.filter((heading) => heading.level === 2);

  return (
    <Page>
      <Container>
        <Sections className="gap-8">
          <header className="grid gap-3">
            <Link
              className="text-foreground text-xs hover:underline"
              href={`/blogs/category/${article.blogHandle}`}
            >
              {article.blogTitle}
            </Link>
            <h1 className="font-bold text-3xl uppercase tracking-tight sm:text-4xl md:text-5xl">
              {article.title}
            </h1>
            <div className="flex flex-wrap gap-x-2 text-muted-foreground text-xs">
              {article.author &&
                (article.authorProfile?.handle ? (
                  <Link
                    className="hover:text-foreground hover:underline"
                    href={`/blogs/author/${article.authorProfile.handle}`}
                  >
                    {article.authorProfile.name}
                  </Link>
                ) : (
                  <span>{article.author}</span>
                ))}
              {article.author && <span aria-hidden>·</span>}
              <time dateTime={article.publishedAt}>{publishedAt}</time>
            </div>
            {article.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      className="border px-2 py-1 text-xs hover:bg-muted"
                      href={`/blogs/tag/${tagHandle(tag)}`}
                    >
                      {tag}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </header>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
            <div className="grid content-start gap-12" data-article-body>
              {article.image && (
                <div className="relative aspect-4/3 w-full overflow-hidden">
                  <Image
                    alt={article.image.altText}
                    className="object-cover"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 900px"
                    src={article.image.url}
                  />
                </div>
              )}
              <div className="grid w-full content-start gap-12">
                <ArticleBody segments={segments} />
                {article.authorProfile && <AuthorCard profile={article.authorProfile} />}
              </div>
            </div>

            <aside className="grid content-start gap-10">
              {contents.length > 1 && (
                <nav aria-label="Contents" className="hidden gap-4 lg:grid">
                  <h2 className="text-xs uppercase tracking-wide">Contents</h2>
                  <ol className="grid gap-4 border p-4">
                    {contents.map((heading) => (
                      <li key={heading.id}>
                        <a className="font-medium text-xs underline" href={`#${heading.id}`}>
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
              <Suspense fallback={null}>
                <RelatedArticles article={article} />
              </Suspense>
            </aside>
          </div>
        </Sections>
        <ReadingProgress />
        <BackToTop />
      </Container>
    </Page>
  );
}
