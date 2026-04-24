type Props = {
  schema: Record<string, unknown> | Record<string, unknown>[];
};

/** JSON-LD를 <script type="application/ld+json">으로 주입. SSR에서 렌더링. */
export function JsonLd({ schema }: Props) {
  return (
    <script
      type="application/ld+json"
      // suppressHydrationWarning: 서버/클라이언트 간 날짜 포맷 차이 방지
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
