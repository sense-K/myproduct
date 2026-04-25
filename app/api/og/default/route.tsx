import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo/config";

export const dynamic = "force-static";

const W = 1200;
const H = 630;

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          background: "#1A1A1A",
          padding: "72px 96px",
          position: "relative",
        }}
      >
        {/* 배경 글로우 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 25% 55%, rgba(240,77,46,0.11) 0%, transparent 60%)",
          }}
        />

        {/* 상단: 브랜드 */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#F04D2E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FBF6ED",
              fontSize: 24,
              fontWeight: 900,
            }}
          >
            M
          </div>
          <span style={{ color: "#555", fontSize: 22, fontWeight: 700 }}>
            {SITE_NAME}
          </span>
        </div>

        {/* 하단: 메인 카피 */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <p
            style={{
              fontSize: 68,
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              margin: 0,
              marginBottom: 24,
            }}
          >
            만드느라
            <br />
            혼자였잖아요.
          </p>
          <p
            style={{
              fontSize: 24,
              color: "#9a958a",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            한국 인디 메이커를 위한 피드백 교환과 등록 증명 플랫폼
          </p>
          <p style={{ fontSize: 18, color: "#555", margin: 0, marginTop: 12 }}>
            myproduct.kr
          </p>
        </div>
      </div>
    ),
    { width: W, height: H },
  );
}
