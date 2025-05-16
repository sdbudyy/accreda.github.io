import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Briefcase, Edit2, Trash2, X, Users, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSkillsStore } from '../../store/skills';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string;
  skills?: string[]; // Array of skill IDs
}

interface Reference {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  description: string;
  reference_number: number;
  created_at: string;
  updated_at?: string;
}

interface Validator {
  id: string;
  skill_id: string;
  full_name: string;
  email: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface JobFormProps {
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
  job: Partial<Job>;
  onJobChange: (field: keyof Job, value: string) => void;
  onSkillsToggle: (skillId: string) => void;
  onSkillsPopupOpen: () => void;
  skillCategories: Array<{
    name: string;
    skills: Array<{
      id: string;
      name: string;
    }>;
  }>;
}

const JobForm: React.FC<JobFormProps> = ({
  onSubmit,
  onCancel,
  isEditing,
  job,
  onJobChange,
  onSkillsToggle,
  onSkillsPopupOpen,
  skillCategories
}) => {
  return (
    <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <h3 className="font-medium mb-4">{isEditing ? 'Edit Job' : 'Add New Job'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
          <input
            type="text"
            value={job.title || ''}
            onChange={(e) => onJobChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[200px]"
            placeholder="e.g., Software Engineer"
            maxLength={100}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
          <input
            type="text"
            value={job.company || ''}
            onChange={(e) => onJobChange('company', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[200px]"
            placeholder="e.g., Tech Corp"
            maxLength={100}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
          <input
            type="text"
            value={job.location || ''}
            onChange={(e) => onJobChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[200px]"
            placeholder="e.g., San Francisco, CA"
            maxLength={100}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={job.start_date || ''}
              onChange={(e) => onJobChange('start_date', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[150px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input
              type="date"
              value={job.end_date || ''}
              onChange={(e) => onJobChange('end_date', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[150px]"
              placeholder="Present"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            value={job.description || ''}
            onChange={(e) => onJobChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[200px]"
            rows={3}
            placeholder="Brief description of your role and responsibilities"
            maxLength={500}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Skills</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(job.skills || []).map((skillId) => {
              const skill = skillCategories
                .flatMap(cat => cat.skills)
                .find(s => s.id === skillId);
              return skill ? (
                <span
                  key={skillId}
                  className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs flex items-center gap-1"
                >
                  {skill.name}
                  <button
                    onClick={() => onSkillsToggle(skillId)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              ) : null;
            })}
          </div>
          <button
            onClick={onSkillsPopupOpen}
            className="btn btn-secondary w-full"
          >
            {job.skills?.length ? 'Edit Skills' : 'Select Skills'}
          </button>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="btn btn-primary"
        >
          {isEditing ? 'Update Job' : 'Save Job'}
        </button>
      </div>
    </div>
  );
};

const Timeline: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [references, setReferences] = useState<Record<string, Reference[]>>({});
  const [validators, setValidators] = useState<Record<string, Validator[]>>({});
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState<string | null>(null);
  const [isSkillsPopupOpen, setIsSkillsPopupOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { skillCategories } = useSkillsStore();
  const [newJob, setNewJob] = useState<Partial<Job>>({
    title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    description: '',
    skills: []
  });
  const [pendingScroll, setPendingScroll] = useState<{ itemId: string; itemType: string } | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // Fetch jobs first
      const jobsRes = await supabase.from('jobs').select('id, title, company, location, start_date, end_date, description, skills').eq('eit_id', user.id).order('start_date', { ascending: false });
      setJobs(jobsRes.data || []);
      // Fetch references for these jobs
      const jobIds = (jobsRes.data || []).map((j: any) => j.id);
      let refsRes: any = { data: [] };
      if (jobIds.length > 0) {
        refsRes = await supabase.from('job_references').select('id, job_id, full_name, email, description, reference_number, created_at, updated_at').in('job_id', jobIds);
      }
      // Fetch validators
      const valsRes = await supabase.from('validators').select('id, eit_id, skill_id, full_name, email, description, created_at, updated_at').eq('eit_id', user.id);
      // References
      let referencesData: Reference[] = [];
      if (!refsRes.error && Array.isArray(refsRes.data)) {
        referencesData = refsRes.data;
      }
      const groupedReferences = referencesData.reduce((acc: Record<string, Reference[]>, reference: Reference) => {
        if (!acc[reference.job_id]) acc[reference.job_id] = [];
        acc[reference.job_id].push(reference);
        return acc;
      }, {} as Record<string, Reference[]>);
      setReferences(groupedReferences);
      // Validators
      if (valsRes.data) {
        const groupedValidators = valsRes.data.reduce((acc: Record<string, Validator[]>, validator: Validator) => {
          if (!acc[validator.skill_id]) acc[validator.skill_id] = [];
          acc[validator.skill_id].push(validator);
          return acc;
        }, {} as Record<string, Validator[]>);
        setValidators(groupedValidators);
      }
    } catch (error) {
      console.error('Error loading jobs, references, or validators:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();

    // Check for pending scroll in sessionStorage (for cross-page navigation)
    const storedScroll = sessionStorage.getItem('pendingScroll');
    if (storedScroll) {
      try {
        const parsed = JSON.parse(storedScroll);
        if (parsed && parsed.itemId && parsed.itemType) {
          setPendingScroll({ itemId: parsed.itemId, itemType: parsed.itemType });
        }
      } catch (e) {
        // Ignore parse errors
      }
      sessionStorage.removeItem('pendingScroll');
    }

    // Add event listener for scrolling to specific items
    const handleScrollToItem = (event: CustomEvent) => {
      console.log('Scroll event received, queuing:', event.detail);
      const { itemId, itemType } = event.detail;
      if (itemId && itemType) {
        setPendingScroll({ itemId, itemType });
      }
    };

    window.addEventListener('scroll-to-item', handleScrollToItem as EventListener);

    return () => {
      window.removeEventListener('scroll-to-item', handleScrollToItem as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!pendingScroll || loading) {
      if (pendingScroll && loading) {
        console.log('Holding scroll for item', pendingScroll.itemId, 'due to main loading state.');
      }
      return;
    }

    const { itemId, itemType } = pendingScroll;
    let elementToScroll: HTMLElement | null = null;
    let canAttemptQuery = false;

    console.log(`Processing pending scroll for ${itemType} ${itemId}`);

    if (itemType === 'job') {
      canAttemptQuery = true;
      const selector = `[data-job-id="${itemId}"]`;
      console.log('Attempting to find job element with selector:', selector);
      elementToScroll = document.querySelector(selector);
    } else if (itemType === 'reference') {
      // Check if references data seems populated enough
      if (Object.keys(references).length > 0 || jobs.some(j => references[j.id]?.some(r => r.id === itemId))) {
        canAttemptQuery = true;
        const selector = `[data-reference-id="${itemId}"]`;
        console.log('Attempting to find reference element with selector:', selector);
        elementToScroll = document.querySelector(selector);
      } else {
        console.log('References data not yet populated enough to find item:', itemId);
      }
    } else if (itemType === 'validator') {
      // Check if validators data seems populated enough
      let validatorDataSufficient = Object.keys(validators).length > 0;
      let validatorSkillId: string | null = null;
      for (const skillIdKey in validators) {
        if (validators[skillIdKey].some(v => v.id === itemId)) {
          validatorSkillId = skillIdKey;
          break;
        }
      }

      if (validatorSkillId && jobs.some(job => job.skills?.includes(validatorSkillId))) {
        canAttemptQuery = true; // Specific validator's job and skill context seems loaded
      } else if (validatorDataSufficient) {
        // Fallback: some validators are loaded, so the specific one might be there
        canAttemptQuery = true;
        console.log('Validator data seems generally loaded, attempting query for:', itemId);
      } else {
         console.log('Validators data not yet populated enough to find item:', itemId);
      }
      
      if (canAttemptQuery) {
        const selector = `[data-validator-id="${itemId}"]`;
        console.log('Attempting to find validator element with selector:', selector);
        elementToScroll = document.querySelector(selector);
      }
    }

    if (canAttemptQuery && elementToScroll) {
      console.log(`Performing queued scroll for ${itemType} ${itemId} to element:`, elementToScroll);
      // Polling not needed if already found, but keep for consistency
      let raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          elementToScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
          elementToScroll.classList.add('highlight-item');
          setTimeout(() => {
            elementToScroll?.classList.remove('highlight-item');
          }, 2000);
        });
      });
      setPendingScroll(null); // Clear pending scroll
    } else if (canAttemptQuery && !elementToScroll) {
      // Poll for the element to appear in the DOM (up to 3 seconds)
      let attempts = 0;
      const maxAttempts = 30; // 30 x 100ms = 3s
      const selector =
        itemType === 'job' ? `[data-job-id="${itemId}"]` :
        itemType === 'reference' ? `[data-reference-id="${itemId}"]` :
        itemType === 'validator' ? `[data-validator-id="${itemId}"]` : '';
      if (!selector) {
        setPendingScroll(null);
        return;
      }
      const poller = setInterval(() => {
        const el = document.querySelector(selector);
        attempts++;
        if (el) {
          console.log(`Polling found element for ${itemType} ${itemId} after ${attempts} attempts.`);
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('highlight-item');
          setTimeout(() => {
            el.classList.remove('highlight-item');
          }, 2000);
          clearInterval(poller);
          setPendingScroll(null);
        } else if (attempts >= maxAttempts) {
          console.warn(`Polling failed to find element for ${itemType} ${itemId} after ${attempts} attempts.`);
          clearInterval(poller);
          setPendingScroll(null);
        }
      }, 100);
    } else if (!canAttemptQuery) {
      console.log(`Data not yet ready for ${itemType} ${itemId}. Scroll remains pending. Will retry on next data update.`);
    }
  }, [pendingScroll, jobs, references, validators, loading]);

  const handleAddJob = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('jobs')
        .insert([{
          ...newJob,
          eit_id: user.id,
          skills: newJob.skills || [] // Ensure skills array is included
        }]);

      if (error) throw error;

      // Reset form and reload jobs
      setNewJob({
        title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: '',
        description: '',
        skills: []
      });
      setIsAddingJob(false);
      await fetchAll();
      window.dispatchEvent(new Event('jobs-updated'));
    } catch (error) {
      console.error('Error adding job:', error);
    }
  };

  const handleUpdateJob = async (jobId: string, updatedSkills?: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        return;
      }

      // First, verify the job exists
      const { data: existingJob, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (fetchError) {
        console.error('Error fetching existing job:', fetchError);
        throw fetchError;
      }

      if (!existingJob) {
        console.error('Job not found');
        return;
      }

      // Prepare the update data
      const updateData = {
        title: newJob.title || existingJob.title,
        description: newJob.description || existingJob.description,
        skills: updatedSkills || newJob.skills || [],
        eit_id: user.id
      };

      // Log the update data for debugging
      console.log('Updating job with data:', {
        jobId,
        updateData,
        currentSkills: newJob.skills
      });

      const { error: updateError } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', jobId)
        .eq('eit_id', user.id);

      if (updateError) {
        console.error('Error updating job:', updateError);
        throw updateError;
      }

      // Reset form and reload jobs
      setNewJob({
        title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: '',
        description: '',
        skills: []
      });
      setIsEditingJob(null);
      await fetchAll();
      window.dispatchEvent(new Event('jobs-updated'));
    } catch (error) {
      console.error('Error in handleUpdateJob:', error);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      await fetchAll();
      window.dispatchEvent(new Event('jobs-updated'));
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleEditClick = (job: Job) => {
    setNewJob({
      ...job,
      skills: job.skills || []
    });
    setIsEditingJob(job.id);
  };

  const handleSkillToggle = (skillId: string) => {
    setNewJob(prev => {
      const currentSkills = prev.skills || [];
      const updatedSkills = currentSkills.includes(skillId)
        ? currentSkills.filter(id => id !== skillId)
        : [...currentSkills, skillId];
      
      console.log('Updating skills:', {
        currentSkills,
        updatedSkills,
        skillId
      });
      
      return {
        ...prev,
        skills: updatedSkills
      };
    });
  };

  const handleInputChange = (field: keyof Job, value: string) => {
    setNewJob(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Always render SkillsPopup, but toggle visibility
  const SkillsPopup = () => {
    // Ref for scrollable container
    const scrollRef = React.useRef<HTMLDivElement>(null);
    // Local state for selected skills
    const [selectedSkills, setSelectedSkills] = React.useState<string[]>([]);
    // Track if popup was just opened
    const prevOpenRef = React.useRef<string | null>(null);

    // When popup is opened, copy newJob.skills to local state
    React.useEffect(() => {
      if (isSkillsPopupOpen && prevOpenRef.current !== isSkillsPopupOpen) {
        setSelectedSkills(newJob.skills ? [...newJob.skills] : []);
        prevOpenRef.current = isSkillsPopupOpen;
      }
      if (!isSkillsPopupOpen) {
        prevOpenRef.current = null;
      }
    }, [isSkillsPopupOpen, newJob.skills]);

    // Scroll position logic (unchanged)
    const lastScroll = React.useRef<number>(0);
    const handleSkillToggleWithScroll = (skillId: string) => {
      if (scrollRef.current) {
        lastScroll.current = scrollRef.current.scrollTop;
      }
      setSelectedSkills(prev =>
        prev.includes(skillId)
          ? prev.filter(id => id !== skillId)
          : [...prev, skillId]
      );
    };
    React.useLayoutEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = lastScroll.current;
      }
    });
    React.useEffect(() => {
      if (scrollRef.current) {
        lastScroll.current = scrollRef.current.scrollTop;
      }
    }, [selectedSkills]);

    const handleDone = async () => {
      if (isSkillsPopupOpen !== 'new' && isSkillsPopupOpen) {
        await handleUpdateJob(isSkillsPopupOpen, selectedSkills);
        await fetchAll();
      }
      setIsSkillsPopupOpen(null);
    };

    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-200 ${isSkillsPopupOpen ? '' : 'hidden'}`}>
        <div ref={scrollRef} className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Select Skills</h3>
            <button
              onClick={() => setIsSkillsPopupOpen(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            {skillCategories.map((category) => (
              <div key={category.name} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">{category.name}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {category.skills.map((skill) => (
                    <label
                      key={skill.id}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill.id)}
                        onChange={() => handleSkillToggleWithScroll(skill.id)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm">{skill.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={handleDone}
              className="btn btn-primary"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (isAddingJob && !isEditingJob) {
      setNewJob({
        title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: '',
        description: '',
        skills: []
      });
    }
  }, [isAddingJob, isEditingJob]);

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="p-6">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-24 h-24 bg-slate-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Work Experience</h2>
          <button
            onClick={() => setIsAddingJob(true)}
            className="btn btn-primary flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
          >
            <Plus size={16} />
            Add Job
          </button>
        </div>

        {isAddingJob && (
          <div className="mb-6">
            <JobForm
              onSubmit={handleAddJob}
              onCancel={() => {
                setIsAddingJob(false);
                setNewJob({
                  title: '',
                  company: '',
                  location: '',
                  start_date: '',
                  end_date: '',
                  description: '',
                  skills: []
                });
              }}
              isEditing={false}
              job={newJob}
              onJobChange={handleInputChange}
              onSkillsToggle={handleSkillToggle}
              onSkillsPopupOpen={() => setIsSkillsPopupOpen('new')}
              skillCategories={skillCategories}
            />
          </div>
        )}

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500 to-teal-200"></div>

          <div className="space-y-6">
            {jobs.map((job, index) => (
              <div 
                key={job.id} 
                className="relative pl-10" 
                data-job-id={job.id}
                data-reference-id={references[job.id]?.[0]?.id}
                data-validator-id={job.skills?.[0] ? validators[job.skills[0]]?.[0]?.id : undefined}
              >
                {/* Timeline dot */}
                <div className="absolute left-0 w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-blue-400 border-4 border-white flex items-center justify-center shadow-lg z-10">
                  <Briefcase size={16} className="text-white" />
                </div>

                {isEditingJob === job.id ? (
                  <JobForm
                    onSubmit={() => handleUpdateJob(job.id)}
                    onCancel={() => {
                      setIsEditingJob(null);
                      setNewJob({
                        title: '',
                        company: '',
                        location: '',
                        start_date: '',
                        end_date: '',
                        description: '',
                        skills: []
                      });
                    }}
                    isEditing={true}
                    job={newJob}
                    onJobChange={handleInputChange}
                    onSkillsToggle={handleSkillToggle}
                    onSkillsPopupOpen={() => setIsSkillsPopupOpen(job.id)}
                    skillCategories={skillCategories}
                  />
                ) : (
                  <div className="bg-gradient-to-br from-white via-sky-50 to-teal-50 rounded-xl border border-teal-100 p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-teal-900 flex items-center gap-2">
                          {job.title}
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold">{job.company}</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">{job.location}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setNewJob({
                              ...job,
                              skills: job.skills || []
                            });
                            setIsSkillsPopupOpen(job.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
                          title="Edit Skills"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => handleEditClick(job)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit Job"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete Job"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-teal-500" />
                        <span>
                          {new Date(job.start_date).toLocaleDateString()} - {job.end_date ? new Date(job.end_date).toLocaleDateString() : 'Present'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-teal-500" />
                        <span>{job.location}</span>
                      </div>
                    </div>

                    {job.description && (
                      <p className="text-sm text-slate-700 mb-4 leading-relaxed">{job.description}</p>
                    )}

                    {/* References Section */}
                    {references[job.id] && references[job.id].length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                          <Users size={14} className="text-blue-500" />
                          <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide">References</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {references[job.id].map((reference) => (
                            <div 
                              key={reference.id} 
                              data-reference-id={reference.id}
                              className="bg-blue-50 rounded-full px-3 py-1 border border-blue-100 text-xs text-blue-800 flex items-center gap-2 shadow-sm"
                            >
                              <span className="font-medium">{reference.full_name}</span>
                              <span className="text-blue-400">|</span>
                              <span>{reference.email}</span>
                              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">Ref {reference.reference_number}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills and Validators Section */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle2 size={14} className="text-green-500" />
                          <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wide">Skills & Validators</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skillId) => {
                            const skill = skillCategories
                              .flatMap(cat => cat.skills)
                              .find(s => s.id === skillId);
                            const skillValidators = validators[skillId] || [];
                            return skill ? (
                              <div key={skillId} className="bg-green-50 rounded-full px-3 py-1 border border-green-100 text-xs text-green-800 flex items-center gap-2 shadow-sm">
                                <span className="font-medium">{skill.name}</span>
                                {skill.rank && (
                                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">Score {skill.rank}</span>
                                )}
                                {skillValidators.length > 0 && (
                                  <span className="ml-2 flex items-center gap-1">
                                    {skillValidators.map((validator) => (
                                      <span key={validator.id} className="bg-white border border-green-200 rounded-full px-2 py-0.5 text-green-700 font-medium ml-1">
                                        {validator.full_name}
                                      </span>
                                    ))}
                                  </span>
                                )}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {jobs.length === 0 && !isAddingJob && (
              <div className="text-center py-8 text-slate-500">
                <Briefcase size={24} className="mx-auto mb-2 text-slate-400" />
                <p className="text-sm mb-2">No work experience added yet</p>
                <button
                  onClick={() => setIsAddingJob(true)}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  Add your first job
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <SkillsPopup />

      <style>
        {`
          .highlight-item {
            animation: highlight 2s ease-out;
          }

          @keyframes highlight {
            0% {
              background-color: rgba(99, 102, 241, 0.1);
            }
            100% {
              background-color: transparent;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Timeline; 