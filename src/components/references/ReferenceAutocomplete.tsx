import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

interface Reference {
  id: string;
  full_name: string;
  email: string;
}

interface ReferenceAutocompleteProps {
  value: string;
  onChange: (name: string, email: string) => void;
  disabled?: boolean;
}

const ReferenceAutocomplete: React.FC<ReferenceAutocompleteProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const [suggestions, setSuggestions] = useState<Reference[]>([]);
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

      // Search in job_references table for existing references
      const { data, error } = await supabase
        .from('job_references')
        .select('id, full_name, email')
        .or(`full_name.ilike.%${inputValue}%,email.ilike.%${inputValue}%`)
        .eq('eit_id', user.id)
        .limit(5);

      if (error) throw error;

      // Remove duplicates based on email
      const uniqueReferences = Array.from(
        new Map((data || []).map(ref => [ref.email, ref])).values()
      );

      setSuggestions(uniqueReferences);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching references:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (reference: Reference) => {
    onChange(reference.full_name, reference.email);
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        placeholder="Enter reference's full name"
        required
        disabled={disabled}
      />
      
      {showSuggestions && (value.trim() || loading) && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-2 text-sm text-slate-500">Searching...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((reference) => (
              <button
                key={reference.id}
                className="w-full px-4 py-2 text-left hover:bg-slate-50 focus:outline-none focus:bg-slate-50"
                onClick={() => handleSuggestionClick(reference)}
              >
                <div className="font-medium text-slate-900">{reference.full_name}</div>
                <div className="text-sm text-slate-500">{reference.email}</div>
              </button>
            ))
          ) : (
            <div className="p-2 text-sm text-slate-500">No matching references found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReferenceAutocomplete; 