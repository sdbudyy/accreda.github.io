import React, { useState, useEffect, useRef } from 'react';
import { FileEdit, Plus, X, ChevronDown, Trash2, Edit2, Sparkles, Clock, Upload } from 'lucide-react';
import { useSkillsStore, Category, Skill } from '../store/skills';
import { useSAOsStore, SAO } from '../store/saos';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { enhanceSAO } from '../lib/webllm';
import SAOFeedbackComponent from '../components/saos/SAOFeedback';
import Modal from '../components/common/Modal';
import { useSubscriptionStore } from '../store/subscriptionStore';
import SAOAnnotation from '../components/saos/SAOAnnotation';
import toast from 'react-hot-toast';
import RichTextEditor from '../components/documents/RichTextEditor';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?worker';
import DOMPurify from 'dompurify';

// @ts-ignore
declare global {
  interface Window {
    gapi?: any;
    OneDrive?: any;
    google?: any;
  }
}

interface SAOModalProps {
  isOpen: boolean;
  onClose: () => void;
  editSAO?: SAO;
  onCreated?: () => void;
  initialContent?: string | null;
  onInitialContentUsed?: () => void;
}

// Utility to get the most recent feedback
function getMostRecentFeedback(feedbackArr: { updated_at: string; status: string }[]): { updated_at: string; status: string } | null {
  if (!feedbackArr || feedbackArr.length === 0) return null;
  return feedbackArr.reduce((latest, curr) =>
    new Date(curr.updated_at) > new Date(latest.updated_at) ? curr : latest
  );
}

