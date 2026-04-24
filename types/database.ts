// -----------------------------------------------------------------------------
// Supabase 자동 생성 타입 자리.
// 실제 타입은 `npm run gen:types`로 덮어쓰게 됩니다. (아래 명령 참고)
//   npx supabase gen types typescript --project-id <your-project-ref> --schema public > types/database.ts
// 값이 채워지기 전까지는 타입 안전성이 비어있는 빈 스키마로 유지됩니다.
// -----------------------------------------------------------------------------

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
