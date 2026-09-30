import type { Image } from "@/lib/media/types";
import type { SEO } from "@/lib/seo/types";

export interface Blog {
  articles: BlogArticle[];
  handle: string;
  seo: SEO;
  title: string;
}

export interface AuthorProfile {
  bio?: string | undefined;
  handle?: string | undefined;
  name: string;
  photo?: Image | undefined;
  role?: string | undefined;
}

export interface BlogArticle {
  author?: string;
  authorProfile?: AuthorProfile | undefined;
  blogHandle: string;
  blogTitle: string;
  body?: string;
  excerpt: string;
  handle: string;
  image: Image | null;
  publishedAt: string;
  seo: SEO;
  tags: string[];
  title: string;
}
