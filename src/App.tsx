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
import { GoogleOAuthProvider } from '@react-oauth/google'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const initialize = useProgressStore(state => state.initialize)
  const setupRealtimeSubscriptions = useProgressStore(state => state.setupRealtimeSubscriptions)
  const loadUserSkills = useSkillsStore(state => state.loadUserSkills)
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={!session ? <Landing /> : <Navigate to="/dashboard" />} />
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
          element={session ? <Layout /> : <Navigate to="/" />}
        >
          <Route index element={<Dashboard />} />
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

        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </GoogleOAuthProvider>
  )
}

export default App