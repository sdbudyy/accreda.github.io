import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { Mail } from 'lucide-react';
import { sendNotification } from '../utils/notifications';

interface EIT {
  id: string;
  full_name: string;
  email: string;
  start_date?: string;
  target_date?: string;
}

interface PendingRequest {
  id: string;
  eit_id: string;
  status: string;
  created_at: string;
  eit_profiles: EIT;
}

interface EITProgress {
  overallProgress: number;
  completedSkills: number;
  documentedExperiences: number;
  supervisorApprovals: number;
}

const fetchEITProgress = async (eitId: string): Promise<EITProgress> => {
  try {
    const [skillsRes, expRes, apprRes] = await Promise.all([
      supabase
        .from('eit_skills')
        .select('id', { count: 'exact', head: true })
        .eq('eit_id', eitId)
        .not('rank', 'is', null),
      supabase
        .from('experiences')
        .select('id', { count: 'exact', head: true })
        .eq('eit_id', eitId),
      supabase
        .from('experiences')
        .select('id', { count: 'exact', head: true })
        .eq('eit_id', eitId)
        .eq('supervisor_approved', true),
    ]);

    if (skillsRes.error || expRes.error || apprRes.error) {
      throw new Error('Failed to fetch EIT progress');
    }

    const completedSkills = skillsRes.count || 0;
    const documentedExperiences = expRes.count || 0;
    const supervisorApprovals = apprRes.count || 0;
    const skillsProgress = completedSkills / 22;
    const experiencesProgress = documentedExperiences / 24;
    const approvalsProgress = supervisorApprovals / 24;
    const overallProgress = Math.round(((skillsProgress + experiencesProgress + approvalsProgress) / 3) * 100);
    return { overallProgress, completedSkills, documentedExperiences, supervisorApprovals };
  } catch (error) {
    console.error('Error fetching EIT progress:', error);
    return { overallProgress: 0, completedSkills: 0, documentedExperiences: 0, supervisorApprovals: 0 };
  }
};

