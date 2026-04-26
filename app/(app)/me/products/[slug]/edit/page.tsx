export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { EditForm } from "./edit-form";

type PageProps = { params: Promise<{ slug: string }> };

export default async function EditPage({ params }: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/me/products/${slug}/edit`);

  const admin = createAdminClient();
  const { data: product, error } = await admin
    .from("products")
    .select("slug, name, tagline, category, external_url, thumbnail_url, target_audience, problem_statement, solution_approach, differentiator, product_stage, pricing_model, feedback_categories, maker_note, screenshot_urls, demo_video_url, owner_id")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !product) notFound();
  if (product.owner_id !== user.id) redirect("/me/products");

  return <EditForm product={product} />;
}
