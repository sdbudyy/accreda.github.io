import React, { useEffect, useRef } from 'react';
import { useSkillsStore, Category, Skill } from '../../store/skills';
import { Award } from 'lucide-react';
import { useUserProfile } from '../../context/UserProfileContext';

interface SkillCategoryProps {
  name: string;
  completed: number;
  total: number;
  color: string;
}

const SkillsOverview: React.FC = () => {
  const { skillCategories, loadUserSkills } = useSkillsStore();
  const skillRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { profile, loading: profileLoading } = useUserProfile();

  useEffect(() => {
    if (profile && profile.account_type === 'eit') {
      loadUserSkills();
    }
  }, [profile, loadUserSkills]);

  useEffect(() => {
    const handleScrollToSkill = (e: CustomEvent) => {
      const skillId = e.detail.skillId;
      const el = skillRefs.current[skillId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring', 'ring-teal-400');
        setTimeout(() => el.classList.remove('ring', 'ring-teal-400'), 1500);
      }
    };
    window.addEventListener('scroll-to-skill', handleScrollToSkill as EventListener);
    return () => window.removeEventListener('scroll-to-skill', handleScrollToSkill as EventListener);
  }, []);

  if (profileLoading) {
    return <div>Loading skills...</div>;
  }
  if (!profile || profile.account_type !== 'eit') {
    return <div>Skills not available.</div>;
  }

  const categoryColors = ['bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500'];
  const categoryProgress: SkillCategoryProps[] = skillCategories.map((category: Category, index: number) => {
    const completed = category.skills.filter((skill: Skill) => skill.rank !== undefined).length;
    const total = category.skills.length;
    return {
      name: category.name,
      completed,
      total,
      color: categoryColors[index % categoryColors.length]
    };
  });

  // Get recently completed skills (last 3 skills that were ranked)
  const recentlyCompleted = skillCategories
    .flatMap((category: Category) => category.skills)
    .filter((skill: Skill) => skill.rank !== undefined)
    .sort((a: Skill, b: Skill) => (b.rank || 0) - (a.rank || 0))
    .slice(0, 3);

  // Calculate overall progress
  const totalCompleted = categoryProgress.reduce((acc, cat) => acc + cat.completed, 0);
  const totalSkills = categoryProgress.reduce((acc, cat) => acc + cat.total, 0);
  const overallPercentage = Math.round((totalCompleted / totalSkills) * 100);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Award size={18} className="mr-2 text-teal-600" />
          Skills Overview
        </h2>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-teal-100 text-teal-700 mr-2">
            <span className="text-sm font-bold">{overallPercentage}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {categoryProgress.map((category) => {
          const percentage = Math.round((category.completed / category.total) * 100);
          
          return (
            <div key={category.name} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">{category.name}</span>
                <span className="text-sm text-slate-500">
                  {category.completed}/{category.total}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${category.color}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}

        <hr className="my-4 border-slate-200" />
        
        <div>
          <h4 className="font-medium text-sm mb-3">Recently Completed Skills</h4>
          <div className="space-y-2">
            {recentlyCompleted.length > 0 ? (
              recentlyCompleted.map((skill: Skill) => (
                <div
                  key={skill.id}
                  id={`skill-${skill.id}`}
                  ref={el => (skillRefs.current[skill.id] = el)}
                  className="text-sm flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span className="truncate mr-2">{skill.name}</span>
                  <span className="bg-green-100 text-green-700 text-xs py-0.5 px-2 rounded-full whitespace-nowrap">
                    Score {skill.rank}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No skills completed yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsOverview;