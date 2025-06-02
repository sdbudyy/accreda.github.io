import React from 'react';
import { PenTool, Bot, Edit3, Eye, Trash2, CheckSquare, Clock } from 'lucide-react';

const Essays: React.FC = () => {
  // Example data
  const essays = [
    {
      id: 1,
      title: 'Technical Problem Analysis',
      description: 'Self-Assessment Outcome (SAO) for problem analysis competency',
      status: 'complete',
      updatedAt: '2025-04-12',
      wordCount: 850
    },
    {
      id: 2,
      title: 'Team Leadership Experience',
      description: 'SAO documenting leadership skills in team environments',
      status: 'draft',
      updatedAt: '2025-04-08',
      wordCount: 620
    },
    {
      id: 3,
      title: 'Project Management Methodology',
      description: 'SAO for project planning and execution competency',
      status: 'ai-assisted',
      updatedAt: '2025-04-02',
      wordCount: 740
    },
    {
      id: 4,
      title: 'Professional Ethics Application',
      description: 'SAO for ethical decision making in engineering',
      status: 'in-review',
      updatedAt: '2025-03-25',
      wordCount: 910
    }
  ];

  const statusBadges = {
    'complete': 'bg-green-100 text-green-800 border-green-200',
    'draft': 'bg-slate-100 text-slate-800 border-slate-200',
    'ai-assisted': 'bg-purple-100 text-purple-800 border-purple-200',
    'in-review': 'bg-amber-100 text-amber-800 border-amber-200'
  };

  const statusIcons = {
    'complete': <CheckSquare size={16} className="mr-1" />,
    'draft': <Edit3 size={16} className="mr-1" />,
    'ai-assisted': <Bot size={16} className="mr-1" />,
    'in-review': <Clock size={16} className="mr-1" />
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Essays</h1>
        <p className="text-slate-500 mt-1">Manage your Self-Assessment Outcome (SAO) essays</p>
      </div>

      {/* Actions Row */}
      <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
        <button className="btn btn-primary flex items-center">
          <PenTool size={16} className="mr-1.5" />
          Create New Essay
        </button>
        
        <div className="flex items-center space-x-2">
          <select className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="all">All Essays</option>
            <option value="complete">Completed</option>
            <option value="draft">Drafts</option>
            <option value="ai-assisted">AI-Assisted</option>
            <option value="in-review">In Review</option>
          </select>
          
          <select className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="recent">Recently Updated</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Essays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {essays.map((essay) => (
          <div key={essay.id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between">
              <h3 className="font-semibold text-lg text-slate-800">{essay.title}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadges[essay.status as keyof typeof statusBadges]}`}>
                {statusIcons[essay.status as keyof typeof statusIcons]}
                {essay.status === 'ai-assisted' ? 'AI Assisted' : essay.status.charAt(0).toUpperCase() + essay.status.slice(1)}
              </span>
            </div>
            
            <p className="text-sm text-slate-600 mt-2">{essay.description}</p>
            
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                <span>Updated {new Date(essay.updatedAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</span>
                <span className="mx-2">•</span>
                <span>{essay.wordCount} words</span>
              </div>
              
              <div className="flex space-x-1">
                <button className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                  <Eye size={16} />
                </button>
                <button className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                  <Edit3 size={16} />
                </button>
                <button className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Essays;