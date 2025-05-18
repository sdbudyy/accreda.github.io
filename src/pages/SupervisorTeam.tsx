import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface EIT {
  id: string;
  full_name: string;
  email: string;
  organization: string;
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
  // Fetch progress for a given EIT (mimic logic from progress store)
  // 1. Completed skills
  // 2. Documented experiences
  // 3. Supervisor approvals
  // 4. Calculate overall progress
  // (No need to load skills store, just count rows)
  const [skillsRes, expRes, apprRes] = await Promise.all([
    supabase
      .from('skills')
      .select('*', { count: 'exact', head: true })
      .eq('eit_id', eitId),
    supabase
      .from('experiences')
      .select('*', { count: 'exact', head: true })
      .eq('eit_id', eitId),
    supabase
      .from('experiences')
      .select('*', { count: 'exact', head: true })
      .eq('eit_id', eitId)
      .eq('supervisor_approved', true),
  ]);
  const completedSkills = skillsRes.count || 0;
  const documentedExperiences = expRes.count || 0;
  const supervisorApprovals = apprRes.count || 0;
  const skillsProgress = completedSkills / 22;
  const experiencesProgress = documentedExperiences / 24;
  const approvalsProgress = supervisorApprovals / 24;
  const overallProgress = Math.round(((skillsProgress + experiencesProgress + approvalsProgress) / 3) * 100);
  return { overallProgress, completedSkills, documentedExperiences, supervisorApprovals };
};

const SupervisorTeam: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [eits, setEITs] = useState<EIT[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, EITProgress>>({});

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        // Fetch pending requests
        const { data: pendingReqsRaw } = await supabase
          .from('supervisor_eit_relationships')
          .select('id, eit_id, status, created_at, eit_profiles (id, full_name, email)')
          .eq('supervisor_id', user.id)
          .eq('status', 'pending');
        // Fix: eit_profiles should be a single object, not array
        const pendingReqs: PendingRequest[] = (pendingReqsRaw || []).map((req: any) => ({
          ...req,
          eit_profiles: Array.isArray(req.eit_profiles) ? req.eit_profiles[0] : req.eit_profiles
        }));
        setPending(pendingReqs);
        // Fetch active EITs
        const { data: relationshipsRaw } = await supabase
          .from('supervisor_eit_relationships')
          .select('eit_id, eit_profiles (id, full_name, email)')
          .eq('supervisor_id', user.id)
          .eq('status', 'active');
        const eitList: EIT[] = (relationshipsRaw || []).map((rel: any) => Array.isArray(rel.eit_profiles) ? rel.eit_profiles[0] : rel.eit_profiles);
        setEITs(eitList);
        // Fetch progress for each EIT
        const progressEntries = await Promise.all(
          eitList.map(async (eit) => [eit.id, await fetchEITProgress(eit.id)])
        );
        setProgressMap(Object.fromEntries(progressEntries));
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const handleRequest = async (id: string, accept: boolean) => {
    setLoading(true);
    try {
      await supabase
        .from('supervisor_eit_relationships')
        .update({ status: accept ? 'active' : 'denied', updated_at: new Date().toISOString() })
        .eq('id', id);
      // Refresh
      window.location.reload();
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

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
                    <p className="font-medium">{eit.full_name}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{eit.email}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Organization</p>
                    <p className="font-medium">{eit.organization}</p>
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
    </div>
  );
};

export default SupervisorTeam; 