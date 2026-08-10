import { GuildMember, characterTypes, guildMemberRoles } from "@/lib/db/schema";
import { toEpochMs } from "@/lib/time";

export const roleLabels: Record<(typeof guildMemberRoles)[number], string> = {
  guild_leader: "길드장",
  vice_leader: "부길드장",
  elder: "장로",
  member: "일반",
  trial: "수습",
};

export const characterTypeLabels: Record<(typeof characterTypes)[number], string> = {
  main: "본캐",
  alt: "부캐",
};

export const GUILD_NAMES = ["리더1", "리더2", "리더4"];

// 길드마다 소속 서버가 고정되어 있다 (리더1/리더4 = 메투스, 리더2 = 돌로르).
export const GUILD_SERVER_MAP: Record<string, string> = {
  리더1: "메투스",
  리더4: "메투스",
  리더2: "돌로르",
};

export function getGuildServer(guildName: string | null): string | null {
  if (!guildName) return null;
  return GUILD_SERVER_MAP[guildName] ?? null;
}

export const CLASS_NAMES = [
  "뱅가드",
  "버서커",
  "어쌔신",
  "워로드",
  "건슬링어",
  "나이트레인저",
  "디스트로이어",
  "엘리멘탈리스트",
  "데스브링어",
  "디바인캐스터",
];

const STATS_STALE_MS = 7 * 24 * 60 * 60 * 1000;

// statsUpdatedAt is a SQLite CURRENT_TIMESTAMP-style UTC string (no timezone
// marker), so it has to go through toEpochMs() rather than `new Date()`.
export function isStatsStale(statsUpdatedAt: string | null): boolean {
  if (!statsUpdatedAt) return true;
  return Date.now() - toEpochMs(statsUpdatedAt) > STATS_STALE_MS;
}

// 랭킹에서 다루는 4개 스탯 종류 — RankingCard(대시보드)와 인원 상세 페이지
// (ranking/[memberId])에서 공유해서 쓴다.
export type RankStat = "total" | "attack" | "defense" | "accuracy";

export const RANK_STAT_LABELS: Record<RankStat, string> = {
  total: "종합 랭킹",
  attack: "공격력 랭킹",
  defense: "방어력 랭킹",
  accuracy: "명중 랭킹",
};

export const RANK_STAT_ACCENT_CLASSES: Record<RankStat, string> = {
  total: "text-rank-total",
  attack: "text-rank-attack",
  defense: "text-rank-defense",
  accuracy: "text-rank-accuracy",
};

export const RANK_STAT_ICONS: Record<RankStat, string> = {
  total: "/three.svg",
  attack: "/combat.svg",
  defense: "/shield.svg",
  accuracy: "/hit.svg",
};

export function getRankStatValue(member: GuildMember, stat: RankStat): number {
  if (stat === "total") return member.attack + member.defense + member.accuracy;
  return member[stat];
}

export type UpdateStatsResult = { ok: boolean; message: string } | null;
