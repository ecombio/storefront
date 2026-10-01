import { ArticleTile } from "@/components/blog/article-tile";
import { getAllArticles } from "@/lib/blog/tag-server";
import type { BlogArticle } from "@/lib/blog/types";

export async function RelatedArticles({
  article,
  limit = 3,
}: {
  article: BlogArticle;
  limit?: number;
}) {
  const tags = new Set(article.tags.map((tag) => tag.toLowerCase()));
  const picks = (await getAllArticles())
    .filter((other) => other.handle !== article.handle)
    .map((other) => ({
      other,
      score:
        other.tags.filter((tag) => tags.has(tag.toLowerCase())).length * 2 +
        (other.blogHandle === article.blogHandle ? 1 : 0),
    }))
    .sort(
      (a, b) =>
        b.score - a.score || Date.parse(b.other.publishedAt) - Date.parse(a.other.publishedAt),
    )
    .slice(0, limit)
    .map(({ other }) => other);

  if (picks.length === 0) return null;

  return (
    <section className="grid gap-4">
      <h2 className="text-xs uppercase tracking-wide">You may like</h2>
      <div className="grid gap-8">
        {picks.map((other) => (
          <ArticleTile article={other} category={other.blogTitle} key={other.handle} showAuthor />
        ))}
      </div>
    </section>
  );
}
