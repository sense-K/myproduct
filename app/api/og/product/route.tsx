import { ImageResponse } from "next/og";
import { getMockProduct } from "@/lib/mock/products";
import { CATEGORIES } from "@/lib/constants/user";
import { SITE_NAME } from "@/lib/seo/config";

export const dynamic = "force-dynamic";

const W = 1200;
const H = 630;

function getCategoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? "";

  // DB 연동 후: DB에서 fetch → mock은 폴백
  const product = getMockProduct(slug);

  const name = product?.name ?? (slug || "마이프로덕트 제품");
  const tagline = product?.tagline ?? "";
  const category = product ? getCategoryLabel(product.category) : "";
  const feedbackCount = product?.feedback_count ?? 0;
  const hasCert = !!product?.certificate;

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          background: "#1A1A1A",
          padding: "64px 80px",
          position: "relative",
        }}
      >
        {/* 배경 글로우 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(240,77,46,0.12) 0%, transparent 60%)",
          }}
        />

        {/* 카테고리 */}
        {category && (
          <div
            style={{
              display: "flex",
              marginBottom: 28,
            }}
          >
            <span
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "#9a958a",
                fontSize: 18,
                fontWeight: 600,
                padding: "6px 18px",
                borderRadius: 100,
              }}
            >
              {category}
            </span>
          </div>
        )}

        {/* 제품명 */}
        <p
          style={{
            fontSize: Math.min(72, Math.max(48, 1200 / name.length)),
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            margin: 0,
            marginBottom: 22,
          }}
        >
          {name}
        </p>

        {/* 태그라인 */}
        <p
          style={{
            fontSize: 26,
            color: "#9a958a",
            lineHeight: 1.5,
            margin: 0,
            maxWidth: 840,
          }}
        >
          {tagline}
        </p>

        {/* 하단 배지 + 브랜드 */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: "auto",
            alignItems: "center",
          }}
        >
          {hasCert && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(122,136,113,0.2)",
                color: "#9cad93",
                padding: "8px 20px",
                borderRadius: 8,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              🛡️ 등록 증명
            </div>
          )}
          {feedbackCount > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(240,77,46,0.15)",
                color: "#f07060",
                padding: "8px 20px",
                borderRadius: 8,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              💬 피드백 {feedbackCount}
            </div>
          )}

          {/* 브랜드 워터마크 */}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#F04D2E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FBF6ED",
                fontSize: 20,
                fontWeight: 900,
              }}
            >
              M
            </div>
            <span style={{ color: "#5a5a5a", fontSize: 22, fontWeight: 700 }}>{SITE_NAME}</span>
          </div>
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
