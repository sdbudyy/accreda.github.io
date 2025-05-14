import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Link,
  Image,
  FileText,
  Paperclip,
  Save,
  X
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onSave,
  onCancel
}) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleFormat = (command: string) => {
    document.execCommand(command, false);
  };

  const handleLink = () => {
    if (linkUrl) {
      document.execCommand('createLink', false, linkUrl);
      setShowLinkInput(false);
      setLinkUrl('');
    }
  };

  const handleImage = () => {
    if (imageUrl) {
      document.execCommand('insertImage', false, imageUrl);
      setShowImageInput(false);
      setImageUrl('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
        <button
          onClick={() => handleFormat('bold')}
          className="p-2 rounded hover:bg-slate-200"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => handleFormat('italic')}
          className="p-2 rounded hover:bg-slate-200"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => handleFormat('underline')}
          className="p-2 rounded hover:bg-slate-200"
          title="Underline"
        >
          <Underline size={16} />
        </button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <button
          onClick={() => handleFormat('insertUnorderedList')}
          className="p-2 rounded hover:bg-slate-200"
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => handleFormat('insertOrderedList')}
          className="p-2 rounded hover:bg-slate-200"
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <button
          onClick={() => setShowLinkInput(true)}
          className="p-2 rounded hover:bg-slate-200"
          title="Insert Link"
        >
          <Link size={16} />
        </button>
        <button
          onClick={() => setShowImageInput(true)}
          className="p-2 rounded hover:bg-slate-200"
          title="Insert Image"
        >
          <Image size={16} />
        </button>
        <div className="w-px h-6 bg-slate-300 mx-1" />
        <label className="p-2 rounded hover:bg-slate-200 cursor-pointer" title="Attach File">
          <Paperclip size={16} />
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Link Input Modal */}
      {showLinkInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Enter URL"
              className="w-full px-3 py-2 border rounded-lg mb-2"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLinkInput(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleLink}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Input Modal */}
      {showImageInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Insert Image</h3>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
              className="w-full px-3 py-2 border rounded-lg mb-2"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImageInput(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleImage}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div
        contentEditable
        className="min-h-[400px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg flex items-center"
        >
          <X size={16} className="mr-1" />
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center"
        >
          <Save size={16} className="mr-1" />
          Save
        </button>
      </div>
    </div>
  );
};

export default RichTextEditor; 