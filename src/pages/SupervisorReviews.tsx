import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { sendScoreNotification } from '../utils/notifications';
import SAOFeedbackComponent from '../components/saos/SAOFeedback';
import { X } from 'lucide-react';

// --- Skill Validation Types ---
interface Validator {
  id: string;
  skill_id: string;
  full_name: string;
  email: string;
  description: string;
  status: string;
  score: number | null;
  created_at: string;
  updated_at: string;
  eit_id: string;
}
interface EITProfile { id: string; full_name: string; email: string; }
interface Skill { id: string; name: string; }

// --- SAO Feedback Types ---
interface SAOFeedback {
  id: string;
  sao_id: string;
  supervisor_id: string;
  feedback: string;
  status: 'pending' | 'submitted' | 'resolved';
  created_at: string;
  updated_at: string;
  sao?: {
    title: string;
    content: string;
    created_at: string;
    eit_id: string;
  };
}

const SupervisorReviews: React.FC = () => {
  const [tab, setTab] = useState<'skills' | 'saos'>('skills');

  // --- Skill Validation State ---
  const [validators, setValidators] = useState<Validator[]>([]);
  const [scoreInputs, setScoreInputs] = useState<Record<string, number>>({});
  const [eitProfiles, setEITProfiles] = useState<Record<string, EITProfile>>({});
  const [skills, setSkills] = useState<Record<string, Skill>>({});
  const [history, setHistory] = useState<Record<string, any[]>>({});
  const [loadingSkills, setLoadingSkills] = useState(true);

  // --- SAO Feedback State ---
  const [feedbackRequests, setFeedbackRequests] = useState<SAOFeedback[]>([]);
  const [loadingSAOs, setLoadingSAOs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSAO, setSelectedSAO] = useState<SAOFeedback | null>(null);
  const [isSAOModalOpen, setIsSAOModalOpen] = useState(false);
  const [eitNameMap, setEitNameMap] = useState<Record<string, string>>({});

  // --- Fetch Skill Validation Requests ---
  useEffect(() => {
    const fetchValidatorsAndMeta = async () => {
      setLoadingSkills(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: validators, error } = await supabase
        .from('validators')
        .select('*')
        .eq('email', user.email)
        .eq('status', 'pending');
      if (error || !validators) { setLoadingSkills(false); return; }
      setValidators(validators);
      // Fetch EIT profiles and skills in parallel
      const eitIds = Array.from(new Set(validators.map(v => v.eit_id)));
      const skillIds = Array.from(new Set(validators.map(v => v.skill_id)));
      const [{ data: eits }, { data: skillsData }] = await Promise.all([
        supabase.from('eit_profiles').select('id, full_name, email').in('id', eitIds),
        supabase.from('skills').select('id, name').in('id', skillIds)
      ]);
      const eitMap: Record<string, EITProfile> = {};
      (eits || []).forEach((eit: any) => { eitMap[eit.id] = eit; });
      setEITProfiles(eitMap);
      const skillMap: Record<string, Skill> = {};
      (skillsData || []).forEach((s: any) => { skillMap[s.id] = s; });
      setSkills(skillMap);
      // Fetch history for each validator request (by eit_id + skill_id) from skill_validations
      const historyObj: Record<string, any[]> = {};
      await Promise.all(validators.map(async (validator) => {
        const { data: prev } = await supabase
          .from('skill_validations')
          .select('score, feedback, validated_at, validator_id')
          .eq('eit_id', validator.eit_id)
          .eq('skill_id', validator.skill_id)
          .order('validated_at', { ascending: false });
        let historyWithNames = prev || [];
        if (historyWithNames.length > 0) {
          const validatorIds = Array.from(new Set(historyWithNames.map((h: any) => h.validator_id)));
          const { data: validatorProfiles } = await supabase
            .from('supervisor_profiles')
            .select('id, full_name, email')
            .in('id', validatorIds);
          const profileMap: Record<string, any> = {};
          (validatorProfiles || []).forEach((p: any) => { profileMap[p.id] = p; });
          historyWithNames = historyWithNames.map((h: any) => ({
            ...h,
            full_name: profileMap[h.validator_id]?.full_name || '',
            email: profileMap[h.validator_id]?.email || ''
          }));
        }
        historyObj[validator.id] = historyWithNames;
      }));
      setHistory(historyObj);
      setLoadingSkills(false);
    };
    fetchValidatorsAndMeta();
  }, []);

  // --- Fetch SAO Feedback Requests ---
  const fetchFeedbackRequests = async () => {
    setLoadingSAOs(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      const { data, error } = await supabase
        .from('sao_feedback')
        .select(`*, sao:saos (title, content, created_at, eit_id)`)
        .eq('supervisor_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFeedbackRequests(data || []);
      // Fetch EIT names for all unique eit_ids
      const eitIds = Array.from(new Set((data || []).map((req: any) => req.sao?.eit_id).filter(Boolean)));
      if (eitIds.length > 0) {
        const { data: eits } = await supabase
          .from('eit_profiles')
          .select('id, full_name')
          .in('id', eitIds);
        const nameMap: Record<string, string> = {};
        (eits || []).forEach((eit: any) => { nameMap[eit.id] = eit.full_name; });
        setEitNameMap(nameMap);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load feedback requests');
    } finally {
      setLoadingSAOs(false);
    }
  };
  useEffect(() => { fetchFeedbackRequests(); }, []);

  // --- Handlers ---
  const handleScoreChange = (id: string, value: number) => {
    setScoreInputs((prev) => ({ ...prev, [id]: value }));
  };
  const handleSubmit = async (validator: Validator) => {
    const score = scoreInputs[validator.id];
    if (!score || score < 1 || score > 5) return;
    await supabase
      .from('validators')
      .update({ status: 'scored', score })
      .eq('id', validator.id);
    await supabase
      .from('eit_skills')
      .update({ supervisor_score: score, status: 'completed' })
      .eq('eit_id', validator.eit_id)
      .eq('skill_id', validator.skill_id);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('skill_validations')
      .insert({
        eit_id: validator.eit_id,
        skill_id: validator.skill_id,
        validator_id: user.id,
        score,
        validated_at: new Date().toISOString()
      });
    const eit = eitProfiles[validator.eit_id];
    const skill = skills[validator.skill_id];
    if (eit && skill) {
      await sendScoreNotification(eit.id, skill.name, score);
    }
    setValidators((prev) => prev.filter((v) => v.id !== validator.id));
  };
  const handleResolve = async (feedbackId: string) => {
    await supabase
      .from('sao_feedback')
      .update({ status: 'resolved' })
      .eq('id', feedbackId);
    setFeedbackRequests((prev) =>
      prev.map((f) => (f.id === feedbackId ? { ...f, status: 'resolved' } : f))
    );
  };
  const handleSubmitFeedback = async (saoId: string, feedback: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from('sao_feedback')
      .update({ feedback, status: 'submitted' })
      .eq('sao_id', saoId)
      .eq('supervisor_id', user.id);
    setFeedbackRequests((prev) =>
      prev.map((f) =>
        f.sao_id === saoId ? { ...f, feedback, status: 'submitted' } : f
      )
    );
  };

  // --- UI ---
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Review Center</h1>
      </div>
      {/* Centered Toggle */}
      <div className="flex justify-center my-8">
        <div className="relative flex bg-slate-100 rounded-full p-1 shadow-inner gap-0">
          <button
            onClick={() => setTab('skills')}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 text-sm focus:outline-none z-10
              ${tab === 'skills' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-700 hover:text-teal-600'}`}
            style={{ marginRight: '-0.5rem', marginLeft: '0.5rem' }}
            aria-pressed={tab === 'skills'}
          >
            Skills
          </button>
          <button
            onClick={() => setTab('saos')}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 text-sm focus:outline-none z-10
              ${tab === 'saos' ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-700 hover:text-teal-600'}`}
            style={{ marginLeft: '-0.5rem', marginRight: '0.5rem' }}
            aria-pressed={tab === 'saos'}
          >
            SAOs
          </button>
        </div>
      </div>
      {/* Skills Tab */}
      {tab === 'skills' && (
        <div>
          {loadingSkills ? (
            <div>Loading...</div>
          ) : validators.length === 0 ? (
            <div>No pending skill validation requests.</div>
          ) : (
            <div className="space-y-4">
              {validators.map((validator) => {
                const eit = eitProfiles[validator.eit_id];
                const skill = skills[validator.skill_id];
                return (
                  <div 
                    key={validator.id} 
                    className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-300"
                  >
                    <div>
                      <div className="font-semibold">Skill: {skill ? skill.name : validator.skill_id}</div>
                      <div className="text-slate-600">EIT: {eit ? `${eit.full_name} (${eit.email})` : validator.eit_id}</div>
                      <div className="text-slate-600">Description: {validator.description}</div>
                      {/* History Section */}
                      {history[validator.id] && history[validator.id].length > 0 && (
                        <div className="mt-2 text-xs text-slate-500">
                          <div className="font-semibold text-slate-700 mb-1">History:</div>
                          <ul className="space-y-1">
                            {history[validator.id].map((h, idx) => (
                              <li key={idx} className="flex gap-2 items-center">
                                <span>Score: <span className="font-semibold text-green-700">{h.score}</span></span>
                                <span>by {h.full_name || h.email || 'Unknown'}</span>
                                <span>on {h.validated_at ? new Date(h.validated_at).toLocaleDateString() : ''}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={scoreInputs[validator.id] || ''}
                        onChange={(e) => handleScoreChange(validator.id, Number(e.target.value))}
                        className="input w-24"
                        placeholder="Score (1-5)"
                      />
                      <button
                        className="btn btn-primary"
                        onClick={() => handleSubmit(validator)}
                        disabled={!scoreInputs[validator.id] || scoreInputs[validator.id] < 1 || scoreInputs[validator.id] > 5}
                      >
                        Submit Score
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {/* SAOs Tab */}
      {tab === 'saos' && (
        <div>
          <button
            onClick={fetchFeedbackRequests}
            disabled={loadingSAOs}
            className="mb-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingSAOs ? 'Refreshing...' : 'Refresh'}
          </button>
          {loadingSAOs ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : feedbackRequests.length === 0 ? (
            <div className="text-slate-500">No feedback requests assigned to you.</div>
          ) : (
            <div className="space-y-4">
              {feedbackRequests.map((req) => (
                <div 
                  key={req.id} 
                  className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedSAO(req);
                    setIsSAOModalOpen(true);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-teal-600">{req.sao?.title || 'Untitled SAO'}</h2>
                      <p className="text-sm text-slate-500">From: {eitNameMap[req.sao?.eit_id || ''] || req.sao?.eit_id || 'Unknown'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {req.status === 'pending' && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          Pending Review
                        </span>
                      )}
                      {req.status === 'submitted' && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Feedback Submitted
                        </span>
                      )}
                      {req.status === 'resolved' && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SAO Details Modal */}
      {isSAOModalOpen && selectedSAO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-slate-900">{selectedSAO.sao?.title || 'Untitled SAO'}</h2>
                <button
                  onClick={() => {
                    setIsSAOModalOpen(false);
                    setSelectedSAO(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">SAO Content</h3>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedSAO.sao?.content}</p>
                </div>
              </div>

              <SAOFeedbackComponent
                feedback={[selectedSAO]}
                onResolve={handleResolve}
                onSubmitFeedback={handleSubmitFeedback}
                isSupervisor={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorReviews; 