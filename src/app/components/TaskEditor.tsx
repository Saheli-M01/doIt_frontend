"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Strikethrough, CircleSmall } from "lucide-react";
import { Underline as UnderlineIcon } from "lucide-react";

type TaskEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
};

export default function TaskEditor({ value = "", onChange }: TaskEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      UnderlineExtension,
      Placeholder.configure({
        placeholder: "Add details.",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  const toolbarButtonBase =
    "group relative flex h-10 w-10 items-center justify-center rounded-md border border-border/90 bg-background text-foreground shadow-[0_3px_0_0_rgba(107,114,128,0.45)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_rgba(107,114,128,0.4)] active:translate-y-0.5 active:shadow-[0_1px_0_0_rgba(107,114,128,0.4)] disabled:opacity-50";
  const toolbarButtonActive =
    "border-primary/80 bg-primary/20 text-primary shadow-[0_3px_0_0_rgba(59,130,246,0.45)] hover:shadow-[0_5px_0_0_rgba(59,130,246,0.42)]";
  const toolbarButtonIdle = "hover:bg-muted/70";

  return (
    <div className="border border-border bg-background rounded-md p-3 space-y-2 text-foreground">
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${toolbarButtonBase} ${editor.isActive("bold") ? toolbarButtonActive : toolbarButtonIdle}`}
        >
          <Bold className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${toolbarButtonBase} ${editor.isActive("italic") ? toolbarButtonActive : toolbarButtonIdle}`}
        >
          <Italic className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${toolbarButtonBase} ${editor.isActive("underline") ? toolbarButtonActive : toolbarButtonIdle}`}
        >
          <UnderlineIcon className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`${toolbarButtonBase} ${editor.isActive("strike") ? toolbarButtonActive : toolbarButtonIdle}`}
        >
          <Strikethrough className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${toolbarButtonBase} ${editor.isActive("bulletList") ? toolbarButtonActive : toolbarButtonIdle}`}
        >
          <CircleSmall className="h-5 w-5" />
        </button>
      </div>

      {/* Editor content goes BELOW toolbar */}
      <EditorContent
        editor={editor}
        className="task-editor-content min-h-28 rounded border border-border bg-surface p-2 text-foreground
  [&_.ProseMirror]:min-h-24 
  [&_.ProseMirror]:outline-none
  [&_.ProseMirror_ul]:list-disc 
  [&_.ProseMirror_ul]:ml-5 
  [&_.ProseMirror_ul]:pl-2 
  [&_.ProseMirror_ol]:list-decimal 
  [&_.ProseMirror_ol]:ml-5 
  [&_.ProseMirror_ol]:pl-2
"
      />
    </div>
  );
}
