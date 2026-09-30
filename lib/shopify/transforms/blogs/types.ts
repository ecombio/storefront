import type { ARTICLE_SUMMARY_FRAGMENT, BLOG_FRAGMENT } from "@/lib/shopify/fragments/blogs";
import type { ResultOf } from "@/lib/shopify/types";

export type ShopifyBlog = ResultOf<typeof BLOG_FRAGMENT>;

type ShopifyField = { value: string | null } | null;

export type ShopifyAuthorProfile = {
  reference?: {
    __typename?: string;
    bio?: ShopifyField;
    handle?: string;
    name?: ShopifyField;
    photo?: {
      reference?: {
        __typename?: string;
        image?: {
          altText?: string | null;
          height?: number | null;
          url: string;
          width?: number | null;
        } | null;
      } | null;
    } | null;
    role?: ShopifyField;
  } | null;
} | null;

export type ShopifyArticle = ResultOf<typeof ARTICLE_SUMMARY_FRAGMENT> & {
  authorProfile?: ShopifyAuthorProfile;
  contentHtml?: string;
  seo?: { description: string | null; title: string | null } | null;
  tags?: string[];
};
