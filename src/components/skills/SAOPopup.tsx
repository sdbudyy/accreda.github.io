import React from 'react';
import { X, ExternalLink, Briefcase, MessageSquare } from 'lucide-react';
import { SAO } from '../../store/saos';
import { useNavigate } from 'react-router-dom';
import SAOFeedbackComponent from '../saos/SAOFeedback';

interface Job {
  id: string;
  title: string;
  company: string;
  start_date: string;
  end_date?: string;
}

interface LinksPopupProps {
  isOpen: boolean;
  onClose: () => void;
  skillName: string;
  saos: SAO[];
  jobs: Job[];
}

const LinksPopup: React.FC<LinksPopupProps> = ({ isOpen, onClose, skillName, saos, jobs }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleOpenSAO = (saoId: string) => {
    navigate(`/saos?saoId=${saoId}`);
    onClose();
  };

  const handleOpenJob = (jobId: string) => {
    navigate(`/references?jobId=${jobId}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Linked Items for {skillName}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* SAOs Section */}
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Linked SAOs</h4>
            <div className="space-y-4">
              {saos.length > 0 ? (
                saos.map((sao) => (
                  <div key={sao.id} className="border rounded-lg p-4 hover:bg-slate-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{sao.title}</h4>
                        {sao.feedback && sao.feedback.length > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <MessageSquare size={14} className="text-blue-500" />
                            <span className="text-xs text-blue-600">
                              {sao.feedback.some(f => f.status === 'pending') ? 'Feedback Pending' : 'Has Feedback'}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleOpenSAO(sao.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Open SAO"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600">{sao.content}</p>
                    {sao.feedback && sao.feedback.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <SAOFeedbackComponent
                          feedback={sao.feedback}
                          onResolve={async () => Promise.resolve()}
                          onSubmitFeedback={async () => Promise.resolve()}
                          isSupervisor={false}
                        />
                      </div>
                    )}
                    <div className="mt-2 text-xs text-slate-500">
                      Created: {new Date(sao.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">No SAOs linked to this skill yet.</p>
              )}
            </div>
          </div>

          {/* Jobs Section */}
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Linked Jobs</h4>
            <div className="space-y-4">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:bg-slate-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-slate-900">{job.title}</h4>
                        <p className="text-sm text-slate-600">{job.company}</p>
                      </div>
                      <button
                        onClick={() => handleOpenJob(job.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Open Job"
                      >
                        <Briefcase size={18} />
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {new Date(job.start_date).toLocaleDateString()} - {job.end_date ? new Date(job.end_date).toLocaleDateString() : 'Present'}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">No jobs linked to this skill yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinksPopup; 