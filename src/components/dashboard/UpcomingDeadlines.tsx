import React from 'react';
import { CalendarClock } from 'lucide-react';

interface UpcomingDeadlinesProps {
  googleToken?: string | null;
  calendarLoading?: boolean;
  calendarEvents?: any[];
}

const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ googleToken, calendarLoading, calendarEvents }) => {
  if (googleToken) {
    if (calendarLoading) {
      return (
        <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-lg">
          <div className="text-slate-500">Loading events...</div>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-lg">
          <h3 className="text-sm font-medium text-slate-600 mb-1">Upcoming Google Calendar Events</h3>
          {calendarEvents && calendarEvents.length > 0 ? (
            <ul className="space-y-1">
              {calendarEvents.map(event => (
                <li key={event.id} className="text-sm">
                  <span className="font-semibold">{event.summary}</span>
                  {event.start?.dateTime && (
                    <span className="ml-2 text-slate-500">{new Date(event.start.dateTime).toLocaleString()}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-slate-500">No upcoming events found.</div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-lg">
        <CalendarClock size={24} className="mx-auto text-slate-400 mb-3" />
        <h3 className="text-sm font-medium text-slate-600 mb-1">No upcoming deadlines</h3>
        <p className="text-sm text-slate-500 mb-4">
          Connect your Google Calendar to see your upcoming deadlines
        </p>
      </div>
    </div>
  );
};

export default UpcomingDeadlines;