import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Check, Lock, Bell, Sun, Trash2, User as UserIcon, Calendar, FileText, Shield } from 'lucide-react';
import { useNotificationPreferences } from '../store/notificationPreferences';
import { Switch } from '@headlessui/react';
import { useSubscriptionStore } from '../store/subscriptionStore';
import { sendSupervisorRequestNotification } from '../utils/notifications';
import { generateCSAWPDF, createPDFBlobUrl, CSAWData } from '../utils/pdfGenerator';
import { useSAOsStore } from '../store/saos';
import { useSkillsStore } from '../store/skills';
import { useUserProfile } from '../context/UserProfileContext';
import { useProgressStore } from '../store/progress';
import { getLatestTermsAcceptance, TermsAcceptance } from '../utils/termsAcceptance';

const defaultAvatar =
  'https://ui-avatars.com/api/?name=User&background=E0F2FE&color=0891B2&size=128';

async function getUserProfileTable(userId: string) {
  // Try EIT profile first
  const { data: eitProfile } = await supabase
    .from('eit_profiles')
    .select('id')
    .eq('id', userId)
    .single();
  if (eitProfile) return 'eit_profiles';

  // Try supervisor profile
  const { data: supervisorProfile } = await supabase
    .from('supervisor_profiles')
    .select('id')
    .eq('id', userId)
    .single();
  if (supervisorProfile) return 'supervisor_profiles';

  return null;
}

// Lazy load the PDF preview modal
const PDFPreviewModal = React.lazy(() => import('../components/PDFPreviewModal'));

