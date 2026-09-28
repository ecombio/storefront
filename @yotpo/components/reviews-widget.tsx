// Path: @yotpo/components/reviews-widget.tsx
//
// CHANGES:
// - Renders nothing if Yotpo is unavailable (was: "No reviews yet" during any outage).
// - "Write A Review" now opens a working modal (WriteReviewButton) in both the empty and populated states.
// - New props `handle` + `productTitle` (the form needs them; the server route re-derives the
//   product ID from the handle, so the client can't post reviews to arbitrary products).
// - Vote buttons were dead (no handlers in a Server Component); they're now a plain "helpful" count.
// - Guards: empty title / display name, "1 review" pluralization, unambiguous date format.
// - The #reviews anchor lives on a wrapper in product-detail-section.tsx so it always exists.
//
// Async Server Component. Pagination / sorting is still page 1 only.

import { getProductReviews } from '../client';
import type { YotpoReview } from '../types';
import { WriteReviewButton } from './review-form';
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
  const date = new Date(review.created_at).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const name = review.user?.display_name?.trim() || 'Anonymous';

  return (
    <div className="flex gap-4 border-t border-neutral-100 py-5">
      <div className="h-9 w-9 flex-shrink-0 rounded-full bg-[#CBD2E0]" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-black">{name}</p>
            <div className="my-1.5">
              <StarRow score={review.score} />
            </div>
            {review.title ? (
              <p className="mb-1 text-sm font-bold text-black">{review.title}</p>
            ) : null}
            <p className="text-sm leading-relaxed text-black">{review.content}</p>
          </div>
          <span className="whitespace-nowrap text-xs text-neutral-500">{date}</span>
        </div>
        {review.votes_up > 0 ? (
          <p className="mt-3 text-xs text-neutral-500">
            {review.votes_up} {review.votes_up === 1 ? 'person' : 'people'} found this helpful
          </p>
        ) : null}
      </div>
    </div>
  );
}

export async function ProductReviews({
  productId,
  handle,
  productTitle
}: {
  productId: string;
  handle: string;
  productTitle: string;
}) {
  const data = await getProductReviews(productId);
  if (!data) return null;

  const { reviews, bottomline } = data;

  if (bottomline.total_review === 0) {
    return (
      <section className="mx-auto w-full max-w-[1100px] px-6 py-12 text-center font-sans">
        <h2 className="mb-4 text-lg font-bold text-black">Customer Reviews</h2>
        <div className="mb-4 flex justify-center opacity-30">
          <StarRow score={0} label="No reviews yet" />
        </div>
        <p className="mb-5 text-sm text-neutral-500">
          No reviews yet. Be the first to share your thoughts.
        </p>
        <WriteReviewButton handle={handle} productTitle={productTitle} />
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
            Based on {bottomline.total_review}{' '}
            {bottomline.total_review === 1 ? 'review' : 'reviews'}
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

        <WriteReviewButton handle={handle} productTitle={productTitle} />
      </div>

      <div>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
