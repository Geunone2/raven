// 공지 내용(announcements.content)은 2026-08-15부터 Tiptap 에디터로 작성된
// HTML 문자열이지만, 그 이전에 일반 텍스트(줄바꿈만 있는 순수 문자열)로 저장된
// 과거 공지도 그대로 DB에 남아있다. 별도의 데이터 마이그레이션 없이 두 형태를
// 한 렌더러에서 같이 지원하기 위해, 태그가 있는지로 형태를 그때그때 판별한다
// (스키마에 별도 플래그를 추가하지 않는 이유).
export function looksLikeHtml(content: string): boolean {
  return /<[a-z][\s\S]*>/i.test(content);
}

// Tiptap 에디터에 과거 일반 텍스트 공지를 초기 content로 넣어줄 때 쓴다 —
// 그냥 문자열째로 넣으면 Tiptap이 HTML 파서로 읽으면서 줄바꿈이 공백으로
// 뭉개진다(브라우저의 일반적인 HTML 공백 처리 규칙과 동일). 문단(빈 줄 기준)은
// <p>로, 문단 안 줄바꿈은 <br>로 살려서 기존 줄바꿈 모양을 그대로 유지한다.
export function plainTextToHtml(text: string): string {
  if (!text) return "";
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

// Tiptap이 만든 HTML을 dangerouslySetInnerHTML로 그릴 때 공통으로 쓰는 최소한의
// prose 스타일 — 별도 typography 플러그인 없이 문단 간격/리스트 들여쓰기/링크
// 밑줄 정도만 지정한다.
export const RICH_TEXT_CLASS =
  "[&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 " +
  "[&_a]:text-brand [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-edge-strong " +
  "[&_blockquote]:pl-3 [&_blockquote]:text-ink-muted [&_strong]:font-semibold";
