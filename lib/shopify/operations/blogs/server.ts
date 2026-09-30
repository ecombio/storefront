import { gql } from "@shopify/hydrogen";

import type { Blog, BlogArticle } from "@/lib/blog/types";
import { shopConfig } from "@/lib/config";
import type { CommerceLocale } from "@/lib/config/types";
import { assertStorefrontOk } from "@/lib/shopify/errors/server";
import { ARTICLE_SUMMARY_FRAGMENT, BLOG_FRAGMENT } from "@/lib/shopify/fragments/blogs";
import { storefront } from "@/lib/shopify/storefront/server";
import { transformArticle } from "@/lib/shopify/transforms/blogs";

const GET_BLOG_QUERY = gql(
  `#graphql
  query getBlog($handle: String!, $first: Int!, $country: CountryCode, $language: LanguageCode) @inContext(country: $country, language: $language) {
    blog(handle: $handle) {
      ...BlogFields
      articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          ...ArticleSummaryFields authorProfile: metafield(namespace: "custom", key: "author_profile") { reference { ... on Metaobject { handle name: field(key: "name") { value } } } }
          tags
        }
      }
    }
  }
`,
  [ARTICLE_SUMMARY_FRAGMENT, BLOG_FRAGMENT],
);

const GET_BLOG_ARTICLE_QUERY = gql(
  `#graphql
  query getBlogArticle($blogHandle: String!, $articleHandle: String!, $country: CountryCode, $language: LanguageCode) @inContext(country: $country, language: $language) {
    blog(handle: $blogHandle) {
      ...BlogFields
      articleByHandle(handle: $articleHandle) {
        ...ArticleSummaryFields
        contentHtml authorProfile: metafield(namespace: "custom", key: "author_profile") { reference { ... on Metaobject { handle name: field(key: "name") { value } role: field(key: "role") { value } bio: field(key: "bio") { value } photo: field(key: "photo") { reference { ... on MediaImage { image { url altText width height } } } } } } }
        seo {
          description
          title
        }
        tags
      }
    }
  }
`,
  [ARTICLE_SUMMARY_FRAGMENT, BLOG_FRAGMENT],
);

export async function fetchBlog({
  handle,
  limit = 50,
  locale = shopConfig.localization,
}: {
  handle: string;
  limit?: number;
  locale?: CommerceLocale;
}): Promise<Blog | undefined> {
  const response = await storefront.request(GET_BLOG_QUERY, {
    locale,
    variables: { first: limit, handle },
  });
  assertStorefrontOk(response, "getBlog");

  const blog = response.data.blog;
  if (!blog) return undefined;

  return {
    articles: blog.articles.nodes.map((article) => transformArticle(article, blog)),
    handle: blog.handle,
    seo: {
      description: blog.seo?.description ?? "",
      title: blog.seo?.title ?? blog.title,
    },
    title: blog.title,
  };
}

export async function fetchBlogArticle({
  articleHandle,
  blogHandle,
  locale = shopConfig.localization,
}: {
  articleHandle: string;
  blogHandle: string;
  locale?: CommerceLocale;
}): Promise<BlogArticle | undefined> {
  const response = await storefront.request(GET_BLOG_ARTICLE_QUERY, {
    locale,
    variables: { articleHandle, blogHandle },
  });
  assertStorefrontOk(response, "getBlogArticle");

  const blog = response.data.blog;
  if (!blog?.articleByHandle) return undefined;

  return transformArticle(blog.articleByHandle, blog);
}

const GET_ARTICLE_BY_HANDLE_QUERY = gql(
  `#graphql
  query getArticleByHandle($articleHandle: String!, $country: CountryCode, $language: LanguageCode) @inContext(country: $country, language: $language) {
    blogs(first: 25) {
      nodes {
        ...BlogFields
        articleByHandle(handle: $articleHandle) {
          ...ArticleSummaryFields
          contentHtml authorProfile: metafield(namespace: "custom", key: "author_profile") { reference { ... on Metaobject { handle name: field(key: "name") { value } role: field(key: "role") { value } bio: field(key: "bio") { value } photo: field(key: "photo") { reference { ... on MediaImage { image { url altText width height } } } } } } }
          seo {
            description
            title
          }
          tags
        }
      }
    }
  }
`,
  [ARTICLE_SUMMARY_FRAGMENT, BLOG_FRAGMENT],
);

export async function fetchArticleByHandle({
  articleHandle,
  locale = shopConfig.localization,
}: {
  articleHandle: string;
  locale?: CommerceLocale;
}): Promise<BlogArticle | undefined> {
  const response = await storefront.request(GET_ARTICLE_BY_HANDLE_QUERY, {
    locale,
    variables: { articleHandle },
  });
  assertStorefrontOk(response, "getArticleByHandle");

  for (const blog of response.data.blogs.nodes) {
    if (blog.articleByHandle) return transformArticle(blog.articleByHandle, blog);
  }
  return undefined;
}

const GET_BLOG_LIST_QUERY = gql(`#graphql
  query getBlogList($first: Int!, $country: CountryCode, $language: LanguageCode) @inContext(country: $country, language: $language) {
    blogs(first: $first) {
      nodes {
        handle
        title
      }
    }
  }
`);

export async function fetchBlogList({
  locale = shopConfig.localization,
}: {
  locale?: CommerceLocale;
} = {}): Promise<{ handle: string; title: string }[]> {
  const response = await storefront.request(GET_BLOG_LIST_QUERY, {
    locale,
    variables: { first: 25 },
  });
  assertStorefrontOk(response, "getBlogList");
  return response.data.blogs.nodes.map((blog) => ({ handle: blog.handle, title: blog.title }));
}
