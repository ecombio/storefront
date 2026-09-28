// Path: @yotpo/components/reviews-widget.tsx
//
// Async Server Component: fetches the reviews, then hands them to <ReviewsBrowser> (client),
// which owns the summary, rating bars, search / rating filter / sort controls and the list.
//
// - Renders nothing if Yotpo is unavailable.
// - Empty state shows text + "Write A Review" only (no zero-star row).
// - Props `handle` + `productTitle` are needed by the form; the server route re-derives the
//   product ID from the handle, so the client can't post reviews to arbitrary products.
// - The #reviews anchor lives on a wrapper in product-detail-section.tsx so it always exists.

import { getProductReviews } from '../client';
import { yotpoConfig } from '../config';
import { WriteReviewButton } from './review-form';
import { ReviewsBrowser } from './reviews-browser';

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
      <ReviewsBrowser
        reviews={reviews}
        bottomline={bottomline}
        handle={handle}
        productTitle={productTitle}
        pageSize={yotpoConfig.reviewsPerPage}
      />
    </section>
  );
}