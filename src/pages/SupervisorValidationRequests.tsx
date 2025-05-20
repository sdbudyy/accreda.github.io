import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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

// Add this function at the top-level (outside the component)
async function markSkillAsSupervisor(eitId: string, skillId: string, supervisorScore: number) {
  const { error } = await supabase
    .from('eit_skills')
    .update({
      supervisor_score: supervisorScore,
      status: 'completed'
    })
    .eq('eit_id', eitId)
    .eq('skill_id', skillId);
  if (error) {
    console.error('Error updating supervisor score:', error);
    throw error;
  }
}

const SupervisorValidationRequests: React.FC = () => {
  const [validators, setValidators] = useState<Validator[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoreInputs, setScoreInputs] = useState<Record<string, number>>({});
  const [eitProfiles, setEITProfiles] = useState<Record<string, EITProfile>>({});
  const [skills, setSkills] = useState<Record<string, Skill>>({});

  useEffect(() => {
    const fetchValidatorsAndMeta = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: validators, error } = await supabase
        .from('validators')
        .select('*')
        .eq('email', user.email)
        .eq('status', 'pending');
      if (error || !validators) { setLoading(false); return; }
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
      setLoading(false);
    };
    fetchValidatorsAndMeta();
  }, []);

  const handleScoreChange = (id: string, value: number) => {
    setScoreInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (validator: Validator) => {
    const score = scoreInputs[validator.id];
    if (!score || score < 1 || score > 5) return;
    // Update validators table
    await supabase
      .from('validators')
      .update({ status: 'scored', score })
      .eq('id', validator.id);
    // Update eit_skills table using the new function
    await markSkillAsSupervisor(validator.eit_id, validator.skill_id, score);
    setValidators((prev) => prev.filter((v) => v.id !== validator.id));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Skill Validation Requests</h1>
      {validators.length === 0 ? (
        <div>No pending validation requests.</div>
      ) : (
        <div id="validation-requests" className="space-y-4">
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
  );
};

export default SupervisorValidationRequests; 