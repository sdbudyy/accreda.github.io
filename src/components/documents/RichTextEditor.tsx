import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote, Heading2, Heading3, Undo2, Redo2 } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

const toolbarBtn = (isActive: boolean) =>
  `p-2 rounded transition-colors duration-100 flex items-center justify-center text-lg ${
    isActive
      ? 'bg-teal-100 text-teal-700 shadow-sm'
      : 'text-slate-500 hover:bg-slate-100 hover:text-teal-700'
  }`;

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onSave,
  onCancel,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Placeholder.configure({
        placeholder: 'Start typing...'
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm min-h-[200px] max-h-[400px] overflow-y-auto focus:outline-none px-4 py-3 rounded-b-lg border-0 bg-white text-slate-800',
      },
    },
  });

  // Keep editor content in sync with prop
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '<p></p>', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  return (
    <div className="space-y-4">
      <div className="shadow border border-slate-200 rounded-lg bg-white">
        <div className="flex flex-wrap gap-1 p-2 border-b border-slate-100 bg-slate-50 rounded-t-lg">
          <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={toolbarBtn(editor?.isActive('bold') || false)} title="Bold (Ctrl+B)"><Bold size={18} /></button>
          <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={toolbarBtn(editor?.isActive('italic') || false)} title="Italic (Ctrl+I)"><Italic size={18} /></button>
          <button type="button" onClick={() => editor?.chain().focus().toggleUnderline().run()} className={toolbarBtn(editor?.isActive('underline') || false)} title="Underline (Ctrl+U)"><UnderlineIcon size={18} /></button>
          <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={toolbarBtn(editor?.isActive('bulletList') || false)} title="Bullet List"><List size={18} /></button>
          <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={toolbarBtn(editor?.isActive('orderedList') || false)} title="Numbered List"><ListOrdered size={18} /></button>
          <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={toolbarBtn(editor?.isActive('blockquote') || false)} title="Blockquote"><Quote size={18} /></button>
          <button type="button" onClick={() => editor?.chain().focus().setParagraph().run()} className={toolbarBtn(editor?.isActive('paragraph') || false)} title="Paragraph"><span className="font-bold text-base">¶</span></button>
          <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={toolbarBtn(editor?.isActive('heading', { level: 2 }) || false)} title="Heading 2"><Heading2 size={18} /></button>
          <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={toolbarBtn(editor?.isActive('heading', { level: 3 }) || false)} title="Heading 3"><Heading3 size={18} /></button>
          <button type="button" onClick={() => editor?.chain().focus().undo().run()} className={toolbarBtn(false)} title="Undo"><Undo2 size={18} /></button>
          <button type="button" onClick={() => editor?.chain().focus().redo().run()} className={toolbarBtn(false)} title="Redo"><Redo2 size={18} /></button>
        </div>
        <EditorContent editor={editor} />
      </div>
      {onSave && onCancel && (
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg flex items-center"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor; 