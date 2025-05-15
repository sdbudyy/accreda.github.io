import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Check, Lock, Bell, Sun, Trash2, User as UserIcon } from 'lucide-react';
import FileUpload from '../components/FileUpload';

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

const defaultAvatar =
  'https://ui-avatars.com/api/?name=User&background=E0F2FE&color=0891B2&size=128';

const Settings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFullName(user.user_metadata?.full_name || '');
        setEmail(user.email || '');
        setNewEmail(user.email || '');
        setAvatarUrl(user.user_metadata?.avatar_url || '');
      }
    };

    getUserProfile();
  }, []);

  const handleAvatarSelect = (files: File[]) => {
    if (files.length > 0) {
      setAvatarFile(files[0]);
      setAvatarPreview(URL.createObjectURL(files[0]));
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;
    setLoading(true);
    try {
      // Upload to Supabase Storage
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `${user.id}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });
      if (uploadError) throw uploadError;
      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      // Update user_metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { ...user.user_metadata, avatar_url: publicUrl }
      });
      if (updateError) throw updateError;
      setAvatarUrl(publicUrl);
      setMessage({ type: 'success', text: 'Profile picture updated!' });
      setAvatarFile(null);
      setAvatarPreview('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update avatar.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Remove avatar_url from user_metadata
      const { error } = await supabase.auth.updateUser({
        data: { ...user.user_metadata, avatar_url: '' }
      });
      if (error) throw error;
      setAvatarUrl('');
      setMessage({ type: 'success', text: 'Profile picture removed.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove avatar.' });
    } finally {
      setLoading(false);
    }
  };

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
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Profile Card */}
      <section className="card p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            {avatarPreview || avatarUrl ? (
              <img
                src={avatarPreview || avatarUrl}
                className="w-24 h-24 rounded-full object-cover bg-slate-100"
                alt="Profile"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center text-white text-3xl font-bold">
                {getInitials(fullName || email)}
              </div>
            )}
            {/* Remove the upload label and its SVG icon */}
            {(avatarPreview || avatarUrl) && (
              <button
                className="absolute -top-2 -right-2 bg-slate-100 rounded-full p-1 shadow hover:bg-slate-200"
                onClick={handleRemoveAvatar}
                disabled={loading}
                title="Remove profile picture"
                style={{ zIndex: 10 }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" className="text-red-600">
                  <path d="M6 6l8 8M6 14L14 6" strokeWidth="2" />
                </svg>
              </button>
            )}
          </div>
          {avatarFile && (
            <button
              className="btn btn-primary mt-2"
              onClick={handleAvatarUpload}
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Save Photo'}
            </button>
          )}
        </div>
        <form className="flex-1 space-y-4" onSubmit={handleUpdateProfile}>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <UserIcon /> Profile Information
          </h2>
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="label">Full Name</label>
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
                  <button type="button" onClick={() => setIsEditingName(false)} className="btn btn-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p>{fullName || 'Not set'}</p>
                <button type="button" onClick={() => setIsEditingName(true)} className="text-sm text-teal-600 hover:text-teal-700">Edit</button>
              </div>
            )}
          </div>
          {/* Email */}
          <div>
            <label htmlFor="email" className="label">Email Address</label>
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
                <p className="text-sm text-slate-500">After changing your email, you'll need to use the new email address to log in.</p>
                <div className="flex space-x-2">
                  <button type="button" onClick={() => setIsEditingEmail(false)} className="btn btn-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p>{email}</p>
                <button type="button" onClick={() => setIsEditingEmail(true)} className="text-sm text-teal-600 hover:text-teal-700">Edit</button>
              </div>
            )}
          </div>
          {/* Save Button */}
          {(isEditingName || isEditingEmail) && (
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </form>
      </section>

      {/* Security Card */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
          <Lock /> Security
        </h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="label">Password</label>
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
                {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                <div className="flex space-x-2">
                  <button type="button" onClick={() => setIsEditingPassword(false)} className="btn btn-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p>••••••••</p>
                <button type="button" onClick={() => setIsEditingPassword(true)} className="text-sm text-teal-600 hover:text-teal-700">Change</button>
              </div>
            )}
          </div>
          {/* Placeholder for 2FA */}
          <div className="mt-4">
            <label className="label">Two-Factor Authentication</label>
            <p className="text-slate-500 text-sm">Coming soon: Add an extra layer of security to your account.</p>
          </div>
        </div>
      </section>

      {/* Notifications Card (placeholder) */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
          <Bell /> Notifications
        </h2>
        <p className="text-slate-500 text-sm">Coming soon: Manage your email and in-app notification preferences.</p>
      </section>

      {/* Theme Card (placeholder) */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
          <Sun /> Appearance
        </h2>
        <p className="text-slate-500 text-sm">Coming soon: Switch between light and dark mode.</p>
      </section>

      {/* Subscription Card */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Subscription Plan</h2>
        <div className="grid gap-6 md:grid-cols-1">
          {subscriptionTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-lg border ${tier.isPopular ? 'border-teal-500' : 'border-slate-200'} p-6`}
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
                className={`mt-6 w-full rounded-md px-4 py-2 text-sm font-medium ${tier.isPopular ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                disabled={true}
              >
                {tier.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="card p-6 border-red-200">
        <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2 mb-2">
          <Trash2 /> Danger Zone
        </h2>
        <button className="btn btn-danger">Delete Account</button>
        <p className="text-slate-500 text-sm mt-2">This action is irreversible. Your data will be permanently deleted.</p>
      </section>

      {/* Feedback/Toast */}
      {message.text && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-md z-50 ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default Settings; 