import React from 'react';
import Modal from './Modal';
import { X } from 'lucide-react';
import { Category, Skill } from '../../store/skills';

interface SkillSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSkills: Skill[];
  onChange: (skills: Skill[]) => void;
  skillCategories: Category[];
}

const SkillSelectModal: React.FC<SkillSelectModalProps> = ({ isOpen, onClose, selectedSkills, onChange, skillCategories }) => {
  const handleToggleSkill = (skill: Skill, categoryName: string) => {
    if (selectedSkills.some(s => s.id === skill.id)) {
      onChange(selectedSkills.filter(s => s.id !== skill.id));
    } else {
      onChange([...selectedSkills, { ...skill, category_name: categoryName }]);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-3xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold">Select Skills</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedSkills.map(skill => (
            <span key={skill.id} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
              {skill.name}
              <button type="button" onClick={() => onChange(selectedSkills.filter(s => s.id !== skill.id))} className="ml-2 text-teal-600 hover:text-teal-800"><X size={16} /></button>
            </span>
          ))}
        </div>
        <div className="space-y-6 max-h-[50vh] overflow-y-auto">
          {skillCategories.map(category => (
            <div key={category.name} className="border rounded-lg p-4">
              <h4 className="font-medium text-slate-900 text-lg mb-4">{category.name}</h4>
              <div className="space-y-3">
                {category.skills.map(skill => (
                  <label key={skill.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSkills.some(s => s.id === skill.id)}
                      onChange={() => handleToggleSkill(skill, category.name)}
                      className="rounded text-teal-600 focus:ring-teal-500 w-5 h-5"
                    />
                    <span className="text-base">{skill.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-8">
          <button onClick={onClose} className="btn btn-primary px-6 py-3 text-lg">Done</button>
        </div>
      </div>
    </Modal>
  );
};

export default SkillSelectModal; 