// Path: yotpo/client.ts
//
// CHANGES FROM ORIGINAL:
// 1. `yotpoFetch` no longer throws on a failed request — it logs and returns `null`, so a Yotpo
//    outage/rate-limit/misconfiguration can't crash an async Server Component's render.
// 2. Cache tag is now per-product (`yotpo-reviews-${productId}`) in addition to the blanket
//    `yotpo-reviews` tag, so you can revalidate a single product without invalidating the whole catalog.
// 3. `getProductReviews` / `getProductRatingSummary` return an empty-but-valid shape instead of
//    throwing when the fetch fails, so callers (`ProductReviews`, `StarRating`) can keep their
//    existing "0 reviews" rendering path with no changes needed on their end.
// 4. `productId` is URL-encoded before being interpolated into the request path.

import 'server-only';
import { yotpoConfig } from './config';
import type { YotpoProductReviews, YotpoRatingSummary } from './types';

const EMPTY_REVIEWS: YotpoProductReviews = {
  reviews: [],
  bottomline: {
    total_review: 0,
    average_score: 0,
    star_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  }
};

async function yotpoFetch<T>(path: string, tags: string[]): Promise<T | null> {
  try {
    const res = await fetch(`${yotpoConfig.apiBaseUrl}/${yotpoConfig.appKey}${path}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: {
        revalidate: yotpoConfig.revalidateSeconds,
        tags
      }
    });

    if (!res.ok) {
      console.error(`Yotpo API error: ${res.status} ${res.statusText} (${path})`);
      return null;
    }

    return (await res.json()) as T;
  } catch (err) {
    console.error(`Yotpo fetch failed (${path}):`, err);
    return null;
  }
}

/**
 * Reviews + aggregate bottomline (score, distribution, count) for one product.
 * Returns an empty-but-valid shape (0 reviews) if Yotpo is unreachable or errors,
 * rather than throwing and taking down the page render.
 *
 * @param productId - Shopify numeric product ID (not the GraphQL GID).
 */
export async function getProductReviews(
  productId: string,
  opts: { page?: number; perPage?: number } = {}
): Promise<YotpoProductReviews> {
  const { page = 1, perPage = yotpoConfig.reviewsPerPage } = opts;
  const encodedId = encodeURIComponent(productId);

  const data = await yotpoFetch<{ response: YotpoProductReviews }>(
    `/products/${encodedId}/reviews.json?page=${page}&per_page=${perPage}`,
    ['yotpo-reviews', `yotpo-reviews-${productId}`]
  );

  return data?.response ?? EMPTY_REVIEWS;
}

/**
 * Lightweight score/count only — use on PLPs and product cards.
 */
export async function getProductRatingSummary(
  productId: string
): Promise<YotpoRatingSummary> {
  const { bottomline } = await getProductReviews(productId, { perPage: 1 });
  return {
    averageScore: bottomline.average_score,
    totalReviews: bottomline.total_review
  };
}
