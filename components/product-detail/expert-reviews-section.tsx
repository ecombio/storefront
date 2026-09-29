import { ExpertReviews } from "@/components/product-detail/expert-reviews";
import { getExpertReviews } from "@/lib/product/server";

export async function ExpertReviewsSection({ handle }: { handle: string }) {
  const reviews = await getExpertReviews({ handle });
  return <ExpertReviews reviews={reviews} />;
}
