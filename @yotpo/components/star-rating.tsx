import { getProductRatingSummary } from '../client';
import { StarRow } from './star';

/**
 * Compact rating badge for product cards / PLPs.
 * Async Server Component — fetches on the server, ships no client JS.
 */
export async function StarRating({ productId }: { productId: string }) {
  const { averageScore, totalReviews } = await getProductRatingSummary(productId);

  if (totalReviews === 0) return null;

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
