import React, { useEffect, useCallback, useRef, memo, useMemo, useState, Suspense } from 'react';
import { Star, Circle, CheckCircle2, ChevronDown, Award, AlertTriangle, Check, CircleDot, FileText, Briefcase, Info } from 'lucide-react';
import { useSkillsStore, Skill, Category } from '../store/skills';
import { useSAOsStore, SAO } from '../store/saos';
import { lazy } from 'react';
import { supabase } from '../lib/supabase';
import { useClickAway } from 'react-use';

// Lazy load LinksPopup
const LinksPopup = lazy(() => import('../components/skills/SAOPopup'));

// Memoized Skill Item component
const SkillItem = memo(({ 
  skill, 
  categoryIndex, 
  onRankChange, 
  getStatusIcon, 
  getStatusLabel, 
  getStatusClass, 
  getRankColor, 
  getRankLabel,
  skillRef,
  linkedSkillIds,
  fetchLinkedItems
}: { 
  skill: Skill;
  categoryIndex: number;
  onRankChange: (categoryIndex: number, skillId: string, rank: number | null) => void;
  getStatusIcon: (skill: Skill) => React.ReactNode;
  getStatusLabel: (skill: Skill) => string;
  getStatusClass: (skill: Skill) => string;
  getRankColor: (rank: number | undefined) => string;
  getRankLabel: (rank: number | undefined) => string;
  skillRef?: (el: HTMLDivElement | null) => void;
  linkedSkillIds: Set<string>;
  fetchLinkedItems: (skillId: string) => Promise<{ saos: any[]; jobs: any[] }>;
}) => {
  const [isLinksPopupOpen, setIsLinksPopupOpen] = useState(false);
  const [linkedSAOs, setLinkedSAOs] = useState<any[]>([]);
  const [linkedJobs, setLinkedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const hasLinkedItems = linkedSkillIds.has(skill.id);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickAway(dropdownRef, () => setDropdownOpen(false));

  const handleLinksClick = async () => {
    setLoading(true);
    try {
      const { saos, jobs } = await fetchLinkedItems(skill.id);
      setLinkedSAOs(saos);
      setLinkedJobs(jobs);
      setIsLinksPopupOpen(true);
    } catch (error) {
      console.error('Error fetching linked items:', error);
    } finally {
      setLoading(false);
    }
  };

  const rankOptions = [
    { value: '', label: 'Not Ranked', color: 'bg-slate-100 text-slate-600', desc: 'No rank assigned yet.' },
    { value: 1, label: '1 - Beginner', color: 'bg-red-100 text-red-600', desc: 'Beginner: You are just starting to learn this skill.' },
    { value: 2, label: '2 - Basic', color: 'bg-orange-100 text-orange-600', desc: 'Basic: You can perform this skill with guidance.' },
    { value: 3, label: '3 - Intermediate', color: 'bg-yellow-100 text-yellow-600', desc: 'Intermediate: You can perform this skill independently.' },
    { value: 4, label: '4 - Advanced', color: 'bg-blue-100 text-blue-600', desc: 'Advanced: You can perform this skill independently and help others.' },
    { value: 5, label: '5 - Expert', color: 'bg-green-100 text-green-600', desc: 'Expert: You can teach this skill to others and handle complex situations.' },
  ];

  const selectedOption = rankOptions.find(opt => String(opt.value) === String(skill.rank ?? '')) || rankOptions[0];

  return (
    <>
      <div 
        ref={skillRef}
        className="flex items-center justify-between p-3 rounded-lg border hover:border-slate-300 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center">
          <div className="mr-3">
            {getStatusIcon(skill)}
          </div>
          <span className="font-medium">{skill.name}</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLinksClick}
            className={`p-2 rounded-full transition-colors ${
              hasLinkedItems 
                ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50 shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title={hasLinkedItems ? "View linked items" : "No linked items"}
            disabled={loading}
          >
            <FileText size={18} className={loading ? 'animate-pulse' : ''} />
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer shadow-sm transition ${selectedOption.color}`}
              onClick={() => setDropdownOpen(v => !v)}
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
            >
              {selectedOption.label}
              <ChevronDown size={16} className="text-current" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 z-20 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black/10 py-1 transition-all duration-200 ease-out animate-dropdown-fade-slide" role="listbox">
                {rankOptions.map(opt => (
                  <div key={opt.value} className="relative">
                    <button
                      type="button"
                      className={`w-full text-left px-4 py-2 flex items-center rounded-lg transition font-medium text-sm ${opt.color} ${String(opt.value) === String(skill.rank ?? '') ? 'ring-2 ring-teal-400 bg-teal-50' : 'hover:bg-slate-100'}`}
                      onClick={() => {
                        setDropdownOpen(false);
                        onRankChange(categoryIndex, skill.id, opt.value === '' ? null : Number(opt.value));
                      }}
                      role="option"
                      aria-selected={String(opt.value) === String(skill.rank ?? '')}
                    >
                      <span className="flex-1 flex items-center gap-2">
                        {opt.label}
                      </span>
                      <span className="relative flex items-center ml-2 group/info">
                        <Info size={15} className="text-slate-400 group-hover/info:text-slate-600 cursor-pointer" />
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 z-30 whitespace-pre-line min-w-[180px] max-w-xs bg-slate-900 text-white text-xs rounded-md px-3 py-2 shadow-lg opacity-0 group-hover/info:opacity-100 pointer-events-none transition-opacity duration-200">
                          {opt.desc}
                        </span>
                      </span>
                      {String(opt.value) === String(skill.rank ?? '') && <Check size={16} className="ml-2 text-teal-500" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusClass(skill)}`}>{getStatusLabel(skill)}</span>
        </div>
      </div>

      <Suspense fallback={<div>Loading links...</div>}>
        <LinksPopup
          isOpen={isLinksPopupOpen}
          onClose={() => setIsLinksPopupOpen(false)}
          skillName={skill.name}
          saos={linkedSAOs}
          jobs={linkedJobs}
        />
      </Suspense>
    </>
  );
});

// Memoized Category component
const CategorySection = memo(({ 
  category, 
  categoryIndex, 
  onRankChange,
  getStatusIcon,
  getStatusLabel,
  getStatusClass,
  getRankColor,
  getRankLabel,
  getCategoryProgress,
  calculateCategoryMean,
  getMeanColor,
  showRequirementWarning,
  getRequirementMessage,
  skillRefs,
  linkedSkillIds,
  fetchLinkedItems
}: {
  category: Category;
  categoryIndex: number;
  onRankChange: (categoryIndex: number, skillId: string, rank: number | null) => void;
  getStatusIcon: (skill: Skill) => React.ReactNode;
  getStatusLabel: (skill: Skill) => string;
  getStatusClass: (skill: Skill) => string;
  getRankColor: (rank: number | undefined) => string;
  getRankLabel: (rank: number | undefined) => string;
  getCategoryProgress: (skills: Skill[]) => { completed: number; notStarted: number };
  calculateCategoryMean: (skills: Skill[]) => { mean: number; isComplete: boolean };
  getMeanColor: (mean: number) => string;
  showRequirementWarning: (categoryName: string, mean: number) => boolean;
  getRequirementMessage: (categoryName: string, mean: number) => string;
  skillRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  linkedSkillIds: Set<string>;
  fetchLinkedItems: (skillId: string) => Promise<{ saos: any[]; jobs: any[] }>;
}) => {
  const categoryProgress = getCategoryProgress(category.skills);
  const { mean, isComplete } = calculateCategoryMean(category.skills);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">{category.name}</h2>
          {isComplete && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getMeanColor(mean)}`}>
              <Award size={16} />
              <span className="text-sm font-medium">Mean Score: {mean}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 text-green-700 mr-2">
              <span className="text-sm font-bold">{categoryProgress.completed}</span>
            </div>
            <div>
              <p className="text-xs font-medium">Completed</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-700 mr-2">
              <span className="text-sm font-bold">{categoryProgress.notStarted}</span>
            </div>
            <div>
              <p className="text-xs font-medium">Not Started</p>
            </div>
          </div>
        </div>
      </div>

      {isComplete && showRequirementWarning(category.name, mean) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Warning: This category does not meet the minimum requirements
              </p>
              <p className="text-sm text-red-600 mt-1">
                {getRequirementMessage(category.name, mean)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {category.skills.map((skill) => (
          <SkillItem
            key={skill.id}
            skill={skill}
            categoryIndex={categoryIndex}
            onRankChange={onRankChange}
            getStatusIcon={getStatusIcon}
            getStatusLabel={getStatusLabel}
            getStatusClass={getStatusClass}
            getRankColor={getRankColor}
            getRankLabel={getRankLabel}
            skillRef={el => (skillRefs.current[skill.id] = el)}
            linkedSkillIds={linkedSkillIds}
            fetchLinkedItems={fetchLinkedItems}
          />
        ))}
      </div>
    </div>
  );
});

const Skills: React.FC = () => {
  const { 
    skillCategories, 
    updateSkillRank, 
    loadUserSkills, 
    loading, 
    error 
  } = useSkillsStore();
  
  const skillRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [linkedSkillIds, setLinkedSkillIds] = useState<Set<string>>(new Set());
  const linkedItemsCache = useRef<Record<string, { saos: any[]; jobs: any[] }>>({});

  // Load skills on component mount
  useEffect(() => {
    loadUserSkills();
  }, [loadUserSkills]);

  useEffect(() => {
    const fetchAllLinked = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        // Fetch all SAOs and jobs for the user
        const [{ data: saosRaw }, { data: jobsRaw }] = await Promise.all([
          supabase.from('saos').select('*, sao_skills(skill_id)').eq('eit_id', user.id),
          supabase.from('jobs').select('id, skills').eq('eit_id', user.id)
        ]);
        const saos = saosRaw || [];
        const jobs = jobsRaw || [];
        // Build set of skill IDs that are linked
        const skillIdSet = new Set<string>();
        saos.forEach((sao: any) => {
          if (sao.sao_skills) {
            sao.sao_skills.forEach((ss: any) => skillIdSet.add(ss.skill_id));
          }
        });
        jobs.forEach((job: any) => {
          if (Array.isArray(job.skills)) {
            job.skills.forEach((sid: string) => skillIdSet.add(sid));
          }
        });
        setLinkedSkillIds(skillIdSet);
      } catch (err) {
        console.error('Error fetching all linked items:', err);
      }
    };
    fetchAllLinked();
  }, [loadUserSkills]);

  // Function to fetch linked items for a skill (for popup)
  const fetchLinkedItems = async (skillId: string) => {
    if (linkedItemsCache.current[skillId]) {
      return linkedItemsCache.current[skillId];
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { saos: [], jobs: [] };
    // Fetch SAOs linked to this skill
    const { data: saosRaw } = await supabase
      .from('saos')
      .select('*, sao_skills!inner(skill_id)')
      .eq('eit_id', user.id)
      .eq('sao_skills.skill_id', skillId);
    const saos = saosRaw || [];
    // Fetch jobs linked to this skill
    const { data: jobsRaw } = await supabase
      .from('jobs')
      .select('*')
      .eq('eit_id', user.id)
      .contains('skills', [skillId]);
    const jobs = jobsRaw || [];
    linkedItemsCache.current[skillId] = { saos, jobs };
    return { saos, jobs };
  };

  useEffect(() => {
    const handleScrollToSkill = (e: CustomEvent) => {
      const { skillId, timestamp } = e.detail;
      console.log('Scroll event received:', { skillId, timestamp });
      
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        const el = skillRefs.current[skillId];
        console.log('Looking for element:', { skillId, element: el });
        
        if (el) {
          console.log('Scrolling to element');
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring', 'ring-teal-400');
          setTimeout(() => el.classList.remove('ring', 'ring-teal-400'), 1500);
        } else {
          console.log('Element not found, retrying in 100ms');
          // Retry once after a short delay
          setTimeout(() => {
            const retryEl = skillRefs.current[skillId];
            if (retryEl) {
              retryEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              retryEl.classList.add('ring', 'ring-teal-400');
              setTimeout(() => retryEl.classList.remove('ring', 'ring-teal-400'), 1500);
            }
          }, 100);
        }
      }, 100);
    };

    window.addEventListener('scroll-to-skill', handleScrollToSkill as EventListener);
    return () => window.removeEventListener('scroll-to-skill', handleScrollToSkill as EventListener);
  }, []);

  const handleRankChange = useCallback(async (categoryIndex: number, skillId: string, newRank: number | null) => {
    try {
      console.log('Updating skill rank for skillId:', skillId, typeof skillId);
      await updateSkillRank(categoryIndex, skillId, newRank);
    } catch (error) {
      // Error is already handled in the store
      console.error('Error in handleRankChange:', error);
    }
  }, [updateSkillRank]);

  // Memoize all the helper functions
  const getCategoryProgress = useCallback((skills: Skill[]) => {
    return skills.reduce((acc, skill) => {
      if (skill.rank !== undefined) {
        acc.completed++;
      } else {
        acc.notStarted++;
      }
      return acc;
    }, { completed: 0, notStarted: 0 });
  }, []);

  const calculateCategoryMean = useCallback((skills: Skill[]): { mean: number; isComplete: boolean } => {
    const rankedSkills = skills.filter(skill => skill.rank !== undefined);
    if (rankedSkills.length !== skills.length) {
      return { mean: 0, isComplete: false };
    }
    const sum = rankedSkills.reduce((acc, skill) => acc + (skill.rank || 0), 0);
    return { 
      mean: Number((sum / skills.length).toFixed(1)),
      isComplete: true 
    };
  }, []);

  const getMeanColor = useCallback((mean: number) => {
    if (mean >= 4.5) return 'bg-green-100 text-green-700';
    if (mean >= 3.5) return 'bg-blue-100 text-blue-700';
    if (mean >= 2.5) return 'bg-yellow-100 text-yellow-700';
    if (mean >= 1.5) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  }, []);

  const getStatusIcon = useCallback((skill: Skill) => {
    if (skill.status === 'completed') {
      return <CheckCircle2 size={18} className="text-green-500" />;
    }
    if (skill.status === 'in-progress') {
      return <Star size={18} className="text-amber-500" />;
    }
    return skill.rank !== undefined ? (
      <CircleDot size={18} className="text-green-500" />
    ) : (
      <Circle size={18} className="text-slate-300" />
    );
  }, []);

  const getStatusLabel = useCallback((skill: Skill) => {
    if (skill.rank !== undefined) {
      return 'Completed';
    }
    return skill.status === 'completed' ? 'Completed' :
           skill.status === 'in-progress' ? 'In Progress' :
           'Not Started';
  }, []);

  const getStatusClass = useCallback((skill: Skill) => {
    if (skill.rank !== undefined) {
      return 'bg-green-100 text-green-800';
    }
    return skill.status === 'completed' ? 'bg-green-100 text-green-800' :
           skill.status === 'in-progress' ? 'bg-amber-100 text-amber-800' :
           'bg-slate-100 text-slate-800';
  }, []);

  const getRankColor = useCallback((rank: number | undefined) => {
    if (!rank) return 'bg-slate-100 text-slate-600';
    switch (rank) {
      case 1: return 'bg-red-100 text-red-600';
      case 2: return 'bg-orange-100 text-orange-600';
      case 3: return 'bg-yellow-100 text-yellow-600';
      case 4: return 'bg-blue-100 text-blue-600';
      case 5: return 'bg-green-100 text-green-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  }, []);

  const getRankLabel = useCallback((rank: number | undefined) => {
    if (!rank) return 'Not Ranked';
    switch (rank) {
      case 1: return 'Beginner';
      case 2: return 'Basic';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Not Ranked';
    }
  }, []);

  const CATEGORY_REQUIREMENTS = {
    'Category 1 – Technical Competence': 3,
    'Category 2 – Communication': 3,
    'Category 3 – Project & Financial Management': 2,
    'Category 4 – Team Effectiveness': 3,
    'Category 5 – Professional Accountability': 3,
    'Category 6 – Social, Economic, Environmental & Sustainability': 2
  } as const;

  const showRequirementWarning = useCallback((categoryName: string, mean: number) => {
    const minimumRequired = CATEGORY_REQUIREMENTS[categoryName as keyof typeof CATEGORY_REQUIREMENTS];
    return mean < minimumRequired;
  }, []);

  const getRequirementMessage = useCallback((categoryName: string, mean: number) => {
    const minimumRequired = CATEGORY_REQUIREMENTS[categoryName as keyof typeof CATEGORY_REQUIREMENTS];
    return `A minimum average score of ${minimumRequired} is required for ${categoryName}. Current average: ${mean}`;
  }, []);

  // Calculate overall progress statistics
  const progressStats = useMemo(() => skillCategories.reduce((acc, category) => {
    category.skills.forEach(skill => {
      if (skill.rank !== undefined) {
        acc.completed++;
      } else {
        acc.notStarted++;
      }
    });
    return acc;
  }, { completed: 0, notStarted: 0 }), [skillCategories]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Skills & Competencies</h1>
        <p className="text-slate-500 mt-1">Track and document your EIT program competencies</p>
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
        <>
          {/* Overall Progress Summary */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Overall Progress</h2>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100 text-green-700 mr-3">
                  <span className="text-lg font-bold">{progressStats.completed}</span>
                </div>
                <div>
                  <p className="font-medium">Completed</p>
                  <p className="text-sm text-slate-500">Skills</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 text-slate-700 mr-3">
                  <span className="text-lg font-bold">{progressStats.notStarted}</span>
                </div>
                <div>
                  <p className="font-medium">Not Started</p>
                  <p className="text-sm text-slate-500">Skills</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Categories */}
          <div className="space-y-6">
            {skillCategories.map((category, categoryIndex) => (
              <CategorySection
                key={category.name}
                category={category}
                categoryIndex={categoryIndex}
                onRankChange={handleRankChange}
                getStatusIcon={getStatusIcon}
                getStatusLabel={getStatusLabel}
                getStatusClass={getStatusClass}
                getRankColor={getRankColor}
                getRankLabel={getRankLabel}
                getCategoryProgress={getCategoryProgress}
                calculateCategoryMean={calculateCategoryMean}
                getMeanColor={getMeanColor}
                showRequirementWarning={showRequirementWarning}
                getRequirementMessage={getRequirementMessage}
                skillRefs={skillRefs}
                linkedSkillIds={linkedSkillIds}
                fetchLinkedItems={fetchLinkedItems}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(Skills);