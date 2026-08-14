"use server";

import {
  getAdjacentAnnouncements,
  getAnnouncement,
  getAnnouncementsPage,
} from "@/lib/actions/announcements";
import {
  getAdjacentForumArticles,
  getOfficialForumArticle,
  getOfficialForumPage,
} from "@/lib/actions/officialForum";
import {
  OFFICIAL_FORUM_NOTICE_MENU_SEQ,
  OFFICIAL_FORUM_UPDATE_MENU_SEQ,
  OFFICIAL_FORUM_DEV_NEWS_MENU_SEQ,
} from "@/lib/constants/officialForum";
import { toEpochMs } from "@/lib/time";
import { looksLikeHtml } from "@/lib/richText";
import { NoticeSource } from "@/components/atoms/SourceLabel";

export type NoticeCategory = "all" | NoticeSource;

export type UnifiedNotice = {
  key: string;
  source: NoticeSource;
  title: string;
  date: number;
  isPinned?: boolean;
  imageUrl?: string;
};

const FORUM_MENU_SEQ: Record<Exclude<NoticeSource, "leader">, number> = {
  notice: OFFICIAL_FORUM_NOTICE_MENU_SEQ,
  update: OFFICIAL_FORUM_UPDATE_MENU_SEQ,
  devnote: OFFICIAL_FORUM_DEV_NEWS_MENU_SEQ,
};

async function fetchLeaderNotices(query: string, offset: number, limit: number) {
  const { items, total } = await getAnnouncementsPage({ query, offset, limit });
  return {
    notices: items.map((a): UnifiedNotice => ({
      key: `leader-${a.id}`,
      source: "leader",
      title: a.title,
      date: toEpochMs(a.createdAt),
      isPinned: a.isPinned,
    })),
    total,
  };
}

async function fetchForumNotices(
  source: Exclude<NoticeSource, "leader">,
  query: string,
  offset: number,
  limit: number
) {
  const { notices, total } = await getOfficialForumPage(FORUM_MENU_SEQ[source], offset, limit);
  const filtered = query
    ? notices.filter((n) => n.title.toLowerCase().includes(query.toLowerCase()))
    : notices;
  return {
    // hasMore is based on the raw (unfiltered) fetch — the forum API has no
    // search of its own, so a query can shrink a page to fewer visible items
    // without meaning there's nothing left to page through.
    notices: filtered.map((n): UnifiedNotice => ({
      key: `${source}-${n.id}`,
      source,
      title: n.title,
      date: n.regDate,
      imageUrl: n.thumbnailUrl ?? undefined,
    })),
    total,
    rawCount: notices.length,
  };
}

export async function getNoticesPage({
  category,
  query,
  page,
  pageSize = 10,
}: {
  category: NoticeCategory;
  query: string;
  page: number;
  pageSize?: number;
}): Promise<{ items: UnifiedNotice[]; hasMore: boolean }> {
  const offset = (page - 1) * pageSize;

  if (category === "leader") {
    const { notices, total } = await fetchLeaderNotices(query, offset, pageSize);
    return { items: notices, hasMore: offset + notices.length < total };
  }

  if (category !== "all") {
    const { notices, total, rawCount } = await fetchForumNotices(category, query, offset, pageSize);
    return { items: notices, hasMore: offset + rawCount < total };
  }

  // "all": no single shared cursor exists across a DB table and 3 independently
  // paginated external boards, so instead of true incremental pagination we
  // refetch each source from the top with a growing window each page, merge
  // by date, and slice out just this page's slot. Simpler to reason about
  // correctly than a hand-rolled multi-source cursor, at the cost of refetching
  // already-seen items on every "load more" — acceptable at this app's scale.
  const windowSize = page * pageSize;
  const [leader, notice, update, devnote] = await Promise.all([
    fetchLeaderNotices(query, 0, windowSize),
    fetchForumNotices("notice", query, 0, windowSize),
    fetchForumNotices("update", query, 0, windowSize),
    fetchForumNotices("devnote", query, 0, windowSize),
  ]);

  // 고정 공지(leader 출처만 isPinned을 가짐)는 날짜와 무관하게 항상 맨 위로.
  const merged = [...leader.notices, ...notice.notices, ...update.notices, ...devnote.notices].sort(
    (a, b) => Number(b.isPinned ?? false) - Number(a.isPinned ?? false) || b.date - a.date
  );

  const sliceStart = (page - 1) * pageSize;
  const sliceEnd = page * pageSize;
  const items = merged.slice(sliceStart, sliceEnd);
  const anySourceHasMore =
    leader.total > windowSize ||
    notice.total > windowSize ||
    update.total > windowSize ||
    devnote.total > windowSize;

  return { items, hasMore: merged.length > sliceEnd || anySourceHasMore };
}

export type NoticeNavItem = { key: string; title: string };

export type NoticeDetail = {
  source: NoticeSource;
  title: string;
  date: number;
  isPinned?: boolean;
  content: string;
  // 리더 공지는 2026-08-15부터 Tiptap 에디터로 작성된 HTML이지만, 그 이전에
  // 일반 텍스트로 저장된 과거 공지도 섞여 있어 고정값이 아니라 매번 판별한다
  // (looksLikeHtml). 포럼 게시글은 Netmarble CMS가 내려주는 raw inline-styled
  // HTML이라 항상 true.
  isHtml: boolean;
  originalUrl?: string;
  imageUrl?: string;
  older: NoticeNavItem | null;
  newer: NoticeNavItem | null;
};

// Keys are built as `${source}-${id}` (see fetchLeaderNotices/fetchForumNotices
// above) — none of the source prefixes contain a dash, so splitting on the
// first one cleanly recovers both parts.
export async function getNoticeDetail(key: string): Promise<NoticeDetail | null> {
  const dashIndex = key.indexOf("-");
  if (dashIndex === -1) return null;
  const source = key.slice(0, dashIndex) as NoticeSource;
  const id = Number(key.slice(dashIndex + 1));
  if (!Number.isFinite(id)) return null;

  if (source === "leader") {
    const announcement = await getAnnouncement(id);
    if (!announcement) return null;
    const { older, newer } = await getAdjacentAnnouncements({
      id: announcement.id,
      createdAt: announcement.createdAt,
    });
    return {
      source,
      title: announcement.title,
      date: toEpochMs(announcement.createdAt),
      isPinned: announcement.isPinned,
      content: announcement.content,
      isHtml: looksLikeHtml(announcement.content),
      older: older && { key: `leader-${older.id}`, title: older.title },
      newer: newer && { key: `leader-${newer.id}`, title: newer.title },
    };
  }

  if (source === "notice" || source === "update" || source === "devnote") {
    const menuSeq = FORUM_MENU_SEQ[source];
    const [article, { older, newer }] = await Promise.all([
      getOfficialForumArticle(menuSeq, id),
      getAdjacentForumArticles(menuSeq, id),
    ]);
    if (!article) return null;
    return {
      source,
      title: article.title,
      date: article.regDate,
      content: article.content,
      isHtml: true,
      originalUrl: article.url,
      imageUrl: article.thumbnailUrl ?? undefined,
      older: older && { key: `${source}-${older.id}`, title: older.title },
      newer: newer && { key: `${source}-${newer.id}`, title: newer.title },
    };
  }

  return null;
}
