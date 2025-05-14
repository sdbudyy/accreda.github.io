import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Paperclip, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLocalDocumentStore } from '../store/localDocuments';
import RichTextEditor from '../components/documents/RichTextEditor';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

const EditDocument: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDocument, updateDocument } = useLocalDocumentStore();
  const [content, setContent] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [category, setCategory] = useState('Experience Reports');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      const document = getDocument(id);
      if (document) {
        setContent(document.content);
        setDocumentName(document.name);
        setCategory(document.category);
        // Load attachments if they exist
        if (document.attachments) {
          setAttachments(document.attachments);
        }
      } else {
        navigate('/documents');
      }
    }
  }, [id, getDocument, navigate]);

  const handleSave = async () => {
    try {
      if (!documentName.trim()) {
        alert('Please enter a document name');
        return;
      }

      setIsSaving(true);
      if (id) {
        await updateDocument(id, {
          name: documentName,
          content,
          category,
          attachments,
        });
        navigate('/documents');
      }
    } catch (error) {
      console.error('Error updating document:', error);
      alert('Error updating document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Here you would typically upload the file to your storage service
      // For now, we'll create a mock attachment
      const newAttachment: Attachment = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file), // This is temporary, replace with actual upload URL
      };

      setAttachments(prev => [...prev, newAttachment]);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/documents')}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Edit Document</h1>
          <p className="text-slate-500 mt-1">Modify your document</p>
        </div>
      </div>

      <div className="card space-y-4">
        <div>
          <label htmlFor="documentName" className="block text-sm font-medium text-slate-700 mb-1">
            Document Name
          </label>
          <input
            id="documentName"
            type="text"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Enter document name..."
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="Experience Reports">Experience Reports</option>
            <option value="Technical Reports">Technical Reports</option>
            <option value="Certificates">Certificates</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Content
          </label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            onSave={handleSave}
            onCancel={() => navigate('/documents')}
          />
        </div>

        {/* Attachments Section */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Attachments
          </label>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <Paperclip size={16} className="text-slate-500" />
                  <span className="text-sm text-slate-700">{attachment.name}</span>
                  <span className="text-xs text-slate-500">
                    ({(attachment.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="p-1 text-slate-500 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <label className="flex items-center space-x-2 p-2 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-teal-500">
              <Paperclip size={16} className="text-slate-500" />
              <span className="text-sm text-slate-700">Add attachment</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary flex items-center"
        >
          <Save size={16} className="mr-1.5" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default EditDocument; 