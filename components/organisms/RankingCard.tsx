import Image from "next/image";
import Link from "next/link";
import { GuildMember } from "@/lib/db/schema";
import { RankBadge } from "@/components/atoms/RankBadge";
import { ClassBadge } from "@/components/atoms/ClassBadge";

const STAT_LABELS = {
  total: "총 합 랭킹",
  attack: "공격력 랭킹",
  defense: "방어력 랭킹",
  accuracy: "명중 랭킹",
} as const;

const STAT_ACCENT_CLASSES = {
  total: "text-rank-total",
  attack: "text-rank-attack",
  defense: "text-rank-defense",
  accuracy: "text-rank-accuracy",
} as const;

const STAT_ICONS = {
  total: "/three.svg",
  attack: "/combat.svg",
  defense: "/shield.svg",
  accuracy: "/hit.svg",
} as const;

type Stat = keyof typeof STAT_LABELS;

function getStatValue(member: GuildMember, stat: Stat) {
  if (stat === "total") return member.attack + member.defense + member.accuracy;
  return member[stat];
}

export function RankingCard({
  stat,
  topCount,
  members,
}: {
  stat: Stat;
  topCount: number;
  members: GuildMember[];
}) {
  return (
    <div className="w-full min-h-80 rounded-xl border border-edge bg-surface p-4 shadow-md">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-base font-bold text-ink">
          <Image src={STAT_ICONS[stat]} alt="" width={20} height={20} className="size-5" />
          {STAT_LABELS[stat]}{" "}
          <span className={STAT_ACCENT_CLASSES[stat]}>TOP {topCount}</span>
        </p>
        <Link href="/ranking" className="shrink-0 text-xs text-ink-muted hover:underline">
          전체보기 &gt;
        </Link>
      </div>
      {members.length === 0 ? (
        <p className="mt-3 text-sm text-ink-faint">등록된 길드원이 없습니다.</p>
      ) : (
        <ul className="mt-3 space-y-1.5 text-sm">
          {members.map((member, index) => (
            <li key={member.id} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <RankBadge rank={index + 1} />
                <ClassBadge job={member.className} />
                <span className="truncate">{member.nickname}</span>
              </span>
              <span className="shrink-0 font-medium text-ink">
                {getStatValue(member, stat).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