const Settings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
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
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [start_date, setStartDate] = useState('');
  const [target_date, setTargetDate] = useState('');
  const [plan_interval, setPlanInterval] = useState('monthly');
  const [exportLoading, setExportLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [apegaId, setApegaId] = useState('');
  const [showApegaWarning, setShowApegaWarning] = useState(false);
  const [allowAnyway, setAllowAnyway] = useState(false);
  const [apegaIdSaving, setApegaIdSaving] = useState(false);
  const [apegaIdSaved, setApegaIdSaved] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsAcceptanceData, setTermsAcceptanceData] = useState<TermsAcceptance | null>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  const { profile, loading: profileLoading, error: profileError, refresh: refreshProfile } = useUserProfile();
  const userRole = profile?.account_type || null;
  const fullName = profile?.full_name || '';
  const email = profile?.email || '';
  const [editFullName, setEditFullName] = useState(fullName);
  const [editEmail, setEditEmail] = useState(email);

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

  const { 
    tier,
    supervisorLimit,
    fetchSubscription
  } = useSubscriptionStore();

  const { loadUserSAOs } = useSAOsStore();
  const { loadUserSkills } = useSkillsStore();

  const {
    overallProgress,
    completedSkills,
    documentedExperiences,
    supervisorApprovals,
    loading: progressLoading,
    updateProgress,
    initialize,
    initialized
  } = useProgressStore();

  // Fetch the user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setEditEmail(user?.email || '');
    };
    fetchUser();
  }, []);

  useEffect(() => {
    // Check if user has TOTP enrolled
    if (user) {
      supabase.auth.mfa.listFactors().then(({ data }) => {
        const totp = data?.all?.find(f => f.factor_type === 'totp' && f.status === 'verified');
        setMfaEnrolled(!!totp);
      });
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from('eit_profiles')
        .select('apega_id')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.apega_id) setApegaId(data.apega_id);
        });
    }
  }, [user]);

  useEffect(() => {
    setEditFullName(fullName);
    setEditEmail(email);
  }, [fullName, email]);

  useEffect(() => {
    if (profile && profile.account_type === 'eit') {
      setStartDate(profile.start_date || '');
      setTargetDate(profile.target_date || '');
    }
  }, [profile]);

  // Fetch terms acceptance data
  useEffect(() => {
    const fetchTermsAcceptance = async () => {
      if (user) {
        const { data, error } = await getLatestTermsAcceptance(user.id);
        if (data && !error) {
          setTermsAcceptanceData(data);
          setTermsAccepted(true);
        } else {
          setTermsAccepted(false);
        }
      }
    };

    fetchTermsAcceptance();
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchConnections(user.id);
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
        updates.data = { full_name: editFullName };
      }
      if (isEditingEmail && editEmail !== email) {
        updates.email = editEmail;
      }
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;

      // --- Dynamically update the correct profile table ---
      if (isEditingName && user) {
        const profileTable = await getUserProfileTable(user.id);
        if (!profileTable) {
          setMessage({ type: 'error', text: 'Profile not found.' });
          setLoading(false);
          return;
        }
        const { error: profileError } = await supabase
          .from(profileTable)
          .update({ full_name: editFullName })
          .eq('id', user.id);
        if (profileError) throw profileError;
      }
      // ------------------------------------------------------------

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditingName(false);
      setIsEditingEmail(false);
      // Refresh user data
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) {
        setUser(updatedUser);
        setEditEmail(updatedUser.email || '');
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

  const fetchConnections = async (userId: string) => {
    // Fetch active connections (where user is eit or supervisor)
    const { data: activeData } = await supabase
      .from('supervisor_eit_relationships')
      .select(`id, status, supervisor_id, eit_id, supervisor_profiles (id, full_name, email), eit_profiles (id, full_name, email)`)
      .or(`eit_id.eq.${userId},supervisor_id.eq.${userId}`)
      .eq('status', 'active');
    if (activeData) {
      setSupervisors(
        activeData.map((rel: any) => {
          // Show the other party
          if (rel.eit_id === userId) {
            return rel.supervisor_profiles;
          } else {
            return rel.eit_profiles;
          }
        }).filter((sup: any) => sup)
      );
    }
    // Fetch pending requests (where user is eit or supervisor)
    const { data: pendingData } = await supabase
      .from('supervisor_eit_relationships')
      .select(`id, status, supervisor_id, eit_id, supervisor_profiles (id, full_name, email), eit_profiles (id, full_name, email)`)
      .or(`eit_id.eq.${userId},supervisor_id.eq.${userId}`)
      .eq('status', 'pending');
    if (pendingData) {
      setPendingRequests(pendingData);
    }
  };

  const handleSupervisorRequest = async (e: React.FormEvent) => {
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
      // Check supervisor's current number of active EITs (limit enforcement)
      const { count: activeEITCount, error: countError } = await supabase
        .from('supervisor_eit_relationships')
        .select('id', { count: 'exact', head: true })
        .eq('supervisor_id', supervisor.id)
        .eq('status', 'active');
      if (countError) throw countError;
      const countNum = typeof activeEITCount === 'number' ? activeEITCount : 0;
      if (tier === 'free' && countNum >= supervisorLimit) {
        setSupervisorRequestStatus('error');
        setSupervisorRequestMessage('This supervisor has reached their free plan EIT limit and cannot accept more requests.');
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
      // Ensure user is not null before sending notification
      if (!user) {
        setSupervisorRequestStatus('error');
        setSupervisorRequestMessage('User not found. Please re-login.');
        setLoading(false);
        return;
      }
      // Send notification to supervisor
      await sendSupervisorRequestNotification(supervisor.id, user.user_metadata?.full_name || user.email);
      setSupervisorRequestStatus('success');
      setSupervisorRequestMessage('Request sent! Your supervisor will see it in their dashboard.');
      setSupervisorEmail(''); // Clear the input after successful request
      if (user) {
        fetchConnections(user.id); // Refresh supervisor connections
      }
    } catch (err) {
      console.error(err);
      setSupervisorRequestStatus('error');
      setSupervisorRequestMessage('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStripeCheckout = async (plan: 'pro_monthly' | 'pro_yearly', userId: string, userEmail: string) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userId, userEmail }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to start checkout. Please try again.');
      }
    } catch (err) {
      alert('Failed to start checkout. Please try again.');
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/cancel-stripe-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'Subscription cancelled. You are now on the Free plan.' });
        fetchSubscription();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to cancel subscription.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to cancel subscription.' });
    }
  };

  // Add a helper to get the plan label
  const getPlanLabel = () => {
    if (tier === 'pro') {
      if (plan_interval === 'monthly') return 'Pro (Monthly)';
      if (plan_interval === 'yearly') return 'Pro (Yearly)';
      return 'Pro';
    }
    if (tier === 'enterprise') return 'Enterprise';
    return 'Free';
  };

  const handleSaveApegaId = async () => {
    if (!user) return;
    setApegaIdSaving(true);
    setApegaIdSaved(false);
    await supabase
      .from('eit_profiles')
      .update({ apega_id: apegaId })
      .eq('id', user.id);
    setApegaIdSaving(false);
    setApegaIdSaved(true);
    setTimeout(() => setApegaIdSaved(false), 2000);
  };

  const handleExportToCSAW = async () => {
    if (!user) return;
    if (!apegaId && !allowAnyway) {
      setShowApegaWarning(true);
      return;
    }
    setExportLoading(true);
    setShowApegaWarning(false);
    setAllowAnyway(false);
    try {
      console.log('Starting CSAW export process...');
      
      // Load data using hooks
      console.log('Loading user skills and SAOs...');
      await Promise.all([
        loadUserSkills(true),
        loadUserSAOs(true)
      ]);
      console.log('User skills and SAOs loaded successfully');

      // --- Fetch all SAOs and sao_skills directly from Supabase ---
      console.log('Fetching fresh SAOs and SAO skills...');
      const { data: freshSAOs, error: saosError } = await supabase
        .from('saos')
        .select('*')
        .eq('eit_id', user.id);
      
      if (saosError) {
        console.error('Error fetching SAOs:', saosError);
        throw saosError;
      }
      console.log(`Fetched ${freshSAOs?.length || 0} SAOs`);

      const { data: freshSaoSkills, error: saoSkillsError } = await supabase
        .from('sao_skills')
        .select('*')
        .in('sao_id', (freshSAOs || []).map(s => s.id));
      
      if (saoSkillsError) {
        console.error('Error fetching SAO skills:', saoSkillsError);
        throw saoSkillsError;
      }
      console.log(`Fetched ${freshSaoSkills?.length || 0} SAO skills`);

      // --- End fresh fetch ---
      // Fetch all EIT data
      console.log('Fetching EIT profile data...');
      const { data: eitData, error: eitError } = await supabase
        .from('eit_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (eitError) {
        console.error('Error fetching EIT profile:', eitError);
        throw eitError;
      }
      console.log('EIT profile data fetched successfully');

      // Fetch all skills
      console.log('Fetching user skills...');
      const { data: userSkills, error: skillsError } = await supabase
        .from('eit_skills')
        .select('*')
        .eq('eit_id', user.id);

      if (skillsError) {
        console.error('Error fetching user skills:', skillsError);
        throw skillsError;
      }
      console.log(`Fetched ${userSkills?.length || 0} user skills`);

      // Fetch all experiences
      console.log('Fetching experiences...');
      const { data: experiences, error: expError } = await supabase
        .from('experiences')
        .select('*')
        .eq('eit_id', user.id);

      if (expError) {
        console.error('Error fetching experiences:', expError);
        throw expError;
      }
      console.log(`Fetched ${experiences?.length || 0} experiences`);

      // Fetch all canonical skills for name lookup
      console.log('Fetching canonical skills...');
      const { data: allSkills, error: allSkillsError } = await supabase
        .from('skills')
        .select('id, name');

      if (allSkillsError) {
        console.error('Error fetching canonical skills:', allSkillsError);
        throw allSkillsError;
      }
      console.log(`Fetched ${allSkills?.length || 0} canonical skills`);

      // Build a map of skill_id -> name
      const skillNameMap: Record<string, string> = {};
      (allSkills || []).forEach(skill => {
        skillNameMap[skill.id] = skill.name;
      });

      // Fetch validator for skill 1.1
      const SKILL_1_1_ID = 'b5fb4469-5f9a-47da-86c6-9f17864b8070';
      console.log('Fetching validators...');
      // Fetch all validators for the current user - deleted validators are permanently removed from the database
      // This ensures that only current, active validators are used in the PDF generation
      const { data: allValidators, error: allValidatorsError } = await supabase
        .from('validators')
        .select('first_name, last_name, skill_id, updated_at, eit_id, position, status')
        .eq('eit_id', user.id); // Only fetch validators for the current user

      if (allValidatorsError) {
        console.error('Error fetching validators:', allValidatorsError);
        throw allValidatorsError;
      }
      console.log(`Fetched ${allValidators?.length || 0} validators`);

      console.log('Filtering validators for skill 1.1...');
      const validatorRows = (allValidators || []).filter(
        v => String(v.skill_id).trim().toLowerCase() === String(SKILL_1_1_ID).trim().toLowerCase() &&
             String(v.eit_id).trim().toLowerCase() === String(user.id).trim().toLowerCase()
      );
      console.log(`Found ${validatorRows.length} validators for skill 1.1`);

      let validator1_1 = validatorRows.length > 0
        ? validatorRows.slice().sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]
        : null;

      console.log('Selected validator for skill 1.1:', validator1_1);

      // Map user skills to include canonical name and validator for 1.1
      console.log('Mapping user skills...');
      let skills = (userSkills || [])
        .map(skill => {
          const isSkill11 = skill.skill_id === SKILL_1_1_ID;
          return {
            ...skill,
            id: skill.skill_id,
            name: skillNameMap[skill.skill_id] || skill.skill_name || '',
            validator: isSkill11 && validator1_1
              ? { first_name: validator1_1.first_name, last_name: validator1_1.last_name, position: validator1_1.position }
              : skill.validator
          };
        });

      // Ensure skill 1.1 is present in the skills array
      if (!skills.some(s => s.id === SKILL_1_1_ID)) {
        console.log('Adding missing skill 1.1 to skills array');
        const canonicalName = skillNameMap[SKILL_1_1_ID] || 'Technical Competence 1.1';
        skills = [
          ...skills,
          {
            id: SKILL_1_1_ID,
            name: canonicalName,
            status: '',
            validator: validator1_1 ? {
              first_name: validator1_1.first_name,
              last_name: validator1_1.last_name,
              position: validator1_1.position
            } : undefined
          }
        ];
      }

      skills = skills.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      console.log(`Final skills array contains ${skills.length} skills`);

      // Map experiences to include a skills array
      console.log('Mapping experiences with skills...');
      const mappedExperiences = (experiences || []).map((exp: any) => {
        let skillIds: string[] = [];
        if (Array.isArray(exp.skill_ids)) {
          skillIds = exp.skill_ids;
        } else if (exp.skill_id) {
          skillIds = [exp.skill_id];
        }
        // Build the skills array for this experience
        const expSkills = skillIds
          .map((id: string) => skills.find(s => s.id === id || s.skill_id === id))
          .filter(Boolean);
        return {
          ...exp,
          skills: expSkills
        };
      });
      console.log(`Mapped ${mappedExperiences.length} experiences with skills`);

      // Ensure allValidators includes eit_id for each validator
      console.log('Preparing validators data...');
      const allValidatorsWithEitId = (allValidators || []).map(v => ({
        ...v,
        eit_id: v.eit_id || user.id // fallback to user.id if missing
      }));

      // Create the export data
      console.log('Creating final export data...');
      const exportData: CSAWData = {
        profile: { ...eitData, eit_id: user.id },
        skills: skills,
        experiences: mappedExperiences,
        allValidators: allValidatorsWithEitId,
        saos: (freshSAOs || []).map(sao => ({ ...sao, eit_id: user.id })),
        sao_skills: freshSaoSkills || []
      };

      // Generate PDF
      console.log('Generating PDF...');
      const pdfBytes = await generateCSAWPDF(exportData);
      const url = createPDFBlobUrl(pdfBytes);
      setPdfUrl(url);
      setPreviewData(exportData);
      setShowPreviewModal(true);
      setMessage({ type: 'success', text: 'Preview generated successfully!' });
      console.log('PDF generation completed successfully');

    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: 'Failed to generate preview. Please try again.' });
    } finally {
      setExportLoading(false);
    }
  };

  // Clean up PDF URL when modal is closed
  useEffect(() => {
    if (!showPreviewModal && pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  }, [showPreviewModal]);

  console.log('user:', user);
  console.log('userRole:', userRole);

  if (!user || !userRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  const handleAcceptRequest = async (id: string) => {
    setLoading(true);
    try {
      await supabase
        .from('supervisor_eit_relationships')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', id);
      if (user) fetchConnections(user.id);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to accept request.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDenyRequest = async (id: string) => {
    setLoading(true);
    try {
      await supabase
        .from('supervisor_eit_relationships')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', id);
      if (user) fetchConnections(user.id);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to deny request.' });
    } finally {
      setLoading(false);
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
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        className="input"
                        placeholder="Enter your full name"
                      />
                      <div className="flex space-x-2">
                        <button type="button" onClick={() => setIsEditingName(false)} className="btn btn-secondary">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p>{editFullName || 'Not set'}</p>
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
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
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
                      <p>{editEmail}</p>
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

          {/* Program Timeline Section (move this up) */}
          {userRole === 'eit' && (
            <section className="card p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Calendar /> Program Timeline
              </h2>
              <form
                className="flex flex-col gap-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoading(true);
                  setMessage({ type: '', text: '' });
                  if (start_date && target_date && new Date(target_date) <= new Date(start_date)) {
                    setMessage({ type: 'error', text: 'End date must be after start date.' });
                    setLoading(false);
                    return;
                  }
                  try {
                    const { error } = await supabase
                      .from('eit_profiles')
                      .update({ start_date, target_date })
                      .eq('id', user?.id);
                    if (error) throw error;
                    setMessage({ type: 'success', text: 'Timeline updated!' });
                  } catch (err) {
                    setMessage({ type: 'error', text: 'Failed to update timeline.' });
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <div className="flex flex-col md:flex-row gap-8 items-center w-full">
                  <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={start_date || ''}
                      onChange={e => setStartDate(e.target.value)}
                      className="input"
                    />
                    {start_date && (
                      <span className="text-xs text-slate-500 mt-1">{new Date(start_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    {/* Expected & Actual Progress */}
                    {start_date && target_date && (
                      <div className="flex flex-col items-center w-full mb-2">
                        <div className="flex gap-4 text-sm font-medium text-slate-700 mb-1">
                          <span>Expected Progress: {(() => {
                            const now = new Date().getTime();
                            const start = new Date(start_date).getTime();
                            const end = new Date(target_date).getTime();
                            if (end <= start) return '0%';
                            const percent = Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
                            return `${percent}%`;
                          })()}</span>
                          <span>Actual Progress: {overallProgress}%</span>
                        </div>
                        {/* Color logic for progress bar */}
                        {(() => {
                          const now = new Date().getTime();
                          const start = new Date(start_date).getTime();
                          const end = new Date(target_date).getTime();
                          let expected = 0;
                          if (end > start) {
                            expected = Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
                          }
                          const delta = overallProgress - expected;
                          let progressColor = 'bg-teal-500';
                          if (delta > 5) progressColor = 'bg-teal-500';
                          else if (delta >= -5) progressColor = 'bg-blue-500';
                          else progressColor = 'bg-red-500';
                          return (
                            <div className="w-full max-w-xs flex items-center gap-2 mt-1">
                              <span className="w-2 h-2 rounded-full bg-slate-300" />
                              <div className="flex-1 h-2 bg-slate-200 rounded-full relative overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                                  style={{ width: `${overallProgress}%` }}
                                />
                              </div>
                              <span className="w-2 h-2 rounded-full bg-slate-300" />
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    {/* Timeline bar (expected only, fallback) */}
                    {(!start_date || !target_date) && (
                      <div className="w-full max-w-xs flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal-500" />
                        <div className="flex-1 h-1 bg-slate-200 rounded-full relative" />
                        <span className="w-2 h-2 rounded-full bg-teal-500" />
                      </div>
                    )}
                    <div className="flex justify-between w-full max-w-xs text-xs text-slate-400 mt-1">
                      <span>{start_date ? new Date(start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : ''}</span>
                      <span>{target_date ? new Date(target_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : ''}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expected End Date</label>
                    <input
                      type="date"
                      value={target_date || ''}
                      onChange={e => setTargetDate(e.target.value)}
                      className="input"
                    />
                    {target_date && (
                      <span className="text-xs text-slate-500 mt-1">{new Date(target_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Dates'}
                  </button>
                  {message.type === 'success' && (
                    <span className="text-green-600 flex items-center gap-1 font-medium"><Check size={18} /> Saved!</span>
                  )}
                  {message.type === 'error' && (
                    <span className="text-red-600 text-sm">{message.text}</span>
                  )}
                </div>
              </form>
            </section>
          )}

          {/* Supervisor Connections Section (EIT or Supervisor) */}
          {(userRole === 'eit' || userRole === 'supervisor') && (
            <section className="card p-6 mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <UserIcon /> Supervisor Connections
              </h2>
              <div className="space-y-6">
                {/* Current Connections */}
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Current Connections</h3>
                  {supervisors.length === 0 ? (
                    <div className="text-slate-400">No active connections.</div>
                  ) : (
                    <ul className="divide-y divide-slate-200">
                      {supervisors.map((sup) => (
                        <li key={sup.id} className="py-2 flex md:flex-row flex-col md:items-center md:justify-between">
                          <span className="font-medium text-slate-800 md:w-1/2 w-full">{sup.full_name}</span>
                          <span className="text-slate-500 text-sm md:w-1/2 w-full md:text-right mt-1 md:mt-0">{sup.email}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* Divider */}
                <div className="border-t border-slate-200 my-4"></div>
                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-medium text-yellow-800 mb-2">Pending Requests</h3>
                    <ul className="divide-y divide-yellow-100">
                      {pendingRequests.map((req) => {
                        const isRecipient = (user && ((user.id === req.eit_id && req.supervisor_id !== user.id) || (user.id === req.supervisor_id && req.eit_id !== user.id)));
                        const otherParty = user && user.id === req.eit_id ? req.supervisor_profiles : req.eit_profiles;
                        return (
                          <li key={req.id} className="py-2 flex md:flex-row flex-col md:items-center md:justify-between gap-2">
                            <div className="flex flex-col md:flex-row md:items-center md:gap-4 md:w-1/2 w-full">
                              <span className="font-medium text-yellow-900">{otherParty?.full_name}</span>
                              <span className="text-yellow-700 text-sm">{otherParty?.email}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 md:mt-0 md:w-1/2 w-full md:justify-end">
                              <span className="text-xs text-yellow-600">Pending Approval</span>
                              {isRecipient && (
                                <>
                                  <button className="btn btn-primary btn-sm" onClick={() => handleAcceptRequest(req.id)} disabled={loading}>Accept</button>
                                  <button className="btn btn-danger btn-sm" onClick={() => handleDenyRequest(req.id)} disabled={loading}>Deny</button>
                                </>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                {/* Divider */}
                <div className="border-t border-slate-200 my-4"></div>
                {/* Connect with New Supervisor Form (EIT only) */}
                {userRole === 'eit' && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Connect with a New Supervisor</h3>
                    <form className="flex flex-col md:flex-row gap-4 items-start md:items-end" onSubmit={handleSupervisorRequest}>
                      <div className="flex-1 w-full">
                        <label htmlFor="supervisorEmail" className="label">Supervisor Email</label>
                        <input
                          type="email"
                          id="supervisorEmail"
                          className="input w-full"
                          placeholder="Enter supervisor's email"
                          value={supervisorEmail}
                          onChange={e => setSupervisorEmail(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-primary whitespace-nowrap" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Request'}
                      </button>
                    </form>
                    {supervisorRequestStatus !== 'idle' && supervisorRequestMessage && (
                      <div
                        className={`mt-3 text-sm p-2 rounded-md ${
                          supervisorRequestStatus === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : supervisorRequestStatus === 'pending'
                            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {supervisorRequestMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* CSAW Export Section */}
          {userRole === 'eit' && (
            <section className="card p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5" /> CSAW Application Preview
              </h2>
              <div className="space-y-4">
                <p className="text-slate-600">
                  Generate a PDF preview of your CSAW application. This can be used to review your application before submission, but does not submit the application to CSAW.
                </p>
                <button
                  onClick={handleExportToCSAW}
                  disabled={exportLoading}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  {exportLoading ? 'Generating Preview...' : 'Generate Preview'}
                </button>
              </div>
            </section>
          )}

          {/* APEGA ID Section */}
          {userRole === 'eit' && (
            <section className="card p-6 mb-6">
              <h2 className="text-lg font-semibold mb-2">APEGA ID</h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={7}
                  minLength={5}
                  className="input input-bordered w-full mb-2"
                  placeholder="Enter your APEGA ID"
                  value={apegaId}
                  onChange={e => {
                    // Only allow numbers
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setApegaId(val);
                  }}
                />
                <button
                  className={`btn btn-primary mb-2 flex items-center justify-center ${apegaIdSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                  style={{ minWidth: 80 }}
                  onClick={handleSaveApegaId}
                  disabled={apegaId.length < 5 || apegaId.length > 7 || !/^[0-9]{5,7}$/.test(apegaId) || apegaIdSaving}
                  type="button"
                >
                  {apegaIdSaving ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                  ) : apegaIdSaved ? (
                    <span className="text-green-500">Saved!</span>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
              {apegaId && (apegaId.length < 5 || apegaId.length > 7) && (
                <p className="text-red-600 text-sm mt-1">APEGA ID must be 5 to 7 digits.</p>
              )}
              <p className="text-slate-500 text-sm">Your APEGA ID is required for your CSAW application.</p>
            </section>
          )}

          {/* Subscription Section */}
          <div className="pt-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Choose Your Plan</h2>
              <p className="text-gray-600 text-md max-w-2xl mx-auto">
                Select the plan that best fits your needs
              </p>
              <div className="mt-2 text-lg font-semibold text-teal-700">
                Your Plan: {getPlanLabel()}
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                    Connect with 1 supervisor
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Standard support
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    One-click CSAW generation
                  </li>
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

              {/* Pro Plan */}
              <div className={`border ${tier === 'pro' ? 'border-teal-500' : 'border-gray-200'} rounded-2xl p-8 bg-gradient-to-br from-teal-50 to-white flex flex-col items-center shadow-sm`}>
                <h3 className="text-2xl font-bold text-teal-900 mb-2">Pro</h3>
                <p className="text-5xl font-extrabold text-teal-800 mb-4">$9.99</p>
                <p className="text-base font-semibold text-teal-700 mb-4">per month</p>
                <ul className="mb-6 w-full space-y-3">
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Unlimited documents
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Unlimited SAOs
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Unlimited supervisors
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    Priority support
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    One-click CSAW generation
                  </li>
                </ul>
                {tier === 'pro' ? (
                  <span className="inline-block bg-teal-100 text-teal-800 px-4 py-2 rounded-full font-semibold text-sm shadow">Current Plan</span>
                ) : (
                  <button 
                    onClick={() => window.location.href = 'mailto:contact@accreda.com?subject=Upgrade to Pro Plan'}
                    className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full font-semibold text-sm shadow transition-colors"
                  >
                    Upgrade to Pro
                  </button>
                )}
              </div>

              {/* Enterprise Plan */}
              <div className={`border ${tier === 'enterprise' ? 'border-purple-500' : 'border-gray-200'} rounded-2xl p-8 bg-gradient-to-br from-purple-50 to-white flex flex-col items-center shadow-sm`}>
                <h3 className="text-2xl font-bold text-purple-900 mb-2">Enterprise</h3>
                <p className="text-base font-semibold text-purple-800 mb-4">Custom Pricing</p>
                <ul className="mb-6 w-full space-y-3">
                  <li className="flex items-center text-gray-700"><span className="text-green-500 mr-2">✓</span> Everything in Pro</li>
                  <li className="flex items-center text-gray-700"><span className="text-green-500 mr-2">✓</span> Priority support</li>
                  <li className="flex items-center text-gray-700"><span className="text-green-500 mr-2">✓</span> Dedicated account manager</li>
                  <li className="flex items-center text-gray-700"><span className="text-green-500 mr-2">✓</span> Access to Supervisor Dashboard</li>
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

          {/* Billing Portal Section */}
          <div className="max-w-2xl mx-auto mt-10">
            <div className="rounded-2xl shadow bg-gradient-to-br from-slate-50 to-white p-8 flex flex-col items-center border border-slate-200">
              <h3 className="text-xl font-bold text-teal-800 mb-2 flex items-center gap-2">
                <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-1.79-8-4V6c0-2.21 3.582-4 8-4s8 1.79 8 4v8c0 2.21-3.582 4-8 4z" /></svg>
                Manage Your Billing
              </h3>
              <p className="text-gray-600 text-center mb-4 max-w-md">Update your payment method or view your invoices securely through our billing portal. <span className="font-semibold text-teal-700">Plan changes and cancellations require contacting support.</span></p>
              <a
                href="https://billing.stripe.com/p/login/test_bJebJ12tadR8e1d3pQ7ss00"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full font-semibold text-md shadow transition-colors mb-2 mt-2"
              >
                Go to Billing Portal
              </a>
            </div>
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
                  <h3 className="text-sm font-medium text-gray-900">User Skills</h3>
                  <p className="text-sm text-gray-500">Get notified when your skills are validated or updated</p>
                </div>
                <Switch
                  checked={userSkills}
                  onChange={toggleUserSkills}
                  className={`${userSkills ? 'bg-teal-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${userSkills ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>

              {/* Portfolio Update Email Frequency */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Portfolio Update Reminders</h3>
                    <p className="text-sm text-gray-500">Receive automated reminders to update your portfolio</p>
                  </div>
                  <Switch
                    checked={true}
                    onChange={() => {}}
                    className={`${true ? 'bg-teal-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${true ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
                <div className="mt-3">
                  <label htmlFor="emailFrequency" className="block text-sm font-medium text-gray-700">Email Frequency</label>
                  <select
                    id="emailFrequency"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                    defaultValue="weekly"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Terms Acceptance Card */}
          <section className="card p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Shield /> Terms & Conditions
            </h2>
            {termsAccepted && termsAcceptanceData ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Terms and Conditions Accepted</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium">{termsAcceptanceData.terms_version}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Accepted on:</span>
                    <span className="font-medium">
                      {new Date(termsAcceptanceData.accepted_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {termsAcceptanceData.ip_address && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IP Address:</span>
                      <span className="font-mono text-xs">{termsAcceptanceData.ip_address}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    You accepted our Terms and Conditions when you created your account. 
                    If we update our terms, you'll be notified and asked to accept the new version.
                  </p>
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium underline"
                  >
                    View Terms
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-600">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Terms Acceptance Status Unknown</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    We couldn't find a record of your terms acceptance. This might be because you signed up before we started tracking this information.
                  </p>
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium underline"
                  >
                    View Terms
                  </a>
                </div>
              </div>
            )}
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
      {/* Contact Us Modal */}
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
            <h2 className="text-xl font-bold mb-4 text-blue-800">Request Plan Downgrade</h2>
            {contactSuccess ? (
              <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm mb-4">
                Your downgrade request has been sent successfully. We'll get back to you soon!
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
                        subject: 'Plan Downgrade Request',
                        message: `Name: ${contactName}\nEmail: ${contactEmail}\nCurrent Plan: ${tier}\n\nReason for Downgrade:\n${contactMessage}`,
                        issueType: 'downgrade',
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    className="input"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    required
                    disabled={contactLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="input"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    required
                    disabled={contactLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Downgrade (Optional)</label>
                  <textarea
                    className="input"
                    rows={4}
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    disabled={contactLoading}
                    placeholder="Please let us know why you'd like to downgrade your plan..."
                  />
                </div>
                {contactError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {contactError}
                  </div>
                )}
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={contactLoading}
                >
                  {contactLoading ? 'Sending...' : 'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"><div className="bg-white rounded-lg shadow-lg p-8">Loading preview...</div></div>}>
          <PDFPreviewModal
            pdfUrl={pdfUrl}
            onClose={() => setShowPreviewModal(false)}
          />
        </Suspense>
      )}

      {/* APEGA ID Warning Modal */}
      {showApegaWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-red-600">APEGA ID Required</h2>
            <p className="mb-4">You have not entered your APEGA ID. Are you sure you want to generate the PDF without it?</p>
            <div className="flex justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setShowApegaWarning(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setAllowAnyway(true); setShowApegaWarning(false); handleExportToCSAW(); }}>Allow Anyway</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 