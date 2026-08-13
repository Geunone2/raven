import Link from "next/link";
import { GuildMember } from "@/lib/db/schema";
import { TotalIcon } from "@/components/atoms/BankIcons";

export function MyInfoCard({
  member,
  balance,
}: {
  member: GuildMember | null;
  balance: number;
}) {
  // 비회원이어도 이 카드 자체는 항상 렌더링한다 — 대시보드 우측 컬럼이 이 카드를
  // 포함해 4개로 고정된 스택이라, 카드가 통째로 빠지면 컬럼 높이가 옆 컬럼들과
  // 어긋나 레이아웃이 깨진다(min-h-70은 유지하고 안쪽 내용만 로그인 유도로 교체).
  if (!member) {
    return (
      <div className="flex w-full min-h-70 flex-col rounded-xl border border-edge bg-surface p-4 shadow-md">
        <p className="text-base font-bold text-brand">내 정보</p>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm">
          <p className="text-ink-muted">
            <Link href="/login" className="text-brand hover:underline">
              로그인
            </Link>
            하면 전투력, 통장 잔고 같은 내 정보를 볼 수 있어요.
          </p>
          <p className="text-xs text-ink-faint">
            아직 회원이 아니신가요?{" "}
            <Link href="/signup" className="text-brand hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const total = member.attack + member.defense + member.accuracy;

  return (
    <div className="w-full rounded-xl border border-edge bg-surface p-4 shadow-md min-h-70">
      <p className="text-base font-bold text-brand">내 정보</p>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span>닉네임: {member.nickname}</span>
          <span>길드명: {member.guildName ?? "-"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>클래스: {member.className || "-"}</span>
          <span>레벨: {member.level}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-muted">
          <span>공격력: {member.attack}</span>
          <span>방어력: {member.defense}</span>
          <span>명중: {member.accuracy}</span>
          <span className="font-medium text-ink">총 합: {total}</span>
        </div>
        <div className="flex items-center gap-1.5 border-t border-edge pt-2 text-brand">
          <TotalIcon className="size-4" />
          통장 잔고: <span className="font-semibold text-ink">{balance.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
