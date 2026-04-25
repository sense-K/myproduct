import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};
import { Suspense } from "react";
import "./globals.css";
import { WelcomeModalGate } from "@/components/auth/WelcomeModalGate";
import { JsonLd } from "@/components/seo/JsonLd";
import { rootMetadata } from "@/lib/seo/metadata";
import { buildWebSiteSchema } from "@/lib/seo/json-ld";
import { AnalyticsScripts } from "@/components/analytics/Scripts";

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-cream text-ink">
        {children}
        <Suspense fallback={null}>
          <WelcomeModalGate />
        </Suspense>
        {/* 전 페이지 공통 JSON-LD (PRD 9.4.1) */}
        <JsonLd schema={buildWebSiteSchema()} />
        {/* Analytics: GA4 + Clarity (env 없으면 자동 skip) */}
        <AnalyticsScripts />
      </body>
    </html>
  );
}
