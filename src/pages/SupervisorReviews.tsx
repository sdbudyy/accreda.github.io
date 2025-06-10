import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { sendScoreNotification } from '../utils/notifications';
import SAOFeedbackComponent from '../components/saos/SAOFeedback';
import { X, Info, Clock } from 'lucide-react';
import SAOAnnotation from '../components/saos/SAOAnnotation';
import toast from 'react-hot-toast';
import { useNotificationsStore } from '../store/notifications';
import DOMPurify from 'dompurify';
import ScrollToTop from '../components/ScrollToTop';
import { useSAOsStore } from '../store/saos';

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

// Add SKILL_SUMMARIES mapping for rubric info
const SKILL_SUMMARIES: Record<string, string> = {
  '1.1 Regulations, Codes & Standards': `Correct selection and application of statutory and technical requirements.
Evidence: Explicit citation of CSA, IEC, ABSA, etc.; design reviews addressing code clauses.
Level cues:
1 = can name relevant codes.
3 = interprets and applies clauses without oversight.
5 = authoring corporate standards; mentoring others on compliance.`,
  '1.2 Technical & Design Constraints': `Identifying limits (temperature, load, schedule) and designing within them.
Evidence: Trade-off studies, design margin calculations, interdisciplinary coordination notes.
Level cues:
1 = recognises simple constraints given by others.
3 = optimises design under multiple constraints.
5 = sets project-wide constraint envelopes and negotiates them.`,
  '1.3 Risk Management for Technical Work': `Systematic identification and mitigation of technical risks (distinct from safety).
Evidence: FMEA tables, hazard logs, risk registers with action plans.
Level cues:
1 = attends risk meetings.
3 = creates risk matrix and closes actions.
5 = institutionalises risk methodologies across projects.`,
  '1.4 Application of Theory': `Using engineering science to create or validate designs.
Evidence: Hand calculations, simulation models, design notes.
Level cues:
1 = performs textbook calcs shown by others.
3 = selects appropriate theory and justifies assumptions.
5 = derives novel analytical methods adopted by peers.`,
  '1.5 Solution Techniques & Results Verification': `Self-checking, peer-reviewing, and validating outputs.
Evidence: Check prints, back-calculations, test-vs-model comparisons.
Level cues:
1 = runs software without independent check.
3 = uses alternative method to cross-verify.
5 = implements QA verification workflows enterprise-wide.`,
  '1.6 Safety in Design & Technical Work': `Integrating safety / HAZOP thinking into technical tasks.
Evidence: SIL/LOPA studies, safety factors, safeguard design notes.
Level cues:
1 = attends toolbox talks.
3 = designs safety features and documents residual risk.
5 = chairs safety reviews and influences corporate safety culture.`,
  '1.7 Systems & Their Components': `Understanding and managing interactions within complex systems.
Evidence: System block diagrams, interface registers, control narratives.
Level cues:
1 = works on single component.
3 = balances interfaces across disciplines.
5 = architects whole-of-plant integration strategies.`,
  '1.8 Project or Asset Life-Cycle Awareness': `Considering feasibility through decommissioning.
Evidence: Stage-gate reports, O&M cost analyses, end-of-life plans.
Level cues:
1 = aware of immediate project phase.
3 = optimises design for O&M and eventual retirement.
5 = leads life-cycle cost optimisation across portfolio.`,
  '1.9 Quality Assurance': `Ensuring designs and deliverables meet defined quality criteria.
Evidence: ITPs, NCR resolution, audit findings.
Level cues:
1 = follows checklists.
3 = designs QA checks and resolves NCRs.
5 = drives continuous-improvement programs, reduces defect rates.`,
  '1.10 Engineering Documentation': `Creating clear drawings, reports, calculations.
Evidence: Issued-for-construction packages, calculation books.
Level cues:
1 = fills templates.
3 = authors multi-disciplinary documents accepted without major edits.
5 = sets documentation standards and trains staff.`,
  '2.1 Oral Communication (English)': `Clear, professional spoken English (presentations, meetings).
Evidence: Recorded presentations, client kick-off meetings.
Level cues:
1 = reads prepared notes.
3 = leads technical meetings, answers questions concisely.
5 = facilitates high-stakes negotiations.`,
  '2.2 Written Communication (English)': `Clear, structured technical writing.
Evidence: Formal reports, proposals, standards.
Level cues:
1 = grammar issues persist.
3 = reports accepted by clients without rewrite.
5 = publishes guidance documents adopted by organisation.`,
  '2.3 Reading & Comprehension (English)': `Using written technical material effectively.
Evidence: Mark-ups showing critical review, code interpretation memos.
Level cues:
1 = needs help interpreting dense specs.
3 = extracts crucial requirements, flags conflicts.
5 = synthesises complex literature into design policy.`,
  '3.1 Project Management Principles': `Scope, schedule, risk, change control.
Evidence: Gantt charts, change-order logs, status reports.
Level cues:
1 = tracks own tasks only.
3 = develops baselines, mitigates slippage.
5 = manages multi-discipline programs, mentors PMs.`,
  '3.2 Finances & Budget': `Cost estimating, cash-flow tracking, value engineering.
Evidence: CAPEX/OPEX estimates, variance analyses.
Level cues:
1 = inputs timesheets.
3 = owns WBS cost code, forecasts EAC accurately.
5 = optimises portfolio budgets, secures funding approvals.`,
  '4.1 Promote Team Effectiveness & Resolve Conflict': `Fostering collaboration and addressing interpersonal issues.
Evidence: Meeting minutes, stakeholder feedback, conflict-resolution plans.
Level cues:
1 = participates politely.
3 = facilitates consensus, resolves minor conflicts.
5 = leads high-tension negotiations, builds high-performing multi-site teams.`,
  '5.1 Professional Accountability (Ethics, Liability, Limits)': `Acting ethically, declaring limits, managing conflicts of interest.
Evidence: Signed professional-practice declarations, ethics case notes.
Level cues:
1 = knows the Code of Ethics exists.
3 = raises concerns proactively, seeks guidance.
5 = champions ethical culture, develops training modules.`,
  '6.1 Protection of the Public Interest': `Safety audits, public-impact assessments.
Evidence: Safety audits, public-impact assessments.
Level cues:
1 = identifies obvious hazards.
3 = designs to mitigate societal risk.
5 = influences public-safety policy.`,
  '6.2 Benefits of Engineering to the Public': `Community engagement records, cost-benefit studies.
Evidence: Community engagement records, cost-benefit studies.
Level cues:
1 = mentions public benefit.
3 = quantifies benefits, presents to stakeholders.
5 = leads projects delivering measurable public value.`,
  '6.3 Role of Regulatory Bodies': `Compliance registers, correspondence with AHJs.
Evidence: Compliance registers, correspondence with AHJs.
Level cues:
1 = names APEGA.
3 = coordinates approvals with multiple regulators.
5 = advises regulators, serves on industry committees.`,
  '6.4 Application of Sustainability Principles': `Life-cycle carbon analyses, circular-economy studies.
Evidence: Life-cycle carbon analyses, circular-economy studies.
Level cues:
1 = reuses specs.
3 = optimises design for energy/resource efficiency.
5 = drives corporate ESG strategy.`,
  '6.5 Promotion of Sustainability': `Training sessions delivered, sustainability KPIs met.
Evidence: Training sessions delivered, sustainability KPIs met.
Level cues:
1 = attends webinars.
3 = implements team sustainability actions.
5 = publishes best-practice guides, influences supply chain.`
};

