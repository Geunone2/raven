import type { Config } from "drizzle-kit";
import { config as loadEnv } from "dotenv";

// drizzle-kit은 Next.js 밖의 독립 CLI라 .env.local을 자동으로 안 읽는다 —
// 이 프로젝트가 실제로 쓰는 .env.local을 명시적으로 지정해서 불러온다.
loadEnv({ path: ".env.local" });

// 마이그레이션(DDL)은 Transaction pooler가 아니라 Session pooler(또는 direct
// connection)로 붙는다 — pgbouncer transaction 모드는 여러 statement로 이뤄진
// 마이그레이션/DDL과 상성이 안 좋다(2026-08-15, SQLite에서 이관).
export default {
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEXT_SESSION_POOLER!,
  },
} satisfies Config;
