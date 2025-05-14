import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Check } from 'lucide-react';

const subscriptionTiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      'Basic progress tracking',
      'Up to 5 documents',
      'Standard support',
      'Basic analytics'
    ],
    buttonText: 'Current Plan',
    isPopular: false
  }
];

const Settings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [currentPlan, setCurrentPlan] = useState('Free');

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFullName(user.user_metadata?.full_name || '');
        setEmail(user.email || '');
        setNewEmail(user.email || '');
      }
    };

    getUserProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updates: { data?: { full_name: string }, email?: string } = {};
      
      if (isEditingName) {
        updates.data = { full_name: fullName };
      }
      
      if (isEditingEmail && newEmail !== email) {
        updates.email = newEmail;
      }

      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditingName(false);
      setIsEditingEmail(false);
      
      // Refresh user data
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setEmail(user.email || '');
        setNewEmail(user.email || '');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setPasswordError('');

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password. Please try again.' });
      console.error('Error updating password:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        {/* Profile Information */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="label">
                Full Name
              </label>
              {isEditingName ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input"
                    placeholder="Enter your full name"
                  />
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingName(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p>{fullName || 'Not set'}</p>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              {isEditingEmail ? (
                <div className="space-y-2">
                  <input
                    type="email"
                    id="newEmail"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="input"
                    placeholder="Enter your new email"
                  />
                  <p className="text-sm text-slate-500">
                    After changing your email, you'll need to use the new email address to log in.
                  </p>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p>{email}</p>
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(true)}
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              {isEditingPassword ? (
                <div className="space-y-4">
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input"
                    placeholder="Current password"
                  />
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input"
                    placeholder="New password"
                  />
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    placeholder="Confirm new password"
                  />
                  {passwordError && (
                    <p className="text-sm text-red-600">{passwordError}</p>
                  )}
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingPassword(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p>••••••••</p>
                  <button
                    type="button"
                    onClick={() => setIsEditingPassword(true)}
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {isEditingName || isEditingEmail ? (
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            ) : null}
          </form>
        </div>

        {/* Subscription Plan */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Subscription Plan</h2>
          <div className="grid gap-6 md:grid-cols-1">
            {subscriptionTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-lg border ${
                  tier.isPopular ? 'border-teal-500' : 'border-slate-200'
                } p-6`}
              >
                {tier.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white px-3 py-1 rounded-full text-sm">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-2xl font-bold">{tier.price}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{tier.description}</p>
                <ul className="mt-4 space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-4 w-4 text-teal-500 mr-2" />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`mt-6 w-full rounded-md px-4 py-2 text-sm font-medium ${
                    tier.isPopular
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  disabled={true}
                >
                  {tier.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {message.text && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default Settings; 