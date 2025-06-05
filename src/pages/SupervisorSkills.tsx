import React, { useEffect, useRef, useState, memo } from 'react';
import { useSkillsStore, Skill, Category } from '../store/skills';
import { AlertTriangle, Info, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';

// Expanded skill summaries for each skill
const SKILL_SUMMARIES: Record<string, string> = {
  '1.1 Regulations, Codes & Standards': `Demonstrates knowledge and application of relevant regulations, codes, standards, and safety requirements in engineering practice. This includes identifying which standards apply to a given project, ensuring compliance, and keeping up to date with changes in the regulatory environment. Example: Ensuring a design meets all applicable building codes and safety standards.`,
  '1.2 Technical & Design Constraints': `Understands and works within technical and design constraints, including limitations of materials, processes, and systems. Able to identify constraints early in the design process and adapt solutions accordingly. Example: Designing a bridge that meets both load requirements and material limitations.`,
  '1.3 Risk Management for Technical Work': `Identifies, assesses, and manages risks associated with technical work. This includes conducting risk assessments, implementing mitigation strategies, and monitoring risk throughout the project lifecycle. Example: Performing a hazard analysis for a new manufacturing process.`,
  '1.4 Application of Theory': `Applies engineering theory and principles to solve practical problems. Demonstrates the ability to use theoretical knowledge in real-world situations. Example: Using fluid dynamics equations to design a piping system.`,
  '1.5 Solution Techniques – Results Verification': `Selects and applies appropriate solution techniques and verifies results for accuracy and reliability. Example: Double-checking calculations and using simulation software to validate a design.`,
  '1.6 Safety in Design & Technical Work': `Prioritizes safety in all aspects of design and technical work. Identifies potential hazards and incorporates safety measures into engineering solutions. Example: Designing a machine with proper guarding to prevent operator injury.`,
  '1.7 Systems & Their Components': `Understands how systems and their components interact. Able to analyze and optimize system performance. Example: Evaluating the impact of a new component on an existing electrical system.`,
  '1.8 Project or Asset Life-Cycle Awareness': `Considers the entire life cycle of a project or asset, from conception to decommissioning. Example: Selecting materials that minimize maintenance costs over the lifespan of a product.`,
  '1.9 Quality Assurance': `Implements quality assurance processes to ensure deliverables meet required standards. Example: Developing and following a quality control checklist for a construction project.`,
  '1.10 Engineering Documentation': `Prepares clear, accurate, and comprehensive engineering documentation. Example: Writing detailed reports, specifications, and drawings that can be understood by others.`,
  '2.1 Oral Communication (English)': `Communicates effectively in spoken English with colleagues, clients, and stakeholders. Example: Leading a project meeting or presenting technical information to a non-technical audience.`,
  '2.2 Written Communication (English)': `Communicates effectively in written English, producing clear and concise reports, emails, and documentation. Example: Writing a technical report or project proposal.`,
  '2.3 Reading & Comprehension (English)': `Reads and comprehends technical documents, standards, and instructions in English. Example: Interpreting a complex engineering standard or technical manual.`,
  '3.1 Project Management Principles': `Applies project management principles to plan, execute, and close projects successfully. Example: Creating a project schedule, managing resources, and tracking progress.`,
  '3.2 Finances & Budget': `Manages project finances and budgets, including cost estimation, tracking, and reporting. Example: Preparing a project budget and monitoring expenses to stay within limits.`,
  '4.1 Promote Team Effectiveness & Resolve Conflict': `Demonstrates the ability to work effectively in teams, resolve conflicts, and promote collaboration. Example: Facilitating a team meeting to resolve technical disagreements and reach consensus.`,
  '5.1 Professional Accountability (Ethics, Liability, Limits)': `Understands and applies professional ethics, legal responsibilities, and limitations in engineering practice. Example: Making decisions that prioritize public safety and environmental protection while considering legal implications.`,
  '6.1 Protection of the Public Interest': `Prioritizes public safety, health, and welfare in engineering decisions and actions. Example: Ensuring a design meets all safety requirements and minimizes potential risks to the public.`,
  '6.2 Benefits of Engineering to the Public': `Understands and communicates how engineering solutions benefit society and improve quality of life. Example: Explaining how a new infrastructure project will improve community access and safety.`,
  '6.3 Role of Regulatory Bodies': `Understands the role and importance of regulatory bodies in engineering practice. Example: Working with building inspectors to ensure compliance with local regulations.`,
  '6.4 Application of Sustainability Principles': `Applies sustainability principles to engineering solutions, considering environmental, social, and economic impacts. Example: Designing a building with energy-efficient systems and sustainable materials.`,
  '6.5 Promotion of Sustainability': `Actively promotes and implements sustainable practices in engineering work. Example: Leading initiatives to reduce waste and energy consumption in manufacturing processes.`
};

const SkillItem = memo(({ skill, skillRef }: { skill: Skill, skillRef?: (el: HTMLDivElement | null) => void }) => {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <>
      <div ref={skillRef} className="flex items-center justify-between p-3 rounded-lg border hover:border-slate-300 hover:bg-slate-50 transition-colors">
        <span className="font-medium">{skill.name}</span>
        <button
          className="p-2 rounded-full text-blue-500 hover:bg-blue-50"
          onClick={() => setShowInfo(true)}
          title="More Info"
        >
          <Info size={18} />
        </button>
      </div>
      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
              onClick={() => setShowInfo(false)}
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-2">{skill.name}</h3>
            <p className="text-slate-700 text-base">
              {SKILL_SUMMARIES[skill.name] || 'No summary available for this skill.'}
            </p>
          </div>
        </div>
      )}
    </>
  );
});

