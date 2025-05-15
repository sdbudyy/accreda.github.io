import React, { useEffect, useState, Suspense } from 'react';
import { Clock, Calendar, Award, BarChart3, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
// Lazy load heavy dashboard components
const ProgressCard = React.lazy(() => import('../components/dashboard/ProgressCard'));
const RecentActivities = React.lazy(() => import('../components/dashboard/RecentActivities'));
const UpcomingDeadlines = React.lazy(() => import('../components/dashboard/UpcomingDeadlines'));
const SkillsOverview = React.lazy(() => import('../components/dashboard/SkillsOverview'));
import { useProgressStore } from '../store/progress';
import { useEssayStore } from '../store/essays';
import { useSkillsStore } from '../store/skills';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useSAOsStore } from '../store/saos';

type ProgressStat = {
  title: string;
  value: number;
  total?: number;
  description: string;
  color: 'teal' | 'blue' | 'indigo' | 'purple';
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
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

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      }
    };

    const initializeData = async () => {
      try {
        // First load skills, then initialize progress
        await loadUserSkills();
        await initialize();
        await getUserProfile();
        // Load SAOs on mount if not already loaded
        if (saos.length === 0 && !saosLoading) {
          loadUserSAOs();
        }
      } catch (error) {
        console.error('Error initializing dashboard data:', error);
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
      title: 'SAOs Completed', 
      value: saos.length,
      total: 24,
      description: `${24 - saos.length} SAOs remaining to complete`,
      color: 'indigo' 
    },
    { 
      title: 'Supervisor Approvals', 
      value: supervisorApprovals,
      total: totalApprovals,
      description: `${totalApprovals - supervisorApprovals} items pending approval`,
      color: 'purple' 
    },
  ];

  const formatLastUpdated = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Use useGoogleLogin for one-click auth
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setGoogleToken(tokenResponse.access_token);
    },
    onError: () => {
      alert('Google Login Failed');
    },
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    flow: 'implicit',
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Welcome back, {userName || 'Engineer'}!
          </h1>
          <p className="text-slate-500 mt-1">Here's an overview of your EIT progress</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <span className="text-sm text-slate-500 flex items-center">
            <Clock size={14} className="mr-1" /> 
            Last updated: {formatLastUpdated(lastUpdated)}
          </span>
          <button 
            className={`btn btn-primary ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            onClick={() => {
              if (!loading) {
                loadUserSkills().then(() => updateProgress());
              }
            }}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Warn if client ID is missing */}
      {!GOOGLE_CLIENT_ID && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          Google Client ID is not set. Please configure VITE_GOOGLE_CLIENT_ID in your .env file.<br />
          <span className="text-xs">Current value: {String(GOOGLE_CLIENT_ID)}</span>
        </div>
      )}

      {/* Progress Cards */}
      <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="card animate-pulse h-32" />)}</div>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {progressStats.map((stat, index) => (
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
              <div className="flex items-center space-x-2">
                <button className="text-sm text-teal-600 hover:text-teal-700 flex items-center">
                  View All <ArrowRight size={14} className="ml-1" />
                </button>
                {/* One-click Connect Calendar Button */}
                {!googleToken && (
                  <button
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center border border-blue-200 rounded px-2 py-1 ml-2"
                    onClick={() => login()}
                    type="button"
                  >
                    Connect Calendar
                  </button>
                )}
              </div>
            </div>
            {/* Show Google Calendar iframe if connected, else show UpcomingDeadlines */}
            {googleToken ? (
              <div className="flex justify-center py-4">
                <iframe
                  src="https://calendar.google.com/calendar/embed?mode=AGENDA"
                  style={{ border: 0, width: '100%', height: '400px', minHeight: '300px' }}
                  frameBorder="0"
                  scrolling="no"
                  title="Google Calendar"
                ></iframe>
              </div>
            ) : (
              <Suspense fallback={<div className="p-6 text-center text-slate-400">Loading deadlines...</div>}>
                <UpcomingDeadlines />
              </Suspense>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Suspense fallback={<div className="card animate-pulse h-32" />}> 
            <SkillsOverview />
          </Suspense>
          <div className="card border-2 border-teal-100 bg-teal-50/50">
            <h3 className="font-semibold text-teal-800 mb-2">AI Writing Assistant</h3>
            <p className="text-sm text-teal-700 mb-3">
              Let our AI help you draft your next Self-Assessment Outcome (SAO) essay based on your documented experiences.
            </p>
            <button 
              className={`btn btn-primary w-full ${essayLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              onClick={() => startWriting()}
              disabled={essayLoading}
            >
              {essayLoading ? 'Generating...' : 'Start Writing'}
            </button>
          </div>
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