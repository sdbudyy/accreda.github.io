import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

interface Supervisor {
  id: string;
  full_name: string;
  email: string;
}

interface Connection {
  eit_id: string;
  connected_eit_id: string;
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
  const [connections, setConnections] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load connections when component mounts
  useEffect(() => {
    const loadConnections = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get supervisor relationships for this EIT
        const { data, error } = await supabase
          .from('supervisor_eit_relationships')
          .select('supervisor_id')
          .eq('eit_id', user.id)
          .eq('status', 'active');

        if (error) throw error;

        // Only keep unique supervisor IDs
        const supervisorIds = Array.from(new Set((data || []).map((rel: { supervisor_id: string }) => rel.supervisor_id)));
        console.log('Supervisor connections:', supervisorIds); // Debug log
        setConnections(supervisorIds);
      } catch (error) {
        console.error('Error loading supervisor connections:', error);
      }
    };

    loadConnections();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue, ''); // Clear email when input changes

    if (!inputValue.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Wait until connections are loaded
      if (connections === undefined) {
        setSuggestions([]);
        setShowSuggestions(true);
        setLoading(false);
        return;
      }

      // Defensive: If no connections, show nothing
      if (!connections.length) {
        setSuggestions([]);
        setShowSuggestions(true);
        setLoading(false);
        return;
      }

      // Only search among connected supervisors
      const { data, error } = await supabase
        .from('supervisor_profiles')
        .select('id, full_name, email')
        .or(`full_name.ilike.%${inputValue}%,email.ilike.%${inputValue}%`)
        .in('id', connections)
        .limit(5);

      if (error) throw error;
      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
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
            <div className="p-2 text-sm text-slate-500">No matching connected supervisors found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupervisorAutocomplete; 