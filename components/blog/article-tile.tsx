import Image from "next/image";
import Link from "next/link";

import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import type { BlogArticle } from "@/lib/blog/types";
import { shopConfig } from "@/lib/config";

export function formatArticleDate(value: string): string {
  return new Intl.DateTimeFormat(shopConfig.localization.locale, {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })
    .format(new Date(value))
    .replace(/\//g, ".");
}

export interface ArticleTileProps {
  article: BlogArticle;
  category: string;
}

export function ArticleTile({ article, category }: ArticleTileProps) {
  const href = `/blogs/articles/${article.handle}`;
  return (
    <article className="grid content-start gap-3">
      <Link className="relative aspect-square overflow-hidden" href={href}>
        {article.image ? (
          <Image
            alt={article.image.altText}
            className="object-cover transition-transform duration-300 hover:scale-105"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            src={article.image.url}
          />
        ) : (
          <ImagePlaceholder className="size-full bg-muted" />
        )}
      </Link>
      <div className="grid gap-2">
        <p className="text-muted-foreground text-xs">{category}</p>
        <h3 className="font-medium text-sm uppercase tracking-tight md:text-base">
          <Link className="hover:underline" href={href}>
            {article.title}
          </Link>
        </h3>
        <time className="text-muted-foreground text-xs" dateTime={article.publishedAt}>
          {formatArticleDate(article.publishedAt)}
        </time>
      </div>
    </article>
  );
}
