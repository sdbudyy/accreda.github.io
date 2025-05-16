import React, { useEffect, useState, Suspense } from 'react';
import { Clock, Calendar, Award, BarChart3, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useProgressStore } from '../store/progress';
import { useEssayStore } from '../store/essays';
import { useSkillsStore } from '../store/skills';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useSAOsStore } from '../store/saos';
import SupervisorDashboard from '../components/dashboard/SupervisorDashboard';
import EITDashboard from '../components/eitdashboard/EITDashboard';

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

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (user.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      }

      // Check user role
      const { data: eitProfile } = await supabase
        .from('eit_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      const { data: supervisorProfile } = await supabase
        .from('supervisor_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (supervisorProfile) {
        setUserRole('supervisor');
      } else if (eitProfile) {
        setUserRole('eit');
      }
      setRoleLoading(false);
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

  if (roleLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (userRole === 'supervisor') {
    return <SupervisorDashboard />;
  }

  return <EITDashboard />;
};

export default function DashboardWithBoundary() {
  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
        <Dashboard />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}