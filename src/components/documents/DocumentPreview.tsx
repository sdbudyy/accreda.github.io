import React from 'react';
import { X, FileText, Download } from 'lucide-react';
import { useDocumentsStore } from '../../store/documents';

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  isOpen,
  onClose,
  documentId,
  documentTitle
}) => {
  const { documents } = useDocumentsStore();
  const document = documents.find(doc => doc.id === documentId);

  if (!isOpen || !document) return null;

  const handleDownload = () => {
    const blob = new Blob([document.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title}.txt`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText size={20} className="text-teal-600" />
            <h3 className="text-lg font-semibold text-slate-800">{documentTitle}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-teal-600"
              onClick={handleDownload}
            >
              <Download size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-4rem)]">
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">
              {document.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview; 