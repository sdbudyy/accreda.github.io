import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Check, Lock, Bell, Sun, Trash2, User as UserIcon, Mail } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import ConnectionStatus from '../components/common/ConnectionStatus';
import { useNotificationPreferences } from '../store/notificationPreferences';
import { Switch } from '@headlessui/react';

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
  const [userRole, setUserRole] = useState<'eit' | 'supervisor' | null>(null);
  const [supervisorEmail, setSupervisorEmail] = useState('');
  const [supervisorRequestStatus, setSupervisorRequestStatus] = useState<'idle' | 'success' | 'error' | 'notfound' | 'already' | 'pending'>('idle');
  const [supervisorRequestMessage, setSupervisorRequestMessage] = useState('');
  const [supervisors, setSupervisors] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [mfaEnrolled, setMfaEnrolled] = useState(false);
  const [mfaQr, setMfaQr] = useState('');
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaStatus, setMfaStatus] = useState<'idle' | 'enrolling' | 'verifying' | 'enabled' | 'error'>('idle');
  const [mfaError, setMfaError] = useState('');

  const {
    supervisorReviews,
    saoFeedback,
    relationships,
    userSkills,
    toggleSupervisorReviews,
    toggleSaoFeedback,
    toggleRelationships,
    toggleUserSkills,
  } = useNotificationPreferences();

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFullName(user.user_metadata?.full_name || '');
        setEmail(user.email || '');
        setNewEmail(user.email || '');
        setAvatarUrl(user.user_metadata?.avatar_url || '');

        // Check user role
        const { data: eitProfile } = await supabase
          .from('eit_profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        const { data: supervisorProfile } = await supabase
          .from('supervisor_profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (supervisorProfile) {
          setUserRole('supervisor');
        } else if (eitProfile) {
          setUserRole('eit');
        }
      }
    };

    getUserProfile();
  }, []);

  useEffect(() => {
    if (userRole === 'eit' && user) {
      fetchSupervisors(user.id);
    }
  }, [userRole, user]);

  useEffect(() => {
    // Check if user has TOTP enrolled
    if (user) {
      supabase.auth.mfa.listFactors().then(({ data }) => {
        const totp = data?.all?.find(f => f.factor_type === 'totp' && f.status === 'verified');
        setMfaEnrolled(!!totp);
      });
    }
  }, [user]);

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

  const fetchSupervisors = async (eitId: string) => {
    const { data } = await supabase
      .from('supervisor_eit_relationships')
      .select('supervisor_profiles (id, full_name, email)')
      .eq('eit_id', eitId)
      .eq('status', 'active');
    if (data) {
      setSupervisors(
        data
          .map((rel: any) => rel.supervisor_profiles)
          .filter((sup: any) => sup)
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 divide-y divide-gray-200">
          {/* Profile Section */}
          <div className="space-y-6 pt-8">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Profile</h3>
              <p className="mt-1 text-sm text-gray-500">
                Update your profile information and preferences.
              </p>
            </div>
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
                  {userRole && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      userRole === 'eit' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {userRole.toUpperCase()}
                    </span>
                  )}
                </h2>
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
                {(isEditingName || isEditingEmail) && (
                  <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </form>
            </section>
          </div>

          {/* Subscription Section */}
          <div className="pt-8">
            <section className="bg-white shadow rounded-lg p-8 mb-8 border border-blue-100">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-blue-900 mb-2">Subscription Plan</h2>
                <p className="text-gray-600 text-md max-w-2xl mx-auto">
                  Perfect for getting started
                </p>
              </div>
              <div className="max-w-md mx-auto border border-gray-200 rounded-2xl p-8 bg-gradient-to-br from-blue-50 to-white flex flex-col items-center shadow-sm">
                <h3 className="text-2xl font-bold text-blue-900 mb-2">Free</h3>
                <p className="text-5xl font-extrabold text-blue-800 mb-4">$0</p>
                <ul className="mb-6 w-full space-y-3">
                  <li className="flex items-center text-gray-700"><span className="text-green-500 mr-2">✓</span> Basic progress tracking</li>
                  <li className="flex items-center text-gray-700"><span className="text-green-500 mr-2">✓</span> Up to 5 documents</li>
                  <li className="flex items-center text-gray-700"><span className="text-green-500 mr-2">✓</span> Standard support</li>
                  <li className="flex items-center text-gray-700"><span className="text-green-500 mr-2">✓</span> Basic analytics</li>
                </ul>
                <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-sm shadow">Current Plan</span>
              </div>
            </section>
          </div>

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

          {userRole === 'eit' && (
            <section className="card p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Mail /> Supervisor Connections
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Current Connections</h3>
                  {supervisors.length === 0 ? (
                    <div className="text-slate-400">No active supervisor connections.</div>
                  ) : (
                    <ul className="divide-y divide-slate-200">
                      {supervisors.map((sup) => (
                        <li key={sup.id} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between">
                          <span className="font-medium text-slate-800">{sup.full_name}</span>
                          <span className="text-slate-500 text-sm">{sup.email}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border-t border-slate-200 my-4"></div>

                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Connect with a New Supervisor</h3>
                  <form
                    className="flex flex-col md:flex-row gap-4 items-start md:items-end"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setSupervisorRequestStatus('idle');
                      setSupervisorRequestMessage('');
                      if (!supervisorEmail) return;
                      setLoading(true);
                      try {
                        // Look up supervisor by email
                        const { data: supervisor } = await supabase
                          .from('supervisor_profiles')
                          .select('id, email, full_name')
                          .eq('email', supervisorEmail)
                          .single();
                        if (!supervisor) {
                          setSupervisorRequestStatus('notfound');
                          setSupervisorRequestMessage('No supervisor found with that email.');
                          setLoading(false);
                          return;
                        }
                        // Check for existing relationship
                        const { data: existing } = await supabase
                          .from('supervisor_eit_relationships')
                          .select('id, status')
                          .eq('supervisor_id', supervisor.id)
                          .eq('eit_id', user?.id)
                          .maybeSingle();
                        if (existing && existing.status === 'pending') {
                          setSupervisorRequestStatus('pending');
                          setSupervisorRequestMessage('A request is already pending for this supervisor.');
                          setLoading(false);
                          return;
                        }
                        if (existing && existing.status === 'active') {
                          setSupervisorRequestStatus('already');
                          setSupervisorRequestMessage('This supervisor is already connected.');
                          setLoading(false);
                          return;
                        }
                        // Create relationship
                        const { error } = await supabase
                          .from('supervisor_eit_relationships')
                          .upsert({
                            supervisor_id: supervisor.id,
                            eit_id: user?.id,
                            status: 'pending',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                          });
                        if (error) throw error;
                        setSupervisorRequestStatus('success');
                        setSupervisorRequestMessage('Request sent! Your supervisor will see it in their dashboard.');
                        setSupervisorEmail(''); // Clear the input after successful request
                        if (user) {
                          fetchSupervisors(user.id); // Refresh supervisor connections
                        }
                      } catch (err) {
                        console.error(err);
                        setSupervisorRequestStatus('error');
                        setSupervisorRequestMessage('Failed to send request. Please try again.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    <div className="flex-1 w-full">
                      <label htmlFor="supervisorEmail" className="label">Supervisor Email</label>
                      <input
                        type="email"
                        id="supervisorEmail"
                        value={supervisorEmail}
                        onChange={e => setSupervisorEmail(e.target.value)}
                        className="input w-full"
                        placeholder="Enter supervisor's email"
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-primary whitespace-nowrap" 
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Request'}
                    </button>
                  </form>
                  {supervisorRequestMessage && (
                    <div 
                      className={`mt-3 text-sm p-2 rounded-md ${
                        supervisorRequestStatus === 'success' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {supervisorRequestMessage}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

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
                  <h3 className="text-sm font-medium text-gray-900">Supervisor Reviews</h3>
                  <p className="text-sm text-gray-500">Get notified when you receive new reviews or updates</p>
                </div>
                <Switch
                  checked={supervisorReviews}
                  onChange={toggleSupervisorReviews}
                  className={`${
                    supervisorReviews ? 'bg-teal-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      supervisorReviews ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">SAO Feedback</h3>
                  <p className="text-sm text-gray-500">Get notified when you receive feedback on your SAOs</p>
                </div>
                <Switch
                  checked={saoFeedback}
                  onChange={toggleSaoFeedback}
                  className={`${
                    saoFeedback ? 'bg-teal-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      saoFeedback ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Relationship Updates</h3>
                  <p className="text-sm text-gray-500">Get notified when your supervisor relationship status changes</p>
                </div>
                <Switch
                  checked={relationships}
                  onChange={toggleRelationships}
                  className={`${
                    relationships ? 'bg-teal-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      relationships ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Skill Updates</h3>
                  <p className="text-sm text-gray-500">Get notified when your skills are updated or approved</p>
                </div>
                <Switch
                  checked={userSkills}
                  onChange={toggleUserSkills}
                  className={`${
                    userSkills ? 'bg-teal-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      userSkills ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            </div>
          </div>

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
      </div>
    </div>
  );
};

export default Settings; 