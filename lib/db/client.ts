import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// Supabase의 "Transaction" pooler(포트 6543, pgbouncer transaction 모드)를
// 통해 접속한다 — Vercel 같은 서버리스 환경에서 매 요청마다 새 커넥션이 열려도
// 커넥션 풀이 감당하게 하기 위함(2026-08-15, SQLite/better-sqlite3에서 이관).
// pgbouncer transaction 모드는 prepared statement를 세션 간에 재사용할 수
// 없어서, prepare: false가 필수다 — 이게 없으면 "prepared statement already
// exists" 같은 에러가 랜덤하게 난다.
const client = postgres(process.env.NEXT_TRANSACTION_POOLER!, { prepare: false });

export const db = drizzle(client, { schema });
