"use client";

import Image from "@tiptap/extension-image";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, type ReactNode } from "react";
import { cn } from "@/components/ui";
import { MediaPicker } from "./MediaPicker";

/**
 * Визуальный редактор текста статей и страниц. Отдаёт HTML; бэкенд дополнительно чистит его
 * от скриптов. Заголовки — только H2/H3: H1 на странице один, это заголовок статьи.
 */
export function RichText({ value, onChange, invalid }: { value: string; onChange: (html: string) => void; invalid?: boolean }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        underline: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image,
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose-content admin-editor min-h-[360px] px-5 py-4 focus:outline-none",
        "aria-label": "Текст",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-white focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15",
        invalid ? "border-danger" : "border-line",
      )}
    >
      {editor && <Toolbar editor={editor} onImage={() => setPickerOpen(true)} />}
      <EditorContent editor={editor} />
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(m) => editor?.chain().focus().setImage({ src: m.url, alt: m.alt || "" }).run()}
      />
    </div>
  );
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Адрес ссылки (пусто — убрать ссылку)", prev ?? "https://");
    if (url === null) return;
    if (url.trim() === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const c = () => editor.chain().focus();
  return (
    <div className="sticky top-0 z-10 flex flex-wrap gap-1 border-b border-line bg-paper/90 p-1.5 backdrop-blur" role="toolbar" aria-label="Форматирование">
      <Tool label="Заголовок раздела" active={s.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}>
        H2
      </Tool>
      <Tool label="Подзаголовок" active={s.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}>
        H3
      </Tool>
      <Sep />
      <Tool label="Жирный" active={s.bold} onClick={() => c().toggleBold().run()}>
        <b>Ж</b>
      </Tool>
      <Tool label="Курсив" active={s.italic} onClick={() => c().toggleItalic().run()}>
        <i>К</i>
      </Tool>
      <Tool label="Ссылка" active={s.link} onClick={setLink}>
        🔗
      </Tool>
      <Sep />
      <Tool label="Маркированный список" active={s.bullet} onClick={() => c().toggleBulletList().run()}>
        • —
      </Tool>
      <Tool label="Нумерованный список" active={s.ordered} onClick={() => c().toggleOrderedList().run()}>
        1.
      </Tool>
      <Tool label="Цитата" active={s.quote} onClick={() => c().toggleBlockquote().run()}>
        «»
      </Tool>
      <Tool label="Разделитель" onClick={() => c().setHorizontalRule().run()}>
        —
      </Tool>
      <Tool label="Картинка из медиабиблиотеки" onClick={onImage}>
        🖼
      </Tool>
      <Sep />
      <Tool label="Отменить" disabled={!s.canUndo} onClick={() => c().undo().run()}>
        ↶
      </Tool>
      <Tool label="Повторить" disabled={!s.canRedo} onClick={() => c().redo().run()}>
        ↷
      </Tool>
    </div>
  );
}

function Tool({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-bold transition-colors disabled:opacity-30",
        active ? "bg-ink text-white" : "text-ink hover:bg-white",
      )}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="mx-1 my-1.5 w-px bg-line" aria-hidden="true" />;
