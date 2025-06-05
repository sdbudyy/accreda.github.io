import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Eye } from 'lucide-react';
import DocumentPreview from '../components/documents/DocumentPreview';
import ScrollToTop from '../components/ScrollToTop';

interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  type: string;
  status: string;
  file_type?: string;
  supervisor_id?: string;
  word_count?: number;
  eit_id?: string;
}

interface EITProfile {
  id: string;
  full_name: string;
  email: string;
}

const SupervisorDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [eitProfiles, setEitProfiles] = useState<Record<string, EITProfile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [selectedEIT, setSelectedEIT] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Move fetchDocuments outside useEffect so it can be used by the refresh button
  const fetchDocuments = async () => {
    setLoading(true);
    setRefreshing(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      // Fetch all document_shares for this supervisor
      const { data: shares, error: sharesError } = await supabase
        .from('document_shares')
        .select('document_id, documents:document_id(*)')
        .eq('supervisor_id', user.id);
      if (sharesError) throw sharesError;
      const docs = (shares || []).map((row: any) => row.documents).filter(Boolean);
      setDocuments(docs);
      // Fetch EIT profiles for all unique eit_ids
      const eitIds = Array.from(new Set((docs || []).map((doc: any) => doc.eit_id).filter(Boolean)));
      if (eitIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from('eit_profiles')
          .select('id, full_name, email')
          .in('id', eitIds);
        if (!profileError && profiles) {
          const map: Record<string, EITProfile> = {};
          profiles.forEach((p: EITProfile) => { map[p.id] = p; });
          setEitProfiles(map);
        }
      }
    } catch (err) {
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Get unique EITs for dropdown
  const uniqueEITs = Object.values(eitProfiles);
  // Filter documents by selected EIT
  const filteredDocuments = selectedEIT === 'all'
    ? documents
    : documents.filter(doc => doc.eit_id === selectedEIT);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold mb-4">Shared Documents</h1>
        {/* EIT Filter Dropdown */}
        {uniqueEITs.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <label htmlFor="eit-filter" className="text-sm font-medium text-slate-700">Filter by EIT:</label>
            <select
              id="eit-filter"
              value={selectedEIT}
              onChange={e => setSelectedEIT(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">All EITs</option>
              {uniqueEITs.map(eit => (
                <option key={eit.id} value={eit.id}>{eit.full_name} ({eit.email})</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex justify-end mb-4">
          <button
            className={`btn btn-primary ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={fetchDocuments}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && documents.length === 0 && (
          <div className="text-slate-500 flex flex-col items-center py-12">
            <FileText size={48} className="mx-auto text-slate-400" />
            <div className="mt-4 text-lg font-medium">No documents shared with you yet.</div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(doc => {
            const eit = doc.eit_id ? eitProfiles[doc.eit_id] : undefined;
            return (
              <div key={doc.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg text-slate-800">{doc.title}</h3>
                  <button
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => setPreviewDocument(doc)}
                    title="Preview"
                  >
                    <Eye size={16} />
                  </button>
                </div>
                <div className="text-xs text-slate-500 mb-2">
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span className="capitalize">{doc.status}</span>
                </div>
                {eit && (
                  <div className="text-xs text-slate-600 mt-1">
                    <span>From: <span className="font-medium">{eit.full_name}</span> ({eit.email})</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {previewDocument && (
          <DocumentPreview
            document={{
              ...previewDocument,
              type: (['essay', 'saos', 'other'].includes(previewDocument.type) ? previewDocument.type : 'other') as 'essay' | 'saos' | 'other',
              status: (['draft', 'submitted', 'approved', 'rejected'].includes(previewDocument.status) ? previewDocument.status : 'draft') as 'draft' | 'submitted' | 'approved' | 'rejected',
              word_count: typeof previewDocument.word_count === 'number' ? previewDocument.word_count : 0,
            }}
            onClose={() => setPreviewDocument(null)}
          />
        )}
      </div>
      <ScrollToTop />
    </>
  );
};

export default SupervisorDocuments; 