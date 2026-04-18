"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Link2Off,
  Image as ImageIcon,
  Play,
  Minus,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded p-1.5 text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "disabled:pointer-events-none disabled:opacity-40",
        active && "bg-accent text-accent-foreground"
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

export function RichTextEditor({
  name,
  defaultValue = "",
  placeholder,
  className,
}: RichTextEditorProps) {
  const [html, setHtml] = useState(defaultValue);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({ inline: false }),
      Youtube.configure({ nocookie: true }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[200px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      setHtml(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // keep hidden input in sync when defaultValue changes externally
  useEffect(() => {
    if (editor && defaultValue !== editor.getHTML()) {
      editor.commands.setContent(defaultValue);
      setHtml(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("連結網址", prev ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  const insertImage = () => {
    if (!editor) return;
    const url = window.prompt("圖片網址");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const insertYoutube = () => {
    if (!editor) return;
    const url = window.prompt("YouTube 影片網址");
    if (!url) return;
    editor.commands.setYoutubeVideo({ src: url });
  };

  return (
    <div className={cn("overflow-hidden rounded-md border bg-background", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 px-2 py-1.5">
        <ToolbarButton
          title="粗體 (Ctrl+B)"
          active={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="斜體 (Ctrl+I)"
          active={editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="行內程式碼"
          active={editor?.isActive("code")}
          onClick={() => editor?.chain().focus().toggleCode().run()}
        >
          <Code className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          title="標題 H1"
          active={editor?.isActive("heading", { level: 1 })}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="標題 H2"
          active={editor?.isActive("heading", { level: 2 })}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="標題 H3"
          active={editor?.isActive("heading", { level: 3 })}
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          title="項目清單"
          active={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="編號清單"
          active={editor?.isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="引用區塊"
          active={editor?.isActive("blockquote")}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          title={editor?.isActive("link") ? "移除連結" : "插入連結"}
          active={editor?.isActive("link")}
          onClick={setLink}
        >
          {editor?.isActive("link") ? (
            <Link2Off className="h-3.5 w-3.5" />
          ) : (
            <Link2 className="h-3.5 w-3.5" />
          )}
        </ToolbarButton>
        <ToolbarButton title="插入圖片" onClick={insertImage}>
          <ImageIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
              <ToolbarButton title="嵌入 YouTube" onClick={insertYoutube}>
          <Play className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="分隔線"
          onClick={() =>
            editor?.chain().focus().setHorizontalRule().run()
          }
        >
          <Minus className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          title="復原 (Ctrl+Z)"
          disabled={!editor?.can().undo()}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="重做 (Ctrl+Y)"
          disabled={!editor?.can().redo()}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      {/* Placeholder overlay (shows when editor is empty) */}
      {editor && editor.isEmpty && placeholder && (
        <div className="pointer-events-none absolute px-4 py-3 text-sm text-muted-foreground">
          {placeholder}
        </div>
      )}

      {/* Hidden input for native form submission */}
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