const CategorySection = memo(({ category }: { category: Category }) => (
  <div className="card">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">{category.name}</h2>
    </div>
    <div className="space-y-3">
      {category.skills.map((skill) => (
        <SkillItem key={skill.id} skill={skill} />
      ))}
    </div>
  </div>
));

const SupervisorSkills: React.FC = () => {
  const { skillCategories, loadUserSkills, loading, error } = useSkillsStore();
  const skillRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [categoryAverages, setCategoryAverages] = useState<Record<string, { eitSelfAvg: number; supervisorAvg: number; completionRate: number }>>({});
  const navigate = useNavigate();
  const location = useLocation();

  const categoryColors = ['#14b8a6', '#3b82f6', '#6366f1', '#a21caf', '#ec4899', '#22c55e']; // teal, blue, indigo, purple, pink, green

  useEffect(() => {
    async function fetchAndCalculate() {
      await loadUserSkills();
      await calculateCategoryAverages();
    }
    fetchAndCalculate();
  }, [loadUserSkills, location]);

  // Scroll and highlight functionality
  useEffect(() => {
    const handleScrollToSkill = (e: CustomEvent) => {
      const { skillId, timestamp } = e.detail;
      setTimeout(() => {
        const el = skillRefs.current[skillId];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring', 'ring-teal-400', 'highlight-item');
          setTimeout(() => el.classList.remove('ring', 'ring-teal-400', 'highlight-item'), 1500);
        }
      }, 100);
    };
    window.addEventListener('scroll-to-skill', handleScrollToSkill as EventListener);
    return () => window.removeEventListener('scroll-to-skill', handleScrollToSkill as EventListener);
  }, []);

  // Add new function to calculate category averages and completion rates
  const calculateCategoryAverages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all EITs connected to this supervisor
      const { data: eitConnections, error: connectionsError } = await supabase
        .from('supervisor_eit_relationships')
        .select('eit_id')
        .eq('supervisor_id', user.id);

      if (connectionsError) throw connectionsError;

      const eitIds = eitConnections.map(conn => conn.eit_id);

      // Get all skills for these EITs
      const { data: skills, error: skillsError } = await supabase
        .from('eit_skills')
        .select('*')
        .in('eit_id', eitIds);

      if (skillsError) throw skillsError;

      // Calculate averages and completion rates for each category
      const categoryStats: Record<string, {
        eitSelfScores: number[];
        supervisorScores: number[];
        completed: number;
        total: number;
        eitCount: number;
      }> = {};
      // Initialize category stats
      skillCategories.forEach(category => {
        categoryStats[category.name] = {
          eitSelfScores: [],
          supervisorScores: [],
          completed: 0,
          total: category.skills.length * eitIds.length,
          eitCount: eitIds.length
        };
      });
      skills.forEach(skill => {
        const category = skillCategories.find(cat =>
          cat.skills.some(s => s.id === skill.skill_id)
        );
        if (category) {
          if (skill.rank !== null && skill.rank !== undefined) {
            categoryStats[category.name].eitSelfScores.push(skill.rank);
          }
          if (skill.supervisor_score !== null && skill.supervisor_score !== undefined) {
            categoryStats[category.name].supervisorScores.push(skill.supervisor_score);
            categoryStats[category.name].completed += 1;
          }
        }
      });
      // Calculate final averages
      const averages: Record<string, { eitSelfAvg: number; supervisorAvg: number; completionRate: number }> = {};
      Object.entries(categoryStats).forEach(([category, stats]) => {
        const eitSelfTotal = stats.eitSelfScores.reduce((sum, score) => sum + score, 0);
        const eitSelfCount = stats.eitSelfScores.length;
        const supervisorTotal = stats.supervisorScores.reduce((sum, score) => sum + score, 0);
        const supervisorCount = stats.supervisorScores.length;
        averages[category] = {
          eitSelfAvg: eitSelfCount > 0 ? Number((eitSelfTotal / eitSelfCount).toFixed(2)) : 0,
          supervisorAvg: supervisorCount > 0 ? Number((supervisorTotal / supervisorCount).toFixed(2)) : 0,
          completionRate: stats.total > 0 ? Number(((stats.completed / stats.total) * 100).toFixed(1)) : 0
        };
      });
      setCategoryAverages(averages);
    } catch (error) {
      console.error('Error calculating category averages:', error);
    }
  };

  useEffect(() => {
    calculateCategoryAverages();
  }, []);

  const getMeanColor = (mean: number) => {
    if (mean >= 4.5) return 'bg-green-100 text-green-700';
    if (mean >= 3.5) return 'bg-blue-100 text-blue-700';
    if (mean >= 2.5) return 'bg-yellow-100 text-yellow-700';
    if (mean >= 1.5) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-blue-500';
    if (rate >= 40) return 'bg-yellow-500';
    if (rate >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center">
            <Award size={24} className="mr-2 text-teal-600" />
            Skills
          </h1>
        </div>

        {/* Category Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {skillCategories.map((category, index) => {
            const averagesForCat = categoryAverages[category.name] || { eitSelfAvg: 0, supervisorAvg: 0, completionRate: 0 };
            const color = categoryColors[index % categoryColors.length];
            return (
              <div key={category.name} className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-slate-900 text-lg">{category.name}</h3>
                </div>
                <div className="space-y-5">
                  {/* Average EIT Self Score */}
                  <div className="flex items-center gap-4">
                    <span className="w-40 text-base font-semibold">Average EIT Self Score</span>
                    <div className="w-10 flex-shrink-0 flex justify-center">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 text-slate-800 text-sm font-bold border border-slate-200">
                        {Math.round((averagesForCat.eitSelfAvg / 5) * 100)}%
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="w-full max-w-[160px] bg-slate-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(averagesForCat.eitSelfAvg / 5) * 100}%`, background: color }}
                        />
                      </div>
                    </div>
                    <div className="w-14 text-xs text-slate-500 text-right">
                      {averagesForCat.eitSelfAvg.toFixed(2)}/5.0
                    </div>
                  </div>
                  {/* Average Supervisor Score */}
                  <div className="flex items-center gap-4">
                    <span className="w-40 text-base font-semibold">Average Supervisor Score</span>
                    <div className="w-10 flex-shrink-0 flex justify-center">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 text-slate-800 text-sm font-bold border border-slate-200">
                        {Math.round((averagesForCat.supervisorAvg / 5) * 100)}%
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="w-full max-w-[160px] bg-slate-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(averagesForCat.supervisorAvg / 5) * 100}%`, background: color }}
                        />
                      </div>
                    </div>
                    <div className="w-14 text-xs text-slate-500 text-right">
                      {averagesForCat.supervisorAvg.toFixed(2)}/5.0
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Skills & Competencies</h1>
          <p className="text-slate-500 mt-1">View the EIT program competencies</p>
        </div>
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {skillCategories.map((category) => (
              <div className="card" key={category.name}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">{category.name}</h2>
                </div>
                <div className="space-y-3">
                  {category.skills.map((skill) => (
                    <SkillItem key={skill.id} skill={skill} skillRef={el => (skillRefs.current[skill.id] = el)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ScrollToTop />
    </>
  );
};

export default SupervisorSkills; 