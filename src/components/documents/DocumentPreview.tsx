import React, { useEffect, useState } from 'react';
import { X, FileText, Download, AlertCircle, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDocumentsStore } from '../../store/documents';
import { Document as PDFDocument, Page, pdfjs } from 'react-pdf';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import mammoth from 'mammoth';
import type { Document as BaseDocument } from '../../store/documents';

// Set up PDF.js worker from local package (fixes CDN 404 issue)
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

// Extend Document type to include file_url if not present
interface DocumentWithUrl extends BaseDocument {
  file_url?: string;
}

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
  const document = documents.find(doc => doc.id === documentId) as DocumentWithUrl | undefined;
  const [error, setError] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (document) {
      setError(null);
      setPreviewContent(null);
      setPdfUrl(null);
      setLoading(true);
      try {
        const fileType = document.file_type || '';
        if (fileType.startsWith('text/')) {
          setPreviewContent(document.content);
          setLoading(false);
        } else if (fileType === 'application/pdf') {
          try {
            // Handle both string and array content formats
            let uint8Array: Uint8Array;
            if (typeof document.content === 'string') {
              if (document.content.includes(',')) {
                // Handle comma-separated string
                uint8Array = new Uint8Array(document.content.split(',').map(Number));
              } else {
                // Handle base64 string
                const binaryString = atob(document.content);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                uint8Array = bytes;
              }
            } else if (document.content && typeof document.content === 'object' && 'buffer' in document.content) {
              uint8Array = new Uint8Array((document.content as ArrayBufferView).buffer);
            } else {
              throw new Error('Invalid PDF content format');
            }

            const blob = new Blob([uint8Array], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            setLoading(false);
          } catch (err) {
            console.error('Error processing PDF:', err);
            setError('Error processing PDF file. Please try downloading it instead.');
            setLoading(false);
          }
        } else if (
          fileType === 'application/msword' ||
          fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          try {
            const uint8Array = new Uint8Array(document.content.split(',').map(Number));
            const arrayBuffer = uint8Array.buffer;
            mammoth.convertToHtml({ arrayBuffer })
              .then(result => {
                setPreviewContent(result.value);
                setLoading(false);
              })
              .catch(err => {
                console.error('Error converting Word document:', err);
                setError('Error converting Word document');
                setLoading(false);
              });
          } catch (err) {
            console.error('Error processing Word file:', err);
            setError('Error processing Word file');
            setLoading(false);
          }
        } else {
          setPreviewContent(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in document preview:', err);
        setError('Error loading document preview');
        setLoading(false);
      }
    }

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [document]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!document) return;
    
    try {
      let blob: Blob;
      const fileExtension = documentTitle.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'pdf') {
        let uint8Array: Uint8Array;
        if (typeof document.content === 'string') {
          if (document.content.includes(',')) {
            uint8Array = new Uint8Array(document.content.split(',').map(Number));
          } else {
            const binaryString = atob(document.content);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            uint8Array = bytes;
          }
        } else if (document.content && typeof document.content === 'object' && 'buffer' in document.content) {
          uint8Array = new Uint8Array((document.content as ArrayBufferView).buffer);
        } else {
          throw new Error('Invalid PDF content format');
        }
        blob = new Blob([uint8Array], { type: 'application/pdf' });
      } else {
        blob = new Blob([document.content], { type: document.file_type || 'text/plain' });
      }
      
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = documentTitle;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Error downloading document');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF file. Please try downloading it instead.');
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages || 1);
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  const getFileIcon = () => {
    if (!document) return <FileText size={20} className="text-teal-600" />;
    
    const fileType = document.file_type || '';
    if (fileType === 'application/pdf') {
      return <FileText size={20} className="text-red-600" />;
    } else if (
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return <FileText size={20} className="text-blue-600" />;
    }
    return <FileText size={20} className="text-teal-600" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {getFileIcon()}
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle size={32} className="text-red-500 mb-4" />
              <p className="text-red-500">{error}</p>
              <button
                onClick={handleDownload}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Download Instead
              </button>
            </div>
          ) : !document ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle size={32} className="text-red-500 mb-4" />
              <p className="text-red-500">Document not found</p>
            </div>
          ) : pdfUrl ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={zoomOut}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-teal-600"
                  disabled={scale <= 0.5}
                >
                  <ZoomOut size={20} />
                </button>
                <span className="text-sm text-slate-600">{Math.round(scale * 100)}%</span>
                <button
                  onClick={zoomIn}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-teal-600"
                  disabled={scale >= 2.0}
                >
                  <ZoomIn size={20} />
                </button>
              </div>
              <PDFDocument
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                className="max-w-full"
                loading={<div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>}
                options={{
                  cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
                  cMapPacked: true,
                }}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  width={Math.min(window.innerWidth * 0.8, 800)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={<div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>}
                />
              </PDFDocument>
              {numPages && (
                <div className="flex items-center justify-center mt-4 space-x-4">
                  <button
                    onClick={previousPage}
                    disabled={pageNumber <= 1}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-teal-600 disabled:opacity-50"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm text-slate-600">Page {pageNumber} of {numPages}</span>
                  <button
                    onClick={nextPage}
                    disabled={pageNumber >= numPages}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-teal-600 disabled:opacity-50"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          ) : previewContent !== null ? (
            document.file_type && (document.file_type === 'application/msword' || document.file_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') ? (
              <div 
                className="prose max-w-none bg-white p-8 rounded-lg shadow-sm"
                dangerouslySetInnerHTML={{ __html: previewContent }}
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  lineHeight: '1.6',
                  color: '#1f2937'
                }}
              />
            ) : (
              <pre className="whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">{previewContent}</pre>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle size={32} className="text-yellow-500 mb-4" />
              <p className="text-yellow-700">Preview not available for this file type.</p>
              {document.file_url && (
                <a
                  href={document.file_url}
                  download={document.title}
                  className="mt-4 btn btn-primary"
                >
                  Download File
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview; 