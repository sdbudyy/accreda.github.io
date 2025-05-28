import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Session } from '@supabase/supabase-js'
import Login from './components/auth/Login'
import SignUp from './components/auth/SignUp'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Skills from './pages/Skills'
import Documents from './pages/Documents'
import Essays from './pages/Essays'
import TextInput from './pages/TextInput'
import NotFound from './pages/NotFound'
import EditDocument from './pages/EditDocument'
import Settings from './pages/Settings'
import SAOs from './pages/SAOs'
import Support from './pages/Support'
import Landing from './pages/Landing'
import References from './pages/References'
import { useProgressStore } from './store/progress'
import { useSkillsStore } from './store/skills'
import { useEssayStore } from './store/essays'
import SupervisorLayout from './components/supervisor/SupervisorLayout'
import SupervisorTeam from './pages/SupervisorTeam'
import SupervisorReviews from './pages/SupervisorReviews'
import SupervisorDocuments from './pages/SupervisorDocuments'
import SupervisorSettings from './pages/SupervisorSettings'
import SupervisorSupport from './pages/SupervisorSupport'
import SupervisorDashboardContent from './pages/SupervisorDashboard'
import RoleBasedDashboard from './components/dashboard/RoleBasedDashboard'
import EitDashboardGate from './components/dashboard/EitDashboardGate'
import SupervisorSkills from './pages/SupervisorSkills'
import { useNotificationsStore } from './store/notifications'
import RealtimeNotifications from './components/common/RealtimeNotifications'
import { Toaster } from 'react-hot-toast'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const initialize = useProgressStore(state => state.initialize)
  const setupRealtimeSubscriptions = useProgressStore(state => state.setupRealtimeSubscriptions)
  const loadUserSkills = useSkillsStore(state => state.loadUserSkills)
  const initializeNotifications = useNotificationsStore(state => state.initialize)

  const initializeApp = async () => {
    try {
      console.log('Starting app initialization...');
      // First load skills, then initialize progress
      await loadUserSkills();
      console.log('Skills loaded successfully');
      await initialize();
      console.log('Progress initialized successfully');
      await setupRealtimeSubscriptions();
      console.log('Realtime subscriptions set up successfully');
      await initializeNotifications();
      console.log('Notifications initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
      // Don't throw the error, just log it
      // This prevents the app from crashing if initialization fails
    }
  }

  useEffect(() => {
    console.log('Checking for existing session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Session check result:', session ? 'Session found' : 'No session');
      setSession(session)
      setLoading(false)
      if (session) {
        console.log('Session found, initializing app...');
        initializeApp();
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session ? 'Session present' : 'No session');
      setSession(session)
      if (session) {
        console.log('New session detected, initializing app...');
        initializeApp();
      }
    })

    return () => subscription.unsubscribe()
  }, [initialize, setupRealtimeSubscriptions, loadUserSkills])

  // Auto sign-out after 30 minutes of tab inactivity (tab closed)
  useEffect(() => {
    const LAST_CLOSE_KEY = 'accreda_last_tab_close';
    const THIRTY_MINUTES = 30 * 60 * 1000;

    // On load, check if last close was > 30 min ago
    const lastClose = localStorage.getItem(LAST_CLOSE_KEY);
    if (lastClose) {
      const lastCloseTime = parseInt(lastClose, 10);
      if (!isNaN(lastCloseTime) && Date.now() - lastCloseTime > THIRTY_MINUTES) {
        // Sign out if session exists
        supabase.auth.signOut().then(() => {
          setSession(null);
        });
      }
    }

    // On unload, store timestamp
    const handleUnload = () => {
      localStorage.setItem(LAST_CLOSE_KEY, Date.now().toString());
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <>
      {session && <RealtimeNotifications userId={session.user.id} />}
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={!session ? <Landing /> : <RoleBasedDashboard />} />
        <Route
          path="/login"
          element={!session ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/signup"
          element={!session ? <SignUp /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/forgot-password"
          element={!session ? <ForgotPassword /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/reset-password"
          element={!session ? <ResetPassword /> : <Navigate to="/dashboard" />}
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={session ? <Layout appLoaded={!loading} /> : <Navigate to="/" />}
        >
          <Route index element={<EitDashboardGate />} />
          <Route path="skills" element={<Skills />} />
          <Route path="saos" element={<SAOs />} />
          <Route path="documents" element={<Documents />} />
          <Route path="essays" element={<Essays />} />
          <Route path="text-input" element={<TextInput />} />
          <Route path="edit-document/:id" element={<EditDocument />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Support />} />
          <Route path="references" element={<References />} />
        </Route>
        {/* Supervisor dashboard route */}
        <Route
          path="/dashboard/supervisor"
          element={session ? <SupervisorLayout appLoaded={!loading} /> : <Navigate to="/" />}
        >
          <Route index element={<SupervisorDashboardContent />} />
          <Route path="team" element={<SupervisorTeam />} />
          <Route path="reviews" element={<SupervisorReviews />} />
          <Route path="documents" element={<SupervisorDocuments />} />
          <Route path="settings" element={<SupervisorSettings />} />
          <Route path="support" element={<SupervisorSupport />} />
          <Route path="skills" element={<SupervisorSkills />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App