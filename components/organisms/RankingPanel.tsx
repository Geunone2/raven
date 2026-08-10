"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GuildMember } from "@/lib/db/schema";
import { GUILD_NAMES, CLASS_NAMES } from "@/lib/constants/members";
import { getClassTone } from "@/lib/constants/classes";
import { Badge, type Tone } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { hashTone } from "@/lib/colorHash";
import { RankingTable } from "@/components/organisms/RankingTable";

const ALL = "전체";
const PAGE_SIZE = 20;

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

export function RankingPanel({ members }: { members: GuildMember[] }) {
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [activeGuild, setActiveGuild] = useState(ALL);
  const [activeClass, setActiveClass] = useState(ALL);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 검색/필터와 무관하게 항상 동일한 순위를 보여주기 위해, 전체 길드원을
  // 총합 기준으로 정렬한 뒤 member.id -> 순위를 미리 계산해둔다.
  const fullyRanked = useMemo(() => {
    return [...members].sort(
      (a, b) =>
        b.attack + b.defense + b.accuracy - (a.attack + a.defense + a.accuracy)
    );
  }, [members]);

  const rankById = useMemo(() => {
    const map = new Map<number, number>();
    fullyRanked.forEach((member, index) => map.set(member.id, index + 1));
    return map;
  }, [fullyRanked]);

  const filtered = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    return fullyRanked
      .filter(
        (member) => !trimmedQuery || member.nickname.toLowerCase().includes(trimmedQuery)
      )
      .filter((member) => activeGuild === ALL || member.guildName === activeGuild)
      .filter((member) => activeClass === ALL || member.className === activeClass);
  }, [fullyRanked, query, activeGuild, activeClass]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => prev + PAGE_SIZE);
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  function selectGuild(name: string) {
    setActiveGuild(name);
    setVisibleCount(PAGE_SIZE);
  }

  function selectClass(name: string) {
    setActiveClass(name);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div className="space-y-4">
      <form
        className="flex flex-nowrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(queryInput);
          setVisibleCount(PAGE_SIZE);
        }}
      >
        <div className="min-w-0 flex-1">
          <Input
            type="text"
            placeholder="닉네임으로 검색"
            value={queryInput}
            onChange={(event) => setQueryInput(event.target.value)}
          />
        </div>
        <Button type="submit" className="shrink-0 whitespace-nowrap">
          검색
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-faint">길드</span>
        {[ALL, ...GUILD_NAMES].map((name) => (
          <FilterChip
            key={name}
            label={name}
            tone={name === ALL ? "neutral" : hashTone(name)}
            active={activeGuild === name}
            onClick={() => selectGuild(name)}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-faint">직업</span>
        {[ALL, ...CLASS_NAMES].map((name) => (
          <FilterChip
            key={name}
            label={name}
            tone={name === ALL ? "neutral" : getClassTone(name)}
            active={activeClass === name}
            onClick={() => selectClass(name)}
          />
        ))}
      </div>

      <RankingTable members={visible} rankById={rankById} />

      {hasMore && (
        <div ref={sentinelRef} className="py-4 text-center text-sm text-ink-faint">
          더 불러오는 중...
        </div>
      )}
    </div>
  );
}
