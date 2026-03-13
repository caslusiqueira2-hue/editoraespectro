import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { Node, mergeAttributes } from "@tiptap/core";
import { useCallback, useRef, useEffect } from "react";
import { uploadPostImage } from "@/hooks/usePosts";
import { toast } from "sonner";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Code, Link as LinkIcon, Image as ImageIcon, Quote,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Minus, Undo, Redo, LetterText,
} from "lucide-react";

// Custom paragraph node that supports a "class" attribute for drop cap
const CustomParagraph = Node.create({
  name: "paragraph",
  priority: 1000,
  group: "block",
  content: "inline*",
  addAttributes() {
    return {
      class: { default: null, parseHTML: (el) => el.getAttribute("class") || null, renderHTML: (attrs) => attrs.class ? { class: attrs.class } : {} },
    };
  },
  parseHTML() { return [{ tag: "p" }]; },
  renderHTML({ HTMLAttributes }) {
    return ["p", mergeAttributes(HTMLAttributes), 0];
  },
});

const FONT_OPTIONS = [
  { label: "Merriweather", value: "Merriweather" },
  { label: "EB Garamond", value: "EB Garamond" },
  { label: "Libre Baskerville", value: "Libre Baskerville" },
  { label: "Crimson Pro", value: "Crimson Pro" },
  { label: "Playfair Display", value: "Playfair Display" },
];

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function RichEditor({ content, onChange }: RichEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        paragraph: false, // disable default, use custom
      }),
      CustomParagraph,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-accent underline" } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      FontFamily,
      Placeholder.configure({ placeholder: "Comece a escrever…" }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose-editor outline-none min-h-[400px] text-foreground",
      },
    },
  }, []);

  const handleImageUpload = useCallback(async () => {
    fileInputRef.current?.click();
  }, []);

  const onFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    try {
      const url = await uploadPostImage(file);
      editor.chain().focus().setImage({ src: url }).run();
      toast.success("Imagem inserida");
    } catch (err: any) {
      toast.error("Erro: " + err.message);
    }
    e.target.value = "";
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL do link:", prev || "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const toggleDropCap = useCallback(() => {
    if (!editor) return;
    const { from } = editor.state.selection;
    const resolved = editor.state.doc.resolve(from);
    const node = resolved.parent;

    if (node.type.name !== "paragraph") {
      toast.error("Posicione o cursor em um parágrafo");
      return;
    }

    const currentClass = node.attrs.class || "";
    const hasDropCap = currentClass.includes("has-dropcap");

    editor.chain().focus().updateAttributes("paragraph", {
      class: hasDropCap ? null : "has-dropcap",
    }).run();
  }, [editor]);

  if (!editor) return null;

  // Check if current paragraph has dropcap
  const { from } = editor.state.selection;
  const currentNode = editor.state.doc.resolve(from).parent;
  const isDropCapActive = currentNode.type.name === "paragraph" && (currentNode.attrs.class || "").includes("has-dropcap");

  const currentFont = editor.getAttributes("textStyle").fontFamily || "";

  const ToolBtn = ({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${active ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="border-b border-border px-3 py-2 flex flex-wrap items-center gap-0.5 bg-secondary/50">
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Desfazer"><Undo size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Refazer"><Redo size={16} /></ToolBtn>
        <div className="w-px h-6 bg-border mx-1" />

        {/* Heading select */}
        <select
          onChange={(e) => {
            const v = e.target.value;
            if (v === "p") editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: Number(v) as 1 | 2 | 3 }).run();
          }}
          value={
            editor.isActive("heading", { level: 1 }) ? "1" :
            editor.isActive("heading", { level: 2 }) ? "2" :
            editor.isActive("heading", { level: 3 }) ? "3" : "p"
          }
          className="bg-transparent text-muted-foreground text-xs px-2 py-1.5 rounded border border-border outline-none focus:ring-1 focus:ring-accent cursor-pointer"
        >
          <option value="p">Parágrafo</option>
          <option value="1">Título 1</option>
          <option value="2">Título 2</option>
          <option value="3">Título 3</option>
        </select>

        {/* Font family select */}
        <select
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") editor.chain().focus().unsetFontFamily().run();
            else editor.chain().focus().setFontFamily(v).run();
          }}
          value={currentFont}
          className="bg-transparent text-muted-foreground text-xs px-2 py-1.5 rounded border border-border outline-none focus:ring-1 focus:ring-accent cursor-pointer"
        >
          <option value="">Fonte padrão</option>
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
              {f.label}
            </option>
          ))}
        </select>
        <div className="w-px h-6 bg-border mx-1" />

        <ToolBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Negrito"><Bold size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Itálico"><Italic size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Sublinhado"><UnderlineIcon size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Tachado"><Strikethrough size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} title="Código"><Code size={16} /></ToolBtn>
        <div className="w-px h-6 bg-border mx-1" />

        <ToolBtn active={editor.isActive("link")} onClick={setLink} title="Link"><LinkIcon size={16} /></ToolBtn>
        <ToolBtn onClick={handleImageUpload} title="Imagem"><ImageIcon size={16} /></ToolBtn>
        <div className="w-px h-6 bg-border mx-1" />

        <ToolBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citação"><Quote size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Lista"><List size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Lista numerada"><ListOrdered size={16} /></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Separador"><Minus size={16} /></ToolBtn>
        <div className="w-px h-6 bg-border mx-1" />

        <ToolBtn active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Alinhar à esquerda"><AlignLeft size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Centralizar"><AlignCenter size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Alinhar à direita"><AlignRight size={16} /></ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()} title="Justificar"><AlignJustify size={16} /></ToolBtn>
        <div className="w-px h-6 bg-border mx-1" />

        <ToolBtn active={isDropCapActive} onClick={toggleDropCap} title="Capitular (letra grande inicial)"><LetterText size={16} /></ToolBtn>
      </div>

      {/* Editor area */}
      <div className="px-6 py-8">
        <EditorContent editor={editor} />
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileSelected} className="hidden" />
    </div>
  );
}
