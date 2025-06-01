import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Check, Lock, Bell, Sun, Trash2, User as UserIcon, Mail } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import ConnectionStatus from '../components/common/ConnectionStatus';
import { useSupervisorNotificationPreferences } from '../store/supervisorNotificationPreferences';
import { Switch } from '@headlessui/react';
import { useSubscriptionStore } from '../store/subscriptionStore';

const SupervisorSettings: React.FC = () => {
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
  const [eits, setEITs] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [eitEmail, setEitEmail] = useState('');
  const [eitRequestStatus, setEitRequestStatus] = useState<'idle' | 'success' | 'error' | 'notfound' | 'already' | 'pending'>('idle');
  const [eitRequestMessage, setEitRequestMessage] = useState('');
  const [mfaEnrolled, setMfaEnrolled] = useState(false);
  const [mfaQr, setMfaQr] = useState('');
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaStatus, setMfaStatus] = useState<'idle' | 'enrolling' | 'verifying' | 'enabled' | 'error'>('idle');
  const [mfaError, setMfaError] = useState('');
  const {
    eitRequests,
    skillValidationRequests,
    saoFeedback,
    weeklyDigest,
    toggleEitRequests,
    toggleSkillValidationRequests,
    toggleSaoFeedback,
    toggleWeeklyDigest,
  } = useSupervisorNotificationPreferences();
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCorporation, setContactCorporation] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState(false);

  const { 
    tier,
    documentLimit,
    saoLimit,
    supervisorLimit,
    hasAiAccess,
    fetchSubscription,
  } = useSubscriptionStore();

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFullName(user.user_metadata?.full_name || '');
        setEmail(user.email || '');
        setNewEmail(user.email || '');
        // Fetch all active EIT connections
        supabase
          .from('supervisor_eit_relationships')
          .select('eit_profiles (id, full_name, email)')
          .eq('supervisor_id', user.id)
          .eq('status', 'active')
          .then(({ data }) => {
            if (data) {
              setEITs(
                data
                  .map((rel: any) => rel.eit_profiles)
                  .filter((eit: any) => eit)
              );
            }
          });
        // Check if user has TOTP enrolled
        supabase.auth.mfa.listFactors().then(({ data }) => {
          const totp = data?.all?.find(f => f.factor_type === 'totp' && f.status === 'verified');
          setMfaEnrolled(!!totp);
        });
      }
    };
    getUserProfile();
    fetchSubscription();
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
      // If name was updated, also update the supervisor_profiles table
      if (isEditingName && user) {
        const { error: profileError } = await supabase
          .from('supervisor_profiles')
          .update({ full_name: fullName })
          .eq('id', user.id);
        if (profileError) throw profileError;
      }
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditingName(false);
      setIsEditingEmail(false);
      // Refresh user data
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) {
        setUser(updatedUser);
        setEmail(updatedUser.email || '');
        setNewEmail(updatedUser.email || '');
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Profile Card */}
      <section className="card p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                className="w-24 h-24 rounded-full object-cover bg-slate-100"
                alt="Profile"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center text-white text-3xl font-bold">
                {getInitials(fullName || email)}
              </div>
            )}
          </div>
        </div>
        <form className="flex-1 space-y-4 w-full" onSubmit={handleUpdateProfile}>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <UserIcon /> Profile Information
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              SUPERVISOR
            </span>
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
          {/* TOTP 2FA Section */}
          <div className="mt-4">
            <label className="label">Two-Factor Authentication</label>
            {mfaEnrolled ? (
              <div className="flex flex-col gap-2">
                <span className="text-green-700 font-medium">Enabled (TOTP)</span>
                <button
                  className="btn btn-danger w-fit"
                  onClick={async () => {
                    setMfaStatus('idle');
                    setMfaError('');
                    try {
                      const { data } = await supabase.auth.mfa.listFactors();
                      const totp = data?.all?.find(f => f.factor_type === 'totp' && f.status === 'verified');
                      if (totp) {
                        await supabase.auth.mfa.unenroll({ factorId: totp.id });
                        setMfaEnrolled(false);
                      }
                    } catch (err) {
                      setMfaError('Failed to disable 2FA.');
                    }
                  }}
                >
                  Disable 2FA
                </button>
                {mfaError && <span className="text-red-600 text-sm">{mfaError}</span>}
              </div>
            ) : mfaStatus === 'enrolling' ? (
              <div className="flex flex-col gap-2">
                <span>Scan this QR code with your authenticator app:</span>
                {mfaQr && <img src={mfaQr} alt="TOTP QR Code" className="w-40 h-40" />}
                <input
                  type="text"
                  className="input mt-2"
                  placeholder="Enter 6-digit code"
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value)}
                  maxLength={6}
                />
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary w-fit"
                    onClick={async () => {
                      setMfaStatus('verifying');
                      setMfaError('');
                      try {
                        // Get challengeId for verification
                        const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
                        if (challengeError) throw challengeError;
                        const { error } = await supabase.auth.mfa.verify({
                          factorId: mfaFactorId,
                          challengeId: challengeData.id,
                          code: mfaCode
                        });
                        if (error) throw error;
                        setMfaEnrolled(true);
                        setMfaStatus('enabled');
                      } catch (err) {
                        setMfaError('Invalid code. Please try again.');
                        setMfaStatus('enrolling');
                      }
                    }}
                    disabled={mfaCode.length !== 6}
                  >
                    Verify
                  </button>
                  <button
                    className="btn btn-secondary w-fit"
                    onClick={async () => {
                      setMfaStatus('idle');
                      setMfaQr('');
                      setMfaFactorId('');
                      setMfaCode('');
                      setMfaError('');
                      // Clean up any unverified TOTP factors
                      try {
                        const { data } = await supabase.auth.mfa.listFactors();
                        if (data?.all) {
                          for (const factor of data.all) {
                            if (factor.factor_type === 'totp' && factor.status !== 'verified') {
                              await supabase.auth.mfa.unenroll({ factorId: factor.id });
                            }
                          }
                        }
                      } catch (e) { /* ignore */ }
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {mfaError && <span className="text-red-600 text-sm">{mfaError}</span>}
              </div>
            ) : (
              <button
                className="btn btn-primary w-fit"
                onClick={async () => {
                  setMfaStatus('enrolling');
                  setMfaError('');
                  setMfaQr('');
                  setMfaFactorId('');
                  setMfaCode('');
                  // Clean up any unverified TOTP factors before enrolling
                  try {
                    const { data } = await supabase.auth.mfa.listFactors();
                    if (data?.all) {
                      for (const factor of data.all) {
                        if (factor.factor_type === 'totp' && factor.status !== 'verified') {
                          await supabase.auth.mfa.unenroll({ factorId: factor.id });
                        }
                      }
                    }
                  } catch (e) { /* ignore */ }
                  try {
                    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
                    if (error) throw error;
                    setMfaQr(data.totp.qr_code);
                    setMfaFactorId(data.id);
                  } catch (err) {
                    setMfaError('Failed to start 2FA enrollment.');
                    setMfaStatus('idle');
                  }
                }}
              >
                Set up Two-Factor Authentication
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Notification Preferences */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">EIT Connection Requests</h3>
              <p className="text-sm text-gray-500">Get notified when an EIT requests to connect with you</p>
            </div>
            <Switch
              checked={eitRequests}
              onChange={toggleEitRequests}
              className={`${eitRequests ? 'bg-teal-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`}
            >
              <span
                className={`${eitRequests ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Skill Validation Requests</h3>
              <p className="text-sm text-gray-500">Get notified when an EIT requests skill validation</p>
            </div>
            <Switch
              checked={skillValidationRequests}
              onChange={toggleSkillValidationRequests}
              className={`${skillValidationRequests ? 'bg-teal-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`}
            >
              <span
                className={`${skillValidationRequests ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">SAO Feedback</h3>
              <p className="text-sm text-gray-500">Get notified when you receive new SAO feedback requests</p>
            </div>
            <Switch
              checked={saoFeedback}
              onChange={toggleSaoFeedback}
              className={`${saoFeedback ? 'bg-teal-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`}
            >
              <span
                className={`${saoFeedback ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Weekly Digest</h3>
              <p className="text-sm text-gray-500">Receive a weekly report on your EITs' progress and activities ({email})</p>
            </div>
            <Switch
              checked={weeklyDigest}
              onChange={toggleWeeklyDigest}
              className={`${weeklyDigest ? 'bg-teal-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`}
            >
              <span
                className={`${weeklyDigest ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </div>
      </div>

      <section className="card p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Mail /> EIT Connections
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Current Connections</h3>
            {eits.length === 0 ? (
              <div className="text-slate-400">No active EIT connections.</div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {eits.map((eit) => (
                  <li key={eit.id} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between">
                    <span className="font-medium text-slate-800">{eit.full_name}</span>
                    <span className="text-slate-500 text-sm">{eit.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Divider */}
          <div className="border-t border-slate-200 my-4"></div>
          {/* Connect with EIT Form */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Connect with a New EIT</h3>
            {tier === 'free' && eits.length >= 1 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-900 font-semibold text-center">
                You have reached your EIT connection limit for the Free plan. Upgrade to Enterprise to connect with more EITs.
              </div>
            )}
            <form
              className="flex flex-col md:flex-row gap-4 items-start md:items-end"
              onSubmit={async (e) => {
                e.preventDefault();
                setEitRequestStatus('idle');
                setEitRequestMessage('');
                if (!eitEmail) return;

                // Check subscription limit for free tier
                if (tier === 'free' && eits.length >= 1) {
                  setEitRequestStatus('error');
                  setEitRequestMessage('You have reached your EIT connection limit for the Free plan. Please upgrade to Enterprise to connect with more EITs.');
                  return;
                }

                setLoading(true);
                try {
                  // Look up EIT by email
                  const { data: eit } = await supabase
                    .from('eit_profiles')
                    .select('id, email, full_name')
                    .eq('email', eitEmail)
                    .single();
                  if (!eit) {
                    setEitRequestStatus('notfound');
                    setEitRequestMessage('No EIT found with that email.');
                    setLoading(false);
                    return;
                  }
                  // Check for existing relationship
                  const { data: existing } = await supabase
                    .from('supervisor_eit_relationships')
                    .select('id, status')
                    .eq('supervisor_id', user?.id)
                    .eq('eit_id', eit.id)
                    .maybeSingle();
                  if (existing && existing.status === 'pending') {
                    setEitRequestStatus('pending');
                    setEitRequestMessage('A request is already pending for this EIT.');
                    setLoading(false);
                    return;
                  }
                  if (existing && existing.status === 'active') {
                    setEitRequestStatus('already');
                    setEitRequestMessage('This EIT is already connected.');
                    setLoading(false);
                    return;
                  }
                  // Create relationship
                  const { error } = await supabase
                    .from('supervisor_eit_relationships')
                    .upsert({
                      supervisor_id: user?.id,
                      eit_id: eit.id,
                      status: 'pending',
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    });
                  if (error) throw error;
                  setEitRequestStatus('success');
                  setEitRequestMessage('Request sent! The EIT will see it in their dashboard.');
                  setEitEmail('');
                } catch (err) {
                  console.error(err);
                  setEitRequestStatus('error');
                  setEitRequestMessage('Failed to send request. Please try again.');
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div className="flex-1 w-full">
                <label htmlFor="eitEmail" className="label">EIT Email</label>
                <input
                  type="email"
                  id="eitEmail"
                  value={eitEmail}
                  onChange={e => setEitEmail(e.target.value)}
                  className="input w-full"
                  placeholder="Enter EIT's email"
                  required
                  disabled={tier === 'free' && eits.length >= 1}
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary whitespace-nowrap" 
                disabled={loading || (tier === 'free' && eits.length >= 1)}
              >
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            </form>
            {eitRequestMessage && (
              <div 
                className={`mt-3 text-sm p-2 rounded-md ${
                  eitRequestStatus === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {eitRequestMessage}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Theme Card (placeholder) */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
          <Sun /> Appearance
        </h2>
        <p className="text-slate-500 text-sm">Coming soon: Switch between light and dark mode.</p>
      </section>

      {/* Subscription Section */}
      <div className="pt-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Choose Your Plan</h2>
          <p className="text-gray-600 text-md max-w-2xl mx-auto">
            Select the plan that best fits your needs
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className={`border ${tier === 'free' ? 'border-blue-500' : 'border-gray-200'} rounded-2xl p-8 bg-gradient-to-br from-blue-50 to-white flex flex-col items-center shadow-sm`}>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Free</h3>
            <p className="text-5xl font-extrabold text-blue-800 mb-4">$0</p>
            <ul className="mb-6 w-full space-y-3">
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Up to 5 documents
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Up to 5 SAOs
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                Connect with 1 EIT
              </li>
              <li className="flex items-center text-gray-700"><span className="text-green-500 mr-2">✓</span> Standard support</li>
              <li className="flex items-center text-gray-700"><span className="text-red-500 mr-2">✗</span> AI Features</li>
            </ul>
            {tier === 'free' ? (
              <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-sm shadow">Current Plan</span>
            ) : (
              <button 
                onClick={() => window.location.href = 'mailto:contact@accreda.com?subject=Downgrade to Free Plan'}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold text-sm shadow transition-colors"
              >
                Contact to Downgrade
              </button>
            )}
          </div>

          {/* Enterprise Plan */}
          <div className={`border ${tier === 'enterprise' ? 'border-purple-500' : 'border-gray-200'} rounded-2xl p-8 bg-gradient-to-br from-purple-50 to-white flex flex-col items-center shadow-sm`}>
            <h3 className="text-2xl font-bold text-purple-900 mb-2">Enterprise</h3>
            <p className="text-base font-semibold text-purple-800 mb-4">Custom Pricing</p>
            <ul className="mb-6 w-full space-y-3">
              <li className="flex items-center text-gray-700"><span className="text-green-500 mr-2">✓</span> Unlimited documents</li>
              <li className="flex items-center text-gray-700"><span className="text-green-500 mr-2">✓</span> Unlimited SAOs</li>
              <li className="flex items-center text-gray-700"><span className="text-green-500 mr-2">✓</span> Unlimited EIT connections</li>
              <li className="flex items-center text-gray-700"><span className="text-green-500 mr-2">✓</span> Priority support</li>
              <li className="flex items-center text-gray-700"><span className="text-green-500 mr-2">✓</span> AI Features</li>
              <li className="flex items-center text-gray-700"><span className="text-green-500 mr-2">✓</span> Dedicated account manager</li>
            </ul>
            {tier === 'enterprise' ? (
              <span className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-semibold text-sm shadow">Current Plan</span>
            ) : (
              <button 
                onClick={() => setShowContactModal(true)}
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-semibold text-sm shadow transition-colors"
              >
                Contact Us
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
              onClick={() => {
                setShowContactModal(false);
                setContactSuccess(false);
                setContactError(null);
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-purple-800">Enterprise Plan Inquiry</h2>
            {contactSuccess ? (
              <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm mb-4">
                Your inquiry has been sent successfully. We'll get back to you soon!
              </div>
            ) : (
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  setContactLoading(true);
                  setContactError(null);
                  setContactSuccess(false);
                  try {
                    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-support-email`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                      },
                      body: JSON.stringify({
                        email: contactEmail,
                        subject: 'Enterprise Plan Inquiry',
                        message: `Name: ${contactName}\nCorporation: ${contactCorporation}\n\n${contactMessage}`,
                        issueType: 'enterprise',
                        mode: 'help',
                      }),
                    });
                    const data = await response.json();
                    if (!response.ok) {
                      throw new Error(data.error || 'Failed to send message');
                    }
                    setContactSuccess(true);
                    setContactName('');
                    setContactEmail('');
                    setContactCorporation('');
                    setContactMessage('');
                  } catch (err) {
                    setContactError(err instanceof Error ? err.message : 'Failed to send message. Please try again later.');
                  } finally {
                    setContactLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="contactName" className="label">Full Name</label>
                  <input
                    type="text"
                    id="contactName"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="label">Email Address</label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contactCorporation" className="label">Organization</label>
                  <input
                    type="text"
                    id="contactCorporation"
                    value={contactCorporation}
                    onChange={e => setContactCorporation(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contactMessage" className="label">Message</label>
                  <textarea
                    id="contactMessage"
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    className="input h-32"
                    required
                    placeholder="Tell us about your needs and how we can help..."
                  />
                </div>
                {contactError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {contactError}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowContactModal(false);
                      setContactSuccess(false);
                      setContactError(null);
                    }}
                    disabled={contactLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={contactLoading}
                  >
                    {contactLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

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

export default SupervisorSettings; 