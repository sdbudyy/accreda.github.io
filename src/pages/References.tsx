import React from 'react';
import { Bookmark, CheckCircle2, Award } from 'lucide-react';
import { useSkillsStore } from '../store/skills';
import Timeline from '../components/references/Timeline';

const References: React.FC = () => {
  const { skillCategories } = useSkillsStore();

  // Get completed skills grouped by category
  const completedSkillsByCategory = skillCategories.map(category => ({
    ...category,
    skills: category.skills.filter(skill => skill.status === 'completed')
  })).filter(category => category.skills.length > 0);

  // Calculate category statistics
  const getCategoryStats = (skills: typeof skillCategories[0]['skills']) => {
    const completed = skills.filter(skill => skill.status === 'completed').length;
    const total = skills.length;
    const mean = skills.reduce((acc, skill) => acc + (skill.rank || 0), 0) / completed;
    
    return {
      completed,
      total,
      mean: Number(mean.toFixed(1))
    };
  };

  const getMeanColor = (mean: number) => {
    if (mean >= 4.5) return 'bg-green-100 text-green-700';
    if (mean >= 3.5) return 'bg-blue-100 text-blue-700';
    if (mean >= 2.5) return 'bg-yellow-100 text-yellow-700';
    if (mean >= 1.5) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center">
          <Bookmark size={24} className="mr-2 text-teal-600" />
          References
        </h1>
      </div>

      {/* Work Experience Timeline */}
      <Timeline />

      {/* Completed Skills Section */}
      {completedSkillsByCategory.length > 0 ? (
        <div className="space-y-6">
          {completedSkillsByCategory.map((category) => {
            const stats = getCategoryStats(category.skills);
            
            return (
              <div key={category.name} className="card">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">{category.name}</h2>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getMeanColor(stats.mean)}`}>
                      <Award size={16} />
                      <span className="text-sm font-medium">Mean Score: {stats.mean}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 text-green-700 mr-2">
                      <span className="text-sm font-bold">{stats.completed}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium">Completed</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {category.skills.map((skill) => (
                    <div 
                      key={skill.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <CheckCircle2 size={18} className="text-green-500 mr-3" />
                        <span className="font-medium">{skill.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-800`}>
                          Rank {skill.rank}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Completed Skills</h2>
            <p className="text-slate-600">
              No completed skills yet. Complete skills in the Skills section to see them here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default References; 