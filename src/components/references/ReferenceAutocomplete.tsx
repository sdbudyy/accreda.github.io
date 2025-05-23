import React from 'react';

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
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value, '')}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
      placeholder="Enter reference's full name"
      required
      disabled={disabled}
    />
  );
};

export default ReferenceAutocomplete; 