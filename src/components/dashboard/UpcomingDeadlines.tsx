import React from 'react';
import { CalendarClock, Plus } from 'lucide-react';

const UpcomingDeadlines: React.FC = () => {
  return (
    <div className="space-y-3">
      <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-lg">
        <CalendarClock size={24} className="mx-auto text-slate-400 mb-3" />
        <h3 className="text-sm font-medium text-slate-600 mb-1">No upcoming deadlines</h3>
        <p className="text-sm text-slate-500 mb-4">
          Connect your Google Calendar to see your upcoming deadlines
        </p>
        <button className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
          <Plus size={16} className="mr-1.5" />
          Connect Calendar
        </button>
      </div>
    </div>
  );
};

export default UpcomingDeadlines;