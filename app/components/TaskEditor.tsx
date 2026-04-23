"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

type TaskEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
};

export default function TaskEditor({
  value = "<p>Add details...</p>",
  onChange,
}: TaskEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline],
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
    "px-2 py-1 border border-border rounded text-foreground transition-colors disabled:opacity-50";
  const toolbarButtonActive = "bg-primary text-white border-primary";
  const toolbarButtonIdle = "hover:bg-muted";

  return (
    <div className="border border-border bg-background rounded-md p-3 space-y-2 text-foreground">
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${toolbarButtonBase} ${editor.isActive("bold") ? toolbarButtonActive : toolbarButtonIdle}`}
        >
          B
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${toolbarButtonBase} ${editor.isActive("italic") ? toolbarButtonActive : toolbarButtonIdle}`}
        >
          I
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`${toolbarButtonBase} ${editor.isActive("strike") ? toolbarButtonActive : toolbarButtonIdle}`}
        >
          S
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${toolbarButtonBase} ${editor.isActive("underline") ? toolbarButtonActive : toolbarButtonIdle}`}
        >
          U
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${toolbarButtonBase} ${editor.isActive("bulletList") ? toolbarButtonActive : toolbarButtonIdle}`}
        >
          •
        </button>
      </div>

      {/* Editor content goes BELOW toolbar */}
      <EditorContent
        editor={editor}
        className="min-h-28 rounded border border-border bg-surface p-2 text-foreground [&_.ProseMirror]:min-h-24 [&_.ProseMirror]:outline-none [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:ml-5 [&_.ProseMirror_ul]:pl-2 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:ml-5 [&_.ProseMirror_ol]:pl-2"
      />
    </div>
  );
}
