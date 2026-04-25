import { ImageResponse } from "next/og";

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
          justifyContent: "space-between",
          background: "#1A1A1A",
          padding: "64px 88px",
          position: "relative",
        }}
      >
        {/* 배경 글로우 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 20% 60%, rgba(240,77,46,0.10) 0%, transparent 55%)",
          }}
        />

        {/* 상단: 브랜드 */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#F04D2E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FBF6ED",
              fontSize: 22,
              fontWeight: 900,
            }}
          >
            M
          </div>
          <span style={{ color: "#666", fontSize: 20, fontWeight: 700 }}>
            마이프로덕트
          </span>
        </div>

        {/* 중단: 메인 카피 (大) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <p
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            프로젝트를 공개하고
            <br />
            다른 사람들의 피드백을 받아보세요
          </p>

          {/* 서브 카피 (中) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <p
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#F04D2E",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              공개해도 안전합니다.
            </p>
            <p
              style={{
                fontSize: 22,
                fontWeight: 400,
                color: "#9a958a",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              공개 즉시 발급되는 등록 증명서가 아이디어를 보호합니다
            </p>
          </div>
        </div>

        {/* 하단: 소 카피 */}
        <p style={{ fontSize: 17, color: "#555", margin: 0 }}>
          내가 만든 프로젝트를 검증받는 공간 · myproduct.kr
        </p>
      </div>
    ),
    { width: W, height: H },
  );
}
