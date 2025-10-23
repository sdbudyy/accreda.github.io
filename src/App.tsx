import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Session } from '@supabase/supabase-js'
import Login from './components/auth/Login'
import SignUp from './components/auth/SignUp'
import ForgotPassword from './components/auth/ForgotPassword'
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
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import ProtectedRoute from './components/auth/ProtectedRoute'
import ThankYou from './pages/ThankYou'
import Enterprise from './pages/Enterprise'
import { UserProfileProvider } from './context/UserProfileContext'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import MagicLinkRedirect from './pages/MagicLinkRedirect'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { loadProgress } = useProgressStore()
  const { loadSkills } = useSkillsStore()
  const { loadEssays } = useEssayStore()
  const location = useLocation()

  // No special handling needed for email login

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
    <UserProfileProvider>
      {session && <RealtimeNotifications userId={session.user.id} />}
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/pricing" element={<Navigate to="/?scroll=pricing" replace />} />
        <Route path="/#pricing" element={<Navigate to="/?scroll=pricing" replace />} />
        <Route path="/peng-requirements" element={<Navigate to="/" replace />} />
        <Route path="/peng-lethbridge" element={<Navigate to="/" replace />} />
        <Route path="/peng-edmonton" element={<Navigate to="/" replace />} />
        <Route path="/calgary" element={<Navigate to="/" replace />} />
        <Route path="/fort-mcmurray" element={<Navigate to="/" replace />} />
        <Route path="/peng-progress" element={<Navigate to="/" replace />} />
        <Route path="/apega" element={<Navigate to="/" replace />} />
        <Route path="/peng-tracker" element={<Navigate to="/" replace />} />
        <Route path="/peng-application" element={<Navigate to="/" replace />} />
        <Route path="/edmonton" element={<Navigate to="/" replace />} />
        <Route path="/engineer-in-training-alberta" element={<Navigate to="/" replace />} />
        <Route path="/lethbridge" element={<Navigate to="/" replace />} />
        <Route path="/alberta" element={<Navigate to="/" replace />} />
        <Route path="/peng-alberta" element={<Navigate to="/" replace />} />
        <Route path="/peng-calgary" element={<Navigate to="/" replace />} />
        <Route path="/terms" element={<Terms />} />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/signup"
          element={<SignUp />}
        />
        <Route
          path="/enterprise"
          element={<Enterprise />}
        />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/magic-link-redirect"
          element={<MagicLinkRedirect />}
        />
        <Route path="/thank-you" element={<ThankYou />} />

        {/* Role-based dashboard entry point - only for initial routing */}
        <Route path="/dashboard" element={<RoleBasedDashboard />} />

        {/* Protected EIT routes */}
        <Route
          path="/dashboard/*"
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
          path="/dashboard/supervisor/*"
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
      <Analytics />
      <SpeedInsights />
    </UserProfileProvider>
  )
}

export default App