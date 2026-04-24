// 레지스트리 목 데이터 — DB 연동 후 제거

export type RegistryEntry = {
  registration_number: string;
  issued_at: string;
  product_name: string;
  tagline: string;
  nickname: string;
  hash_short: string;
  product_slug: string | null;
};

export const MOCK_REGISTRY: RegistryEntry[] = [
  { registration_number: "A3F8D9", issued_at: "2026-04-23T14:30:12Z", product_name: "언더커버", tagline: "프랜차이즈 점주를 위한 익명 커뮤니티", nickname: "익명 메이커", hash_short: "a3f8d9c2b1e4f7a2", product_slug: "undercov" },
  { registration_number: "B7E2C1", issued_at: "2026-04-22T10:15:00Z", product_name: "걸음일기", tagline: "매일 걸은 길을 지도로 모아요", nickname: "산책러", hash_short: "b7e2c14d9f3a1c8e", product_slug: "walk-diary" },
  { registration_number: "C4D5F8", issued_at: "2026-04-21T16:45:30Z", product_name: "글공방", tagline: "혼자 쓰는 글도 피드백 받자", nickname: "글쟁이", hash_short: "c4d5f8a2b3c1d9e7", product_slug: "geulbang" },
  { registration_number: "D9A1E3", issued_at: "2026-04-20T09:00:00Z", product_name: "고양이 심판", tagline: "고양이가 내 코드를 리뷰해줘요", nickname: "냥냥메이커", hash_short: "d9a1e3f4b2c8d1e5", product_slug: "cat-judge" },
  { registration_number: "E2B6D4", issued_at: "2026-04-19T13:20:00Z", product_name: "집중해", tagline: "공부 타이머 + 학습 통계", nickname: "공부왕", hash_short: "e2b6d4a9c3f1b7e8", product_slug: "jibjoonghe" },
  { registration_number: "F5C3A7", issued_at: "2026-04-18T11:00:00Z", product_name: "커피런", tagline: "팀 커피 주문을 카카오톡으로 간편하게", nickname: "카페메이커", hash_short: "f5c3a7b1d9e2c4f8", product_slug: "coffee-run" },
];
