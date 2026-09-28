// Path: @yotpo/components/star-ratings.tsx
//
// CHANGES:
// - Renders nothing if Yotpo is unavailable (was: "Write a Review" on every failure).
// - Whole badge is a link that jumps to the reviews section (`href`, default "#reviews").
// - aria-label uses a rounded score; "1 Review" pluralization kept.
//
// Async Server Component; wrap it in <Suspense> where it's used.

import { getProductRatingSummary } from '../client';
import { StarRow } from './star';

export async function StarRating({
  productId,
  href = '#reviews'
}: {
  productId: string;
  href?: string;
}) {
  const summary = await getProductRatingSummary(productId);
  if (!summary) return null;

  const { averageScore, totalReviews } = summary;

  if (totalReviews === 0) {
    return (
      <a href={href} className="inline-flex items-center gap-2 font-sans hover:opacity-80">
        <div className="opacity-30">
          <StarRow score={0} label="No reviews yet" />
        </div>
        <span className="text-sm font-bold text-black">Write a review</span>
      </a>
    );
  }

  const label = `${Number(averageScore.toFixed(1))} out of 5 stars, ${totalReviews} ${
    totalReviews === 1 ? 'review' : 'reviews'
  }. Jump to reviews`;

  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex items-center gap-2 font-sans hover:opacity-80"
    >
      <span className="text-sm font-bold text-black">{averageScore.toFixed(1)}</span>
      <StarRow score={averageScore} label="" />
      <span className="h-3 w-px bg-neutral-300" />
      <span className="text-sm font-bold text-black underline-offset-2 hover:underline">
        {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
      </span>
    </a>
  );
}
