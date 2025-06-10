import React, { useState, useEffect, useRef } from 'react';
import { Link, Plus, X, ExternalLink, FileText, Calendar, MessageSquare, Mail, Video, File, Users, BookOpen, FileSpreadsheet, Presentation, Image, FileCode, FileArchive, FileAudio, FileVideo } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface QuickLink {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

// Map of domain patterns to their corresponding icons
const domainIcons: { [key: string]: React.ReactNode } = {
  'docs.google.com': <FileText className="text-blue-500" size={24} />,
  'calendar.google.com': <Calendar className="text-blue-500" size={24} />,
  'mail.google.com': <Mail className="text-blue-500" size={24} />,
  'meet.google.com': <Video className="text-blue-500" size={24} />,
  'drive.google.com': <File className="text-blue-500" size={24} />,
  'sheets.google.com': <FileSpreadsheet className="text-blue-500" size={24} />,
  'slides.google.com': <Presentation className="text-blue-500" size={24} />,
  'teams.microsoft.com': <Users className="text-blue-500" size={24} />,
  'outlook.office.com': <Mail className="text-blue-500" size={24} />,
  'slack.com': <MessageSquare className="text-blue-500" size={24} />,
  'notion.so': <BookOpen className="text-blue-500" size={24} />,
  'figma.com': <Image className="text-blue-500" size={24} />,
  'github.com': <FileCode className="text-blue-500" size={24} />,
  'dropbox.com': <FileArchive className="text-blue-500" size={24} />,
  'spotify.com': <FileAudio className="text-blue-500" size={24} />,
  'youtube.com': <FileVideo className="text-blue-500" size={24} />,
};

// Function to get the appropriate icon for a URL
const getIconForUrl = (url: string): React.ReactNode => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Check for exact domain matches
    for (const [domain, icon] of Object.entries(domainIcons)) {
      if (hostname.includes(domain)) {
        return icon;
      }
    }
    
    // Default icon if no match found
    return <Link size={24} className="text-slate-400" />;
  } catch {
    // If URL is invalid, return default icon
    return <Link size={24} className="text-slate-400" />;
  }
};

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, url: string) => void;
  initialUrl?: string;
}

const AddLinkModal: React.FC<AddLinkModalProps> = ({ isOpen, onClose, onAdd, initialUrl }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState(initialUrl || '');
  const [error, setError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setUrl(initialUrl || '');
      setError('');
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) {
      setError('Please fill in all fields');
      return;
    }

    try {
      new URL(url);
      onAdd(name, url);
      setName('');
      setUrl('');
      setError('');
    } catch {
      setError('Please enter a valid URL');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Add Quick Link</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Link Name
              </label>
              <input
                id="name"
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., My Google Doc"
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="https://..."
              />
            </div>

            {url && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <div className="flex items-center space-x-3">
                  {getIconForUrl(url)}
                  <span className="text-gray-900">{name || 'Link Name'}</span>
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Add Link
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const QuickLinks: React.FC = () => {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialUrl, setModalInitialUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const dropRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  // Drag-and-drop handlers
  useEffect(() => {
    const handleDrop = (e: DragEvent) => {
      if (!dropRef.current) return;
      if (!dropRef.current.contains(e.target as Node)) return;
      e.preventDefault();
      setIsDragOver(false);
      // Try to get a URL from the dropped data
      const url = e.dataTransfer?.getData('text/uri-list') || e.dataTransfer?.getData('text/plain');
      if (url && url.startsWith('http')) {
        setModalInitialUrl(url);
        setIsModalOpen(true);
      }
    };
    const handleDragOver = (e: DragEvent) => {
      if (!dropRef.current) return;
      if (!dropRef.current.contains(e.target as Node)) return;
      e.preventDefault();
      setIsDragOver(true);
    };
    const handleDragLeave = (e: DragEvent) => {
      if (!dropRef.current) return;
      if (!dropRef.current.contains(e.target as Node)) return;
      setIsDragOver(false);
    };
    document.addEventListener('drop', handleDrop);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    return () => {
      document.removeEventListener('drop', handleDrop);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
    };
  }, []);

  const fetchLinks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('quick_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching quick links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async (name: string, url: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('quick_links')
        .insert([
          {
            user_id: user.id,
            name,
            url,
            icon: 'link'
          }
        ]);

      if (error) throw error;

      setIsModalOpen(false);
      setModalInitialUrl(undefined);
      fetchLinks();
    } catch (error) {
      console.error('Error adding quick link:', error);
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quick_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchLinks();
    } catch (error) {
      console.error('Error deleting quick link:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 px-4 rounded-lg">
        <div className="text-slate-500">Loading quick links...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        ref={dropRef}
        className={`text-center py-6 px-4 rounded-lg border ${isDragOver ? 'border-teal-400 bg-teal-50' : 'border-slate-100 bg-white'} transition-colors`}
        style={{ minHeight: 120 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-medium text-slate-600">Quick Links</h3>
          {links.length < 6 && (
            <button
              onClick={() => { setIsModalOpen(true); setModalInitialUrl(undefined); }}
              className="inline-flex items-center space-x-1 text-sm text-teal-600 hover:text-teal-700"
            >
              <Plus size={16} />
              <span>Add Link</span>
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {links.map((link) => (
            <div
              key={link.id}
              className="group relative flex flex-col items-center"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center space-y-2 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors w-full"
              >
                {getIconForUrl(link.url)}
                <span className="text-sm text-slate-700 text-center line-clamp-2">{link.name}</span>
              </a>
              <button
                onClick={() => handleDeleteLink(link.id)}
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 shadow-sm"
              >
                <X size={14} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>
          ))}
        </div>

        {links.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500 mb-4">No quick links added yet</p>
            <button
              onClick={() => { setIsModalOpen(true); setModalInitialUrl(undefined); }}
              className="inline-flex items-center space-x-1 text-sm text-teal-600 hover:text-teal-700"
            >
              <Plus size={16} />
              <span>Add your first link</span>
            </button>
          </div>
        )}
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-teal-600 text-lg font-semibold bg-white bg-opacity-80 px-4 py-2 rounded-lg border border-teal-300 shadow">Drop a link to add it!</span>
          </div>
        )}
      </div>

      <AddLinkModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setModalInitialUrl(undefined); }}
        onAdd={handleAddLink}
        initialUrl={modalInitialUrl}
      />
    </div>
  );
};

export default QuickLinks; 