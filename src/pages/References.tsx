import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, Users, CheckCircle2, Award, X, Edit2, Briefcase, Calendar, MapPin, Plus } from 'lucide-react';
import Timeline from '../components/references/Timeline';
import { useSkillsStore } from '../store/skills';
import { supabase } from '../lib/supabase';

interface Validator {
  id: string;
  full_name: string;
  email: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string;
  skills?: string[];
}

interface Reference {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  description: string;
  reference_number: number;
  created_at: string;
  updated_at: string;
}

interface ValidatorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  skillName: string;
  skillId: string;
  existingValidator?: Validator;
  onSave: () => void;
}

interface ReferencePopupProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  referenceNumber: number;
  existingReference?: Reference;
  onSave: () => void;
}

const ValidatorPopup: React.FC<ValidatorPopupProps> = ({ 
  isOpen, 
  onClose, 
  skillName, 
  skillId,
  existingValidator,
  onSave 
}) => {
  const [formData, setFormData] = useState({
    fullName: existingValidator?.full_name || '',
    email: existingValidator?.email || '',
    description: existingValidator?.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingValidator) {
      setFormData({
        fullName: existingValidator.full_name,
        email: existingValidator.email,
        description: existingValidator.description
      });
    }
  }, [existingValidator]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      if (existingValidator) {
        // Update existing validator
        const { error: updateError } = await supabase
          .from('validators')
          .update({
            full_name: formData.fullName,
            email: formData.email,
            description: formData.description
          })
          .eq('id', existingValidator.id);

        if (updateError) throw updateError;
      } else {
        // Create new validator
        const { error: insertError } = await supabase
          .from('validators')
          .insert([{
            eit_id: user.id,
            skill_id: skillId,
            full_name: formData.fullName,
            email: formData.email,
            description: formData.description
          }]);

        if (insertError) throw insertError;
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {existingValidator ? 'Edit' : 'Add'} Validator for {skillName}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter validator's full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter validator's email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter description of validation"
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : existingValidator ? 'Update Validator' : 'Add Validator'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReferencePopup: React.FC<ReferencePopupProps> = ({
  isOpen,
  onClose,
  job,
  referenceNumber,
  existingReference,
  onSave
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form data when popup opens/closes or when reference changes
  useEffect(() => {
    if (isOpen) {
      if (existingReference) {
        setFormData({
          fullName: existingReference.full_name,
          email: existingReference.email,
          description: existingReference.description
        });
      } else {
        setFormData({
          fullName: '',
          email: '',
          description: ''
        });
      }
    }
  }, [isOpen, existingReference]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      if (existingReference) {
        // Update existing reference
        const { error: updateError } = await supabase
          .from('job_references')
          .update({
            full_name: formData.fullName,
            email: formData.email,
            description: formData.description
          })
          .eq('id', existingReference.id);

        if (updateError) throw updateError;
      } else {
        // Create new reference
        const { error: insertError } = await supabase
          .from('job_references')
          .insert([{
            job_id: job.id,
            full_name: formData.fullName,
            email: formData.email,
            description: formData.description
          }]);

        if (insertError) throw insertError;
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {existingReference ? 'Edit' : 'Add'} Reference {referenceNumber} for {job.title} at {job.company}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter reference's full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter reference's email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter description of reference"
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : existingReference ? 'Update Reference' : 'Add Reference'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const References: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'references' | 'validators'>('references');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null);
  const [selectedReferenceNumber, setSelectedReferenceNumber] = useState<number | null>(null);
  const [validators, setValidators] = useState<Record<string, Validator[]>>({});
  const [references, setReferences] = useState<Record<string, Reference[]>>({});
  const [jobs, setJobs] = useState<Job[]>([]);
  const { skillCategories } = useSkillsStore();
  const workExperienceRef = useRef<HTMLDivElement>(null);
  const referencesSectionRef = useRef<HTMLDivElement>(null);
  const validatorsSectionRef = useRef<HTMLDivElement>(null);

  // Get completed skills grouped by category
  const completedSkillsByCategory = skillCategories.map(category => ({
    ...category,
    skills: category.skills.filter(skill => skill.status === 'completed' || skill.rank !== undefined)
  })).filter(category => category.skills.length > 0);

  const getMeanColor = (mean: number) => {
    if (mean >= 4.5) return 'bg-green-100 text-green-700';
    if (mean >= 3.5) return 'bg-blue-100 text-blue-700';
    if (mean >= 2.5) return 'bg-yellow-100 text-yellow-700';
    if (mean >= 1.5) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const loadValidators = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('validators')
        .select('*')
        .eq('eit_id', user.id);

      if (error) throw error;

      // Group validators by skill_id
      const groupedValidators = data.reduce((acc, validator) => {
        if (!acc[validator.skill_id]) {
          acc[validator.skill_id] = [];
        }
        acc[validator.skill_id].push(validator);
        return acc;
      }, {} as Record<string, Validator[]>);

      setValidators(groupedValidators);
    } catch (error) {
      console.error('Error loading validators:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('eit_id', user.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadReferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('job_references')
        .select('*')
        .eq('eit_id', user.id);

      if (error) throw error;

      // Group references by job_id
      const groupedReferences = data.reduce((acc, reference) => {
        if (!acc[reference.job_id]) {
          acc[reference.job_id] = [];
        }
        acc[reference.job_id].push(reference);
        return acc;
      }, {} as Record<string, Reference[]>);

      setReferences(groupedReferences);
    } catch (error) {
      console.error('Error loading references:', error);
    }
  };

  useEffect(() => {
    loadValidators();
    loadJobs();
    loadReferences();
  }, []);

  useEffect(() => {
    const handleScrollToItem = (event: any) => {
      const { itemId, itemType } = event.detail || {};
      if (itemType === 'reference') {
        setActiveTab('references');
        setTimeout(() => {
          referencesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else if (itemType === 'validator') {
        setActiveTab('validators');
        setTimeout(() => {
          validatorsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else if (itemType === 'job') {
        workExperienceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
    window.addEventListener('scroll-to-item', handleScrollToItem);
    return () => window.removeEventListener('scroll-to-item', handleScrollToItem);
  }, []);

  useEffect(() => {
    const handleJobsUpdated = () => {
      loadJobs();
      loadReferences();
    };
    window.addEventListener('jobs-updated', handleJobsUpdated);
    return () => window.removeEventListener('jobs-updated', handleJobsUpdated);
  }, []);

  const handleValidatorSave = () => {
    loadValidators();
  };

  const handleReferenceSave = () => {
    loadReferences();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between" ref={workExperienceRef}>
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center">
          <Bookmark size={24} className="mr-2 text-teal-600" />
          Jobs
        </h1>
      </div>

      {/* Work Experience Timeline */}
      <Timeline />

      {/* References and Validators Toggle */}
      <div className="card" ref={referencesSectionRef}>
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('references')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'references'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users size={18} />
              References
            </div>
          </button>
          <button
            onClick={() => setActiveTab('validators')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'validators'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 size={18} />
              Validators
            </div>
          </button>
        </div>

        <div className="p-6" ref={validatorsSectionRef}>
          {activeTab === 'references' ? (
            <div className="space-y-6">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-lg border border-slate-200 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">{job.title}</h3>
                        <p className="text-slate-600">{job.company}</p>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2].map((refNum) => {
                          const reference = references[job.id]?.find(r => r.reference_number === refNum);
                          return reference ? (
                            <button
                              key={reference.id}
                              onClick={() => {
                                setSelectedJob(job);
                                setSelectedReference(reference);
                                setSelectedReferenceNumber(refNum);
                              }}
                              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                            >
                              <Edit2 size={14} />
                              Reference {refNum}: {reference.full_name}
                            </button>
                          ) : (
                            <button
                              key={refNum}
                              onClick={() => {
                                setSelectedJob(job);
                                setSelectedReference(null);
                                setSelectedReferenceNumber(refNum);
                              }}
                              className="px-3 py-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-2"
                            >
                              <Plus size={14} />
                              Add Reference {refNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          {new Date(job.start_date).toLocaleDateString()} - {job.end_date ? new Date(job.end_date).toLocaleDateString() : 'Present'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{job.location}</span>
                      </div>
                    </div>

                    {job.description && (
                      <p className="text-slate-600 text-sm mb-3">{job.description}</p>
                    )}

                    {job.skills && job.skills.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skillId) => {
                            const skill = skillCategories
                              .flatMap(cat => cat.skills)
                              .find(s => s.id === skillId);
                            return skill ? (
                              <span
                                key={skillId}
                                className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs"
                              >
                                {skill.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Briefcase size={24} className="mx-auto mb-2 text-slate-400" />
                  <p>No work experience added yet</p>
                  <p className="text-sm mt-1">Add jobs in the Work Experience section above</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {completedSkillsByCategory.length > 0 ? (
                completedSkillsByCategory.map((category) => {
                  const completed = category.skills.length;
                  const mean = category.skills.reduce((acc, skill) => acc + (skill.rank || 0), 0) / completed;
                  
                  return (
                    <div key={category.name} className="card">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                          <h2 className="text-lg font-semibold">{category.name}</h2>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getMeanColor(mean)}`}>
                            <Award size={16} />
                            <span className="text-sm font-medium">Mean Score: {mean.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 text-green-700 mr-2">
                            <span className="text-sm font-bold">{completed}</span>
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
                            <div className="flex items-center gap-4">
                              <span className={`text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-800`}>
                                Score {skill.rank}
                              </span>
                              <CheckCircle2 size={18} className="text-green-500" />
                              <span className="font-medium">{skill.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {validators[skill.id]?.map((validator) => (
                                <button
                                  key={validator.id}
                                  onClick={() => {
                                    setSelectedSkill(skill.id);
                                    setSelectedValidator(validator);
                                  }}
                                  className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <Edit2 size={14} />
                                  {validator.full_name}
                                </button>
                              ))}
                              {(!validators[skill.id] || validators[skill.id].length === 0) && (
                                <button
                                  onClick={() => {
                                    setSelectedSkill(skill.id);
                                    setSelectedValidator(null);
                                  }}
                                  className="px-3 py-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                                >
                                  Add Validator
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle2 size={24} className="mx-auto mb-2 text-slate-400" />
                  <p>No completed skills yet</p>
                  <p className="text-sm mt-1">Complete skills in the Skills section to see them here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Validator Popup */}
      <ValidatorPopup
        isOpen={selectedSkill !== null}
        onClose={() => {
          setSelectedSkill(null);
          setSelectedValidator(null);
        }}
        skillName={selectedSkill ? skillCategories
          .flatMap(cat => cat.skills)
          .find(s => s.id === selectedSkill)?.name || '' : ''}
        skillId={selectedSkill || ''}
        existingValidator={selectedValidator || undefined}
        onSave={handleValidatorSave}
      />

      {/* Reference Popup */}
      <ReferencePopup
        isOpen={selectedJob !== null && selectedReferenceNumber !== null}
        onClose={() => {
          setSelectedJob(null);
          setSelectedReference(null);
          setSelectedReferenceNumber(null);
        }}
        job={selectedJob!}
        referenceNumber={selectedReferenceNumber!}
        existingReference={selectedReference || undefined}
        onSave={handleReferenceSave}
      />
    </div>
  );
};

export default References; 