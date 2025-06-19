import React, { useEffect, useState } from 'react';
import { FileText, Download, X, AlertCircle } from 'lucide-react';
import { Document } from '../../store/documents';

interface DocumentPreviewProps {
  document: Document;
  onClose: () => void;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const getPreviewContent = () => {
    if (!document.file_type) return <div className="p-4 text-center">No file type information.</div>;

    // Text preview
    if (document.file_type.startsWith('text/')) {
      if (typeof document.content === 'string') {
        return (
          <pre className="whitespace-pre-wrap p-4 bg-slate-50 rounded text-left text-slate-800 max-h-[500px] overflow-auto">{document.content}</pre>
        );
      } else {
        return <div className="p-4 text-center text-red-600">Error: Text file content is not a string.</div>;
      }
    }

    // PDF preview
    if (document.file_type === 'application/pdf') {
      try {
        let blob: Blob;
        if (typeof document.content === 'string') {
          const bytes = base64ToUint8Array(document.content);
          blob = new Blob([bytes], { type: 'application/pdf' });
        } else {
          setError('PDF content is not a string.');
          return null;
        }
        return (
          <iframe
            src={URL.createObjectURL(blob)}
            className="w-full h-[600px]"
            onLoad={() => setLoading(false)}
            title="PDF Preview"
          />
        );
      } catch (e) {
        setError('Failed to decode or display PDF.');
        return null;
      }
    }

    // DOC/DOCX download
    if (
      document.file_type === 'application/msword' ||
      document.file_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return (
        <div className="p-4 text-center">
          <FileText size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">
            Word documents can be previewed after downloading.
            <br />
            <button
              onClick={() => {
                try {
                  let blob: Blob;
                  if (typeof document.content === 'string') {
                    const bytes = base64ToUint8Array(document.content);
                    blob = new Blob([bytes], { type: document.file_type });
                  } else {
                    setError('DOC content is not a string.');
                    return;
                  }
                  const url = URL.createObjectURL(blob);
                  const a = window.document.createElement('a');
                  a.href = url;
                  a.download = document.title;
                  window.document.body.appendChild(a);
                  a.click();
                  window.document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                } catch (e) {
                  setError('Failed to download DOC file.');
                }
              }}
              className="mt-2 inline-flex items-center gap-2 text-teal-600 hover:text-teal-700"
            >
              <Download size={16} />
              Download to View
            </button>
          </p>
        </div>
      );
    }

    return (
      <div className="p-4 text-center">
        <p className="text-slate-600">Preview not available for this file type.</p>
      </div>
    );
  };

  useEffect(() => {
    if (document.file_type === 'application/pdf' && document.file) {
      // If the content is a Blob or ArrayBuffer, create a Blob URL
      const blob = document.file instanceof Blob
        ? document.file
        : new Blob([document.file], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [document]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-slate-800">{document.title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {loading && !error && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center h-full text-red-600">
              <AlertCircle size={32} />
              <div className="mt-2">{error}</div>
            </div>
          )}
          {!error && getPreviewContent()}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview; 