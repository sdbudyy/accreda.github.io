import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

interface Supervisor {
  id: string;
  full_name: string;
  email: string;
}

interface SupervisorAutocompleteProps {
  value: string;
  onChange: (name: string, email: string) => void;
  disabled?: boolean;
}

const SupervisorAutocomplete: React.FC<SupervisorAutocompleteProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const [suggestions, setSuggestions] = useState<Supervisor[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchSupervisors = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get connected supervisors
      const { data: connections } = await supabase
        .from('supervisor_eit_relationships')
        .select('supervisor_id')
        .eq('eit_id', user.id)
        .eq('status', 'active');

      if (!connections) return;

      const supervisorIds = connections.map(conn => conn.supervisor_id);

      // Search supervisors by name
      const { data: supervisors } = await supabase
        .from('supervisor_profiles')
        .select('id, full_name, email')
        .in('id', supervisorIds)
        .ilike('full_name', `%${query}%`)
        .limit(5);

      setSuggestions(supervisors || []);
    } catch (error) {
      console.error('Error searching supervisors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue, ''); // Clear email when name changes
    searchSupervisors(newValue);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (supervisor: Supervisor) => {
    onChange(supervisor.full_name, supervisor.email);
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        placeholder="Enter validator's full name"
        required
        disabled={disabled}
      />
      
      {showSuggestions && (value.trim() || loading) && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-2 text-sm text-slate-500">Searching...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((supervisor) => (
              <button
                key={supervisor.id}
                className="w-full px-4 py-2 text-left hover:bg-slate-50 focus:outline-none focus:bg-slate-50"
                onClick={() => handleSuggestionClick(supervisor)}
              >
                <div className="font-medium text-slate-900">{supervisor.full_name}</div>
                <div className="text-sm text-slate-500">{supervisor.email}</div>
              </button>
            ))
          ) : (
            <div className="p-2 text-sm text-slate-500">No matching supervisors found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupervisorAutocomplete; 