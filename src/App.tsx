import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState, Suspense, lazy } from 'react'
import { supabase } from './lib/supabase'
import { Session } from '@supabase/supabase-js'
import Login from './components/auth/Login'
import SignUp from './components/auth/SignUp'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import Layout from './components/Layout'
import { useProgressStore } from './store/progress'
import { useSkillsStore } from './store/skills'
import { useEssayStore } from './store/essays'
import SupervisorLayout from './components/supervisor/SupervisorLayout'
import { useNotificationsStore } from './store/notifications'
import RealtimeNotifications from './components/common/RealtimeNotifications'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import ProtectedRoute from './components/auth/ProtectedRoute'
import RoleBasedDashboard from './components/dashboard/RoleBasedDashboard'
import EitDashboardGate from './components/dashboard/EitDashboardGate'
import NotFound from './pages/NotFound'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Skills = lazy(() => import('./pages/Skills'))
const Documents = lazy(() => import('./pages/Documents'))
const Essays = lazy(() => import('./pages/Essays'))
const TextInput = lazy(() => import('./pages/TextInput'))
const EditDocument = lazy(() => import('./pages/EditDocument'))
const Settings = lazy(() => import('./pages/Settings'))
const SAOs = lazy(() => import('./pages/SAOs'))
const Support = lazy(() => import('./pages/Support'))
const Landing = lazy(() => import('./pages/Landing'))
const References = lazy(() => import('./pages/References'))
const SupervisorTeam = lazy(() => import('./pages/SupervisorTeam'))
const SupervisorReviews = lazy(() => import('./pages/SupervisorReviews'))
const SupervisorDocuments = lazy(() => import('./pages/SupervisorDocuments'))
const SupervisorSettings = lazy(() => import('./pages/SupervisorSettings'))
const SupervisorSupport = lazy(() => import('./pages/SupervisorSupport'))
const SupervisorDashboardContent = lazy(() => import('./pages/SupervisorDashboard'))
const SupervisorSkills = lazy(() => import('./pages/SupervisorSkills'))
const ThankYou = lazy(() => import('./pages/ThankYou'))
const Enterprise = lazy(() => import('./pages/Enterprise'))

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { loadProgress } = useProgressStore()
  const { loadSkills } = useSkillsStore()
  const { loadEssays } = useEssayStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      const progressStore = useProgressStore.getState();
      progressStore.initialize(true).then(() => {
        progressStore.setupRealtimeSubscriptions();
      });
      loadSkills();
      loadEssays();
    }
  }, [session, loadSkills, loadEssays]);

  useEffect(() => {
    // Always initialize notifications on app load or after login
    useNotificationsStore.getState().initialize();
  }, []);

  return (
    <>
      {session && <RealtimeNotifications userId={session.user.id} />}
      <Toaster position="top-right" />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={!session ? <Landing /> : <RoleBasedDashboard />} />
          <Route path="/pricing" element={<Navigate to="/?scroll=pricing" replace />} />
          <Route path="/#pricing" element={<Navigate to="/?scroll=pricing" replace />} />
          <Route
            path="/login"
            element={!session ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/signup"
            element={!session ? <SignUp /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/enterprise"
            element={<Enterprise />}
          />
          <Route
            path="/forgot-password"
            element={!session ? <ForgotPassword /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/reset-password"
            element={!session ? <ResetPassword /> : <Navigate to="/dashboard" />}
          />
          <Route path="/thank-you" element={<ThankYou />} />

          {/* Protected EIT routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="eit">
                <Layout appLoaded={!loading} />
              </ProtectedRoute>
            }
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

          {/* Protected Supervisor routes */}
          <Route
            path="/dashboard/supervisor"
            element={
              <ProtectedRoute requiredRole="supervisor">
                <SupervisorLayout appLoaded={!loading} />
              </ProtectedRoute>
            }
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
      </Suspense>
      <Analytics />
      <SpeedInsights />
    </>
  )
}

export default App