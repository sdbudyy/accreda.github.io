import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from 'ckeditor5-build-classic-dna';
// @ts-ignore
import type { CKEditorEvent, CKEditor5Editor } from '@ckeditor/ckeditor5-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

const editorStyle = {
  border: '1px solid #e2e8f0', // slate-200
  borderRadius: '0.5rem', // rounded-lg
  background: '#f8fafc', // slate-50
  minHeight: '400px',
  padding: '1rem',
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onSave,
  onCancel
}) => {
  return (
    <div className="space-y-4">
      <div className="border border-slate-200 rounded-lg bg-slate-50">
        <CKEditor
          editor={ClassicEditor}
          data={content}
          config={{
            toolbar: [
              'heading',
              '|',
              'bold',
              'italic',
              'underline',
              'link',
              '|',
              'bulletedList',
              'numberedList',
              '|',
              'insertTable',
              'codeBlock',
              'blockQuote',
              'undo',
              'redo',
              'pasteFromOffice',
            ],
          }}
          onChange={(_event: any, editor: any) => {
            const data = editor.getData();
            onChange(data);
          }}
        />
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
      <style>{`
        .ck-editor__editable_inline {
          border-radius: 0.5rem !important;
          background: #f8fafc !important;
          min-height: 400px !important;
          padding: 1rem !important;
          border: none !important;
        }
        .ck.ck-toolbar {
          border-radius: 0.5rem 0.5rem 0 0 !important;
          background: #f1f5f9 !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor; 