import React, { useEffect, useState } from 'react';
import { FileText, Download, Trash2, Upload, Search, Filter, X, Edit2, Eye, Share2 } from 'lucide-react';
import { useDocumentsStore, Document } from '../store/documents';
import { supabase } from '../lib/supabase';
import { useSubscriptionStore } from '../store/subscriptionStore';
import DocumentPreview from '../components/documents/DocumentPreview';
import Modal from '../components/common/Modal';
import { toast } from 'react-hot-toast';
import type { Google, Gapi } from '../types/google';

interface TokenResponse {
  access_token: string;
  error?: string;
}

interface PickerCallback {
  action: string;
  docs?: Array<{
    id: string;
    name: string;
    mimeType: string;
  }>;
}

interface DocumentObject {
  id: string;
  name: string;
  mimeType: string;
}

interface ResponseObject {
  action: string;
  docs?: DocumentObject[];
}

declare global {
  interface Window {
    gapi: Gapi;
    google: Google;
  }
}

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly';

const Documents: React.FC = () => {
  const {
    documents,
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    loadUserDocuments,
    fetchDocumentShares,
    shareDocumentWithSupervisors,
  } = useDocumentsStore();

  const { documentLimit, tier, fetchSubscription } = useSubscriptionStore();
  const [documentCreatedCount, setDocumentCreatedCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editingDocument, setEditingDocument] = useState<{ id: string; title: string } | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const documentRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [shareModalDoc, setShareModalDoc] = useState<Document | null>(null);
  const [supervisors, setSupervisors] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [selectedSupervisors, setSelectedSupervisors] = useState<string[]>([]);
  const [shareLoading, setShareLoading] = useState(false);
  const [unshareLoading, setUnshareLoading] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [importMenuOpen, setImportMenuOpen] = useState(false);
  const [importedContent, setImportedContent] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [uploadInputRef] = useState(() => React.createRef<HTMLInputElement>());
  const [gapiInited, setGapiInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);
  const [tokenClient, setTokenClient] = useState<any>(null);

  // Load OneDrive API when needed
  const loadOneDriveApi = () => {
    if (window.OneDrive) return Promise.resolve();
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://js.live.net/v7.2/OneDrive.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };

  // Handle OneDrive import
  const handleImportOneDrive = async () => {
    setImportMenuOpen(false);
    await loadOneDriveApi();
    alert('OneDrive picker scaffolded. Add credentials and logic when ready.');
    setImportedContent('Imported content from OneDrive (simulated).');
    setShowImportModal(true);
  };

  // Add Google API initialization
  useEffect(() => {
    const loadGoogleAPI = async () => {
      try {
        // Load the Google API script
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
          window.gapi.load('client', async () => {
            try {
              await window.gapi.client.init({
                apiKey: GOOGLE_API_KEY,
                discoveryDocs: API_DISCOVERY_DOCS,
              });
              setGapiInited(true);
              
              // Load the Google Identity Services script
              const scriptGIS = document.createElement('script');
              scriptGIS.src = 'https://accounts.google.com/gsi/client';
              scriptGIS.onload = () => {
                const token = window.google.accounts.oauth2.initTokenClient({
                  client_id: GOOGLE_CLIENT_ID,
                  scope: SCOPES,
                  callback: (response: TokenResponse) => {
                    if (response.error) {
                      console.error('OAuth error:', response.error);
                      return;
                    }
                    handleTokenResponse(response);
                  }
                });
                setTokenClient(token);
                setGisInited(true);
              };
              document.body.appendChild(scriptGIS);
            } catch (err) {
              console.error('Error initializing GAPI client:', err);
            }
          });
        };
        document.body.appendChild(script);
      } catch (err) {
        console.error('Error loading Google API:', err);
      }
    };

    if (!gapiInited) {
      loadGoogleAPI();
    }
  }, [gapiInited]);

  // Add Google Drive picker functionality
  const handleGoogleDriveImport = () => {
    if (!gapiInited || !gisInited) {
      toast.error('Google Drive API not initialized yet. Please try again in a moment.');
      return;
    }

    if (!tokenClient) {
      toast.error('Authentication not ready. Please try again.');
      return;
    }

    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  };

  const handleTokenResponse = async (response: TokenResponse) => {
    if (response.error) {
      console.error('OAuth error:', response.error);
      toast.error('Failed to authenticate with Google Drive');
      return;
    }

    try {
      // Load the Google Picker script if not already loaded
      if (!window.google.picker) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js?onload=onApiLoad';
          script.onload = () => resolve();
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      // Create and configure the picker
      if (window.google.picker) {
        const docsView = new google.picker.DocsView()
          .setIncludeFolders(true)
          .setMimeTypes('application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain');
        
        const picker = new google.picker.PickerBuilder()
          .enableFeature(google.picker.Feature.NAV_HIDDEN)
          .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
          .setAppId(GOOGLE_CLIENT_ID)
          .setOAuthToken(response.access_token)
          .addView(docsView)
          .setCallback((data: ResponseObject) => {
            if (data.action === google.picker.Action.PICKED && data.docs && data.docs.length > 0) {
              handlePickerSelection(data.docs[0]);
            }
          })
          .build();
        
        picker.setVisible(true);
      } else {
        throw new Error('Google Picker failed to load');
      }

    } catch (err) {
      console.error('Error accessing Google Drive:', err);
      toast.error('Failed to access Google Drive');
    }
  };

  const handlePickerSelection = async (file: DocumentObject) => {
    try {
      const response = await window.gapi.client.drive.files.get({
        fileId: file.id,
        alt: 'media'
      });
      
      // Create document with the content
      await createDocument(file.name, response.body, 'other');
      toast.success('Document imported successfully!');
    } catch (err) {
      console.error('Error downloading file:', err);
      toast.error('Failed to import document');
    }
  };

  useEffect(() => {
    console.log('Documents component mounted');
    loadUserDocuments();
  }, [loadUserDocuments]);

  useEffect(() => {
    console.log('Documents array updated:', {
      documentCount: documents.length,
      documents
    });
  }, [documents]);

  useEffect(() => {
    const handleScrollToDocument = (e: CustomEvent) => {
      const documentId = e.detail.documentId;
      const el = documentRefs.current[documentId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring', 'ring-teal-400', 'transition-all', 'duration-300');
        setTimeout(() => {
          el.classList.remove('ring', 'ring-teal-400');
        }, 2000);
      }
    };
    window.addEventListener('scroll-to-document', handleScrollToDocument as EventListener);
    return () => window.removeEventListener('scroll-to-document', handleScrollToDocument as EventListener);
  }, []);

  useEffect(() => {
    const fetchCount = async () => {
      await fetchSubscription();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('subscriptions')
          .select('document_created_count')
          .eq('user_id', user.id)
          .single();
        if (data && typeof data.document_created_count === 'number') {
          setDocumentCreatedCount(data.document_created_count);
        }
      }
    };
    fetchCount();
  }, []);

  // Fetch connected supervisors when share modal opens
  useEffect(() => {
    if (shareModalDoc) {
      (async () => {
        setShareError(null);
        setShareLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          const { data, error } = await supabase
            .from('supervisor_eit_relationships')
            .select('supervisor_id, supervisor_profiles (id, full_name, email)')
            .eq('eit_id', user.id)
            .eq('status', 'active');
          if (error) throw error;
          const supervisorsList = (data || []).map((rel: any) => rel.supervisor_profiles).filter(Boolean);
          setSupervisors(supervisorsList);
          // Fetch current shares for this doc
          const shares = await fetchDocumentShares(shareModalDoc.id);
          setSelectedSupervisors(shares.map(s => s.id));
        } catch (err) {
          setShareError('Failed to load supervisors.');
        } finally {
          setShareLoading(false);
        }
      })();
    }
  }, [shareModalDoc]);

  // Handle document creation
  const handleCreateDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      console.log('Starting document creation process...');
      
      let content = '';
      const fileType = file.type;
      
      if (fileType.startsWith('text/')) {
        content = await file.text();
      } else {
        content = `File type (${fileType}) not directly viewable. Will be stored.`;
      }
      
      await createDocument(file.name, content, 'other', file);
      console.log('Document creation completed successfully');
      e.target.value = '';
    } catch (err) {
      console.error('Document creation failed:', err);
      toast.error('Failed to create document. Please try again.');
    }
  };

  // Handle document download
  const handleDownload = async (doc: Document) => {
    try {
      // Create a download link for the content
      const blob = new Blob([doc.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download document');
    }
  };

  // Handle document deletion
  const handleDelete = async (doc: Document) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(doc.id);
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete document');
      }
    }
  };

  // Handle document title edit
  const handleEditTitle = async (doc: Document) => {
    setEditingDocument({ id: doc.id, title: doc.title });
    setNewTitle(doc.title);
  };

  const handleSaveTitle = async () => {
    if (!editingDocument) return;
    try {
      const doc = documents.find(d => d.id === editingDocument.id);
      if (!doc) throw new Error('Document not found');
      await updateDocument(editingDocument.id, { title: newTitle });
      setEditingDocument(null);
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update document title');
    }
  };

  // Add this function to handle preview
  const handlePreview = (doc: Document) => {
    setPreviewDocument(doc);
  };

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || doc.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });

  // Get unique types from documents
  const types = ['all', ...new Set(documents.map(doc => doc.type))];

  const handleUnshare = async (supervisorId: string) => {
    if (!shareModalDoc) return;
    setUnshareLoading(supervisorId);
    try {
      await useDocumentsStore.getState().removeDocumentShare(shareModalDoc.id, supervisorId);
      // Remove from selectedSupervisors
      setSelectedSupervisors(selectedSupervisors.filter(id => id !== supervisorId));
      // Optionally, refresh the shares from backend
      const shares = await fetchDocumentShares(shareModalDoc.id);
      setSelectedSupervisors(shares.map(s => s.id));
      // Also refresh the main document list so 'Not shared' updates
      await loadUserDocuments();
    } finally {
      setUnshareLoading(null);
    }
  };

  const handleShare = async () => {
    if (!shareModalDoc) return;
    setShareLoading(true);
    setShareError(null);
    try {
      await shareDocumentWithSupervisors(shareModalDoc.id, selectedSupervisors);
      setShareModalDoc(null);
      await loadUserDocuments(); // Refresh after sharing
    } catch (err) {
      setShareError('Failed to share document.');
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Import Modal for previewing imported content */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Imported Content Preview</h2>
          <div className="bg-slate-50 p-4 rounded mb-4 whitespace-pre-wrap text-slate-800 min-h-[120px]">
            {importedContent}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowImportModal(false)}
          >
            Close
          </button>
        </div>
      </Modal>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Documents</h1>
          <p className="text-slate-500 mt-1">Upload, manage, and share your documents.</p>
        </div>
        <div className="flex gap-2 items-center relative">
          {/* Combined Upload/Import Button */}
          <button
            className="btn flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
            onClick={() => setImportMenuOpen((v) => !v)}
            type="button"
          >
            <Upload size={18} />
            Upload / Import
          </button>
          {importMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-100"
                onClick={() => {
                  setImportMenuOpen(false);
                  uploadInputRef.current?.click();
                }}
              >
                Upload from Device
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-100"
                onClick={() => {
                  setImportMenuOpen(false);
                  handleGoogleDriveImport();
                }}
              >
                Import from Google Drive
              </button>
            </div>
          )}
          {/* Hidden file input for upload */}
          <input
            type="file"
            className="hidden"
            ref={uploadInputRef}
            onChange={handleCreateDocument}
          />
        </div>
      </div>
      {/* Document Limit Banner */}
      {tier === 'free' && (
        <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-900 text-center font-semibold">
          {documentLimit === -1 || documentLimit === 2147483647
            ? 'You have Unlimited documents on your plan.'
            : documentCreatedCount < documentLimit
              ? `You have ${documentLimit - documentCreatedCount} document${documentLimit - documentCreatedCount === 1 ? '' : 's'} left on the Free plan.`
              : 'You have reached your document upload limit for the Free plan. Upgrade to add more.'}
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Documents</h1>
      </div>

      {/* Search and Filter Bar */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary flex items-center"
          >
            <Filter size={16} className="mr-1.5" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc) => (
          <div 
            key={doc.id}
            ref={el => (documentRefs.current[doc.id] = el)}
            data-document-id={doc.id}
            className="document-card bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out"
          >
            <div className="flex items-center justify-between mb-2">
              {editingDocument?.id === doc.id ? (
                <div className="flex-1 mr-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-200 rounded"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') setEditingDocument(null);
                    }}
                    autoFocus
                  />
                </div>
              ) : (
                <h3 className="font-semibold text-lg text-slate-800">{doc.title}</h3>
              )}
              <div className="flex space-x-1">
                <button 
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => handleEditTitle(doc)}
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => handlePreview(doc)}
                >
                  <Eye size={16} />
                </button>
                <button 
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => handleDownload(doc)}
                >
                  <Download size={16} />
                </button>
                <button 
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600"
                  onClick={() => handleDelete(doc)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            {/* Only show content for text files, or a placeholder for others */}
            {doc.file_type && doc.file_type.startsWith('text/') ? (
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{doc.content}</p>
            ) : (
              null
            )}
            
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                {doc.shared_supervisors && doc.shared_supervisors.length > 0 ? (
                  <button
                    className="text-xs px-2 py-1 rounded-full bg-teal-50 text-teal-700 flex items-center gap-1 hover:bg-teal-100 transition"
                    onClick={() => {/* show modal with supervisor list */}}
                    title="View shared supervisors"
                  >
                    Shared with {doc.shared_supervisors.length}
                  </button>
                ) : (
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">Not shared</span>
                )}
              </div>
              {doc.type === 'other' ? (
                <button
                  className="text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-700 flex items-center gap-1 hover:bg-teal-200 transition"
                  onClick={() => setShareModalDoc(doc)}
                  title="Share with Supervisor"
                >
                  <Share2 size={16} /> Share
                </button>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                  {doc.type}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreview
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}

      {/* Share Modal */}
      {shareModalDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Share Document</h2>
              <button
                onClick={() => setShareModalDoc(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-slate-700 mb-2">Share <span className="font-semibold">{shareModalDoc.title}</span> with your supervisor.</p>
              {shareLoading ? (
                <div className="text-slate-500 text-sm">Loading supervisors...</div>
              ) : supervisors.length === 0 ? (
                <div className="text-slate-500 text-sm">No active supervisors found. Connect with a supervisor first.</div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Supervisors</label>
                  <div className="flex flex-col gap-2 mb-2">
                    {selectedSupervisors.map((id, idx) => {
                      const sup = supervisors.find(s => s.id === id);
                      return sup ? (
                        <div key={id} className="flex items-center gap-2 bg-slate-100 rounded px-2 py-1">
                          <span>{sup.full_name} ({sup.email})</span>
                          <button
                            onClick={() => handleUnshare(id)}
                            className="text-red-500 hover:text-red-700"
                            disabled={!!unshareLoading}
                          >
                            {unshareLoading === id ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      ) : null;
                    })}
                    <div className="flex gap-2 items-center">
                      <select
                        value=""
                        onChange={e => {
                          const val = e.target.value;
                          if (val && !selectedSupervisors.includes(val)) setSelectedSupervisors([...selectedSupervisors, val]);
                        }}
                        className="input flex-1"
                      >
                        <option value="">Select another...</option>
                        {supervisors.filter(s => !selectedSupervisors.includes(s.id)).map(sup => (
                          <option key={sup.id} value={sup.id}>{sup.full_name} ({sup.email})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
              {shareError && <div className="text-red-600 text-sm mt-2">{shareError}</div>}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShareModalDoc(null)}
                className="btn btn-secondary"
                disabled={shareLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-primary ${(!selectedSupervisors.length || shareLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!selectedSupervisors.length || shareLoading}
                onClick={handleShare}
              >
                {shareLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-slate-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">No documents found</h3>
          <p className="mt-2 text-slate-500">
            {searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by uploading your first document'}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-slate-500">Loading documents...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-red-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">Error loading documents</h3>
          <p className="mt-2 text-slate-500">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Documents;