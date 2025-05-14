import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Skill {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'not-started';
  rank?: number;
  category_name?: string;
}

export interface Category {
  name: string;
  skills: Skill[];
}

interface SkillsState {
  skillCategories: Category[];
  setSkillCategories: (categories: Category[]) => void;
  updateSkillRank: (categoryIndex: number, skillId: string, rank: number) => Promise<void>;
  loadUserSkills: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Initial skill categories data
const initialSkillCategories: Category[] = [
  {
    name: 'Category 1 – Technical Competence',
    skills: [
      { id: 'temp-1', name: '1.1 Regulations, Codes & Standards', status: 'not-started', rank: undefined },
      { id: 'temp-2', name: '1.2 Technical & Design Constraints', status: 'not-started', rank: undefined },
      { id: 'temp-3', name: '1.3 Risk Management for Technical Work', status: 'not-started', rank: undefined },
      { id: 'temp-4', name: '1.4 Application of Theory', status: 'not-started', rank: undefined },
      { id: 'temp-5', name: '1.5 Solution Techniques – Results Verification', status: 'not-started', rank: undefined },
      { id: 'temp-6', name: '1.6 Safety in Design & Technical Work', status: 'not-started', rank: undefined },
      { id: 'temp-7', name: '1.7 Systems & Their Components', status: 'not-started', rank: undefined },
      { id: 'temp-8', name: '1.8 Project or Asset Life-Cycle Awareness', status: 'not-started', rank: undefined },
      { id: 'temp-9', name: '1.9 Quality Assurance', status: 'not-started', rank: undefined },
      { id: 'temp-10', name: '1.10 Engineering Documentation', status: 'not-started', rank: undefined },
    ]
  },
  {
    name: 'Category 2 – Communication',
    skills: [
      { id: 'temp-11', name: '2.1 Oral Communication (English)', status: 'not-started', rank: undefined },
      { id: 'temp-12', name: '2.2 Written Communication (English)', status: 'not-started', rank: undefined },
      { id: 'temp-13', name: '2.3 Reading & Comprehension (English)', status: 'not-started', rank: undefined },
    ]
  },
  {
    name: 'Category 3 – Project & Financial Management',
    skills: [
      { id: 'temp-14', name: '3.1 Project Management Principles', status: 'not-started', rank: undefined },
      { id: 'temp-15', name: '3.2 Finances & Budget', status: 'not-started', rank: undefined },
    ]
  },
  {
    name: 'Category 4 – Team Effectiveness',
    skills: [
      { id: 'temp-16', name: '4.1 Promote Team Effectiveness & Resolve Conflict', status: 'not-started', rank: undefined },
    ]
  },
  {
    name: 'Category 5 – Professional Accountability',
    skills: [
      { id: 'temp-17', name: '5.1 Professional Accountability (Ethics, Liability, Limits)', status: 'not-started', rank: undefined },
    ]
  },
  {
    name: 'Category 6 – Social, Economic, Environmental & Sustainability',
    skills: [
      { id: 'temp-18', name: '6.1 Protection of the Public Interest', status: 'not-started', rank: undefined },
      { id: 'temp-19', name: '6.2 Benefits of Engineering to the Public', status: 'not-started', rank: undefined },
      { id: 'temp-20', name: '6.3 Role of Regulatory Bodies', status: 'not-started', rank: undefined },
      { id: 'temp-21', name: '6.4 Application of Sustainability Principles', status: 'not-started', rank: undefined },
      { id: 'temp-22', name: '6.5 Promotion of Sustainability', status: 'not-started', rank: undefined },
    ]
  },
];

export const useSkillsStore = create<SkillsState>((set, get) => ({
  skillCategories: initialSkillCategories,
  loading: false,
  error: null,

  setSkillCategories: (categories) => set({ skillCategories: categories }),

  loadUserSkills: async () => {
    set({ loading: true, error: null });
    try {
      console.log('Starting loadUserSkills...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        throw new Error('No authenticated user found');
      }
      console.log('User authenticated:', user.id);

      // Fetch all skills from the skills table (with UUIDs)
      console.log('Fetching skills from DB...');
      const { data: dbSkills, error: dbSkillsError } = await supabase
        .from('skills')
        .select('id, name, category');
      if (dbSkillsError) {
        console.error('Error fetching skills from DB:', dbSkillsError);
        throw dbSkillsError;
      }
      console.log('Skills fetched from DB:', dbSkills?.length);

      // First, check if user has any skills
      console.log('Checking existing user skills...');
      let { data: existingSkills, error: fetchError } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('Error fetching user skills:', fetchError);
        throw fetchError;
      }
      console.log('Existing user skills:', existingSkills?.length);

      // If no skills exist for the user, initialize them using UUIDs from dbSkills
      if (!existingSkills || existingSkills.length === 0) {
        console.log('No existing skills found, initializing for new user...');
        // Map initialSkillCategories to dbSkills by name and category
        const initialSkills = initialSkillCategories.flatMap(category =>
          category.skills.map(skill => {
            const dbSkill = dbSkills.find(
              s => s.name === skill.name && s.category === category.name
            );
            if (!dbSkill) {
              console.warn(`No matching DB skill found for: ${skill.name} in ${category.name}`);
              return null;
            }
            return {
              user_id: user.id,
              skill_id: dbSkill.id,
              category_name: category.name,
              skill_name: skill.name,
              rank: null,
              status: 'not-started'
            };
          }).filter(Boolean)
        );

        console.log('Initializing skills:', initialSkills.length);
        const { error: insertError } = await supabase
          .from('user_skills')
          .insert(initialSkills);

        if (insertError) {
          console.error('Error initializing user skills:', insertError);
          throw insertError;
        }

        // Fetch the newly inserted skills
        console.log('Fetching newly initialized skills...');
        const { data: newSkills, error: newFetchError } = await supabase
          .from('user_skills')
          .select('*')
          .eq('user_id', user.id);

        if (newFetchError) {
          console.error('Error fetching newly initialized skills:', newFetchError);
          throw newFetchError;
        }

        existingSkills = newSkills;
        console.log('New skills fetched:', existingSkills?.length);
      }

      // Update the store with user's skill rankings, using dbSkills for name/category
      console.log('Updating store with user skills...');
      const updatedCategories = initialSkillCategories.map(category => ({
        ...category,
        skills: category.skills.map(skill => {
          // Find the dbSkill for this skill
          const dbSkill = dbSkills.find(
            s => s.name === skill.name && s.category === category.name
          );
          if (!dbSkill) {
            console.warn(`No matching DB skill found for: ${skill.name} in ${category.name}`);
            return skill;
          }
          const userSkill = existingSkills?.find(us => 
            us.skill_id === dbSkill.id
          );
          return {
            ...skill,
            id: dbSkill.id, // Use UUID
            category_name: dbSkill.category, // for display if needed
            rank: userSkill?.rank || undefined,
            status: userSkill?.status || 'not-started'
          };
        })
      }));

      console.log('Setting updated categories in store:', updatedCategories.length);
      set({ skillCategories: updatedCategories });
    } catch (error: any) {
      console.error('Error in loadUserSkills:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      set({ error: `Failed to load skills: ${error.message || 'Unknown error'}` });
      throw error; // Re-throw to be caught by the caller
    } finally {
      set({ loading: false });
    }
  },

  updateSkillRank: async (categoryIndex: number, skillId: string, rank: number) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      if (!user) {
        console.error('No authenticated user found');
        throw new Error('No authenticated user found');
      }

      console.log('Updating skill rank:', { categoryIndex, skillId, rank, userId: user.id });

      const category = get().skillCategories[categoryIndex];
      const skill = category.skills.find(s => s.id === skillId);
      if (!skill) {
        console.error('Skill not found:', { categoryIndex, skillId });
        throw new Error('Skill not found');
      }

      // Optimistically update the UI first
      set(state => ({
        skillCategories: state.skillCategories.map((category, index) => {
          if (index === categoryIndex) {
            return {
              ...category,
              skills: category.skills.map(skill => {
                if (skill.id === skillId) {
                  return { 
                    ...skill, 
                    rank: rank || undefined,
                    status: rank ? 'completed' : 'not-started'
                  };
                }
                return skill;
              })
            };
          }
          return category;
        })
      }));

      // Then sync with Supabase in the background
      const updateData = {
        user_id: user.id,
        skill_id: skillId,
        category_name: skill.category_name || category.name,
        skill_name: skill.name,
        rank: rank || null,
        status: rank ? 'completed' : 'not-started'
      };

      console.log('Sending update to Supabase:', updateData);

      const { error } = await supabase
        .from('user_skills')
        .upsert(updateData, {
          onConflict: 'user_id,skill_id'
        });

      if (error) {
        console.error('Supabase error:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        // Reload the skills to ensure consistency
        await get().loadUserSkills();
        throw error;
      }

      console.log('Successfully updated skill rank');
    } catch (error: any) {
      console.error('Error updating skill rank:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      set({ 
        error: `Failed to update skill rank: ${error.message || 'Unknown error'}`
      });
    }
  },

  consoleLogSkillCategories: () => {
    console.log('Skill categories in store:', get().skillCategories);
  }
})); 