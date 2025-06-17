import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, FileText, FileEdit, BookOpen, Loader2, Briefcase, Users, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../store/search';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<'eit' | 'supervisor' | null>(null);
  const { results, loading, error, search, clearResults } = useSearchStore();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Fetch user role on mount
    const getUserProfile = async () => {
      const { data: { user } } = await import('../lib/supabase').then(m => m.supabase.auth.getUser());
      if (!user) return;
      const { data: eitProfile } = await import('../lib/supabase').then(m => m.supabase
        .from('eit_profiles')
        .select('id')
        .eq('id', user.id)
        .single());
      const { data: supervisorProfile } = await import('../lib/supabase').then(m => m.supabase
        .from('supervisor_profiles')
        .select('id')
        .eq('id', user.id)
        .single());
      if (supervisorProfile) setUserRole('supervisor');
      else if (eitProfile) setUserRole('eit');
    };
    getUserProfile();
  }, []);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.trim()) {
      setIsOpen(true);
      try {
      await search(value);
      } catch (err) {
        console.error('Search error:', err);
        // Keep the dropdown open to show the error
        setIsOpen(true);
      }
    } else {
      setIsOpen(false);
      clearResults();
    }
  };

  const handleSelect = useCallback((result: typeof results[0]) => {
    setIsOpen(false);
    setQuery('');
    clearResults();

    switch (result.type) {
      case 'document':
        navigate('/dashboard/documents');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('highlight-document', { 
            detail: { documentId: result.id }
          }));
        }, 500);
        break;
      case 'sao':
        navigate('/dashboard/saos');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('highlight-sao', { 
            detail: { saoId: result.id }
          }));
        }, 500);
        break;
      case 'skill':
        if (userRole === 'eit') {
        navigate('/dashboard/skills');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('scroll-to-skill', { 
            detail: { 
              skillId: result.id,
              timestamp: Date.now()
            }
          }));
        }, 500);
        } else if (userRole === 'supervisor') {
          navigate('/dashboard/supervisor/skills');
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('scroll-to-skill', { 
              detail: { 
                skillId: result.id,
                timestamp: Date.now()
              }
            }));
          }, 500);
        }
        break;
      case 'job':
        navigate('/dashboard/references');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('scroll-to-item', { 
            detail: { 
              itemId: result.id,
              itemType: 'job'
            }
          }));
        }, 500);
        break;
      case 'reference':
        navigate('/dashboard/references');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('scroll-to-item', { 
            detail: { 
              itemId: result.id,
              itemType: 'reference'
            }
          }));
        }, 500);
        break;
      case 'validator':
        navigate('/dashboard/references');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('scroll-to-item', { 
            detail: { 
              itemId: result.id,
              itemType: 'validator'
            }
          }));
        }, 500);
        break;
    }
  }, [navigate, results, userRole]);

  const getIcon = useCallback((type: typeof results[0]['type']) => {
    switch (type) {
      case 'document':
        return <FileText size={16} className="text-blue-500" />;
      case 'sao':
        return <FileEdit size={16} className="text-amber-500" />;
      case 'skill':
        return <BookOpen size={16} className="text-green-500" />;
      case 'job':
        return <Briefcase size={16} className="text-purple-500" />;
      case 'reference':
        return <Users size={16} className="text-indigo-500" />;
      case 'validator':
        return <CheckCircle2 size={16} className="text-teal-500" />;
    }
  }, []);

  const getMetadataText = (result: typeof results[0]) => {
    if (!result.metadata) return null;

    switch (result.type) {
      case 'job':
        return `${result.metadata.company} • ${result.metadata.location}`;
      case 'reference':
        return `Reference ${result.metadata.referenceNumber} • ${result.metadata.email}`;
      case 'validator':
        return `${result.metadata.skillName} • ${result.metadata.email}`;
      default:
        return null;
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search documents, SAOs, skills, jobs, references..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
        />
        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        {loading && (
          <Loader2 className="absolute right-3 top-2.5 text-slate-400 animate-spin" size={18} />
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (query.trim() || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 max-h-96 overflow-y-auto z-50">
          {error ? (
            <div className="px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center space-x-3"
                >
                  {getIcon(result.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {result.title}
                    </p>
                    {result.description && (
                      <p className="text-xs text-slate-500 truncate">
                        {result.description}
                      </p>
                    )}
                    {result.category && (
                      <p className="text-xs text-slate-500">
                        {result.category}
                      </p>
                    )}
                    {getMetadataText(result) && (
                      <p className="text-xs text-slate-500">
                        {getMetadataText(result)}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(SearchBar); 