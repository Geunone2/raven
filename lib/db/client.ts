import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

// Supabase의 "Transaction" pooler(포트 6543, pgbouncer transaction 모드)를
// 통해 접속한다 — Vercel 같은 서버리스 환경에서 매 요청마다 새 커넥션이 열려도
// 커넥션 풀이 감당하게 하기 위함(2026-08-15, SQLite/better-sqlite3에서 이관).
// pgbouncer transaction 모드는 prepared statement를 세션 간에 재사용할 수
// 없어서, prepare: false가 필수다 — 이게 없으면 "prepared statement already
// exists" 같은 에러가 랜덤하게 난다.
//
// max: 1 — postgres.js 기본값(10)을 그대로 두면 서버리스 인스턴스 하나마다
// 최대 10개씩 연결을 열어두려고 해서, 트래픽이 늘어 인스턴스가 여러 개 뜨는
// 순간 Supabase pooler의 전체 연결 슬롯(무료 플랜 기준 얼마 안 됨)을 금방
// 소진해버린다 — "배포 직후엔 잘 되다가 몇 분 뒤 갑자기 안 됨" 증상의 원인
// (2026-08-15). 서버리스 함수 하나는 한 번에 연결 하나만 쓰고, 실제 풀링은
// pgbouncer(Transaction pooler)가 담당하게 하는 게 Supabase 공식 권장 설정.
// idle_timeout은 안 쓰는 연결을 빨리 반납해서 다른 인스턴스가 더 잘 쓰게 한다.
const client = postgres(process.env.NEXT_TRANSACTION_POOLER!, {
  prepare: false,
  max: 1,
  idle_timeout: 20,
});

export const db = drizzle(client, { schema });
