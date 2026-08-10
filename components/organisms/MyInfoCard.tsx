import { GuildMember } from "@/lib/db/schema";
import { TotalIcon } from "@/components/atoms/BankIcons";

export function MyInfoCard({
  member,
  balance,
}: {
  member: GuildMember;
  balance: number;
}) {
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
