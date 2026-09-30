import Image from "next/image";
import Link from "next/link";

import { ArticleBody } from "@/components/blog/article-body";
import { AuthorCard } from "@/components/blog/author-card";
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
      <Container className="max-w-5xl">
        <Sections className="gap-5">
          <header className="grid gap-4 text-center">
            <Link
              className="justify-self-center text-muted-foreground text-sm hover:text-foreground"
              href={`/blogs/category/${article.blogHandle}`}
            >
              {article.blogTitle}
            </Link>
            <h1 className="text-3xl tracking-tight sm:text-4xl md:text-5xl">{article.title}</h1>
            <div className="flex flex-wrap justify-center gap-x-2 text-muted-foreground text-sm">
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
          </header>
          {article.image && (
            <div className="relative aspect-3/2 overflow-hidden rounded-xl">
              <Image
                alt={article.image.altText}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                src={article.image.url}
              />
            </div>
          )}
          <div className="grid gap-12 lg:grid-cols-[minmax(0,42rem)_16rem] lg:justify-center">
            <div className="grid content-start gap-12">
              <ArticleBody segments={segments} />
              {article.authorProfile && <AuthorCard profile={article.authorProfile} />}
            </div>
            {contents.length > 1 && (
              <aside className="hidden lg:block">
                <nav aria-label="Contents" className="sticky top-24 grid gap-4">
                  <h2 className="text-xs uppercase tracking-wide">Contents</h2>
                  <ol className="grid gap-3">
                    {contents.map((heading) => (
                      <li key={heading.id}>
                        <a
                          className="font-medium text-sm uppercase hover:underline"
                          href={`#${heading.id}`}
                        >
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </aside>
            )}
          </div>
        </Sections>
      </Container>
    </Page>
  );
}
