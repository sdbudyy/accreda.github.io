import React, { useState } from 'react';
import { UserPlus, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

const provinces = [
  'Alberta (APEGA)',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Northwest Territories and Nunavut',
  'Nova Scotia',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Yukon',
];

const WaitlistForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('');
  const [userType, setUserType] = useState('eit');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !province || !userType) {
      setError('Please fill in all fields.');
      return;
    }
    // Insert into Supabase
    const { error: supabaseError } = await supabase
      .from('waitlist_signups')
      .insert([{ email, province, user_type: userType }]);
    if (supabaseError) {
      setError('There was a problem joining the waitlist. Please try again.');
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto bg-white border-2 border-teal-400 shadow-2xl rounded-3xl p-10 flex flex-col items-center animate-fade-in">
        <div className="bg-green-100 rounded-full p-4 mb-4"><Mail className="text-green-600 w-8 h-8" /></div>
        <h3 className="text-2xl font-extrabold text-green-800 mb-2">You're on the list!</h3>
        <p className="text-green-700 mb-2 text-center">Thank you for joining the waitlist.<br />We'll notify you when your province is supported.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white border-2 border-teal-400 shadow-2xl rounded-3xl p-10 animate-fade-in">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-teal-100 rounded-full p-4 mb-3"><UserPlus className="text-teal-600 w-8 h-8" /></div>
        <h3 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Waitlist Signup</h3>
        <p className="text-slate-500 text-base">Be the first to know when Accreda launches in your province!</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="waitlist-email" className="block text-base font-medium text-slate-700 mb-1">Email</label>
          <input
            id="waitlist-email"
            type="email"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 text-lg"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="you@email.com"
            autoComplete="email"
          />
          <span className="text-xs text-slate-400 mt-1 block">We'll only use this to notify you about your province.</span>
        </div>
        <div>
          <label htmlFor="waitlist-province" className="block text-base font-medium text-slate-700 mb-1">Province</label>
          <select
            id="waitlist-province"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 text-lg"
            value={province}
            onChange={e => setProvince(e.target.value)}
            required
          >
            <option value="">Select your province</option>
            {provinces.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-base font-medium text-slate-700 mb-1">I am a:</label>
          <div className="flex gap-4 mt-2 justify-center">
            <button
              type="button"
              className={`px-6 py-2 rounded-full border text-base font-semibold transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${userType === 'eit' ? 'bg-teal-500 text-white border-teal-500 scale-105' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-teal-50'}`}
              onClick={() => setUserType('eit')}
            >
              EIT
            </button>
            <button
              type="button"
              className={`px-6 py-2 rounded-full border text-base font-semibold transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${userType === 'supervisor' ? 'bg-teal-500 text-white border-teal-500 scale-105' : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-teal-50'}`}
              onClick={() => setUserType('supervisor')}
            >
              Supervisor/Enterprise
            </button>
          </div>
        </div>
        {error && <div className="bg-red-50 text-red-700 rounded-md px-3 py-2 text-base text-center font-medium border border-red-200">{error}</div>}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-extrabold py-3 rounded-xl shadow-lg transition-all duration-150 text-xl tracking-wide focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          Join Waitlist
        </button>
      </form>
    </div>
  );
};

export default WaitlistForm; 