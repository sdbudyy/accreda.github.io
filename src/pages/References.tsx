import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, Users, CheckCircle2, Award, X, Edit2, Briefcase, Calendar, MapPin, Plus, ChevronDown, ChevronUp, Search, AlertCircle, CheckCircle, XCircle, Info, MessageCircle, Trash2 } from 'lucide-react';
import Timeline from '../components/references/Timeline';
import { useSkillsStore } from '../store/skills';
import { supabase } from '../lib/supabase';
import SupervisorAutocomplete from '../components/references/SupervisorAutocomplete';
import SupervisorEmailAutocomplete from '../components/references/SupervisorEmailAutocomplete';
import { sendValidationRequestNotification } from '../utils/notifications';
import { toast } from 'react-hot-toast';
import ReferenceAutocomplete from '../components/references/ReferenceAutocomplete';
import SkillSelectModal from '../components/common/SkillSelectModal';
import { deleteValidatorAndValidations } from '../utils/validatorUtils';

interface Validator {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  description: string;
  status: string;
  score: number | null;
  created_at: string;
  updated_at: string;
  eit_id: string;
  skill_id: string;
}

interface Job {
  id: string;
  eit_id: string;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string;
  skills?: string[];
}

interface Reference {
  id: string;
  job_id: string;
  first_name: string;
  last_name: string;
  email: string;
  description: string;
  reference_number: number;
  validation_status: 'pending' | 'validated' | 'rejected' | 'unsent';
  validator_id: string | null;
  validated_at: string | null;
  validation_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface EITConnection {
  id: string;
  eit_id: string;
  connected_eit_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface ValidatorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  skillName: string;
  skillId: string;
  existingValidator?: Validator;
  onSave: () => void;
  status: string;
  loadValidators: () => void;
}

interface ReferencePopupProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  referenceNumber: number;
  existingReference?: Reference;
  onSave: (newReferenceId?: string) => void;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  status?: string;
  description?: string;
}

