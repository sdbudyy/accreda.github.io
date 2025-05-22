import React, { useState, useEffect, useRef } from 'react';
import { FileEdit, Plus, X, ChevronDown, Trash2, Edit2, Sparkles } from 'lucide-react';
import { useSkillsStore, Category, Skill } from '../store/skills';
import { useSAOsStore, SAO } from '../store/saos';
import { useSearchParams } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../lib/supabase';
import SAOFeedbackComponent from '../components/saos/SAOFeedback';
import Modal from '../components/common/Modal';
import { useSubscriptionStore } from '../store/subscriptionStore';

interface SAOModalProps {
  isOpen: boolean;
  onClose: () => void;
  editSAO?: SAO;
  onCreated?: () => void;
}

// Utility to get the most recent feedback
function getMostRecentFeedback(feedbackArr: { updated_at: string; status: string }[]): { updated_at: string; status: string } | null {
  if (!feedbackArr || feedbackArr.length === 0) return null;
  return feedbackArr.reduce((latest, curr) =>
    new Date(curr.updated_at) > new Date(latest.updated_at) ? curr : latest
  );
}

const SAOModal: React.FC<SAOModalProps> = ({ isOpen, onClose, editSAO, onCreated }) => {
  const [title, setTitle] = useState('');
  const [sao, setSao] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [status, setStatus] = useState<'draft' | 'complete'>('draft');
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedText, setEnhancedText] = useState<string | null>(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('');
  const [supervisors, setSupervisors] = useState<Array<{ id: string; name: string }>>([]);
  const { skillCategories } = useSkillsStore();
  const { createSAO, updateSAO, loading, error, requestFeedback, loadUserSAOs } = useSAOsStore();
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [ruleModalMessage, setRuleModalMessage] = useState('');
  const { checkSaoLimit, tier, fetchSubscription } = useSubscriptionStore();
  const [limitError, setLimitError] = useState<string | null>(null);
  const [saoCreatedCount, setSaoCreatedCount] = useState<number>(0);

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
      setSao(editSAO.content);
      setSelectedSkills(editSAO.skills);
      setStatus(editSAO.status || 'draft');
    } else if (isOpen) {
      setTitle('');
      setSao('');
      setSelectedSkills([]);
      setStatus('draft');
    }
  }, [isOpen, editSAO]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLimitError(null);
    try {
      if (!editSAO && tier === 'free') {
        const canCreate = await checkSaoLimit();
        if (!canCreate) {
          setLimitError('You have reached your SAO limit for the Free plan. Upgrade to add more.');
          return;
        }
      }
      if (editSAO) {
        console.log('Calling updateSAO with:', { id: editSAO.id, title, sao, selectedSkills, status });
        await updateSAO(editSAO.id, title, sao, selectedSkills, status);
      } else {
        console.log('Calling createSAO with:', { title, sao, selectedSkills, status });
        await createSAO(title, sao, selectedSkills, status);
      }

      // If a supervisor is selected, request feedback
      if (selectedSupervisor) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: saos } = await supabase
            .from('saos')
            .select('id')
            .eq('eit_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (saos) {
            await requestFeedback(saos.id, selectedSupervisor);
          }
        }
      }

      setTitle('');
      setSao('');
      setSelectedSkills([]);
      setSelectedSupervisor('');
      onClose();
      loadUserSAOs();
      onCreated && onCreated();
    } catch (error) {
      console.error('Error saving SAO:', error);
    }
  };

  const enhanceWithGemini = async (text: string) => {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('Making API call to Gemini...');
    
    const prompt = `You are an expert in writing professional Situation-Action-Outcome (SAO) statements. Please enhance the following SAO statement following these specific guidelines:

1. Structure:
   - Situation: Clearly describe the context, challenge, or problem faced
   - Action: Detail the specific steps taken, emphasizing your personal involvement
   - Outcome: Quantify results and highlight the impact of your actions

2. Best Practices:
   - Use active voice and strong action verbs
   - Include specific metrics and numbers where possible
   - Focus on your personal contributions and leadership
   - Highlight problem-solving and decision-making skills
   - Maintain a professional and confident tone
   - Keep the statement concise but impactful

3. Key Elements to Include:
   - Clear problem statement
   - Specific actions taken
   - Measurable results
   - Skills demonstrated
   - Impact on the organization/team

Please enhance the following SAO statement while maintaining its core message and following these guidelines:

${text}

Format the response as a clear SAO statement with Situation, Action, and Outcome sections clearly separated.`;

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const enhancedText = response.text();
      
      console.log('API Response received:', enhancedText);
      return enhancedText;
    } catch (error) {
      console.error('Error in enhanceWithGemini:', error);
      throw error;
    }
  };

  const handleEnhanceWithAI = async () => {
    if (!sao.trim()) return;
    
    setIsEnhancing(true);
    try {
      console.log('Starting enhancement process...');
      const enhanced = await enhanceWithGemini(sao);
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
      setSao(enhancedText);
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
    // 2. Count unique supervisors for this EIT
    const { data: allValidations } = await supabase
      .from('skill_validations')
      .select('validator_id')
      .eq('eit_id', user.id);
    const uniqueSupervisors = new Set((allValidations || []).map((v: any) => v.validator_id));
    // If this is a new supervisor, add to the set
    uniqueSupervisors.add(selectedSupervisor);
    if (uniqueSupervisors.size < 3) {
      setRuleModalMessage('You must use at least 3 different supervisors for your validations. Please select a different supervisor.');
      setRuleModalOpen(true);
      return;
    }
    // If all rules pass, proceed
    await requestFeedback(editSAO.id, selectedSupervisor);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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

        {/* Show supervisor feedback if present */}
        {editSAO && editSAO.feedback && editSAO.feedback.length > 0 && (
          <div className="mb-6">
            <SAOFeedbackComponent
              feedback={editSAO.feedback}
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
            <label htmlFor="sao" className="block text-sm font-medium text-slate-700 mb-2">
              Situation-Action-Outcome
            </label>
            <div className="relative">
              <textarea
                id="sao"
                value={enhancedText || sao}
                onChange={(e) => {
                  if (!enhancedText) {
                    setSao(e.target.value);
                  }
                }}
                className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[400px] text-lg"
                placeholder="Describe your situation, actions, and outcomes..."
                required
                disabled={loading || isEnhancing}
              />
              {tier !== 'free' && (
                <button
                  type="button"
                  onClick={handleEnhanceWithAI}
                  disabled={!sao.trim() || loading || isEnhancing}
                  className="absolute top-4 right-4 p-3 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                  title="Enhance with AI"
                >
                  <div className="relative">
                    <Sparkles 
                      size={24} 
                      className={`${isEnhancing ? 'animate-pulse' : ''} transition-transform duration-300 group-hover:scale-110`}
                    />
                    {isEnhancing && (
                      <div className="absolute inset-0 animate-ping rounded-full bg-teal-400 opacity-20" />
                    )}
                  </div>
                  <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-slate-800 text-white px-3 py-1.5 rounded text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    Enhance with AI
                  </span>
                </button>
              )}
            </div>
            {enhancedText && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm text-slate-600">AI Enhancement Preview</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleAcceptEnhancement}
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={handleDeclineEnhancement}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}
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
              Relevant Skills
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedSkills.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-teal-100 text-teal-800"
                >
                  {skill.name}
                  <button
                    type="button"
                    onClick={() => setSelectedSkills(prev => prev.filter(s => s.id !== skill.id))}
                    className="ml-2 text-teal-600 hover:text-teal-800"
                    disabled={loading}
                  >
                    <X size={16} />
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsSkillsModalOpen(true)}
              className="btn btn-secondary w-full flex items-center justify-center gap-2 py-3 text-lg"
              disabled={loading}
            >
              <Plus size={20} />
              Select Skills
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
                <h3 className="text-2xl font-semibold">Select Skills</h3>
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
                            type="checkbox"
                            checked={selectedSkills.some(s => s.id === skill.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSkills(prev => [...prev, { ...skill, category_name: category.name }]);
                              } else {
                                setSelectedSkills(prev => prev.filter(s => s.id !== skill.id));
                              }
                            }}
                            className="rounded text-teal-600 focus:ring-teal-500 w-5 h-5"
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
      <p className="text-slate-600 whitespace-pre-wrap mb-4">{sao.content}</p>
      <div className="flex flex-wrap gap-2">
        {sao.skills.map((skill) => (
          <span
            key={skill.id}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-teal-100 text-teal-800"
          >
            {skill.name}
          </span>
        ))}
      </div>
      <div className="mt-4 text-sm text-slate-500">
        Created: {new Date(sao.created_at).toLocaleDateString()}
      </div>
    </div>
  );
};

