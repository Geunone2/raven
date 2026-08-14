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
// max: 1로 처음 줄였다가(2026-08-15) 반대 문제가 생겼다 — /나 /bank처럼 한
// 페이지에서 Promise.all로 병렬 쿼리를 10개 넘게 쏘는 화면이, 연결이 하나뿐이라
// 그 쿼리들이 전부 한 줄로 줄서서 처리되다 타임아웃이 나기 시작했다(관리자
// 페이지처럼 쿼리가 적은 화면은 0%였는데 /, /bank, /index처럼 무거운 화면만
// 에러율이 높았던 게 단서). max: 5로 완화해서 한 요청의 병렬 쿼리를 어느 정도
// 동시에 처리할 여유를 주면서도, 기존 기본값(10)보다는 낮게 유지해 서버리스
// 인스턴스가 여러 개 뜰 때 Supabase pooler 연결 슬롯을 너무 빨리 소진하지
// 않게 했다. idle_timeout은 안 쓰는 연결을 빨리 반납해서 다른 인스턴스가 더
// 잘 쓰게 한다. connect_timeout은 연결 자체가 막혔을 때 무한정 기다리지 않고
// 빠르게 실패해서(느린 원인 파악이 쉬워지도록) 10초로 잡았다.
const client = postgres(process.env.NEXT_TRANSACTION_POOLER!, {
  prepare: false,
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
