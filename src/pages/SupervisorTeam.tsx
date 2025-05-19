import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';

interface EIT {
  id: string;
  full_name: string;
  email: string;
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

  useEffect(() => {
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
            .select('id, eit_id, status, created_at, eit_profiles (id, full_name, email)')
            .eq('supervisor_id', user.id)
            .eq('status', 'pending'),
          supabase
            .from('supervisor_eit_relationships')
            .select('eit_id, eit_profiles (id, full_name, email)')
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
        const eitList: EIT[] = (relationshipsRes.data || []).map((rel: any) => 
          Array.isArray(rel.eit_profiles) ? rel.eit_profiles[0] : rel.eit_profiles
        );
        setEITs(eitList);

        // Fetch progress for all EITs in parallel
        const progressPromises = eitList.map(eit => fetchEITProgress(eit.id));
        const progressResults = await Promise.all(progressPromises);
        const progressEntries = eitList.map((eit, index) => [eit.id, progressResults[index]]);
        setProgressMap(Object.fromEntries(progressEntries));

      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Failed to load team data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const handleRequest = async (id: string, accept: boolean) => {
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
        if (updatedReq) {
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
    setSelectedEIT(eit);
    setSkillsLoading(true);
    // Log the current supervisor's auth user
    const userResult = await supabase.auth.getUser();
    console.log('Supervisor auth user:', userResult);
    console.log('SupervisorTeam: Fetching skills for EIT', eit.id);
    // Fetch all skills for the EIT (no supervisor_score filter)
    const { data: skills, error } = await supabase
      .from('eit_skills')
      .select('skill_id, rank, supervisor_score, category_name, skill_name, status, eit_id')
      .eq('eit_id', eit.id);
    if (error) console.error('Supabase error:', error);
    console.log('Fetched skills:', skills);
    // Filter to only skills with a supervisor_score
    const filteredSkills = (skills || []).filter((skill: any) => skill.supervisor_score !== null && skill.supervisor_score !== undefined);
    // Organize by category and sort numerically by skill number
    const byCategory: Record<string, any[]> = {};
    filteredSkills.forEach((skill: any) => {
      if (!byCategory[skill.category_name]) byCategory[skill.category_name] = [];
      byCategory[skill.category_name].push(skill);
    });
    console.log('Grouped by category:', byCategory);
    Object.keys(byCategory).forEach(category => {
      byCategory[category].sort((a, b) => {
        // Extract the number from the skill name (e.g., '1.2 ...')
        const numA = parseFloat((a.skill_name.match(/^[\d.]+/) || [0])[0]);
        const numB = parseFloat((b.skill_name.match(/^[\d.]+/) || [0])[0]);
        return numA - numB;
      });
    });
    setSkillsByCategory(byCategory);
    setSkillsLoading(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Team</h1>
      {/* Pending Requests */}
      {pending.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold mb-2 text-yellow-800">Pending Requests</h2>
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
                        <div className="h-full bg-teal-500 rounded-full transition-all duration-300" style={{ width: `${progress.overallProgress}%` }}></div>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500">
                        <span>Skills: {progress.completedSkills}/22</span>
                        <span>Experiences: {progress.documentedExperiences}/24</span>
                        <span>Approvals: {progress.supervisorApprovals}/24</span>
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
          <div className="p-6 max-w-lg mx-auto">
            <h2 className="text-xl font-bold mb-4">{selectedEIT.full_name}'s Marked Skills</h2>
            {skillsLoading ? (
              <div>Loading...</div>
            ) : (
              Object.keys(skillsByCategory).length === 0 ? (
                <div>No marked skills found.</div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(skillsByCategory).map(([category, skills]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-slate-800 mb-2">{category}</h3>
                      <ul className="list-disc ml-6">
                        {skills.map((skill) => (
                          <li key={skill.skill_id} className="mb-1">
                            <span className="font-medium">{skill.skill_name}</span>
                            <span className="text-xs text-slate-500 ml-2">
                              (EIT Score: {skill.rank}, Validator Score: {skill.supervisor_score})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SupervisorTeam; 