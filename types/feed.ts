export type FeedProduct = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  feedback_count: number;
  view_count: number;
  hasCertificate: boolean;
  thumbnailUrl: string | null;
  gradientFrom: string;
  gradientTo: string;
  label: string;
  created_at: string;
};

export type HomeProduct = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  feedbackCount: number;
  hasCertificate: boolean;
  thumbnailUrl: string | null;
  gradientFrom: string;
  gradientTo: string;
  label: string;
};

export type NeedFeedbackItem = {
  slug: string;
  name: string;
  tagline: string;
  feedbackCount: number;
  daysAgo: number;
  gradientFrom: string;
  gradientTo: string;
  label: string;
};
