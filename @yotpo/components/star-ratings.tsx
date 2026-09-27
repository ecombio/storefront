// Path: @yotpo/components/star-ratings.tsx
// (Renamed from star-rating.tsx — component export name (`StarRating`) is unchanged,
// so no other file needs to update its import name, only its import path via @yotpo/index.ts.)

import { getProductRatingSummary } from '../client';
import { StarRow } from './star';

/**
 * Compact rating badge for product cards / PLPs.
 * Async Server Component — fetches on the server, ships no client JS.
 */
export async function StarRating({ productId }: { productId: string }) {
  const { averageScore, totalReviews } = await getProductRatingSummary(productId);

  if (totalReviews === 0) {
    return (
      <div className="flex items-center gap-2 font-sans">
        <div className="opacity-30">
          <StarRow score={0} />
        </div>
        <span className="text-sm font-bold text-black">Write a Review</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 font-sans"
      role="img"
      aria-label={`${averageScore} out of 5 stars, ${totalReviews} reviews`}
    >
      <span className="text-sm font-bold text-black">{averageScore.toFixed(1)}</span>
      <StarRow score={averageScore} />
      <span className="h-3 w-px bg-neutral-300" />
      <span className="text-sm font-bold text-black">
        {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
      </span>
    </div>
  );
}
