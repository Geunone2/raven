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

// 관리자 길드원 목록(/admin/members) 정렬 기준. 연속값(총 전투력)/날짜(전투력
// 입력 시각)라 길드/서버/클래스 같은 드롭다운 필터로는 안 맞아서 별도 정렬로 뺐다.
export type MemberSort =
  | "power_desc"
  | "power_asc"
  | "stats_updated_desc"
  | "stats_updated_asc"
  | "contribution_desc"
  | "contribution_asc";

export const MEMBER_SORT_LABELS: Record<MemberSort, string> = {
  power_desc: "총 전투력 높은순",
  power_asc: "총 전투력 낮은순",
  stats_updated_desc: "전투력 입력 최신순",
  stats_updated_asc: "전투력 입력 오래된순",
  contribution_desc: "참여도 점수 높은순",
  contribution_asc: "참여도 점수 낮은순",
};

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
