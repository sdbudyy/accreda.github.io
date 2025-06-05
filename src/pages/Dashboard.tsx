import React, { useEffect, useState, Suspense } from 'react';
import { Clock, Calendar, Award, BarChart3, ArrowRight } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProgressStore } from '../store/progress';
import { useEssayStore } from '../store/essays';
import { useSkillsStore } from '../store/skills';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useSAOsStore } from '../store/saos';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy load heavy dashboard components
const ProgressCard = React.lazy(() => import('../components/eitdashboard/ProgressCard'));
const RecentActivities = React.lazy(() => import('../components/eitdashboard/RecentActivities'));
const UpcomingDeadlines = React.lazy(() => import('../components/eitdashboard/UpcomingDeadlines'));
const SkillsOverview = React.lazy(() => import('../components/eitdashboard/SkillsOverview'));

type ProgressStat = {
  title: string;
  value: number;
  total?: number;
  description: string;
  color: 'teal' | 'blue' | 'indigo' | 'purple';
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { appLoaded } = useOutletContext<{ appLoaded: boolean }>();
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<'eit' | 'supervisor' | null>(null);
  const {
    overallProgress,
    completedSkills,
    totalSkills,
    documentedExperiences,
    totalExperiences,
    supervisorApprovals,
    totalApprovals,
    lastUpdated,
    loading,
    updateProgress,
    initialize
  } = useProgressStore();
  const startWriting = useEssayStore(state => state.startWriting);
  const essayLoading = useEssayStore(state => state.loading);
  const loadUserSkills = useSkillsStore(state => state.loadUserSkills);
  const { saos, loading: saosLoading, loadUserSAOs } = useSAOsStore();
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  console.log('Google Client ID (from import.meta.env):', GOOGLE_CLIENT_ID);
  const [roleLoading, setRoleLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cache for user profile data
  const [userProfileCache, setUserProfileCache] = useState<any>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        // Fetch profile name from eit_profiles or supervisor_profiles
        let profileName = '';
        const [eitProfile, supervisorProfile] = await Promise.all([
          supabase.from('eit_profiles').select('full_name').eq('id', user.id).single(),
          supabase.from('supervisor_profiles').select('full_name').eq('id', user.id).single()
        ]);
        if (supervisorProfile.data && supervisorProfile.data.full_name) {
          setUserName(supervisorProfile.data.full_name);
          setUserRole('supervisor');
        } else if (eitProfile.data && eitProfile.data.full_name) {
          setUserName(eitProfile.data.full_name);
          setUserRole('eit');
        } else {
          setUserName(user.email?.split('@')[0] || 'User');
        }

        // Parallel data fetching
        const [
          skillsData,
          progressData,
          saosData
        ] = await Promise.all([
          loadUserSkills(),
          initialize(),
          saos.length === 0 && !saosLoading ? loadUserSAOs() : Promise.resolve()
        ]);

        // Cache user profile data
        setUserProfileCache({
          eitProfile: eitProfile.data,
          supervisorProfile: supervisorProfile.data
        });

      } catch (error) {
        console.error('Error initializing dashboard data:', error);
      } finally {
        setRoleLoading(false);
      }
    };

    initializeData();
  }, [loadUserSkills, initialize, saos.length, saosLoading, loadUserSAOs]);

  // Fetch Google Calendar events when token changes
  useEffect(() => {
    if (googleToken) {
      setCalendarLoading(true);
      fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=5&orderBy=startTime&singleEvents=true&timeMin=' + new Date().toISOString(), {
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          setCalendarEvents(data.items || []);
        })
        .catch(() => setCalendarEvents([]))
        .finally(() => setCalendarLoading(false));
    }
  }, [googleToken]);

  const completedSAOs = saos.filter(sao => sao.status === 'complete');
  const progressStats: ProgressStat[] = [
    { 
      title: 'Overall Progress', 
      value: overallProgress,
      description: overallProgress >= 75 ? 'Excellent progress!' : 
                 overallProgress >= 50 ? 'Good progress!' : 
                 overallProgress >= 25 ? 'Keep going!' : 'Just getting started!',
      color: 'teal' 
    },
    { 
      title: 'Completed Skills', 
      value: completedSkills,
      total: totalSkills,
      description: `${totalSkills - completedSkills} skills remaining to complete`,
      color: 'blue' 
    },
    { 
      title: 'Completed SAOs', 
      value: completedSAOs.length,
      total: 24,
      description: `${24 - completedSAOs.length} SAOs remaining to complete`,
      color: 'indigo' 
    },
  ];

  // Calculate expected progress for EITs
  let expectedProgress = null;
  let progressColor: 'teal' | 'blue' | 'purple' = 'teal';
  let progressDescription = '';
  if (userRole === 'eit' && userProfileCache?.eitProfile) {
    const { start_date, target_date } = userProfileCache.eitProfile;
    if (start_date && target_date) {
      const now = new Date();
      const start = new Date(start_date);
      const end = new Date(target_date);
      const total = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      let percent = Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
      expectedProgress = percent;
      const delta = overallProgress - percent;
      if (delta > 5) {
        progressColor = 'teal';
        progressDescription = 'Ahead of schedule';
      } else if (delta >= -5) {
        progressColor = 'blue';
        progressDescription = 'On track';
      } else {
        progressColor = 'purple'; // Use purple for 'behind' as ProgressCard supports it
        progressDescription = 'Behind schedule';
      }
    }
  }

  const formatLastUpdated = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (roleLoading && appLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
            Welcome back, {userName || 'Engineer'}!
            {userRole && (
              <span
                className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold
                  ${userRole === 'eit' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}
              >
                {userRole === 'eit' ? 'EIT' : 'Supervisor'}
              </span>
            )}
          </h1>
          <p className="text-slate-500 mt-1">
            {userRole === 'eit' ? "Here's an overview of your EIT progress" : "Here's an overview of your team's progress"}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <span className="text-sm text-slate-500 flex items-center">
            <Clock size={14} className="mr-1" /> 
            Last updated: {formatLastUpdated(lastUpdated)}
          </span>
          <button 
            className={`btn btn-primary ${refreshing ? 'opacity-75 cursor-not-allowed' : ''}`}
            onClick={async () => {
              if (!refreshing) {
                setRefreshing(true);
                try {
                  await Promise.all([
                    loadUserSkills(),
                    updateProgress(true),
                    loadUserSAOs()
                  ]);
                } catch (error) {
                  console.error('Error refreshing dashboard:', error);
                } finally {
                  setRefreshing(false);
                }
              }
            }}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Progress Cards */}
      <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-32" />)}</div>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProgressCard
            title="Overall Progress"
            value={overallProgress}
            total={100}
            description={
              userRole === 'eit' && expectedProgress !== null
                ? `${progressDescription} (Expected: ${expectedProgress}%)`
                : overallProgress >= 75 ? 'Excellent progress!' : 
                  overallProgress >= 50 ? 'Good progress!' : 
                  overallProgress >= 25 ? 'Keep going!' : 'Just getting started!'
            }
            color={userRole === 'eit' && expectedProgress !== null ? progressColor : 'teal'}
          />
          {progressStats.slice(1).map((stat, index) => (
            <ProgressCard key={index} {...stat} />
          ))}
        </div>
      </Suspense>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Calendar size={18} className="mr-2 text-teal-600" />
                Recent Activities
              </h2>
            </div>
            <Suspense fallback={<div className="p-6 text-center text-slate-400">Loading activities...</div>}>
              <RecentActivities />
            </Suspense>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <Award size={18} className="mr-2 text-teal-600" />
                Upcoming Deadlines
              </h2>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Only show SkillsOverview for EITs */}
          {userRole === 'eit' && (
            <Suspense fallback={<div className="card animate-pulse h-32" />}> 
              <SkillsOverview />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DashboardWithBoundary() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}