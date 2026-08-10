"use server";

const FORUM_ARTICLE_API = "https://forum.netmarble.com/api/game/raven2/official/forum/raven2/article";
const FORUM_LIST_API = `${FORUM_ARTICLE_API}/list`;

type RawForumArticle = {
  id: number;
  title: string;
  regDate: number;
  thumbnailUrl?: string;
};

type RawForumArticleDetail = RawForumArticle & {
  content: string;
};

// Links inside Netmarble's raw content HTML have no `target`, so clicking one
// navigates our own tab away to an external page. Not a full HTML parser —
// just enough to add target/rel to <a> tags that don't already set target —
// acceptable since this is trusted first-party CMS content, not arbitrary
// user-submitted HTML.
function openLinksInNewTab(html: string): string {
  return html.replace(/<a\b([^>]*)>/gi, (match, attrs: string) => {
    if (/target\s*=/i.test(attrs)) return match;
    return `<a${attrs} target="_blank" rel="noopener noreferrer">`;
  });
}

// The forum API returns titles with HTML entities already escaped
// (e.g. "코멘터리 &lt;86&gt;"), which would show up literally if rendered as-is.
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, "&");
}

export type OfficialForumNotice = {
  id: number;
  title: string;
  regDate: number;
  url: string;
  thumbnailUrl: string | null;
};

async function fetchForumPage(
  menuSeq: number,
  offset: number,
  limit: number
): Promise<{ notices: OfficialForumNotice[]; total: number }> {
  const url = `${FORUM_LIST_API}?menuSeq=${menuSeq}&sort=NEW&start=${offset}&rows=${limit}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return { notices: [], total: 0 };
    const data: { articleList?: RawForumArticle[]; totalCount?: number } = await res.json();

    return {
      notices: (data.articleList ?? []).map((article) => ({
        id: article.id,
        title: decodeHtmlEntities(article.title),
        regDate: article.regDate,
        url: `https://forum.netmarble.com/raven2/view/${menuSeq}/${article.id}`,
        thumbnailUrl: article.thumbnailUrl || null,
      })),
      total: data.totalCount ?? 0,
    };
  } catch {
    // Netmarble's forum being slow/unreachable shouldn't break our own page.
    return { notices: [], total: 0 };
  }
}

export async function getOfficialForumNotices(
  menuSeq: number,
  limit = 5
): Promise<OfficialForumNotice[]> {
  return (await fetchForumPage(menuSeq, 0, limit)).notices;
}

// The forum API's `start` param is a real offset (verified against the live
// API: start=5 returns older posts than start=0) and `totalCount` in the
// response lets callers compute whether more pages exist.
export async function getOfficialForumPage(menuSeq: number, offset: number, limit: number) {
  return fetchForumPage(menuSeq, offset, limit);
}

export type OfficialForumArticle = {
  id: number;
  title: string;
  // Raw HTML straight from Netmarble's CMS (inline-styled `<span style="...">`,
  // `<p style="...">`, etc.) — meant to be rendered as-is, not decoded/escaped.
  content: string;
  regDate: number;
  url: string;
  thumbnailUrl: string | null;
};

export async function getOfficialForumArticle(
  menuSeq: number,
  id: number
): Promise<OfficialForumArticle | null> {
  const url = `${FORUM_ARTICLE_API}/${id}?menuSeq=${menuSeq}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data: { article?: RawForumArticleDetail } = await res.json();
    if (!data.article) return null;

    return {
      id: data.article.id,
      title: decodeHtmlEntities(data.article.title),
      content: openLinksInNewTab(data.article.content),
      regDate: data.article.regDate,
      url: `https://forum.netmarble.com/raven2/view/${menuSeq}/${id}`,
      thumbnailUrl: data.article.thumbnailUrl || null,
    };
  } catch {
    return null;
  }
}

// The list is sorted by regDate (`sort=NEW`), but article ids are NOT reliably
// monotonic with regDate within a single board (verified: id 25671 sorts
// between the older 25668/25669 despite being numerically higher) — so
// "previous/next by id" would occasionally be wrong. Instead we scan the real
// list, doubling the fetch window until the target id turns up with a
// confirmed neighbor on both sides (or we hit the cap, for very old posts).
export async function getAdjacentForumArticles(
  menuSeq: number,
  id: number
): Promise<{ older: OfficialForumNotice | null; newer: OfficialForumNotice | null }> {
  const maxLimit = 800;
  for (let limit = 50; limit <= maxLimit; limit *= 2) {
    const { notices } = await fetchForumPage(menuSeq, 0, limit);
    const index = notices.findIndex((n) => n.id === id);
    if (index === -1) continue;

    const newer = index > 0 ? notices[index - 1] : null;
    if (index < notices.length - 1) {
      return { older: notices[index + 1], newer };
    }
    if (limit >= maxLimit) {
      // Found right at the fetched edge with no way to confirm what comes
      // after — leave "older" unknown rather than guess.
      return { older: null, newer };
    }
  }
  return { older: null, newer: null };
}