// Helper to format rubric string into sections
function formatRubric(skillName: string) {
  const rubric = SKILL_SUMMARIES[skillName];
  if (!rubric) return <span>No summary available for this skill.</span>;
  // Split into sections
  const [definition, evidenceLine, ...levelLines] = rubric.split(/\n|\r/).filter(Boolean);
  const evidence = evidenceLine?.replace(/^Evidence:/, '').trim();
  const levelCues = levelLines.filter(l => l.trim().match(/^\d/));
  return (
    <div>
      <div className="mb-2">
        <span className="font-semibold">Skill Definition:</span>
        <span className="block text-slate-700 mt-1">{definition}</span>
      </div>
      {evidence && (
        <div className="mb-2">
          <span className="font-semibold">Evidence supervisors might look for:</span>
          <ul className="list-disc ml-6 mt-1 text-slate-700">
            {evidence.split(';').map((ev, i) => <li key={i}>{ev.trim()}</li>)}
          </ul>
        </div>
      )}
      {levelCues.length > 0 && (
        <div className="mb-1">
          <span className="font-semibold">Level-specific indicators (cues):</span>
          <ul className="mt-1 ml-6 text-slate-700">
            {levelCues.map((cue, i) => {
              const match = cue.match(/^(\d)\s*=\s*(.*)$/);
              return match ? (
                <li key={i}><span className="font-bold">{match[1]}</span>: {match[2]}</li>
              ) : <li key={i}>{cue}</li>;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// Utility to convert HTML to plain text for annotation system
function htmlToPlainText(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

const SupervisorReviews: React.FC = () => {
  const [tab, setTab] = useState<'skills' | 'saos'>('skills');
  const [selectedEIT, setSelectedEIT] = useState<string>('all');

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

  // --- Additional State ---
  const [rubricSkill, setRubricSkill] = useState<string | null>(null);
  const [showHistoryMode, setShowHistoryMode] = useState(false);
  const [pendingValidators, setPendingValidators] = useState<Validator[]>([]);
  const [pendingSAOs, setPendingSAOs] = useState<SAOFeedback[]>([]);
  const [allSAOs, setAllSAOs] = useState<SAOFeedback[]>([]);
  const [submitLoading, setSubmitLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { notifications, markAsRead } = useNotificationsStore();
  const { submitFeedback } = useSAOsStore();

  // Filter validators and SAOs based on selected EIT
  const filteredValidators = selectedEIT === 'all' 
    ? pendingValidators 
    : pendingValidators.filter(v => v.eit_id === selectedEIT);

  const filteredSAOs = selectedEIT === 'all'
    ? pendingSAOs
    : pendingSAOs.filter(s => s.sao?.eit_id === selectedEIT);

  const filteredHistory = selectedEIT === 'all'
    ? history
    : Object.fromEntries(
        Object.entries(history).filter(([key]) => key.startsWith(selectedEIT + '_'))
      );

  // --- Fetch Skill Validation Requests ---
  useEffect(() => {
    const fetchAllReviewedSkills = async () => {
      setLoadingSkills(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Fetch all validations by this supervisor
      const { data: validations, error } = await supabase
        .from('skill_validations')
        .select('*')
        .eq('validator_id', user.id)
        .order('validated_at', { ascending: false });
      // Fetch pending validations (from validators table)
      const { data: pending, error: pendingError } = await supabase
        .from('validators')
        .select('*')
        .eq('email', user.email)
        .eq('status', 'pending');
      if (error || !validations) { setLoadingSkills(false); return; }
      // For each validation, get EIT and skill info
      const eitIds = Array.from(new Set([
        ...validations.map(v => v.eit_id),
        ...(pending || []).map(v => v.eit_id)
      ]));
      const skillIds = Array.from(new Set([
        ...validations.map(v => v.skill_id),
        ...(pending || []).map(v => v.skill_id)
      ]));
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
      // Group validations by (eit_id, skill_id)
      const grouped: Record<string, any[]> = {};
      validations.forEach(v => {
        const key = `${v.eit_id}_${v.skill_id}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(v);
      });
      // For display, use the most recent validation for each (eit_id, skill_id)
      const latestValidators: Validator[] = Object.values(grouped).map(vList => {
        const latest = vList[0];
        return {
          id: `${latest.eit_id}_${latest.skill_id}`,
          skill_id: latest.skill_id,
          full_name: eitMap[latest.eit_id]?.full_name || '',
          email: eitMap[latest.eit_id]?.email || '',
          description: latest.feedback || '',
          status: 'completed',
          score: latest.score,
          created_at: latest.validated_at,
          updated_at: latest.validated_at,
          eit_id: latest.eit_id,
        };
      });
      setValidators(latestValidators);
      setPendingValidators((pending || []).map(v => ({
        ...v,
        id: v.id // This should be the UUID from the DB
      })));
      // Set up history for each (eit_id, skill_id)
      setHistory(grouped);
      setLoadingSkills(false);
    };
    fetchAllReviewedSkills();
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
        .select(`*, sao:saos (title, situation, action, outcome, content, created_at, eit_id)`)
        .eq('supervisor_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAllSAOs(data || []);
      setPendingSAOs((data || []).filter((req: SAOFeedback) => req.status === 'pending'));
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
    try {
      setSubmitLoading(validator.id);
      setSuccessMessage(null);
      const score = scoreInputs[validator.id];
      if (!score || score < 1 || score > 5) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Update the validator row with the score and feedback
      const { error: updateError } = await supabase
        .from('validators')
        .update({
          score: score,
          description: validator.description, // feedback
          status: 'scored',
          updated_at: new Date().toISOString()
        })
        .eq('id', validator.id);
      if (updateError) throw updateError;
      // Insert into skill_validations for audit/history
      const { error: insertError } = await supabase
        .from('skill_validations')
        .insert({
          validator_id: user.id,
          eit_id: validator.eit_id,
          skill_id: validator.skill_id,
          score: score,
          feedback: validator.description,
          validated_at: new Date().toISOString()
        });
      if (insertError) throw insertError;
      // Remove from pendingValidators
      setPendingValidators(prev => prev.filter(v => v.id !== validator.id));
      setScoreInputs(prev => {
        const next = { ...prev };
        delete next[validator.id];
        return next;
      });
      // Send notification
      const skill = skills[validator.skill_id];
      await sendScoreNotification(validator.eit_id, skill ? skill.name : validator.skill_id, score);
      // Update eit_skills table
      await supabase
        .from('eit_skills')
        .update({ supervisor_score: score })
        .eq('eit_id', validator.eit_id)
        .eq('skill_id', validator.skill_id);
      // Mark related validation_request notification as read
      const skillName = skill ? skill.name : validator.skill_id;
      notifications.filter(n =>
        n.type === 'validation_request' &&
        !n.read &&
        n.data && n.data.skillName === skillName
      ).forEach(n => markAsRead(n.id));
      setSuccessMessage('Score submitted successfully!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (error: any) {
      console.error('Error submitting score:', error);
      toast.error(error.message || 'Error submitting score');
    } finally {
      setSubmitLoading(null);
    }
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
    setSubmitLoading(saoId);
    setSuccessMessage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await submitFeedback(saoId, feedback);
      setAllSAOs((prev) =>
        prev.map((f) =>
          f.sao_id === saoId ? { ...f, feedback, status: 'submitted' } : f
        )
      );
      setPendingSAOs((prev) =>
        prev.filter((f) => !(f.sao_id === saoId && f.status !== 'pending'))
      );
      setIsSAOModalOpen(false);
      setSelectedSAO(null);
      // Mark related SAO validation_request notification as read
      notifications.filter(n =>
        n.type === 'validation_request' &&
        !n.read &&
        n.data && n.data.saoTitle && selectedSAO && n.data.saoTitle === selectedSAO.sao?.title
      ).forEach(n => markAsRead(n.id));
      setSuccessMessage('Feedback submitted successfully!');
      setTimeout(() => setSuccessMessage(null), 2000);
      toast.success('Feedback submitted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error submitting feedback');
    } finally {
      setSubmitLoading(null);
    }
  };

  // --- UI ---
  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Review Center</h1>
        </div>
        {/* Top Controls Row: History (left), Toggle (center), Refresh & EIT Filter (right) */}
        <div className="flex items-center justify-between my-8 w-full">
          {/* Left: Refresh Button */}
          <div className="flex items-center">
            <button
              onClick={tab === 'skills' ? () => window.location.reload() : fetchFeedbackRequests}
              disabled={loadingSkills || loadingSAOs}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(loadingSkills && tab === 'skills') || (loadingSAOs && tab === 'saos') ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          {/* Center: Tab Toggle */}
          <div className="flex-1 flex justify-center">
            <div className="relative flex bg-slate-100 rounded-full p-1 shadow-inner gap-0 items-center">
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
          {/* Right: EIT Filter Dropdown & History Button */}
          <div className="flex items-center gap-2">
            <div className="ml-2 flex items-center gap-2">
              <label htmlFor="eit-filter" className="text-sm font-medium text-slate-700">
                Filter by EIT:
              </label>
              <select
                id="eit-filter"
                value={selectedEIT}
                onChange={(e) => setSelectedEIT(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="all">All EITs</option>
                {Object.values(eitProfiles).map((eit) => (
                  <option key={eit.id} value={eit.id}>
                    {eit.full_name}
                  </option>
                ))}
              </select>
            </div>
            <button
              className={`p-2 rounded-full text-slate-500 hover:bg-slate-200 transition ${showHistoryMode ? 'bg-slate-300' : ''}`}
              title="Show History"
              onClick={() => setShowHistoryMode((prev) => !prev)}
              type="button"
            >
              <Clock size={20} />
            </button>
          </div>
        </div>
        {/* Skills Tab */}
        {tab === 'skills' && !showHistoryMode && (
          <div>
            {loadingSkills ? (
              <div>Loading...</div>
            ) : filteredValidators.length === 0 ? (
              <div>No pending skill validation requests.</div>
            ) : (
              <div className="space-y-4">
                {successMessage && (
                  <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm mb-4">{successMessage}</div>
                )}
                {filteredValidators.map((validator) => {
                  const eit = eitProfiles[validator.eit_id];
                  const skill = skills[validator.skill_id];
                  return (
                    <div 
                      key={validator.id} 
                      className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-300"
                    >
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          Skill: {skill ? skill.name : validator.skill_id}
                          {skill && (
                            <button
                              className="ml-1 p-1 rounded-full text-blue-500 hover:bg-blue-50"
                              title="View Skill Rubric"
                              onClick={() => setRubricSkill(skill.name)}
                              type="button"
                            >
                              <Info size={18} />
                            </button>
                          )}
                        </div>
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
                          placeholder="Score"
                        />
                        <button
                          className="btn btn-primary flex items-center gap-2"
                          onClick={() => handleSubmit(validator)}
                          disabled={submitLoading === validator.id || !scoreInputs[validator.id] || scoreInputs[validator.id] < 1 || scoreInputs[validator.id] > 5}
                        >
                          {submitLoading === validator.id ? (
                            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                          ) : 'Submit Score'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* History Mode */}
        {tab === 'skills' && showHistoryMode && (
          <div>
            <div className="text-xl font-bold mb-4">History</div>
            {loadingSkills ? (
              <div>Loading...</div>
            ) : Object.keys(filteredHistory).length === 0 ? (
              <div>No history available.</div>
            ) : (
              <div className="space-y-4">
                {Object.entries(filteredHistory).map(([key, entries]) => {
                  const latest = entries[0];
                  const eit = eitProfiles[latest.eit_id];
                  const skill = skills[latest.skill_id];
                  return (
                    <div
                      key={key}
                      className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-300"
                    >
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          Skill: {skill ? skill.name : latest.skill_id}
                          {skill && (
                            <button
                              className="ml-1 p-1 rounded-full text-blue-500 hover:bg-blue-50"
                              title="View Skill Rubric"
                              onClick={() => setRubricSkill(skill.name)}
                              type="button"
                            >
                              <Info size={18} />
                            </button>
                          )}
                        </div>
                        <div className="text-slate-600">EIT: {eit ? `${eit.full_name} (${eit.email})` : latest.eit_id}</div>
                        <div className="text-slate-600">Description: {latest.feedback || ''}</div>
                        <div className="mt-3 border-t pt-3">
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {entries.map((h, idx) => (
                              <div key={idx} className="bg-slate-50 rounded-lg p-2 text-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-slate-700">Score: {h.score}</span>
                                  <span className="text-xs text-slate-500">
                                    {h.validated_at ? new Date(h.validated_at).toLocaleDateString() : ''}
                                  </span>
                                </div>
                                {h.feedback && (
                                  <div className="text-slate-600 text-xs mt-1">
                                    <span className="font-medium">Feedback:</span> {h.feedback}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={scoreInputs[`${latest.eit_id}_${latest.skill_id}`] || ''}
                          onChange={(e) => handleScoreChange(`${latest.eit_id}_${latest.skill_id}`, Number(e.target.value))}
                          className="input w-24"
                          placeholder="Score"
                        />
                        <button
                          className="btn btn-primary"
                          onClick={() => handleSubmit({
                            ...latest,
                            id: `${latest.eit_id}_${latest.skill_id}`,
                            description: latest.feedback || ''
                          })}
                          disabled={!scoreInputs[`${latest.eit_id}_${latest.skill_id}`] || scoreInputs[`${latest.eit_id}_${latest.skill_id}`] < 1 || scoreInputs[`${latest.eit_id}_${latest.skill_id}`] > 5}
                        >
                          Update Score
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
        {tab === 'saos' && !showHistoryMode && (
          <div>
            {loadingSAOs ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : filteredSAOs.length === 0 ? (
              <div className="text-slate-500">No pending feedback requests assigned to you.</div>
            ) : (
              <div className="space-y-4">
                {filteredSAOs.map((req) => (
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === 'saos' && showHistoryMode && (
          <div>
            <div className="text-xl font-bold mb-4">History</div>
            {loadingSAOs ? (
              <div>Loading...</div>
            ) : allSAOs.filter((req) => req.status === 'submitted').length === 0 ? (
              <div className="text-slate-500">No SAO history available.</div>
            ) : (
              <div className="space-y-4">
                {allSAOs.filter((req) => req.status === 'submitted').map((req) => (
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
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Feedback Submitted
                        </span>
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
                  <div className="bg-slate-50 rounded-lg p-4 mb-4 prose prose-sm max-w-none">
                    <div>
                      <div className="font-semibold mb-1">Situation</div>
                      <div className="mb-3" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedSAO.sao && ('situation' in selectedSAO.sao ? (selectedSAO.sao as any).situation : (selectedSAO.sao.content ? selectedSAO.sao.content.split('---')[0] : '')) || '') }} />
                      <div className="font-semibold mb-1">Action</div>
                      <div className="mb-3" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedSAO.sao && ('action' in selectedSAO.sao ? (selectedSAO.sao as any).action : (selectedSAO.sao.content ? selectedSAO.sao.content.split('---')[1] : '')) || '') }} />
                      <div className="font-semibold mb-1">Outcome</div>
                      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedSAO.sao && ('outcome' in selectedSAO.sao ? (selectedSAO.sao as any).outcome : (selectedSAO.sao.content ? selectedSAO.sao.content.split('---')[2] : '')) || '') }} />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mb-2">Highlight text below to add a comment (plain text only)</div>
                  <div className="mb-4">
                    <div className="font-semibold mb-1">Situation</div>
                    <SAOAnnotation
                      saoId={selectedSAO.sao_id}
                      content={htmlToPlainText((selectedSAO.sao as any).situation || '')}
                    />
                  </div>
                  <div className="mb-4">
                    <div className="font-semibold mb-1">Action</div>
                    <SAOAnnotation
                      saoId={selectedSAO.sao_id}
                      content={htmlToPlainText((selectedSAO.sao as any).action || '')}
                    />
                  </div>
                  <div>
                    <div className="font-semibold mb-1">Outcome</div>
                    <SAOAnnotation
                      saoId={selectedSAO.sao_id}
                      content={htmlToPlainText((selectedSAO.sao as any).outcome || '')}
                    />
                  </div>
                </div>

                <SAOFeedbackComponent
                  feedback={[selectedSAO]}
                  onResolve={handleResolve}
                  onSubmitFeedback={handleSubmitFeedback}
                  isSupervisor={true}
                  saoContent={selectedSAO.sao?.content}
                />
              </div>
            </div>
          </div>
        )}

        {/* Rubric Modal */}
        {rubricSkill && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
              <button
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
                onClick={() => setRubricSkill(null)}
              >
                ×
              </button>
              <h3 className="text-lg font-semibold mb-4">{rubricSkill}</h3>
              {formatRubric(rubricSkill)}
            </div>
          </div>
        )}
      </div>
      <ScrollToTop />
    </>
  );
};

export default SupervisorReviews; 