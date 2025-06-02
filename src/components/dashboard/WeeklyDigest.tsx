import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, X } from 'lucide-react';

interface EITActivity {
  eit: {
    id: string;
    full_name: string;
    email: string;
    start_date: string;
    target_date: string;
  };
  activities: {
    score: number;
    feedback: string;
    validated_at: string;
    skills: {
      name: string;
    };
  }[];
}

const WeeklyDigest: React.FC = () => {
  const [showDigest, setShowDigest] = useState(false);
  const [eitActivities, setEitActivities] = useState<EITActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndShowDigest = async () => {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Check if it's the first workday of the week
      // If Monday is a holiday, show on Tuesday
      const isFirstWorkday = dayOfWeek === 1 || (dayOfWeek === 2 && isMondayHoliday(today));
      
      if (isFirstWorkday) {
        // Check if we've already shown the digest today
        const lastShown = localStorage.getItem('lastDigestShown');
        const todayStr = today.toDateString();
        
        if (lastShown !== todayStr) {
          await fetchEITActivities();
          setShowDigest(true);
          localStorage.setItem('lastDigestShown', todayStr);
        }
      }
    };

    checkAndShowDigest();
  }, []);

  const isMondayHoliday = (date: Date) => {
    // Check if the previous day (Monday) was a holiday
    const monday = new Date(date);
    monday.setDate(monday.getDate() - 1);
    
    // You can add more holiday checks here
    // For now, we'll just check for major US holidays
    const month = monday.getMonth();
    const day = monday.getDate();
    
    // Example holiday checks (you can expand this list)
    const holidays = [
      { month: 0, day: 1 },  // New Year's Day
      { month: 0, day: 15 }, // Martin Luther King Jr. Day
      { month: 1, day: 19 }, // Presidents' Day
      { month: 4, day: 27 }, // Memorial Day
      { month: 6, day: 4 },  // Independence Day
      { month: 8, day: 2 },  // Labor Day
      { month: 9, day: 14 }, // Columbus Day
      { month: 10, day: 11 }, // Veterans Day
      { month: 11, day: 25 }, // Christmas Day
    ];
    
    return holidays.some(holiday => holiday.month === month && holiday.day === day);
  };

  const fetchEITActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all connected EITs
      const { data: eits, error: eitsError } = await supabase
        .from('supervisor_eit_relationships')
        .select(`
          eit_profiles (
            id,
            full_name,
            email,
            start_date,
            target_date
          )
        `)
        .eq('supervisor_id', user.id)
        .eq('status', 'active');

      if (eitsError) throw eitsError;

      // Get recent activities for each EIT
      const activities = await Promise.all(
        eits.map(async (eit) => {
          const eitProfile = Array.isArray(eit.eit_profiles) ? eit.eit_profiles[0] : eit.eit_profiles;
          if (!eitProfile) return null;
          const { data: recentActivities } = await supabase
            .from('skill_validations')
            .select(`
              score,
              feedback,
              validated_at,
              skills (
                name
              )
            `)
            .eq('eit_id', eitProfile.id)
            .gte('validated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('validated_at', { ascending: false });

          // Ensure each activity.skills is a single object, not an array
          const normalizedActivities = (recentActivities || []).map((activity: any) => ({
            ...activity,
            skills: Array.isArray(activity.skills) ? activity.skills[0] : activity.skills
          }));

          return {
            eit: eitProfile,
            activities: normalizedActivities
          };
        })
      );

      setEitActivities(activities.filter(Boolean) as EITActivity[]);
    } catch (error) {
      console.error('Error fetching EIT activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!showDigest) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-teal-600" />
              <h2 className="text-2xl font-bold text-gray-900">Weekly EIT Progress Report</h2>
            </div>
            <button
              onClick={() => setShowDigest(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading weekly report...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {eitActivities.map(({ eit, activities }) => {
                // Calculate progress
                const [progress, setProgress] = React.useState<number | null>(null);
                const [completedSkills, setCompletedSkills] = React.useState<number | null>(null);
                const [documentedExperiences, setDocumentedExperiences] = React.useState<number | null>(null);
                const [supervisorApprovals, setSupervisorApprovals] = React.useState<number | null>(null);
                const [expectedProgress, setExpectedProgress] = React.useState<number | null>(null);
                const [progressColor, setProgressColor] = React.useState<'teal' | 'blue' | 'red'>('teal');
                const [progressDescription, setProgressDescription] = React.useState<string>('');
                React.useEffect(() => {
                  const fetchProgress = async () => {
                    // Skills
                    const { count: skillsCount } = await supabase
                      .from('eit_skills')
                      .select('id', { count: 'exact', head: true })
                      .eq('eit_id', eit.id)
                      .not('rank', 'is', null);
                    // Experiences
                    const { count: expCount } = await supabase
                      .from('experiences')
                      .select('id', { count: 'exact', head: true })
                      .eq('eit_id', eit.id);
                    // Approvals
                    const { count: apprCount } = await supabase
                      .from('experiences')
                      .select('id', { count: 'exact', head: true })
                      .eq('eit_id', eit.id)
                      .eq('supervisor_approved', true);
                    const completedSkills = skillsCount || 0;
                    const documentedExperiences = expCount || 0;
                    const supervisorApprovals = apprCount || 0;
                    setCompletedSkills(completedSkills);
                    setDocumentedExperiences(documentedExperiences);
                    setSupervisorApprovals(supervisorApprovals);
                    const skillsProgress = completedSkills / 22;
                    const experiencesProgress = documentedExperiences / 24;
                    const approvalsProgress = supervisorApprovals / 24;
                    const overallProgress = Math.round(((skillsProgress + experiencesProgress + approvalsProgress) / 3) * 100);
                    setProgress(overallProgress);
                    // Expected progress
                    if (eit.start_date && eit.target_date) {
                      const now = new Date();
                      const start = new Date(eit.start_date);
                      const end = new Date(eit.target_date);
                      const total = end.getTime() - start.getTime();
                      const elapsed = now.getTime() - start.getTime();
                      let percent = Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
                      setExpectedProgress(percent);
                      const delta = overallProgress - percent;
                      if (delta > 5) {
                        setProgressColor('teal');
                        setProgressDescription('Ahead of schedule');
                      } else if (delta >= -5) {
                        setProgressColor('blue');
                        setProgressDescription('On track');
                      } else {
                        setProgressColor('red');
                        setProgressDescription('Behind schedule');
                      }
                    }
                  };
                  fetchProgress();
                }, [eit.id, eit.start_date, eit.target_date]);
                return (
                  <div key={eit.id} className="border border-gray-200 rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{eit.full_name}</h3>
                        <p className="text-gray-500">{eit.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Program Start: {new Date(eit.start_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Target: {new Date(eit.target_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">Overall Progress</span>
                        <span className={`text-sm font-semibold ${progressColor === 'teal' ? 'text-teal-600' : progressColor === 'blue' ? 'text-blue-600' : 'text-red-600'}`}>{progress !== null ? `${progress}%` : '--'}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden max-w-xs w-full">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${progressColor === 'teal' ? 'bg-teal-500' : progressColor === 'blue' ? 'bg-blue-500' : 'bg-red-500'}`}
                          style={{ width: progress !== null ? `${progress}%` : '0%' }}
                        ></div>
                      </div>
                      {expectedProgress !== null && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          {progressDescription} (Expected: {expectedProgress}%)
                        </div>
                      )}
                      <div className="flex gap-4 text-xs text-slate-500 mt-2">
                        <span>Skills: {completedSkills !== null ? completedSkills : '--'}/22</span>
                        <span>Experiences: {documentedExperiences !== null ? documentedExperiences : '--'}/24</span>
                        <span>Approvals: {supervisorApprovals !== null ? supervisorApprovals : '--'}/24</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Recent Activities</h4>
                      {activities.length > 0 ? (
                        <div className="space-y-3">
                          {activities.map((activity, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium text-gray-900">{activity.skills.name}</h5>
                                  <p className="text-sm text-gray-500">
                                    {new Date(activity.validated_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                                  Score: {activity.score}/5
                                </div>
                              </div>
                              {activity.feedback && (
                                <p className="mt-2 text-sm text-gray-700">Feedback: {activity.feedback}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No recent activities</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyDigest; 