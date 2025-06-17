import React from 'react';
import { X } from 'lucide-react';

interface PDFPreviewModalProps {
  pdfUrl: string | null;
  onClose: () => void;
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({ pdfUrl, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-800">CSAW Application Preview</h2>
          <button
            className="text-slate-400 hover:text-slate-600"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-auto bg-white rounded-lg border border-slate-200">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="CSAW Application Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500">Loading preview...</p>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (pdfUrl) {
                const a = document.createElement('a');
                a.href = pdfUrl;
                a.download = `csaw_application_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }
            }}
            className="btn btn-primary"
            disabled={!pdfUrl}
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal; 