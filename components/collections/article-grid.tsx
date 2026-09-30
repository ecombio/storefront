import { ArticleCard } from "@/components/blog/article-card";
import type { BlogArticle } from "@/lib/blog/types";

export function ArticleGrid({ articles }: { articles: BlogArticle[] }) {
  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={`${article.blogHandle}/${article.handle}`} article={article} />
      ))}
    </div>
  );
}
