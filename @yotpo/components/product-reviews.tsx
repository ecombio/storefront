import { getProductReviews } from '../client';
import type { YotpoReview } from '../types';
import { StarRow } from './star';

function DistributionBar({
  star,
  count,
  total
}: {
  star: number;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-3 text-right text-black">{star}</span>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full bg-black" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-5 text-neutral-500">{count}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: YotpoReview }) {
  const date = new Date(review.created_at).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });

  return (
    <div className="flex gap-4 border-t border-neutral-100 py-5">
      <div className="h-9 w-9 flex-shrink-0 rounded-full bg-[#CBD2E0]" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-black">{review.user.display_name}</p>
            <div className="my-1.5">
              <StarRow score={review.score} />
            </div>
            <p className="mb-1 text-sm font-bold text-black">{review.title}</p>
            <p className="text-sm leading-relaxed text-black">{review.content}</p>
          </div>
          <span className="whitespace-nowrap text-xs text-neutral-500">{date}</span>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500">
          <span>Was this review helpful?</span>
          <button type="button" className="hover:text-black">
            👍 {review.votes_up}
          </button>
          <button type="button" className="hover:text-black">
            👎 {review.votes_down}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Full "Customer Reviews" section for a product page.
 * Async Server Component — fetches page 1 on the server.
 *
 * Sorting/filtering/pagination beyond page 1 needs a small client component
 * calling a Route Handler that wraps getProductReviews() — not included
 * here since it's a separate, opt-in concern.
 */
export async function ProductReviews({ productId }: { productId: string }) {
  const { reviews, bottomline } = await getProductReviews(productId);

  if (bottomline.total_review === 0) {
    return (
      <section className="mx-auto w-full max-w-[1100px] px-6 py-8 text-center">
        <p className="font-sans text-sm text-neutral-500">
          No reviews yet — be the first to write one.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1100px] px-6 py-8 font-sans">
      <h2 className="mb-6 text-center text-lg font-bold text-black">Customer Reviews</h2>

      <div className="flex flex-wrap items-center justify-center gap-12 pb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-black">
            {bottomline.average_score.toFixed(1)}
          </div>
          <div className="my-1.5 flex justify-center">
            <StarRow score={bottomline.average_score} />
          </div>
          <div className="text-xs text-neutral-500">
            Based on {bottomline.total_review} reviews
          </div>
        </div>

        <div className="space-y-1">
          {([5, 4, 3, 2, 1] as const).map((star) => (
            <DistributionBar
              key={star}
              star={star}
              count={bottomline.star_distribution[star]}
              total={bottomline.total_review}
            />
          ))}
        </div>

        <button
          type="button"
          className="whitespace-nowrap rounded-full bg-black px-6 py-3 text-xs font-bold text-white hover:opacity-85"
        >
          Write A Review
        </button>
      </div>

      <div>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
