"use client";

import { useMemo, useState } from "react";
import { utils as xlsxUtils, writeFile as writeXlsxFile } from "xlsx";
import { Download } from "lucide-react";
import { GuildMember } from "@/lib/db/schema";
import { GUILD_NAMES, CLASS_NAMES, MEMBER_SORT_LABELS, type MemberSort } from "@/lib/constants/members";
import { SERVERS } from "@/lib/constants/schedules";
import { getClassTone } from "@/lib/constants/classes";
import { Badge, type Tone } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { hashTone } from "@/lib/colorHash";
import { toEpochMs, todayDateString } from "@/lib/time";
import { MemberTable } from "@/components/organisms/MemberTable";

const ALL = "전체";
const DEFAULT_SORT = "기본(가입일순)";
type SortChoice = MemberSort | typeof DEFAULT_SORT;

function FilterChip({
  label,
  tone,
  active,
  onClick,
}: {
  label: string;
  tone: Tone;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full transition-shadow ${
        active ? "ring-2 ring-brand" : "hover:ring-2 hover:ring-edge-strong"
      }`}
    >
      <Badge tone={tone} size="lg">
        {label}
      </Badge>
    </button>
  );
}

// 엑셀은 앱 화면과 달리 나중에/다른 맥락에서 열어볼 수 있어서, 연도를 생략하는
// 화면용 포맷(formatMonthDayTimeUtcWithSeconds 등) 대신 연도 포함 전체 날짜를 쓴다.
function formatFullDateTime(input: string): string {
  const date = new Date(toEpochMs(input));
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function exportMembersToExcel(members: GuildMember[]) {
  const rows = members.map((member) => ({
    닉네임: member.nickname,
    서버: member.server ?? "",
    길드명: member.guildName ?? "",
    클래스: member.className,
    레벨: member.level,
    공격력: member.attack,
    방어력: member.defense,
    명중: member.accuracy,
    총전투력: member.attack + member.defense + member.accuracy,
    "전투력 입력일": member.statsUpdatedAt ? formatFullDateTime(member.statsUpdatedAt) : "",
  }));
  const sheet = xlsxUtils.json_to_sheet(rows);
  const workbook = xlsxUtils.book_new();
  xlsxUtils.book_append_sheet(workbook, sheet, "길드원");
  writeXlsxFile(workbook, `길드원_목록_${todayDateString()}.xlsx`);
}

// 전투력 입력 시각이 없는(한 번도 입력 안 한) 회원은 정렬 방향과 무관하게 항상
// 맨 뒤로 보낸다 — "가장 최근"도 "가장 오래됨"도 아닌, 아예 값이 없는 상태라서.
function compareStatsUpdatedAt(a: GuildMember, b: GuildMember, dir: "asc" | "desc") {
  if (!a.statsUpdatedAt && !b.statsUpdatedAt) return 0;
  if (!a.statsUpdatedAt) return 1;
  if (!b.statsUpdatedAt) return -1;
  const cmp = a.statsUpdatedAt.localeCompare(b.statsUpdatedAt);
  return dir === "asc" ? cmp : -cmp;
}

export function MemberPanel({ members }: { members: GuildMember[] }) {
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [activeGuild, setActiveGuild] = useState(ALL);
  const [activeServer, setActiveServer] = useState(ALL);
  const [activeClass, setActiveClass] = useState(ALL);
  const [activeSort, setActiveSort] = useState<SortChoice>(DEFAULT_SORT);

  const filtered = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    // .filter()는 원래 순서를 보존하므로, "기본" 정렬(=members가 이미
    // 가입일 내림차순으로 내려온 상태)은 별도 정렬 없이 그대로 유지된다.
    const rows = members
      .filter(
        (member) => !trimmedQuery || member.nickname.toLowerCase().includes(trimmedQuery)
      )
      .filter((member) => activeGuild === ALL || member.guildName === activeGuild)
      .filter((member) => activeServer === ALL || member.server === activeServer)
      .filter((member) => activeClass === ALL || member.className === activeClass);

    if (activeSort === DEFAULT_SORT) return rows;

    const sorted = [...rows];
    switch (activeSort) {
      case "power_desc":
        sorted.sort(
          (a, b) =>
            b.attack + b.defense + b.accuracy - (a.attack + a.defense + a.accuracy)
        );
        break;
      case "power_asc":
        sorted.sort(
          (a, b) =>
            a.attack + a.defense + a.accuracy - (b.attack + b.defense + b.accuracy)
        );
        break;
      case "stats_updated_desc":
        sorted.sort((a, b) => compareStatsUpdatedAt(a, b, "desc"));
        break;
      case "stats_updated_asc":
        sorted.sort((a, b) => compareStatsUpdatedAt(a, b, "asc"));
        break;
    }
    return sorted;
  }, [members, query, activeGuild, activeServer, activeClass, activeSort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <form
          className="flex flex-nowrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(queryInput);
          }}
        >
          <div className="min-w-0 flex-1 max-w-xs">
            <Input
              type="text"
              placeholder="닉네임으로 검색"
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" className="shrink-0 whitespace-nowrap">
            검색
          </Button>
        </form>

        <Button
          type="button"
          variant="secondary"
          className="shrink-0 whitespace-nowrap"
          onClick={() => exportMembersToExcel(filtered)}
        >
          <Download className="mr-1.5 inline size-4" />
          엑셀로 내보내기
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-faint">길드</span>
        {[ALL, ...GUILD_NAMES].map((name) => (
          <FilterChip
            key={name}
            label={name}
            tone={name === ALL ? "neutral" : hashTone(name)}
            active={activeGuild === name}
            onClick={() => setActiveGuild(name)}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-faint">서버</span>
        {[ALL, ...SERVERS].map((name) => (
          <FilterChip
            key={name}
            label={name}
            tone={name === ALL ? "neutral" : hashTone(name)}
            active={activeServer === name}
            onClick={() => setActiveServer(name)}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-faint">클래스</span>
        {[ALL, ...CLASS_NAMES].map((name) => (
          <FilterChip
            key={name}
            label={name}
            tone={name === ALL ? "neutral" : getClassTone(name)}
            active={activeClass === name}
            onClick={() => setActiveClass(name)}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-faint">순서</span>
        {([DEFAULT_SORT, ...(Object.keys(MEMBER_SORT_LABELS) as MemberSort[])] as SortChoice[]).map(
          (sort) => (
            <FilterChip
              key={sort}
              label={sort === DEFAULT_SORT ? sort : MEMBER_SORT_LABELS[sort]}
              tone="neutral"
              active={activeSort === sort}
              onClick={() => setActiveSort(sort)}
            />
          )
        )}
      </div>

      <MemberTable members={filtered} />
    </div>
  );
}