const SAOs: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSAO, setEditingSAO] = useState<SAO | undefined>();
  const { saos, loading, error, loadUserSAOs, deleteSAO } = useSAOsStore();
  const { tier, saoLimit, fetchSubscription } = useSubscriptionStore();
  const [searchParams] = useSearchParams();
  const saoId = searchParams.get('saoId');
  const [saoCreatedCount, setSaoCreatedCount] = useState<number>(0);

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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* SAO Limit Banner */}
      {tier === 'free' && (
        <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-900 text-center font-semibold">
          {saoCreatedCount < saoLimit
            ? `You have ${saoLimit - saoCreatedCount} SAO${saoLimit - saoCreatedCount === 1 ? '' : 's'} left on the Free plan.`
            : 'You have reached your SAO limit for the Free plan. Upgrade to add more.'}
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Situation-Action-Outcome (SAO)</h1>
          <p className="text-slate-500 mt-1">Write and manage your SAO essays.</p>
        </div>
        <button
          onClick={() => {
            if (saoCreatedCount < saoLimit) setIsModalOpen(true);
          }}
          className={`btn flex items-center gap-2 ${saoCreatedCount >= saoLimit ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed' : 'btn-primary'}`}
          disabled={saoCreatedCount >= saoLimit}
          aria-disabled={saoCreatedCount >= saoLimit}
          title={saoCreatedCount >= saoLimit ? 'You have reached your SAO limit for the Free plan.' : 'Start a new SAO'}
        >
          <Plus size={18} />
          Start New SAO
        </button>
      </div>

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
      ) : saos.length > 0 ? (
        <div className="space-y-4">
          {saos.map((sao) => (
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
      />
    </div>
  );
};

export default SAOs;
export { SAOModal }; 