// Utility to convert HTML to plain text for annotation system
function htmlToPlainText(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

const SAOModal: React.FC<SAOModalProps> = ({ isOpen, onClose, editSAO, onCreated, initialContent, onInitialContentUsed }) => {
  const [title, setTitle] = useState('');
  const [situation, setSituation] = useState('');
  const [action, setAction] = useState('');
  const [outcome, setOutcome] = useState('');
  const [employer, setEmployer] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [status, setStatus] = useState<'draft' | 'complete'>('draft');
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedText, setEnhancedText] = useState<string | null>(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('');
  const [supervisors, setSupervisors] = useState<Array<{ id: string; name: string }>>([]);
  const { skillCategories } = useSkillsStore();
  const { createSAO, updateSAO, loading, error, requestFeedback, loadUserSAOs, fetchSAOVersions } = useSAOsStore();
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [ruleModalMessage, setRuleModalMessage] = useState('');
  const { checkSaoLimit, tier, fetchSubscription } = useSubscriptionStore();
  const [limitError, setLimitError] = useState<string | null>(null);
  const [saoCreatedCount, setSaoCreatedCount] = useState<number>(0);
  const [showHistory, setShowHistory] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [versionError, setVersionError] = useState<string | null>(null);
  const [selectedSkillStatus, setSelectedSkillStatus] = useState<string | null>(null);
  const [selectedSkillInfo, setSelectedSkillInfo] = useState<{ status: string | null, rank: number | null } | null>(null);
  const lastSavedValues = useRef({
    title: '',
    situation: '',
    action: '',
    outcome: '',
    employer: '',
    status: 'draft',
    selectedSkillId: ''
  });
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  const mostRecentFeedback = editSAO && editSAO.feedback ? getMostRecentFeedback(editSAO.feedback) : null;

  // Load supervisors when modal opens
  useEffect(() => {
    const loadSupervisors = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: relationships } = await supabase
        .from('supervisor_eit_relationships')
        .select(`
          supervisor_id,
          supervisor_profiles (
            id,
            full_name
          )
        `)
        .eq('eit_id', user.id)
        .eq('status', 'active');

      if (relationships) {
        setSupervisors(
          relationships.map((rel: any) => ({
            id: rel.supervisor_profiles.id,
            name: rel.supervisor_profiles.full_name
          }))
        );
      }
    };

    if (isOpen) {
      loadSupervisors();
    }
  }, [isOpen]);

  // Reset form when modal opens with editSAO
  useEffect(() => {
    if (isOpen && editSAO) {
      setTitle(editSAO.title);
      setSituation(editSAO.situation || '');
      setAction(editSAO.action || '');
      setOutcome(editSAO.outcome || '');
      setEmployer(editSAO.employer || '');
      setSelectedSkill(editSAO.skills[0] || null);
      setStatus(editSAO.status || 'draft');
    } else if (isOpen) {
      setTitle('');
      setSituation('');
      setAction('');
      setOutcome('');
      setEmployer('');
      setSelectedSkill(null);
      setStatus('draft');
    }
  }, [isOpen, editSAO]);

  // Set initial content if provided
  useEffect(() => {
    if (isOpen && initialContent) {
      setSituation(initialContent);
      if (onInitialContentUsed) onInitialContentUsed();
    }
  }, [isOpen, initialContent, onInitialContentUsed]);

  // Fetch the user's subscription to get sao_created_count
  useEffect(() => {
    const fetchCount = async () => {
      await fetchSubscription();
      // Fetch the count from the subscriptions table
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('subscriptions')
          .select('sao_created_count')
          .eq('user_id', user.id)
          .single();
        if (data && typeof data.sao_created_count === 'number') {
          setSaoCreatedCount(data.sao_created_count);
        }
      }
    };
    fetchCount();
  }, [isOpen]);

  useEffect(() => {
    const fetchSkillInfo = async () => {
      if (!selectedSkill) {
        setSelectedSkillInfo(null);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('eit_skills')
        .select('status, rank')
        .eq('eit_id', user.id)
        .eq('skill_id', selectedSkill.id)
        .single();
      if (error || !data) {
        setSelectedSkillInfo(null);
      } else {
        setSelectedSkillInfo({ status: data.status, rank: data.rank });
      }
    };
    fetchSkillInfo();
  }, [selectedSkill]);

  useEffect(() => {
    if (!editSAO) return;
    const current = {
      title,
      situation,
      action,
      outcome,
      employer,
      status,
      selectedSkillId: selectedSkill?.id || editSAO.skills[0]?.id || ''
    };
    const last = lastSavedValues.current;
    // Only auto-save if any field has changed
    const changed =
      current.title !== (last.title || editSAO.title) ||
      current.situation !== (last.situation || editSAO.situation) ||
      current.action !== (last.action || editSAO.action) ||
      current.outcome !== (last.outcome || editSAO.outcome) ||
      current.employer !== (last.employer || editSAO.employer) ||
      current.status !== (last.status || editSAO.status) ||
      current.selectedSkillId !== (last.selectedSkillId || editSAO.skills[0]?.id || '');
    if (!changed) return;
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(async () => {
      try {
        await updateSAO(
          editSAO.id,
          title,
          situation,
          action,
          outcome,
          [selectedSkill || editSAO.skills[0]],
          status,
          employer
        );
        lastSavedValues.current = { ...current };
      } catch (err: any) {
        toast.error(err.message || 'Failed to auto-save');
      }
    }, 1000);
    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    };
  }, [title, situation, action, outcome, employer, status, selectedSkill, editSAO]);

  const handleSendForValidation = async () => {
    if (!selectedSkill) {
      toast.error('Please select a skill');
      return;
    }

    try {
      if (editSAO) {
        await updateSAO(editSAO.id, title, situation, action, outcome, [selectedSkill], status, employer);
        await requestFeedback(editSAO.id, selectedSupervisor);
      } else {
        // If creating, first create the SAO, then send for validation
        await createSAO(title, situation, action, outcome, [selectedSkill], status, employer);
        // Optionally, you may want to reload SAOs and get the new ID, but for now just call requestFeedback with a placeholder or skip
      }
      toast.success('SAO sent to supervisor for validation!');
      onClose();
      loadUserSAOs();
      onCreated && onCreated();
    } catch (error) {
      console.error('Error sending for validation:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkill) {
      toast.error('Please select a skill');
      return;
    }

    try {
      if (editSAO) {
        await updateSAO(
          editSAO.id,
          title,
          situation,
          action,
          outcome,
          [selectedSkill],
          status,
          employer
        );
        if (selectedSupervisor) {
          await requestFeedback(editSAO.id, selectedSupervisor);
        }
      } else {
        await createSAO(
          title,
          situation,
          action,
          outcome,
          [selectedSkill],
          status,
          employer
        );
      }
      onClose();
      if (onCreated) onCreated();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save SAO');
    }
  };

  const handleEnhanceWithAI = async () => {
    if (!situation.trim() && !action.trim() && !outcome.trim()) return;
    
    setIsEnhancing(true);
    try {
      console.log('Starting enhancement process...');
      const enhanced = await enhanceSAO(situation + '\n' + action + '\n' + outcome);
      console.log('Enhancement completed:', enhanced);
      setEnhancedText(enhanced);
    } catch (error) {
      console.error('Error in handleEnhanceWithAI:', error);
      // Show error to user
      alert(error instanceof Error ? error.message : 'Failed to enhance text. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAcceptEnhancement = () => {
    if (enhancedText) {
      setSituation(enhancedText.split('\n')[0]);
      setAction(enhancedText.split('\n')[1]);
      setOutcome(enhancedText.split('\n')[2]);
      setEnhancedText(null);
    }
  };

  const handleDeclineEnhancement = () => {
    setEnhancedText(null);
  };

  // Rule check and request feedback
  const handleRequestFeedback = async () => {
    if (!selectedSupervisor || !editSAO) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // 1. Count how many skills this supervisor has validated for this EIT
    const { count: supervisorCount } = await supabase
      .from('skill_validations')
      .select('*', { count: 'exact', head: true })
      .eq('eit_id', user.id)
      .eq('validator_id', selectedSupervisor);
    if ((supervisorCount || 0) >= 20) {
      setRuleModalMessage('This supervisor has already validated 20 skills for you. Please select a different supervisor.');
      setRuleModalOpen(true);
      return;
    }
    // If all rules pass, proceed
    await requestFeedback(editSAO.id, selectedSupervisor);
  };

  // Utility to get feedback to show
  const feedbackToShow = showHistory
    ? editSAO?.feedback || []
    : editSAO?.feedback && editSAO.feedback.length > 0
      ? [editSAO.feedback[editSAO.feedback.length - 1]]
      : [];

  const handleBackdropClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      // Save changes before closing
      if (editSAO) {
        try {
          await updateSAO(
            editSAO.id,
            title,
            situation,
            action,
            outcome,
            [selectedSkill || editSAO.skills[0]],
            status,
            employer
          );
          toast.success('Changes saved');
        } catch (error: any) {
          toast.error(error.message || 'Failed to save changes');
          return; // Don't close if save fails
        }
      }
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">
              {editSAO ? 'Edit SAO' : 'Create New SAO'}
            </h2>
            {mostRecentFeedback && mostRecentFeedback.status === 'pending' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>
            )}
            {mostRecentFeedback && mostRecentFeedback.status === 'submitted' && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Marked</span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Show limit error if present */}
        {limitError && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm font-semibold text-center">
            {limitError}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Show annotation UI for EITs if editing an existing SAO */}
        {editSAO && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-slate-700">Comments & Feedback</span>
              {/* Version history clock */}
              {editSAO && (
                <button
                  type="button"
                  className="p-1 rounded hover:bg-slate-200"
                  title="Show Version History"
                  onClick={async () => {
                    setShowVersionModal(true);
                    setLoadingVersions(true);
                    setVersionError(null);
                    try {
                      const data = await fetchSAOVersions(editSAO.id);
                      setVersions(data);
                    } catch (e: any) {
                      setVersionError(e.message || 'Failed to load version history');
                    } finally {
                      setLoadingVersions(false);
                    }
                  }}
                >
                  <Clock size={18} className="text-slate-400" />
                </button>
              )}
            </div>
            <div className="text-xs text-slate-500 mb-1">
              The preview below shows your formatting. Comments and highlights are made on the plain text version.
            </div>
            {/* Formatted preview */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4 prose prose-sm max-w-none">
              <div>
                <div className="font-semibold mb-1">Situation</div>
                <div className="mb-3" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(editSAO.situation || '') }} />
                <div className="font-semibold mb-1">Action</div>
                <div className="mb-3" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(editSAO.action || '') }} />
                <div className="font-semibold mb-1">Outcome</div>
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(editSAO.outcome || '') }} />
              </div>
            </div>
            <div className="text-xs text-slate-500 mb-2">Highlight text below to add a comment (plain text only)</div>
            <div className="mb-4">
              <div className="font-semibold mb-1">Situation</div>
              <SAOAnnotation
                saoId={editSAO.id}
                content={htmlToPlainText(editSAO.situation || '')}
              />
            </div>
            <div className="mb-4">
              <div className="font-semibold mb-1">Action</div>
              <SAOAnnotation
                saoId={editSAO.id}
                content={htmlToPlainText(editSAO.action || '')}
              />
            </div>
            <div>
              <div className="font-semibold mb-1">Outcome</div>
              <SAOAnnotation
                saoId={editSAO.id}
                content={htmlToPlainText(editSAO.outcome || '')}
              />
            </div>
            {/* Feedback history (toggle) */}
            {showHistory && feedbackToShow.length > 1 && (
              <div className="mt-4">
                <div className="font-semibold text-xs text-slate-500 mb-1">Feedback History</div>
                {feedbackToShow.slice(0, -1).map((item, idx) => (
                  <div key={item.id} className="bg-slate-100 rounded p-2 mb-2 text-xs text-slate-700">
                    <div
                      className="mb-1 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.feedback) }}
                    />
                    <div className="text-slate-400">{new Date(item.updated_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Show supervisor feedback if present */}
        {editSAO && editSAO.feedback && editSAO.feedback.length > 0 && (
          <div className="mb-6">
            <SAOFeedbackComponent
              feedback={feedbackToShow}
              onResolve={async () => Promise.resolve()}
              onSubmitFeedback={async () => Promise.resolve()}
              isSupervisor={false}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg"
              placeholder="Enter SAO title"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="employer" className="block text-sm font-medium text-slate-700 mb-2">
              Employer
            </label>
            <input
              type="text"
              id="employer"
              value={employer}
              onChange={(e) => setEmployer(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg"
              placeholder="Enter employer name"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-6">
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 mb-2">
              <div className="font-semibold mb-1 text-lg text-slate-800">Situation</div>
              <div className="relative">
                <RichTextEditor
                  content={situation}
                  onChange={val => setSituation(val)}
                />
                <div className="absolute bottom-2 right-2 text-xs text-slate-500">
                  {situation.split(/\s+/).filter(Boolean).length} words
                </div>
              </div>
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 mb-2">
              <div className="font-semibold mb-1 text-lg text-slate-800">Action</div>
              <div className="relative">
                <RichTextEditor
                  content={action}
                  onChange={val => setAction(val)}
                />
                <div className="absolute bottom-2 right-2 text-xs text-slate-500">
                  {action.split(/\s+/).filter(Boolean).length} words
                </div>
              </div>
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
              <div className="font-semibold mb-1 text-lg text-slate-800">Outcome</div>
              <div className="relative">
                <RichTextEditor
                  content={outcome}
                  onChange={val => setOutcome(val)}
                />
                <div className="absolute bottom-2 right-2 text-xs text-slate-500">
                  {outcome.split(/\s+/).filter(Boolean).length} words
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors duration-200 ${status === 'draft' ? 'bg-slate-200 text-slate-800 border-slate-400' : 'bg-white text-slate-500 border-slate-200'}`}
                onClick={() => setStatus('draft')}
                aria-pressed={status === 'draft'}
              >
                Draft
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors duration-200 ${status === 'complete' ? 'bg-green-200 text-green-800 border-green-400' : 'bg-white text-slate-500 border-slate-200'}`}
                onClick={() => setStatus('complete')}
                aria-pressed={status === 'complete'}
              >
                Completed
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Relevant Skill
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedSkill && (
                <span
                  key={selectedSkill.id}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-teal-100 text-teal-800"
                >
                  {selectedSkill.name}
                  {selectedSkillInfo && selectedSkillInfo.rank && (
                    <span className="ml-2 text-xs text-blue-600 font-semibold">
                      (Rank: {selectedSkillInfo.rank})
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedSkill(null)}
                    className="ml-2 text-teal-600 hover:text-teal-800"
                    disabled={loading}
                  >
                    <X size={16} />
                  </button>
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsSkillsModalOpen(true)}
              className="btn btn-secondary w-full flex items-center justify-center gap-2 py-3 text-lg"
              disabled={loading}
            >
              <Plus size={20} />
              Select Skill
            </button>
          </div>

          {/* Supervisor Feedback Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Supervisor Selection
            </label>
            <div className="flex gap-3">
              <select
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg"
                disabled={loading || supervisors.length === 0}
              >
                <option value="">Select a supervisor</option>
                {supervisors.map((supervisor) => (
                  <option key={supervisor.id} value={supervisor.id}>
                    {supervisor.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleRequestFeedback}
                disabled={!selectedSupervisor || loading || !editSAO}
                className="px-4 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send for Validation
              </button>
            </div>
            {supervisors.length === 0 && (
              <p className="mt-2 text-sm text-slate-500">
                No active supervisors found. Connect with a supervisor first.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary px-6 py-3 text-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary px-6 py-3 text-lg"
              disabled={loading}
            >
              {loading ? 'Saving...' : editSAO ? 'Update SAO' : 'Create SAO'}
            </button>
          </div>
        </form>

        {/* Skills Selection Modal */}
        {isSkillsModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold">Select Skill</h3>
                <button
                  onClick={() => setIsSkillsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {skillCategories.map((category) => (
                  <div key={category.name} className="border rounded-lg p-6">
                    <h4 className="font-medium text-slate-900 text-lg mb-4">{category.name}</h4>
                    <div className="space-y-3">
                      {category.skills.map((skill) => (
                        <label
                          key={skill.id}
                          className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="skill-selection"
                            checked={selectedSkill?.id === skill.id}
                            onChange={() => {
                              setSelectedSkill({ ...skill, category_name: category.name });
                              setIsSkillsModalOpen(false);
                            }}
                            className="text-teal-600 focus:ring-teal-500 w-5 h-5"
                          />
                          <span className="text-base">{skill.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setIsSkillsModalOpen(false)}
                  className="btn btn-primary px-6 py-3 text-lg"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rule Violation Modal */}
        <Modal isOpen={ruleModalOpen} onClose={() => setRuleModalOpen(false)}>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-red-700">Validation Rule Violation</h2>
            <p className="text-slate-700 mb-4">{ruleModalMessage}</p>
            <button
              className="btn btn-primary"
              onClick={() => setRuleModalOpen(false)}
            >
              OK
            </button>
          </div>
        </Modal>

        {/* Version History Modal */}
        {showVersionModal && (
          <Modal isOpen={showVersionModal} onClose={() => setShowVersionModal(false)}>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">SAO Version History</h2>
              {loadingVersions ? (
                <div>Loading...</div>
              ) : versionError ? (
                <div className="text-red-600">{versionError}</div>
              ) : versions.length === 0 ? (
                <div className="text-slate-500">No previous versions found.</div>
              ) : (
                <div className="space-y-4">
                  {versions.map((v, idx) => (
                    <div key={v.id} className="bg-slate-50 rounded-lg p-4">
                      <div className="text-xs text-slate-500 mb-2">
                        {new Date(v.created_at).toLocaleString()} {idx === 0 && <span className="ml-2 text-green-600 font-semibold">Latest</span>}
                      </div>
                      <div className="font-semibold mb-1">{v.title}</div>
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: v.content }} />
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end mt-6">
                <button className="btn btn-secondary" onClick={() => setShowVersionModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

const SAOCard: React.FC<{ 
  sao: SAO; 
  onDelete: (id: string) => void;
  onEdit: (sao: SAO) => void;
}> = ({ sao, onDelete, onEdit }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const saoId = searchParams.get('saoId');

  const mostRecentFeedback = sao.feedback ? getMostRecentFeedback(sao.feedback) : null;

  useEffect(() => {
    if (saoId === sao.id) {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cardRef.current?.classList.add('ring', 'ring-teal-400');
      setTimeout(() => {
        cardRef.current?.classList.remove('ring', 'ring-teal-400');
      }, 1500);
    }
  }, [saoId, sao.id]);

  return (
    <div 
      ref={cardRef}
      className="bg-white rounded-lg shadow p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{sao.title}</h3>
          {mostRecentFeedback && mostRecentFeedback.status === 'pending' && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>
          )}
          {mostRecentFeedback && mostRecentFeedback.status === 'submitted' && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Marked</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Status Tag */}
          {sao.status === 'draft' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">Draft</span>
          )}
          {sao.status === 'complete' && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Complete</span>
          )}
          <button
            onClick={() => onEdit(sao)}
            className="text-slate-400 hover:text-teal-600 transition-colors"
            title="Edit SAO"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(sao.id)}
            className="text-slate-400 hover:text-red-600 transition-colors"
            title="Delete SAO"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div
        className="text-slate-600 whitespace-pre-wrap mb-4 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(sao.situation + '\n' + sao.action + '\n' + sao.outcome) }}
      />
      <div className="flex flex-wrap gap-2">
        {sao.skills.map((skill) => (
          <span
            key={skill.id}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-teal-100 text-teal-800"
          >
            {skill.name}
            {typeof skill.rank === 'number' && (
              <span className="ml-2 text-xs text-blue-600 font-semibold">
                (Rank: {skill.rank})
              </span>
            )}
          </span>
        ))}
      </div>
      <div className="mt-4 text-sm text-slate-500">
        Created: {new Date(sao.created_at).toLocaleDateString()}
      </div>
    </div>
  );
};

const SKILL_ORDER = [
  '1.1 Regulations, Codes & Standards',
  '1.2 Technical & Design Constraints',
  '1.3 Risk Management for Technical Work',
  '1.4 Application of Theory',
  '1.5 Solution Techniques – Results Verification',
  '1.6 Safety in Design & Technical Work',
  '1.7 Systems & Their Components',
  '1.8 Project or Asset Life-Cycle Awareness',
  '1.9 Quality Assurance',
  '1.10 Engineering Documentation',
  '2.1 Oral Communication (English)',
  '2.2 Written Communication (English)',
  '2.3 Reading & Comprehension (English)',
  '3.1 Project Management Principles',
  '3.2 Finances & Budget',
  '4.1 Promote Team Effectiveness & Resolve Conflict',
  '5.1 Professional Accountability (Ethics, Liability, Limits)',
  '6.1 Protection of the Public Interest',
  '6.2 Benefits of Engineering to the Public',
  '6.3 Role of Regulatory Bodies',
  '6.4 Application of Sustainability Principles',
  '6.5 Promotion of Sustainability',
];

function getSkillOrderIndex(skillName: string) {
  const idx = SKILL_ORDER.indexOf(skillName);
  return idx === -1 ? 999 : idx;
}

const SAOs: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSAO, setEditingSAO] = useState<SAO | undefined>();
  const { saos, loading, error, loadUserSAOs, deleteSAO } = useSAOsStore();
  const { tier, saoLimit, fetchSubscription } = useSubscriptionStore();
  const [searchParams] = useSearchParams();
  const saoId = searchParams.get('saoId');
  const [saoCreatedCount, setSaoCreatedCount] = useState<number>(0);
  const [userRole, setUserRole] = useState<'eit' | 'supervisor' | null>(null);
  const [importMenuOpen, setImportMenuOpen] = useState(false);
  const [importedContent, setImportedContent] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [uploadInputRef] = useState(() => React.createRef<HTMLInputElement>());
  const [pendingSAOContent, setPendingSAOContent] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<'recent' | 'skill'>('recent');

  // --- GOOGLE DRIVE IMPORT SCAFFOLD ---
  // TODO: Replace with your credentials when you have a domain
  const GOOGLE_CLIENT_ID = '521009491275-0m5p9k9vm29fc1v6v919k25v4godaem.apps.googleusercontent.com'; // <-- Your real client ID
  const GOOGLE_API_KEY = 'AIzaSyAb5WFdzFEplkP4nktf8KNvoHBUxOC0dDQ'; // <-- Fill in your API key from Google Cloud Console
  const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.readonly';
  const GOOGLE_DISCOVERY_DOCS = [
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
  ];

  // Loads the Google API script and Picker script
  const loadGoogleApi = () => {
    return new Promise((resolve) => {
      if (window.gapi && window.google && window.google.picker) return resolve(undefined);
      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.onload = () => {
        const pickerScript = document.createElement('script');
        pickerScript.src = 'https://apis.google.com/js/api_pickers.js';
        pickerScript.onload = resolve;
        document.body.appendChild(pickerScript);
      };
      document.body.appendChild(gapiScript);
    });
  };

  // Authenticate and open the Google Picker
  const handleImportGoogleDrive = async () => {
    setImportMenuOpen(false);
    await loadGoogleApi();
    window.gapi.load('client:auth2', async () => {
      await window.gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        clientId: GOOGLE_CLIENT_ID,
        discoveryDocs: GOOGLE_DISCOVERY_DOCS,
        scope: GOOGLE_SCOPES,
      });
      const GoogleAuth = window.gapi.auth2.getAuthInstance();
      GoogleAuth.signIn().then(() => {
        const oauthToken = GoogleAuth.currentUser.get().getAuthResponse().access_token;
        if (!window.google || !window.google.picker) {
          alert('Google Picker API not loaded.');
          return;
        }
        const view = new window.google.picker.DocsView()
          .setIncludeFolders(true)
          .setSelectFolderEnabled(false);
        const picker = new window.google.picker.PickerBuilder()
          .addView(view)
          .setOAuthToken(oauthToken)
          .setDeveloperKey(GOOGLE_API_KEY)
          .setCallback(async (data: any) => {
            if (data.action === window.google.picker.Action.PICKED) {
              const file = data.docs[0];
              // Fetch file content using Drive API
              try {
                const fileId = file.id;
                const response = await window.gapi.client.drive.files.get({
                  fileId,
                  alt: 'media',
                });
                setImportedContent(response.body || 'No content found.');
                setShowImportModal(true);
              } catch (err) {
                setImportedContent('Failed to fetch file content.');
                setShowImportModal(true);
              }
            }
          })
          .build();
        picker.setVisible(true);
      });
    });
  };

  // --- ONEDRIVE IMPORT SCAFFOLD ---
  // TODO: Replace with your credentials when you have a domain
  const ONEDRIVE_CLIENT_ID = 'YOUR_ONEDRIVE_CLIENT_ID';
  const ONEDRIVE_SCOPES = 'files.read';

  // Loads the OneDrive Picker script
  const loadOneDriveApi = () => {
    if (window.OneDrive) return Promise.resolve();
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://js.live.net/v7.2/OneDrive.js';
      script.onload = resolve;
      document.body.appendChild(script);
    });
  };

  // Authenticate and open the OneDrive Picker
  const handleImportOneDrive = async () => {
    setImportMenuOpen(false);
    await loadOneDriveApi();
    // TODO: Implement Picker logic here
    // See: https://learn.microsoft.com/en-us/onedrive/developer/controls/file-pickers/js-v72/open-file?view=odsp-graph-online
    alert('OneDrive picker scaffolded. Add credentials and logic when ready.');
    // Simulate import for now
    setImportedContent('Imported content from OneDrive (simulated).');
    setShowImportModal(true);
  };

  // Fetch the user's subscription to get sao_created_count
  useEffect(() => {
    const fetchCount = async () => {
      await fetchSubscription();
      // Fetch the count from the subscriptions table
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('subscriptions')
          .select('sao_created_count')
          .eq('user_id', user.id)
          .single();
        if (data && typeof data.sao_created_count === 'number') {
          setSaoCreatedCount(data.sao_created_count);
        }
      }
    };
    fetchCount();
  }, [isModalOpen]);

  useEffect(() => {
    loadUserSAOs();
  }, [loadUserSAOs]);

  useEffect(() => {
    if (saoId && saos.length > 0) {
      const sao = saos.find(s => s.id === saoId);
      if (sao) {
        setEditingSAO(sao);
        setIsModalOpen(true);
      }
    }
  }, [saoId, saos]);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: supervisorProfile } = await supabase.from('supervisor_profiles').select('id').eq('id', user.id).single();
      if (supervisorProfile) setUserRole('supervisor');
      else setUserRole('eit');
    };
    fetchRole();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this SAO?')) {
      await deleteSAO(id);
    }
  };

  const handleEdit = (sao: SAO) => {
    setEditingSAO(sao);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSAO(undefined);
    loadUserSAOs();
  };

  // File extraction logic
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    let extracted = '';
    let isDocx = false;
    try {
      if (file.type === 'text/plain') {
        extracted = await file.text();
      } else if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        extracted = result.value;
        isDocx = true;
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        extracted = text;
        toast('PDF formatting is not preserved. Only plain text is extracted.', { icon: '⚠️' });
      } else {
        extracted = 'Unsupported file type.';
      }
    } catch (err) {
      extracted = 'Failed to extract content: ' + (err instanceof Error ? err.message : String(err));
    }
    setPendingSAOContent(extracted);
    setIsModalOpen(true);
    setImportMenuOpen(false);
    if (uploadInputRef.current) uploadInputRef.current.value = '';
  };

  // Sorting logic
  let sortedSAOs = [...saos];
  if (sortMode === 'recent') {
    sortedSAOs.sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime());
  } else if (sortMode === 'skill') {
    sortedSAOs.sort((a, b) => {
      // Find the lowest skill order index for each SAO
      const aIdx = Math.min(...a.skills.map(s => getSkillOrderIndex(s.name)));
      const bIdx = Math.min(...b.skills.map(s => getSkillOrderIndex(s.name)));
      return aIdx - bIdx;
    });
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* SAO Limit Banner */}
      {tier === 'free' && (
        <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-900 text-center font-semibold">
          {(saoLimit === -1 || saoLimit === 2147483647)
            ? 'You have Unlimited SAOs on your plan.'
            : (saoCreatedCount < saoLimit
              ? `You have ${saoLimit - saoCreatedCount} SAO${saoLimit - saoCreatedCount === 1 ? '' : 's'} left on the Free plan.`
              : 'You have reached your SAO limit for the Free plan. Upgrade to add more.')}
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 bg-slate-50 px-6 py-4 rounded-lg border border-slate-100">
        <div className="mb-3 md:mb-0">
          <h1 className="text-2xl font-bold text-slate-800">Situation-Action-Outcome (SAO)</h1>
          <p className="text-slate-500 mt-1">Write and manage your SAO essays.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-end">
          <button
            className="btn flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
            onClick={() => setImportMenuOpen((v) => !v)}
            type="button"
          >
            <Upload size={18} />
            Import / Upload
          </button>
          {importMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-100"
                onClick={() => {
                  setImportMenuOpen(false);
                  uploadInputRef.current?.click();
                }}
              >
                Upload from Device
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-100"
                onClick={handleImportGoogleDrive}
              >
                Import from Google Drive
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-100"
                onClick={handleImportOneDrive}
              >
                Import from OneDrive
              </button>
            </div>
          )}
          <input
            type="file"
            className="hidden"
            ref={uploadInputRef}
            onChange={handleUploadFile}
            accept=".txt,.docx,.pdf"
          />
          {userRole === 'eit' && (
            <button
              className={`btn btn-primary ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={() => loadUserSAOs(true)}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
          <button
            onClick={() => {
              if (saoLimit === -1 || saoLimit === 2147483647 || saoCreatedCount < saoLimit) setIsModalOpen(true);
            }}
            className={`btn flex items-center gap-2 ${(saoLimit !== -1 && saoLimit !== 2147483647 && saoCreatedCount >= saoLimit) ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed' : 'btn-primary'}`}
            disabled={saoLimit !== -1 && saoLimit !== 2147483647 && saoCreatedCount >= saoLimit}
            aria-disabled={saoLimit !== -1 && saoLimit !== 2147483647 && saoCreatedCount >= saoLimit}
            title={(saoLimit !== -1 && saoLimit !== 2147483647 && saoCreatedCount >= saoLimit) ? 'You have reached your SAO limit for the Free plan.' : 'Start a new SAO'}
          >
            <Plus size={18} />
            Start New SAO
          </button>
          <select
            className="border border-slate-300 rounded px-3 py-2 text-sm ml-2 min-w-[140px]"
            value={sortMode}
            onChange={e => setSortMode(e.target.value as 'recent' | 'skill')}
            title="Sort SAOs"
          >
            <option value="recent">Recently Edited</option>
            <option value="skill">Sort by Skill</option>
          </select>
        </div>
      </div>
      <hr className="mb-6 border-slate-200" />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-red-600">Error:</span>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : sortedSAOs.length > 0 ? (
        <div className="space-y-4">
          {sortedSAOs.map((sao) => (
            <SAOCard 
              key={sao.id} 
              sao={sao} 
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <FileEdit className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">No SAOs yet</h3>
            <p className="mt-2 text-slate-500">
              Get started by writing your first SAO essay.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-4 btn btn-primary"
            >
              Start Writing
            </button>
          </div>
        </div>
      )}

      <SAOModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editSAO={editingSAO}
        onCreated={() => {
          loadUserSAOs();
          setIsModalOpen(false);
        }}
        initialContent={pendingSAOContent}
        onInitialContentUsed={() => setPendingSAOContent(null)}
      />

      {/* Import Modal for previewing imported content */}
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Imported Content Preview</h2>
          <div className="bg-slate-50 p-4 rounded mb-4 whitespace-pre-wrap text-slate-800 min-h-[120px]">
            {importedContent}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowImportModal(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SAOs;
export { SAOModal }; 