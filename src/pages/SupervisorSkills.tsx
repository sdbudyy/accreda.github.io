import React, { useEffect, useRef, useState, memo } from 'react';
import { useSkillsStore, Skill, Category } from '../store/skills';
import { AlertTriangle, Info } from 'lucide-react';

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
  // ...add more detailed summaries for all other skills as needed...
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

  useEffect(() => {
    loadUserSkills();
  }, [loadUserSkills]);

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

  return (
    <div className="space-y-6">
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
  );
};

export default SupervisorSkills; 