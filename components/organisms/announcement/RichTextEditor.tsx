"use client";

import { useCallback, useState, type ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Link2,
  Undo2,
  Redo2,
} from "lucide-react";
import { looksLikeHtml, plainTextToHtml, RICH_TEXT_CLASS } from "@/lib/richText";

function ToolbarButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`rounded p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-brand/15 text-brand" : "text-ink-muted hover:bg-surface-hover"
      }`}
    >
      {children}
    </button>
  );
}

// 공지 작성/수정 폼에서 기본 textarea 대신 쓰는 Tiptap 리치 텍스트 에디터
// (2026-08-15). 서버 액션은 여전히 <form action={...}>로 FormData를 받는
// 구조라, 에디터 자체는 폼에 직접 값을 못 넣으므로 hidden input(name={name})에
// HTML을 실시간 동기화해서 넣어준다 — CustomSelect와 같은 패턴.
export function RichTextEditor({
  name,
  defaultValue = "",
}: {
  name: string;
  defaultValue?: string;
}) {
  // 과거 일반 텍스트로 저장된 공지를 열었을 때 줄바꿈이 뭉개지지 않도록,
  // HTML처럼 안 보이는 값은 문단/줄바꿈 구조를 살려 HTML로 먼저 변환해 넣는다.
  const initialContent = looksLikeHtml(defaultValue) ? defaultValue : plainTextToHtml(defaultValue);
  const [html, setHtml] = useState(initialContent);

  const editor = useEditor({
    immediatelyRender: false,
    // Tiptap 3의 StarterKit은 link/underline 확장을 기본 포함하므로(개별
    // @tiptap/extension-* 패키지를 따로 등록하면 중복 경고가 뜬다) 옵션으로만
    // 설정한다.
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true },
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: `min-h-40 rounded-b-md border border-t-0 border-edge-strong bg-surface-sunken px-3 py-2 text-sm text-ink focus:outline-none ${RICH_TEXT_CLASS}`,
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = (editor.getAttributes("link").href as string | undefined) ?? "";
    const url = window.prompt("링크 URL을 입력하세요(비우면 링크 해제)", previousUrl);
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div>
      <input type="hidden" name={name} value={html} />
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-md border border-edge-strong bg-surface-raised px-2 py-1.5">
        <ToolbarButton
          label="굵게"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="기울임"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="밑줄"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="취소선"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-edge" />
        <ToolbarButton
          label="글머리 기호 목록"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="번호 목록"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="인용구"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="링크" active={editor.isActive("link")} onClick={setLink}>
          <Link2 className="size-4" />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-edge" />
        <ToolbarButton
          label="실행 취소"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="다시 실행"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="size-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
