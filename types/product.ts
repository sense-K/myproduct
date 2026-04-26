export type VersionItem = {
  id: string;
  version_label: string;
  change_note: string | null;
  version_number: number;
  is_initial: boolean;
  created_at: string;
  is_future?: boolean;
};

export type CareerDist = {
  career_tag: string;
  label: string;
  count: number;
};

export type RelatedProduct = {
  slug: string;
  name: string;
  tagline: string;
  feedback_count: number;
  hasCertificate: boolean;
  gradientFrom: string;
  gradientTo: string;
  label: string;
};

export type ProductPageData = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  maker_quote: string | null;
  category: string;
  thumbnail_url: string | null;
  og_image_url?: string | null;
  external_url: string | null;
  view_count: number;
  click_count: number;
  feedback_count: number;
  created_at: string;
  updated_at: string;
  status: string;
  owner_id: string;
  owner_nickname: string;
  owner_career_tag: string;
  certificate: { registration_number: string; content_hash: string; issued_at: string } | null;
  versions: VersionItem[];
  career_distribution: CareerDist[];
  related: RelatedProduct[];
};