const ValidatorPopup: React.FC<ValidatorPopupProps> = ({ 
  isOpen, 
  onClose, 
  skillName, 
  skillId,
  existingValidator,
  onSave,
  status,
  loadValidators
}) => {
  const [formData, setFormData] = useState({
    firstName: existingValidator?.first_name || '',
    lastName: existingValidator?.last_name || '',
    email: existingValidator?.email || '',
    description: existingValidator?.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (existingValidator) {
        setFormData({
          firstName: existingValidator.first_name,
          lastName: existingValidator.last_name,
          email: existingValidator.email,
          description: existingValidator.description
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          description: ''
        });
      }
    }
  }, [isOpen, existingValidator, skillId]);

  const handleEmailChange = (email: string, firstName?: string, lastName?: string) => {
    setFormData(prev => ({
      ...prev,
      email,
      ...(firstName && { firstName }),
      ...(lastName && { lastName })
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get EIT profile for notification
      const { data: eitProfile, error: eitError } = await supabase
        .from('eit_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (eitError) throw eitError;

      // Get supervisor profile for notification
      const { data: supervisorProfile, error: supervisorError } = await supabase
        .from('supervisor_profiles')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (supervisorError) throw supervisorError;

      if (existingValidator) {
        // Update existing validator
        const { error: updateError } = await supabase
          .from('validators')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            description: formData.description
          })
          .eq('id', existingValidator.id);

        if (updateError) throw updateError;
      } else {
        // Create new validator
        const { error: insertError } = await supabase
          .from('validators')
          .insert([{
            eit_id: user.id,
            skill_id: skillId,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            description: formData.description,
            position: 'supervisor',
            status: 'pending'
          }]);

        if (insertError) throw insertError;

        // Send notification to supervisor
        await sendValidationRequestNotification(
          supervisorProfile?.id || formData.email, // fallback to email if id not found
          eitProfile?.full_name ?? '',
          skillName
        );
      }

      onSave();
      onClose();
      setTimeout(() => loadValidators(), 300);
    } catch (err) {
      console.error('Validator insert error:', err);
      setError(err instanceof Error ? err.message : JSON.stringify(err));
      toast.error(err instanceof Error ? err.message : 'Error submitting validator');
    } finally {
      setLoading(false);
    }
  };

  const handleSendViaEmail = async () => {
    setSending(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      let validatorId = existingValidator?.id;
      // Save validator if not already saved
      if (!validatorId) {
        const { data: insertData, error: insertError } = await supabase
          .from('validators')
          .insert([{
            eit_id: user.id,
            skill_id: skillId,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            description: formData.description,
            position: 'supervisor',
            status: 'pending'
          }])
          .select();
        if (insertError) throw insertError;
        validatorId = insertData && insertData[0]?.id;
      }
      // Call the Edge Function to send the magic link
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-validator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          validator_id: validatorId,
          email: formData.email
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send validation request');
      }
      toast.success('Validation request sent successfully');
      onSave();
      onClose();
      setTimeout(() => loadValidators(), 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while sending the validation request');
      toast.error(err instanceof Error ? err.message : 'Error sending validation request');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {existingValidator ? 'Edit' : 'Add'} Validator for {skillName}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Enter validator's first name"
                required
                disabled={status !== 'draft'}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Enter validator's last name"
                required
                disabled={status !== 'draft'}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <SupervisorEmailAutocomplete
              value={formData.email}
              onChange={handleEmailChange}
              disabled={status !== 'draft'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter description of validation (optional)"
              rows={4}
              disabled={status !== 'draft'}
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-outline-primary px-4 py-2 rounded-md border border-teal-600 text-teal-700 font-semibold hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              onClick={handleSendViaEmail}
              disabled={loading || sending || status !== 'draft'}
            >
              {sending ? 'Sending...' : 'Send via Email instead'}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : existingValidator ? 'Save Changes' : 'Add Validator'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReferencePopup: React.FC<ReferencePopupProps> = ({
  isOpen,
  onClose,
  job,
  referenceNumber,
  existingReference,
  onSave
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    referenceText: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Reset form data when popup opens/closes or when reference changes
  useEffect(() => {
    if (isOpen) {
      if (existingReference) {
        setFormData({
          firstName: existingReference.first_name || '',
          lastName: existingReference.last_name || '',
          email: existingReference.email,
          referenceText: existingReference.description
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          referenceText: ''
        });
      }
    }
  }, [isOpen, existingReference]);

  // Save reference (returns the reference object)
  const saveReference = async (statusOverride?: 'unsent' | 'pending') => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      const referenceData = {
        job_id: job.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        description: formData.referenceText,
        reference_number: referenceNumber,
        eit_id: user.id,
        validation_status: statusOverride || existingReference?.validation_status || 'unsent'
      };
      let refId = existingReference?.id;
      let refObj = null;
      if (existingReference) {
        const { data: updateData, error: updateError } = await supabase
          .from('job_references')
          .update(referenceData)
          .eq('id', existingReference.id)
          .select();
        if (updateError) throw updateError;
        refObj = updateData && updateData[0];
        refId = refObj?.id;
      } else {
        const { data: insertData, error: insertError } = await supabase
          .from('job_references')
          .insert([referenceData])
          .select();
        if (insertError) throw insertError;
        refObj = insertData && insertData[0];
        refId = refObj?.id;
      }
      return refObj;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error(err instanceof Error ? err.message : 'Error saving reference');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Save as unsent
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const refObj = await saveReference('unsent');
      onSave(refObj?.id);
      onClose();
    } catch {}
  };

  // Save and send (set to pending, call send endpoint)
  const handleSaveAndSend = async () => {
    setSending(true);
    setError(null);
    try {
      // Save as pending
      const refObj = await saveReference('pending');
      if (!refObj) throw new Error('Reference not found after save');
      // Call the Edge Function to send the magic link
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reference`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          reference_id: refObj.id,
          email: refObj.email
        })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send reference');
      }
      onSave(refObj.id);
      onClose();
      toast.success('Reference request sent successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while sending the reference');
      toast.error(err instanceof Error ? err.message : 'Error sending reference');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {existingReference ? 'Edit' : 'Add'} Reference {referenceNumber} for {job.title} at {job.company}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Enter reference's first name"
                required
                disabled={existingReference?.validation_status === 'validated'}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Enter reference's last name"
                required
                disabled={existingReference?.validation_status === 'validated'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter reference's email"
              required
              disabled={existingReference?.validation_status === 'validated'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reference Text
            </label>
            <textarea
              value={formData.referenceText}
              onChange={(e) => setFormData(prev => ({ ...prev, referenceText: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter reference text"
              rows={4}
              required
              disabled={existingReference?.validation_status === 'validated'}
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              disabled={loading || sending}
            >
              Close
            </button>
            {existingReference?.validation_status !== 'validated' && (
              <>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-500 hover:bg-slate-600 rounded-lg disabled:opacity-50"
                  disabled={loading || sending}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndSend}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50"
                  disabled={loading || sending}
                >
                  {sending ? 'Sending...' : 'Send via Email'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const References: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'references' | 'validators'>('references');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null);
  const [selectedReferenceNumber, setSelectedReferenceNumber] = useState<number | null>(null);
  const [validators, setValidators] = useState<Record<string, Validator[]>>({});
  const [references, setReferences] = useState<Record<string, Reference[]>>({});
  const [jobs, setJobs] = useState<Job[]>([]);
  const { skillCategories } = useSkillsStore();
  const workExperienceRef = useRef<HTMLDivElement>(null);
  const referencesSectionRef = useRef<HTMLDivElement>(null);
  const validatorsSectionRef = useRef<HTMLDivElement>(null);
  const [nudgeCooldowns, setNudgeCooldowns] = useState<Record<string, number>>({});
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [connections, setConnections] = useState<EITConnection[]>([]);
  const [selectedReferenceForValidation, setSelectedReferenceForValidation] = useState<Reference | null>(null);
  const [validationNotes, setValidationNotes] = useState('');
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [addJobLoading, setAddJobLoading] = useState(false);
  const [addJobError, setAddJobError] = useState<string | null>(null);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    description: '',
    skills: [] as string[],
  });
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isEditSkillsModalOpen, setIsEditSkillsModalOpen] = useState(false); // NEW: for edit modal
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [showDeleteValidatorConfirm, setShowDeleteValidatorConfirm] = useState(false);
  const [validatorToDelete, setValidatorToDelete] = useState<Validator | null>(null);
  // At the top, add state for the comment popup
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentModalContent, setCommentModalContent] = useState({
    comment: '',
    feedback: ''
  });
  const [commentModalLoading, setCommentModalLoading] = useState(false);

  const selectedSkills = skillCategories
    .flatMap(cat => cat.skills)
    .filter(skill => newJob.skills.includes(skill.id));

  // NEW: selectedEditSkills for edit modal
  const selectedEditSkills = skillCategories
    .flatMap(cat => cat.skills)
    .filter(skill => editJob && editJob.skills && editJob.skills.includes(skill.id));

  // Get completed skills grouped by category
  const completedSkillsByCategory = skillCategories.map(category => ({
    ...category,
    skills: category.skills.filter(skill => skill.status === 'completed' || skill.rank !== undefined)
  })).filter(category => category.skills.length > 0);

  const getMeanColor = (mean: number) => {
    if (mean >= 4.5) return 'bg-green-100 text-green-700';
    if (mean >= 3.5) return 'bg-blue-100 text-blue-700';
    if (mean >= 2.5) return 'bg-yellow-100 text-yellow-700';
    if (mean >= 1.5) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const loadValidators = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('validators')
        .select('*')
        .eq('eit_id', user.id);

      if (error) throw error;

      // Group validators by skill_id
      const groupedValidators = data.reduce((acc, validator) => {
        if (!acc[validator.skill_id]) {
          acc[validator.skill_id] = [];
        }
        acc[validator.skill_id].push(validator);
        return acc;
      }, {} as Record<string, Validator[]>);

      setValidators(groupedValidators);
    } catch (error) {
      console.error('Error loading validators:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('eit_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadReferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('job_references')
        .select('*')
        .eq('eit_id', user.id);

      if (error) throw error;

      // Group references by job_id
      const groupedReferences = data.reduce((acc, reference) => {
        if (!acc[reference.job_id]) {
          acc[reference.job_id] = [];
        }
        acc[reference.job_id].push(reference);
        return acc;
      }, {} as Record<string, Reference[]>);

      setReferences(groupedReferences);
    } catch (error) {
      console.error('Error loading references:', error);
    }
  };

  const loadConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('eit_connections')
        .select('*')
        .or(`eit_id.eq.${user.id},connected_eit_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error loading connections:', error);
    }
  };

  useEffect(() => {
    loadValidators();
    loadJobs();
    loadReferences();
    loadConnections();
  }, []);

  useEffect(() => {
    let subscription: any;
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      subscription = supabase
        .channel('validators-realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'validators',
          filter: `eit_id=eq.${user.id}`
        }, (payload) => {
          if (mounted) {
            loadValidators();
          }
        })
        .subscribe();
    })();
    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const handleScrollToItem = (event: any) => {
      const { itemId, itemType } = event.detail || {};
      
      // Function to perform the scroll
      const performScroll = () => {
        const selector = itemType === 'reference' ? `[data-reference-id="${itemId}"]` :
                        itemType === 'validator' ? `[data-validator-id="${itemId}"]` :
                        itemType === 'job' ? `[data-job-id="${itemId}"]` : '';
        
        if (!selector) return;

        const element = document.querySelector(selector);

        if (element) {
          // First scroll the section into view
          if (itemType === 'reference') {
            setActiveTab('references');
            referencesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else if (itemType === 'validator') {
            setActiveTab('validators');
            validatorsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }

          // Then scroll to the specific element after a short delay
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('highlight-item');
            
            // Add a subtle bounce animation
            element.classList.add('animate-bounce-subtle');
            
            // Remove animations after they complete
            setTimeout(() => {
              element.classList.remove('highlight-item', 'animate-bounce-subtle');
            }, 2000);
          }, 300);
        }
      };

      // Wait for the next render cycle to ensure DOM is updated
      requestAnimationFrame(() => {
        // If we're switching tabs, wait for the tab switch to complete
        if ((itemType === 'reference' && activeTab !== 'references') ||
            (itemType === 'validator' && activeTab !== 'validators')) {
          setTimeout(performScroll, 100);
        } else {
          performScroll();
        }
      });
    };

    window.addEventListener('scroll-to-item', handleScrollToItem);
    return () => window.removeEventListener('scroll-to-item', handleScrollToItem);
  }, [activeTab]);

  useEffect(() => {
    const handleJobsUpdated = () => {
      loadJobs();
      loadReferences();
    };
    window.addEventListener('jobs-updated', handleJobsUpdated);
    return () => window.removeEventListener('jobs-updated', handleJobsUpdated);
  }, []);

  const handleValidatorSave = () => {
    loadValidators();
  };

  const handleReferenceSave = async (newReferenceId?: string) => {
    await loadReferences();
    if (newReferenceId) {
      // Find the job and reference number for the new reference
      let foundJob: Job | null = null;
      let foundReference: Reference | null = null;
      let foundRefNum: number | null = null;
      for (const job of jobs) {
        const jobRefs = references[job.id] || [];
        for (const ref of jobRefs) {
          if (ref.id === newReferenceId) {
            foundJob = job;
            foundReference = ref;
            foundRefNum = ref.reference_number;
            break;
          }
        }
        if (foundReference) break;
      }
      if (foundJob && foundReference && foundRefNum) {
        setSelectedJob(foundJob);
        setSelectedReference(foundReference);
        setSelectedReferenceNumber(foundRefNum);
      }
    }
  };

  const handleValidateReference = async (reference: Reference, status: 'validated' | 'rejected') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('job_references')
        .update({
          validation_status: status,
          validator_id: user.id,
          validated_at: new Date().toISOString(),
          validation_notes: validationNotes
        })
        .eq('id', reference.id);

      if (error) throw error;

      setSelectedReferenceForValidation(null);
      setValidationNotes('');
      handleReferenceSave();
      toast.success(`Reference ${status === 'validated' ? 'validated' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error validating reference:', error);
      toast.error('Failed to validate reference');
    }
  };

  const handleUnsendReference = async (reference: Reference) => {
    try {
      const { error } = await supabase
        .from('job_references')
        .delete()
        .eq('id', reference.id);

      if (error) throw error;

      handleReferenceSave();
      toast.success('Reference unsent successfully');
    } catch (error) {
      console.error('Error unsending reference:', error);
      toast.error('Failed to unsend reference');
    }
  };

  // Sort jobs by start_date descending (most recent first)
  const sortedJobs = [...jobs].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  // Filter jobs by search term
  const filteredJobs = sortedJobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.skills && job.skills.some(skillId => {
      const skill = skillCategories.flatMap(cat => cat.skills).find(s => s.id === skillId);
      return skill && skill.name.toLowerCase().includes(searchTerm.toLowerCase());
    }))
  );

  const getValidationStatusColor = (status: string) => {
    switch (status) {
      case 'validated':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getValidationStatusIcon = (status: string) => {
    switch (status) {
      case 'validated':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertCircle size={16} className="text-yellow-600" />;
    }
  };

  const handleDeleteValidator = async () => {
    if (!validatorToDelete) return;
    
    try {
      const result = await deleteValidatorAndValidations(
        validatorToDelete.id,
        validatorToDelete.eit_id,
        validatorToDelete.skill_id
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete validator');
      }

      setShowDeleteValidatorConfirm(false);
      setValidatorToDelete(null);
      setTimeout(() => loadValidators(), 300);
      toast.success('Validator deleted successfully');
    } catch (error) {
      console.error('Error deleting validator:', error);
      toast.error('Failed to delete validator');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between" ref={workExperienceRef}>
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center">
          <Bookmark size={24} className="mr-2 text-teal-600" />
          Jobs
        </h1>
      </div>

      {/* Jobs Timeline Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase size={24} className="text-teal-600" />
            Work Experience
          </h2>
          <button
            className="btn btn-primary flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200"
            onClick={() => setIsAddJobModalOpen(true)}
            title="Add Experience"
          >
            <Plus size={16} />
            Add Experience
          </button>
        </div>
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Search jobs by title, company, or skill..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="relative border-l-2 border-slate-200 pl-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job, idx) => {
              const isCurrent = !job.end_date;
              const statusColor = isCurrent ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600';
              const companyInitials = job.company
                .split(' ')
                .map(w => w[0])
                .join('')
                .toUpperCase();
              return (
                <div key={job.id} className="mb-10 relative">
                  {/* Timeline dot */}
                  <span className="absolute -left-7 top-4 w-5 h-5 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center text-teal-600 font-bold text-sm shadow">
                    {companyInitials}
                  </span>
                  <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">{job.title}
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>{isCurrent ? 'Current' : 'Past'}</span>
                        </h3>
                        <p className="text-slate-600 font-medium">{job.company}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><Calendar size={14} />
                            {new Date(job.start_date).toLocaleDateString()} - {job.end_date ? new Date(job.end_date).toLocaleDateString() : 'Present'}
                          </span>
                          <span className="flex items-center gap-1"><MapPin size={14} />{job.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="ml-2 p-2 rounded-full hover:bg-slate-100 text-slate-500"
                          onClick={() => {
                            setEditJob(job);
                            setIsEditJobModalOpen(true);
                          }}
                          title="Edit Job"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button
                          className="ml-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
                          onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                          title={expandedJobId === job.id ? 'Collapse' : 'Expand'}
                        >
                          {expandedJobId === job.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                    </div>
                    {expandedJobId === job.id && (
                      <div className="mt-4 space-y-3">
                        {job.description && (
                          <p className="text-slate-700 text-sm mb-2">{job.description}</p>
                        )}
                        {job.skills && job.skills.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 mb-1">Skills:</h4>
                            <div className="flex flex-wrap gap-2">
                              {job.skills.map((skillId: string) => {
                                const skill = skillCategories.flatMap(cat => cat.skills).find(s => s.id === skillId);
                                return skill ? (
                                  <span
                                    key={skillId}
                                    className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs"
                                  >
                                    {skill.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                        {/* References Section */}
                        <div className="mt-2">
                          <h4 className="text-sm font-medium text-slate-700 mb-1">References:</h4>
                          <div className="flex gap-2">
                            {[1, 2].map((refNum) => {
                              const reference = references[job.id]?.find(r => r.reference_number === refNum);
                              return reference ? (
                                <button
                                  key={reference.id}
                                  onClick={() => {
                                    setSelectedJob(job);
                                    setSelectedReference(reference);
                                    setSelectedReferenceNumber(refNum);
                                    window.dispatchEvent(new CustomEvent('scroll-to-item', {
                                      detail: { itemId: reference.id, itemType: 'reference' }
                                    }));
                                  }}
                                  className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2 border border-slate-200"
                                  data-reference-id={reference.id}
                                >
                                  <Edit2 size={14} />
                                  Reference {refNum}: {reference.first_name} {reference.last_name}
                                </button>
                              ) : (
                                <button
                                  key={refNum}
                                  onClick={() => {
                                    setSelectedJob(job);
                                    setSelectedReference(null);
                                    setSelectedReferenceNumber(refNum);
                                  }}
                                  className="px-3 py-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-2 border border-teal-200"
                                >
                                  <Plus size={14} />
                                  Add Reference {refNum}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Briefcase size={24} className="mx-auto mb-2 text-slate-400" />
              <p>No work experience added yet</p>
              <p className="text-sm mt-1">Add jobs using the button above</p>
            </div>
          )}
        </div>
      </div>

      {/* References and Validators Toggle */}
      <div className="card" ref={referencesSectionRef}>
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('references')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'references'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users size={18} />
              References
            </div>
          </button>
          <button
            onClick={async () => {
              await loadValidators();
              setActiveTab('validators');
            }}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'validators'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 size={18} />
              Validators
            </div>
          </button>
        </div>

        <div className="p-6" ref={validatorsSectionRef}>
          {activeTab === 'references' ? (
            <div className="space-y-6">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-lg border border-slate-200 p-4" data-job-id={job.id}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">{job.title}</h3>
                        <p className="text-slate-600">{job.company}</p>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2].map((refNum) => {
                          const reference = references[job.id]?.find(r => r.reference_number === refNum);
                          return reference ? (
                            <button
                              key={reference.id}
                              onClick={() => {
                                setSelectedJob(job);
                                setSelectedReference(reference);
                                setSelectedReferenceNumber(refNum);
                                // Dispatch event to scroll to reference
                                window.dispatchEvent(new CustomEvent('scroll-to-item', {
                                  detail: { itemId: reference.id, itemType: 'reference' }
                                }));
                              }}
                              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2 border border-slate-200"
                              data-reference-id={reference.id}
                            >
                              <Edit2 size={14} />
                              Reference {refNum}: {reference.first_name} {reference.last_name}
                            </button>
                          ) : (
                            <button
                              key={refNum}
                              onClick={() => {
                                setSelectedJob(job);
                                setSelectedReference(null);
                                setSelectedReferenceNumber(refNum);
                              }}
                              className="px-3 py-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-2 border border-teal-200"
                            >
                              <Plus size={14} />
                              Add Reference {refNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          {new Date(job.start_date).toLocaleDateString()} - {job.end_date ? new Date(job.end_date).toLocaleDateString() : 'Present'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{job.location}</span>
                      </div>
                    </div>

                    {job.description && (
                      <p className="text-slate-600 text-sm mb-3">{job.description}</p>
                    )}

                    {job.skills && job.skills.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skillId: string) => {
                            const skill = skillCategories.flatMap(cat => cat.skills).find(s => s.id === skillId);
                            return skill ? (
                              <span
                                key={skillId}
                                className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs"
                              >
                                {skill.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {/* References */}
                    <div className="mt-4 space-y-4">
                      <h4 className="text-sm font-medium text-slate-700">References</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map((refNum) => {
                          const reference = references[job.id]?.find(r => r.reference_number === refNum);
                          return (
                            <div key={refNum} className="border border-slate-200 rounded-lg p-4">
                              {reference ? (
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium text-slate-900">{reference.first_name} {reference.last_name}</h5>
                                  </div>
                                  <p className="text-sm text-slate-600 mb-2">{reference.email}</p>
                                  {reference.description && (
                                    <p className="text-sm text-slate-700 mb-2">{reference.description}</p>
                                  )}
                                  {/* Move Unsend button here, only for pending references */}
                                  {reference.validation_status === 'pending' && (
                                    <div className="mb-2">
                                      <button
                                        onClick={() => handleUnsendReference(reference)}
                                        className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        Unsend
                                      </button>
                                    </div>
                                  )}
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getValidationStatusColor(reference.validation_status)}`}>
                                    {getValidationStatusIcon(reference.validation_status)}
                                    {reference.validation_status.charAt(0).toUpperCase() + reference.validation_status.slice(1)}
                                  </div>
                                  {reference.validation_notes && (
                                    <div className="mt-2 p-2 bg-slate-50 rounded text-sm text-slate-600">
                                      <p className="font-medium">Validation Notes:</p>
                                      <p>{reference.validation_notes}</p>
                                    </div>
                                  )}
                                  {reference.validated_at && (
                                    <p className="text-xs text-slate-500 mt-2">
                                      Validated on {new Date(reference.validated_at).toLocaleDateString()}
                                    </p>
                                  )}
                                  {/* Show validation buttons for connected EITs */}
                                  {connections.some(c => c.connected_eit_id === job.eit_id) && reference.validation_status === 'pending' && (
                                    <div className="mt-3 flex gap-2">
                                      <button
                                        onClick={() => {
                                          setSelectedReferenceForValidation(reference);
                                          setValidationNotes('');
                                        }}
                                        className="px-3 py-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-2 border border-teal-200"
                                      >
                                        Validate Reference
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedJob(job);
                                    setSelectedReference(null);
                                    setSelectedReferenceNumber(refNum);
                                  }}
                                  className="w-full px-3 py-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-2 border border-teal-200"
                                >
                                  <Plus size={14} />
                                  Add Reference {refNum}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Briefcase size={24} className="mx-auto mb-2 text-slate-400" />
                  <p>No work experience added yet</p>
                  <p className="text-sm mt-1">Add jobs in the Work Experience section above</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {completedSkillsByCategory.length > 0 ? (
                completedSkillsByCategory.map((category) => (
                  <div key={category.name} className="bg-white rounded-lg border border-slate-200 p-4">
                    <h3 className="font-semibold text-slate-900 mb-4">{category.name}</h3>
                    <div className="space-y-4">
                      {category.skills.map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between group relative transition-shadow hover:shadow-lg focus-within:shadow-lg rounded-lg p-2" data-skill-id={skill.id}>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-800 flex items-center gap-2">
                              {skill.name}
                              {/* Info icon for rubric/description */}
                              {(skill as Skill).description && (
                                <span className="relative group/info">
                                  <Info size={16} className="text-blue-500 cursor-pointer" />
                                  <span className="absolute left-6 top-0 z-10 w-64 p-2 bg-white border border-slate-200 rounded shadow text-xs text-slate-700 opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none">
                                    {(skill as Skill).description}
                                  </span>
                                </span>
                              )}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              {validators[skill.id]?.map((validator) => (
                                <div key={validator.id} className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-1 group/validator relative transition-all hover:bg-slate-100 focus-within:bg-slate-100">
                                  <button
                                    onClick={() => {
                                      if (validator.status === 'draft') {
                                        setSelectedSkill(skill.id);
                                        setSelectedValidator(validator);
                                        window.dispatchEvent(new CustomEvent('scroll-to-item', {
                                          detail: { itemId: validator.id, itemType: 'validator' }
                                        }));
                                      }
                                    }}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${validator.status !== 'draft' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-slate-600 hover:text-slate-700 hover:bg-slate-50'}`}
                                    data-validator-id={validator.id}
                                    disabled={validator.status !== 'draft'}
                                  >
                                    <Edit2 size={14} />
                                    {validator.first_name} {validator.last_name}
                                  </button>
                                  {/* Status tag with tooltip */}
                                  {validator.status !== 'scored' && (
                                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold relative group/status ${
                                      validator.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                      validator.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                      'bg-slate-100 text-slate-500'
                                    }`}>
                                      {validator.status.charAt(0).toUpperCase() + validator.status.slice(1)}
                                      <span className="absolute left-1/2 -translate-x-1/2 top-7 z-10 w-40 p-2 bg-white border border-slate-200 rounded shadow text-xs text-slate-700 opacity-0 group-hover/status:opacity-100 transition-opacity pointer-events-none">
                                        {validator.status === 'draft' && 'Draft: Not yet sent to supervisor.'}
                                        {validator.status === 'pending' && 'Pending: Awaiting supervisor action.'}
                                        {validator.status !== 'draft' && validator.status !== 'pending' && 'Unknown status.'}
                                      </span>
                                    </span>
                                  )}
                                  {/* Supervisor Score UI */}
                                  {validator.status === 'scored' && (
                                    <>
                                      <span className="ml-2 flex flex-col items-center">
                                        <span className="inline-block px-3 py-1 rounded-full text-base font-bold bg-green-100 text-green-800 border border-green-300 shadow-sm relative group/score" title="Supervisor's score for this skill">
                                          Supervisor Score: {validator.score}
                                          <span className="absolute left-1/2 -translate-x-1/2 top-8 z-10 w-40 p-2 bg-white border border-slate-200 rounded shadow text-xs text-slate-700 opacity-0 group-hover/score:opacity-100 transition-opacity pointer-events-none">
                                            This is the score (1-5) given by your supervisor for this skill.
                                          </span>
                                        </span>
                                      </span>
                                      <button
                                        className="ml-2 p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-800 transition-colors"
                                        onClick={async () => {
                                          setCommentModalLoading(true);
                                          setShowCommentModal(true);
                                          // Fetch the latest non-empty comment for this skill/validator
                                          const { data, error } = await supabase
                                            .from('skill_validations')
                                            .select('comment, feedback')
                                            .eq('eit_id', validator.eit_id)
                                            .eq('skill_id', validator.skill_id)
                                            .not('comment', 'is', null)
                                            .not('comment', 'eq', '')
                                            .order('validated_at', { ascending: false })
                                            .limit(1);
                                          console.log({validator, data, error});
                                          if (!error && data && data.length > 0 && data[0].comment) {
                                            setCommentModalContent({
                                              comment: data[0].comment,
                                              feedback: data[0].feedback
                                            });
                                          } else {
                                            setCommentModalContent({
                                              comment: 'No comment found.',
                                              feedback: ''
                                            });
                                          }
                                          setCommentModalLoading(false);
                                        }}
                                        title="View Comment"
                                      >
                                        <MessageCircle size={18} />
                                      </button>
                                      <button
                                        className="ml-2 p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition-colors"
                                        onClick={() => {
                                          setValidatorToDelete(validator);
                                          setShowDeleteValidatorConfirm(true);
                                        }}
                                        title="Delete"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                    </>
                                  )}
                                  {/* Nudge Supervisor button for pending or scored status */}
                                  {(validator.status === 'pending') && (
                                    <button
                                      className={`ml-2 px-2 py-0.5 text-xs font-medium bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-orange-200 disabled:cursor-not-allowed`}
                                      disabled={!!(nudgeCooldowns[validator.id] && Date.now() - nudgeCooldowns[validator.id] < 5 * 60 * 1000)}
                                      onClick={async () => {
                                        setNudgeCooldowns((prev: any) => ({ ...prev, [validator.id]: Date.now() }));
                                        try {
                                          const { data: { user } } = await supabase.auth.getUser();
                                          if (!user) return;
                                          const { data: eitProfile } = await supabase
                                            .from('eit_profiles')
                                            .select('full_name')
                                            .eq('id', user.id)
                                            .single();
                                          const { data: supervisorProfile } = await supabase
                                            .from('supervisor_profiles')
                                            .select('id')
                                            .eq('email', validator.email)
                                            .single();
                                          await sendValidationRequestNotification(
                                            supervisorProfile?.id || validator.email,
                                            eitProfile?.full_name ?? '',
                                            skill.name
                                          );
                                          await supabase.from('validators').update({ status: 'pending', score: null }).eq('id', validator.id);
                                          await loadValidators();
                                          toast.success('Nudge sent!');
                                        } catch (err) {
                                          toast.error('Failed to send nudge.');
                                        }
                                      }}
                                    >
                                      {nudgeCooldowns[validator.id] && Date.now() - nudgeCooldowns[validator.id] < 5 * 60 * 1000
                                        ? `Nudged (wait ${Math.ceil((5 * 60 * 1000 - (Date.now() - nudgeCooldowns[validator.id])) / 1000)}s)`
                                        : 'Nudge Supervisor'}
                                    </button>
                                  )}
                                  {(validator.status === 'draft' || validator.status === 'pending') && (
                                    <button
                                      className="btn btn-danger btn-xs"
                                      onClick={async () => {
                                        try {
                                          const result = await deleteValidatorAndValidations(
                                            validator.id,
                                            validator.eit_id,
                                            validator.skill_id
                                          );

                                          if (!result.success) {
                                            throw new Error(result.error || 'Failed to cancel validator');
                                          }

                                          setTimeout(() => loadValidators(), 300);
                                          toast.success('Validator cancelled successfully');
                                        } catch (error) {
                                          console.error('Error cancelling validator:', error);
                                          toast.error('Failed to cancel validator');
                                        }
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              ))}
                              {(!validators[skill.id] || validators[skill.id].length === 0) && (
                                <button
                                  onClick={() => {
                                    setSelectedSkill(skill.id);
                                    setSelectedValidator(null);
                                  }}
                                  className="px-3 py-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                                >
                                  Add Validator
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle2 size={24} className="mx-auto mb-2 text-slate-400" />
                  <p>No completed skills yet</p>
                  <p className="text-sm mt-1">Complete skills in the Skills section to see them here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Validator Popup */}
      <ValidatorPopup
        isOpen={selectedSkill !== null}
        onClose={() => {
          setSelectedSkill(null);
          setSelectedValidator(null);
        }}
        skillName={selectedSkill ? skillCategories
          .flatMap(cat => cat.skills)
          .find(s => s.id === selectedSkill)?.name || '' : ''}
        skillId={selectedSkill || ''}
        existingValidator={selectedValidator || undefined}
        onSave={handleValidatorSave}
        status={selectedValidator?.status ?? 'draft'}
        loadValidators={loadValidators}
      />

      {/* Reference Popup */}
      <ReferencePopup
        isOpen={selectedJob !== null && selectedReferenceNumber !== null}
        onClose={() => {
          setSelectedJob(null);
          setSelectedReference(null);
          setSelectedReferenceNumber(null);
        }}
        job={selectedJob!}
        referenceNumber={selectedReferenceNumber!}
        existingReference={selectedReference || undefined}
        onSave={handleReferenceSave}
      />

      {/* Validation Modal */}
      {selectedReferenceForValidation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Validate Reference</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Validation Notes</label>
              <textarea
                value={validationNotes}
                onChange={(e) => setValidationNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={4}
                placeholder="Add any notes about the validation..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedReferenceForValidation(null);
                  setValidationNotes('');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleValidateReference(selectedReferenceForValidation, 'rejected')}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => handleValidateReference(selectedReferenceForValidation, 'validated')}
                className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
              >
                Validate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      {isAddJobModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add Experience</h3>
            {addJobError && <div className="mb-2 text-red-600">{addJobError}</div>}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAddJobLoading(true);
                setAddJobError(null);
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) throw new Error('No authenticated user');
                  if (!newJob.title || !newJob.company || !newJob.location || !newJob.start_date) {
                    setAddJobError('Please fill in all required fields.');
                    setAddJobLoading(false);
                    return;
                  }
                  const { error } = await supabase.from('jobs').insert([
                    {
                      ...newJob,
                      eit_id: user.id,
                      skills: newJob.skills,
                      end_date: newJob.end_date ? newJob.end_date : null,
                    },
                  ]);
                  if (error) throw error;
                  setIsAddJobModalOpen(false);
                  setNewJob({ title: '', company: '', location: '', start_date: '', end_date: '', description: '', skills: [] });
                  await loadJobs();
                  toast.success('Experience added!');
                } catch (err: any) {
                  setAddJobError(err.message || 'Failed to add experience');
                } finally {
                  setAddJobLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Job Title <span className="text-red-500">*</span></label>
                <input type="text" className="w-full border rounded px-3 py-2" value={newJob.title} onChange={e => setNewJob(j => ({ ...j, title: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company <span className="text-red-500">*</span></label>
                <input type="text" className="w-full border rounded px-3 py-2" value={newJob.company} onChange={e => setNewJob(j => ({ ...j, company: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location <span className="text-red-500">*</span></label>
                <input type="text" className="w-full border rounded px-3 py-2" value={newJob.location} onChange={e => setNewJob(j => ({ ...j, location: e.target.value }))} required />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Start Date <span className="text-red-500">*</span></label>
                  <input type="date" className="w-full border rounded px-3 py-2" value={newJob.start_date} onChange={e => setNewJob(j => ({ ...j, start_date: e.target.value }))} required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input type="date" className="w-full border rounded px-3 py-2" value={newJob.end_date} onChange={e => setNewJob(j => ({ ...j, end_date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full border rounded px-3 py-2" value={newJob.description} onChange={e => setNewJob(j => ({ ...j, description: e.target.value }))} rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Skills</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedSkills.map(skill => (
                    <span key={skill.id} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs flex items-center gap-1">
                      {skill.name}
                      <button type="button" onClick={() => setNewJob(j => ({ ...j, skills: j.skills.filter(id => id !== skill.id) }))} className="text-slate-400 hover:text-red-600"><X size={12} /></button>
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary w-full flex items-center justify-center gap-2 py-3 text-lg"
                  onClick={() => setIsSkillsModalOpen(true)}
                >
                  <Plus size={20} />
                  Select Skills
                </button>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddJobModalOpen(false)} disabled={addJobLoading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={addJobLoading}>{addJobLoading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
            <SkillSelectModal
              isOpen={isSkillsModalOpen}
              onClose={() => setIsSkillsModalOpen(false)}
              selectedSkills={selectedSkills}
              onChange={skills => setNewJob(j => ({ ...j, skills: skills.map(s => s.id) }))}
              skillCategories={skillCategories}
            />
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {isEditJobModalOpen && editJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Experience</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAddJobLoading(true);
                setAddJobError(null);
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) throw new Error('No authenticated user');
                  if (!editJob.title || !editJob.company || !editJob.location || !editJob.start_date) {
                    setAddJobError('Please fill in all required fields.');
                    setAddJobLoading(false);
                    return;
                  }
                  const { error } = await supabase.from('jobs').update({
                    ...editJob,
                    eit_id: user.id,
                    end_date: editJob.end_date ? editJob.end_date : null,
                  }).eq('id', editJob.id);
                  if (error) throw error;
                  setIsEditJobModalOpen(false);
                  setEditJob(null);
                  await loadJobs();
                  toast.success('Experience updated!');
                } catch (err: any) {
                  setAddJobError(err.message || 'Failed to update experience');
                } finally {
                  setAddJobLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Job Title <span className="text-red-500">*</span></label>
                <input type="text" className="w-full border rounded px-3 py-2" value={editJob.title} onChange={e => setEditJob(j => j ? { ...j, title: e.target.value } : j)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company <span className="text-red-500">*</span></label>
                <input type="text" className="w-full border rounded px-3 py-2" value={editJob.company} onChange={e => setEditJob(j => j ? { ...j, company: e.target.value } : j)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location <span className="text-red-500">*</span></label>
                <input type="text" className="w-full border rounded px-3 py-2" value={editJob.location} onChange={e => setEditJob(j => j ? { ...j, location: e.target.value } : j)} required />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Start Date <span className="text-red-500">*</span></label>
                  <input type="date" className="w-full border rounded px-3 py-2" value={editJob.start_date} onChange={e => setEditJob(j => j ? { ...j, start_date: e.target.value } : j)} required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input type="date" className="w-full border rounded px-3 py-2" value={editJob.end_date || ''} onChange={e => setEditJob(j => j ? { ...j, end_date: e.target.value } : j)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full border rounded px-3 py-2" value={editJob.description || ''} onChange={e => setEditJob(j => j ? { ...j, description: e.target.value } : j)} rows={3} />
              </div>
              {/* Skills section for edit modal */}
              <div>
                <label className="block text-sm font-medium mb-1">Skills</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedEditSkills.map(skill => (
                    <span key={skill.id} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs flex items-center gap-1">
                      {skill.name}
                      <button type="button" onClick={() => setEditJob(j => j && j.skills ? { ...j, skills: j.skills.filter(id => id !== skill.id) } : j)} className="text-slate-400 hover:text-red-600"><X size={12} /></button>
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary w-full flex items-center justify-center gap-2 py-3 text-lg"
                  onClick={() => setIsEditSkillsModalOpen(true)}
                >
                  <Plus size={20} />
                  {selectedEditSkills.length ? 'Edit Skills' : 'Select Skills'}
                </button>
              </div>
              <div className="flex justify-between gap-2 mt-4">
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  disabled={addJobLoading}
                >
                  Delete Experience
                </button>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => { setIsEditJobModalOpen(false); setEditJob(null); }} 
                    disabled={addJobLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={addJobLoading}
                  >
                    {addJobLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
              {addJobError && <div className="text-red-600 mt-2">{addJobError}</div>}
            </form>
            {/* SkillSelectModal for edit modal */}
            <SkillSelectModal
              isOpen={isEditSkillsModalOpen}
              onClose={() => setIsEditSkillsModalOpen(false)}
              selectedSkills={selectedEditSkills}
              onChange={skills => setEditJob(j => j ? { ...j, skills: skills.map(s => s.id) } : j)}
              skillCategories={skillCategories}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && editJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Experience</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this experience? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={async () => {
                  try {
                    const { error } = await supabase
                      .from('jobs')
                      .delete()
                      .eq('id', editJob.id);
                    
                    if (error) throw error;
                    
                    setIsDeleteConfirmOpen(false);
                    setIsEditJobModalOpen(false);
                    setEditJob(null);
                    await loadJobs();
                    toast.success('Experience deleted successfully');
                  } catch (err: any) {
                    toast.error(err.message || 'Failed to delete experience');
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Validator Confirmation Modal */}
      {showDeleteValidatorConfirm && validatorToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-700 mb-4">Delete Validator</h3>
            <p className="mb-4">Are you sure you want to delete the validator <b>{validatorToDelete.first_name} {validatorToDelete.last_name}</b>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowDeleteValidatorConfirm(false); setValidatorToDelete(null); }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteValidator}
                className="px-4 py-2 text-sm font-medium text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Supervisor's Comment</h3>
            {commentModalLoading ? (
              <div>Loading...</div>
            ) : (
              <div className="text-slate-700 whitespace-pre-line">
                <div className="mb-4">
                  <span className="font-semibold">EIT's Description:</span><br />
                  {commentModalContent.feedback || <span className="italic text-slate-500">No description found.</span>}
                </div>
                <div>
                  <span className="font-semibold">Supervisor's Comment:</span><br />
                  {commentModalContent.comment}
                </div>
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default References; 