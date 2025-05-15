import React, { useEffect, useRef } from 'react';
import { useSkillsStore, Category, Skill } from '../../store/skills';

interface SkillCategoryProps {
  name: string;
  completed: number;
  total: number;
  color: string;
}

const SkillsOverview: React.FC = () => {
  const { skillCategories } = useSkillsStore();
  const skillRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  // Calculate progress for each category
  const categoryProgress: SkillCategoryProps[] = skillCategories.map((category: Category, index: number) => {
    const completed = category.skills.filter((skill: Skill) => skill.rank !== undefined).length;
    const total = category.skills.length;
    
    // Assign colors based on category index
    const colors = [
      'bg-blue-500',
      'bg-teal-500',
      'bg-indigo-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500'
    ];
    
    return {
      name: category.name,
      completed,
      total,
      color: colors[index % colors.length]
    };
  });

  // Get recently completed skills (last 3 skills that were ranked)
  const recentlyCompleted = skillCategories
    .flatMap((category: Category) => category.skills)
    .filter((skill: Skill) => skill.rank !== undefined)
    .sort((a: Skill, b: Skill) => (b.rank || 0) - (a.rank || 0))
    .slice(0, 3);

  return (
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
            <div className="progress-bar">
              <div 
                className={`progress-bar-fill ${category.color}`} 
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
                className="text-sm flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-slate-50"
              >
                <span>{skill.name}</span>
                <span className="bg-green-100 text-green-700 text-xs py-0.5 px-2 rounded-full">
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
  );
};

export default SkillsOverview;