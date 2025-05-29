import React, { useEffect, useState } from 'react';
import { FileText, Download, Trash2, AlertCircle, Upload, Search, Filter, X, Edit2, Eye } from 'lucide-react';
import { useDocumentsStore, Document } from '../store/documents';
import { supabase } from '../lib/supabase';
import { useSubscriptionStore } from '../store/subscriptionStore';
import DocumentPreview from '../components/documents/DocumentPreview';

const Documents: React.FC = () => {
  const {
    documents,
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    loadUserDocuments,
  } = useDocumentsStore();

  const { tier, documentLimit, fetchSubscription } = useSubscriptionStore();
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
        // Optional: Add a temporary highlight effect
        el.classList.add('ring', 'ring-teal-400', 'transition-all', 'duration-300');
        setTimeout(() => {
          el.classList.remove('ring', 'ring-teal-400');
        }, 2000); // Highlight for 2 seconds
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

  // Handle document creation
  const handleCreateDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      console.log('Starting document creation process...');
      
      // Read file content based on file type
      let content = '';
      const fileType = file.type;
      
      if (fileType.startsWith('text/')) {
        content = await file.text();
      } else {
        content = `File type (${fileType}) not directly viewable. Will be stored.`; // Simplified content for non-text
      }
      
      await createDocument(file.name, content, 'other', file);
      console.log('Document creation completed successfully');
      // Clear the file input
      e.target.value = '';
    } catch (err) {
      console.error('Document creation failed:', err);
      alert('Failed to create document. Please try again.');
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
      await updateDocument(editingDocument.id, newTitle, doc.content);
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

  return (
    <div className="space-y-6">
      {/* Document Limit Banner */}
      {tier === 'free' && (
        <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-900 text-center font-semibold">
          {documentCreatedCount < documentLimit
            ? `You have ${documentLimit - documentCreatedCount} document${documentLimit - documentCreatedCount === 1 ? '' : 's'} left on the Free plan.`
            : 'You have reached your document upload limit for the Free plan. Upgrade to add more.'}
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Documents</h1>
        <label className={`btn flex items-center cursor-pointer ${tier === 'free' && documentCreatedCount >= documentLimit ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed' : 'btn-primary'}`}>
          <Upload size={16} className="mr-1.5" />
          Upload Document
          <input
            type="file"
            className="hidden"
            onChange={handleCreateDocument}
            disabled={tier === 'free' && documentCreatedCount >= documentLimit}
          />
        </label>
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
              <p className="text-sm text-slate-400 mt-2 italic">Content not viewable here. Click the eye icon to preview.</p>
            )}
            
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span className="capitalize">{doc.status}</span>
              </div>
              
              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                {doc.type}
              </span>
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
          <AlertCircle size={48} className="mx-auto text-red-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">Error loading documents</h3>
          <p className="mt-2 text-slate-500">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Documents;