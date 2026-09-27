/**
 * yotpo/types.ts
 */

export type YotpoReview = {
  id: number;
  score: number; // 1-5
  title: string;
  content: string;
  created_at: string;
  user: {
    display_name: string;
  };
  votes_up: number;
  votes_down: number;
};

export type YotpoBottomline = {
  total_review: number;
  average_score: number;
  star_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};

export type YotpoProductReviews = {
  reviews: YotpoReview[];
  bottomline: YotpoBottomline;
};

export type YotpoRatingSummary = {
  averageScore: number;
  totalReviews: number;
};
