import type { ExpertReview } from "@/lib/product/types";

type Field = {
  key: string;
  value: string | null;
  reference?: {
    image?: { url: string; altText?: string | null } | null;
    previewImage?: { url: string } | null;
    sources?: Array<{ url: string; mimeType: string }> | null;
    url?: string;
  } | null;
};

export type ExpertReviewsMetafield = {
  references?: { nodes: Array<{ fields?: Field[] }> } | null;
} | null;

export function transformExpertReviews(
  metafield: ExpertReviewsMetafield | undefined,
): ExpertReview[] {
  const nodes = metafield?.references?.nodes ?? [];
  const reviews: ExpertReview[] = [];

  for (const node of nodes) {
    const fields = Object.fromEntries((node.fields ?? []).map((f) => [f.key, f]));
    const title = fields.title?.value;
    if (!title) continue;

    const videoUrl = fields.video_url?.value || undefined;
    const videoSources = (fields.video?.reference?.sources ?? []).filter((s) =>
      s.mimeType.startsWith("video/"),
    );
    if (!videoUrl && videoSources.length === 0) continue;

    const thumb = fields.thumbnail?.reference;
    reviews.push({
      title,
      videoUrl,
      videoSources: videoSources.length ? videoSources : undefined,
      thumbnailUrl: thumb?.image?.url ?? fields.video?.reference?.previewImage?.url,
      thumbnailAlt: thumb?.image?.altText ?? title,
      viewCount: fields.view_count?.value || undefined,
      sourceName: fields.source_name?.value || undefined,
      sourceIconUrl: fields.source_icon?.reference?.image?.url,
    });
  }

  return reviews;
}