const SupervisorTeam: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [eits, setEITs] = useState<EIT[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, EITProgress>>({});
  const [selectedEIT, setSelectedEIT] = useState<EIT | null>(null);
  const [eitSkills, setEitSkills] = useState<any[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsByCategory, setSkillsByCategory] = useState<Record<string, any[]>>({});
  const [nudgeModalEIT, setNudgeModalEIT] = useState<EIT | null>(null);
  const [nudgeMessage, setNudgeMessage] = useState('');
  const [nudgeSending, setNudgeSending] = useState(false);
  const [nudgeSuccess, setNudgeSuccess] = useState<string | null>(null);
  const [nudgeError, setNudgeError] = useState<string | null>(null);

  const fetchTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('No user found');
        return;
      }
      // Fetch all data in parallel
      const [pendingReqsRes, relationshipsRes] = await Promise.all([
        supabase
          .from('supervisor_eit_relationships')
          .select('id, eit_id, status, created_at, eit_profiles (id, full_name, email, start_date, target_date)')
          .eq('supervisor_id', user.id)
          .eq('status', 'pending'),
        supabase
          .from('supervisor_eit_relationships')
          .select('eit_id, eit_profiles (id, full_name, email, start_date, target_date)')
          .eq('supervisor_id', user.id)
          .eq('status', 'active')
      ]);
      if (pendingReqsRes.error) throw pendingReqsRes.error;
      if (relationshipsRes.error) throw relationshipsRes.error;
      // Process pending requests
      const pendingReqs: PendingRequest[] = (pendingReqsRes.data || []).map((req: any) => ({
        ...req,
        eit_profiles: Array.isArray(req.eit_profiles) ? req.eit_profiles[0] : req.eit_profiles
      }));
      setPending(pendingReqs);
      // Process active EITs
      const eitList: EIT[] = (relationshipsRes.data || []).map((rel: any) => {
        const profile = Array.isArray(rel.eit_profiles) ? rel.eit_profiles[0] : rel.eit_profiles;
        return {
          id: String(profile?.id || ''),
          full_name: String(profile?.full_name || ''),
          email: String(profile?.email || ''),
          start_date: profile?.start_date || undefined,
          target_date: profile?.target_date || undefined
        };
      });
      setEITs(eitList);
      // Fetch progress for all EITs in parallel
      const progressPromises = eitList.map(eit => fetchEITProgress(eit.id));
      const progressResults = await Promise.all(progressPromises);
      const progressEntries = eitList.map((eit, index) => [eit.id, progressResults[index]]);
      setProgressMap(Object.fromEntries(progressEntries));
      // If modal is open, refresh the selected EIT's skills
      if (selectedEIT) {
        const updatedEIT = eitList.find(e => e.id === selectedEIT.id);
        if (updatedEIT) {
          await handleEITClick(updatedEIT);
        }
      }
    } catch (err) {
      console.error('Error fetching team data:', err);
      setError('Failed to load team data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
    // Add event listener for tab/window focus to auto-refresh team data
    const handleFocus = () => {
      fetchTeam();
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      // Refetch progress for all EITs
      if (eits.length > 0) {
        const progressPromises = eits.map(eit => fetchEITProgress(eit.id));
        const progressResults = await Promise.all(progressPromises);
        const progressEntries = eits.map((eit, index) => [eit.id, progressResults[index]]);
        setProgressMap(Object.fromEntries(progressEntries));
      }
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [eits]);

  const handleRequest = async (id: string, accept: boolean) => {
    if (!id) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('supervisor_eit_relationships')
        .update({ status: accept ? 'active' : 'denied', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Update local state instead of reloading
      setPending(prev => prev.filter(req => req.id !== id));
      if (accept) {
        const updatedReq = pending.find(req => req.id === id);
        if (updatedReq && updatedReq.eit_profiles) {
          setEITs(prev => [...prev, updatedReq.eit_profiles]);
        }
      }
    } catch (err) {
      console.error('Error handling request:', err);
      setError('Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEITClick = async (eit: EIT) => {
    if (!eit || !eit.id) return;
    setSelectedEIT(eit);
    setSkillsLoading(true);

    // Fetch all skills for the EIT
    const { data: skills, error } = await supabase
      .from('eit_skills')
      .select('skill_id, rank, supervisor_score, category_name, skill_name, status, eit_id')
      .eq('eit_id', eit.id);

    // Fetch all validators for the EIT
    const { data: validators, error: validatorsError } = await supabase
      .from('validators')
      .select('*')
      .eq('eit_id', eit.id);

    // Group validators by skill_id
    const validatorsBySkill: Record<string, any[]> = {};
    (validators || []).forEach((validator: any) => {
      if (!validatorsBySkill[validator.skill_id]) validatorsBySkill[validator.skill_id] = [];
      validatorsBySkill[validator.skill_id].push(validator);
    });

    // Organize skills by category, and attach validators
    const byCategory: Record<string, any[]> = {};
    (skills || []).forEach((skill: any) => {
      if (!byCategory[skill.category_name]) byCategory[skill.category_name] = [];
      byCategory[skill.category_name].push({
        ...skill,
        validators: validatorsBySkill[skill.skill_id] || []
      });
    });

    setSkillsByCategory(byCategory);
    setSkillsLoading(false);
  };

  const handleSendNudge = async () => {
    if (!nudgeModalEIT) return;
    setNudgeSending(true);
    setNudgeSuccess(null);
    setNudgeError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No supervisor user');
      await sendNotification({
        userId: nudgeModalEIT.id,
        type: 'nudge',
        title: 'Nudge from Supervisor',
        message: nudgeMessage || 'Keep going! Your supervisor believes in you!'
      });
      setNudgeSuccess('Nudge sent!');
      setNudgeMessage('');
      setTimeout(() => setNudgeModalEIT(null), 1200);
    } catch (err: any) {
      setNudgeError(err.message || 'Failed to send nudge');
    } finally {
      setNudgeSending(false);
    }
  };

  // Calculate average team progress
  const teamProgress = eits.length > 0 ? Math.round(eits.reduce((sum, eit) => sum + (progressMap[eit.id]?.overallProgress || 0), 0) / eits.length) : 0;

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Team</h1>
      <button className="btn btn-primary mb-4" onClick={fetchTeam} disabled={loading}>
        {loading ? 'Reloading...' : 'Reload Team'}
      </button>
      {/* Team Progress Bar */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2 text-slate-800">Team Progress</h2>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-slate-700">Average Completion</span>
          <span className="text-sm font-semibold text-teal-600">{teamProgress}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-teal-500 rounded-full transition-all duration-300" style={{ width: `${teamProgress}%` }}></div>
        </div>
        <div className="text-xs text-slate-500 mt-1">This is the average overall progress of all your connected EITs.</div>
      </div>
      {/* Pending Requests */}
      {pending.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold mb-2 text-yellow-800">Pending Requests</h2>
          <button
            className="btn btn-primary btn-sm mb-4"
            onClick={async () => {
              setLoading(true);
              try {
                await Promise.all(pending.map(req => handleRequest(req.id, true)));
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            Approve All
          </button>
          <div className="space-y-3">
            {pending.map((req) => (
              <div key={req.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-yellow-100 pb-2 last:border-0">
                <div>
                  <span className="font-medium">{req.eit_profiles.full_name}</span> ({req.eit_profiles.email})
                  <span className="ml-2 text-xs text-slate-500">Requested on {new Date(req.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm" onClick={() => handleRequest(req.id, true)}>Accept</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleRequest(req.id, false)}>Deny</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Active EITs */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Team Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eits.map((eit) => {
              const progress = progressMap[eit.id];
              let expectedProgress = null;
              let progressColor = 'teal';
              let progressDescription = '';
              let showNudge = false;

              if (eit.start_date && eit.target_date) {
                const now = new Date();
                const start = new Date(eit.start_date);
                const end = new Date(eit.target_date);
                const total = end.getTime() - start.getTime();
                const elapsed = now.getTime() - start.getTime();
                let percent = Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
                expectedProgress = percent;

                if (progress) {
                  const delta = progress.overallProgress - percent;
                  if (delta > 0) {
                    progressColor = 'teal';
                    progressDescription = 'Ahead of schedule';
                  } else if (delta >= -5) {
                    progressColor = 'blue';
                    progressDescription = 'On track';
                  } else {
                    progressColor = 'purple';
                    progressDescription = 'Behind schedule';
                    showNudge = true;
                  }
                }
              }

              return (
                <div key={eit.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <button className="font-medium text-teal-700 hover:underline" onClick={() => handleEITClick(eit)}>{eit.full_name}</button>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{eit.email}</p>
                  </div>
                  {progress && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">Overall Progress</span>
                        <span className="text-sm font-semibold text-teal-600">{progress.overallProgress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            progressColor === 'teal' ? 'bg-teal-500' :
                            progressColor === 'blue' ? 'bg-blue-500' :
                            'bg-purple-500'
                          }`} 
                          style={{ width: `${progress.overallProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex gap-4 text-xs text-slate-500">
                          <span>Skills: {progress.completedSkills}/22</span>
                          <span>Experiences: {progress.documentedExperiences}/24</span>
                          <span>Approvals: {progress.supervisorApprovals}/24</span>
                        </div>
                        {expectedProgress !== null && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                            {progressDescription} (Expected: {expectedProgress}%)
                            {showNudge && (
                              <button
                                className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1 hover:bg-red-200 transition"
                                onClick={() => { setNudgeModalEIT(eit); setNudgeMessage(''); }}
                              >
                                <Mail size={14} className="mr-1" /> Nudge
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* EIT Skills Modal */}
      {selectedEIT && (
        <Modal isOpen={!!selectedEIT} onClose={() => setSelectedEIT(null)}>
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">{selectedEIT.full_name}'s Skills</h2>
            {skillsLoading ? (
              <div>Loading...</div>
            ) : (
              Object.keys(skillsByCategory).length === 0 ? (
                <div>No marked skills found.</div>
              ) : (
                <div className="pr-2">
                  {Object.entries(skillsByCategory)
                    .sort(([categoryA], [categoryB]) => {
                      // Extract category numbers and compare them
                      const numA = parseInt(categoryA.match(/\d+/)?.[0] || '0');
                      const numB = parseInt(categoryB.match(/\d+/)?.[0] || '0');
                      return numA - numB;
                    })
                    .map(([category, skills]) => {
                    // Sort skills by splitting skill number by '.' and comparing each part numerically
                    const extractSkillParts = (name: string) => {
                      const match = name.match(/^([\d.]+)/);
                      if (!match) return [0];
                      return match[1].split('.').map(Number);
                    };
                    const sortedSkills = [...skills].sort((a, b) => {
                      const partsA = extractSkillParts(a.skill_name);
                      const partsB = extractSkillParts(b.skill_name);
                      for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
                        const numA = partsA[i] ?? 0;
                        const numB = partsB[i] ?? 0;
                        if (numA !== numB) return numA - numB;
                      }
                      return 0;
                    });
                    return (
                      <div key={category} className="mb-6">
                        <h3 className="font-semibold text-slate-800 mb-3 text-lg">{category}</h3>
                        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white shadow-sm">
                          {sortedSkills.map((skill) => (
                            <div
                              key={skill.skill_id}
                              className="flex flex-row items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50 group"
                            >
                              <span className="font-medium text-slate-800 flex-1 min-w-0 truncate">{skill.skill_name}</span>
                              <div className="flex gap-2">
                                {skill.rank !== null && skill.rank !== undefined && (
                                  <span
                                    className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 group-hover:bg-blue-200 transition-colors"
                                    title="EIT's self score"
                                  >
                                    EIT: {skill.rank}
                                  </span>
                                )}
                                {skill.supervisor_score !== null && skill.supervisor_score !== undefined && (
                                  <span
                                    className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 group-hover:bg-green-200 transition-colors"
                                    title="Supervisor's score"
                                  >
                                    Supervisor: {skill.supervisor_score}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </Modal>
      )}
      {/* Nudge Modal */}
      {nudgeModalEIT && (
        <Modal isOpen={!!nudgeModalEIT} onClose={() => setNudgeModalEIT(null)}>
          <div className="w-full max-w-md p-6 bg-white rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Send a Nudge to {nudgeModalEIT.full_name}</h2>
            <textarea
              className="w-full border rounded p-2 mb-3"
              rows={3}
              placeholder="Type your message (or leave blank for a default nudge)"
              value={nudgeMessage}
              onChange={e => setNudgeMessage(e.target.value)}
              disabled={nudgeSending}
            />
            {nudgeError && <div className="text-red-600 text-sm mb-2">{nudgeError}</div>}
            {nudgeSuccess && <div className="text-green-600 text-sm mb-2">{nudgeSuccess}</div>}
            <div className="flex gap-2 justify-end">
              <button className="btn btn-secondary" onClick={() => setNudgeModalEIT(null)} disabled={nudgeSending}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSendNudge} disabled={nudgeSending}>
                {nudgeSending ? 'Sending...' : 'Send Nudge'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SupervisorTeam; 