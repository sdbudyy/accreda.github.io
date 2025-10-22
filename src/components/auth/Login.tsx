import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import AccredaLogo from '../../assets/accreda-logo.png'
import { motion } from 'framer-motion'
import { useProgressStore } from '../../store/progress'
import { useSkillsStore } from '../../store/skills'
import { useNotificationsStore } from '../../store/notifications'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const message = location.state?.message
  const initialize = useProgressStore(state => state.initialize)
  const loadUserSkills = useSkillsStore(state => state.loadUserSkills)
  const initializeNotifications = useNotificationsStore(state => state.initialize)

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsAlreadyLoggedIn(true)
        setCurrentUserEmail(session.user.email || null)
      }
    }
    
    checkSession()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAlreadyLoggedIn(false)
    setCurrentUserEmail(null)
    setError(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data?.user) {
        await Promise.all([
          initialize(true),
          loadUserSkills(),
          initializeNotifications()
        ])
        
        // Check user profile to determine correct dashboard route
        try {
          // Check for supervisor profile first
          const { data: supervisorProfile } = await supabase
            .from('supervisor_profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (supervisorProfile) {
            navigate('/dashboard/supervisor');
            return;
          }
          
          // Check for EIT profile
          const { data: eitProfile } = await supabase
            .from('eit_profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          
          if (eitProfile) {
            navigate('/dashboard');
            return;
          }
          
          // If no profile exists, go to dashboard and let RoleBasedDashboard handle it
          navigate('/dashboard');
        } catch (profileError) {
          console.error('Error checking user profile:', profileError);
          // Fallback to dashboard
          navigate('/dashboard');
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Invalid login credentials')) {
          setError('Invalid email or password')
        } else if (err.message.includes('Email not confirmed')) {
          setError('Please confirm your email address before logging in')
        } else {
          setError(err.message)
        }
      } else {
        setError('An unexpected error occurred during login')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f6fbff] to-[#e3f0fa] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl"
      >
        <div className="flex flex-col items-center">
          <img
            src={AccredaLogo}
            alt="Accreda Logo"
            className="h-20 w-auto mb-4 cursor-pointer"
            onClick={() => navigate('/')}
          />
          <h2 className="text-2xl font-bold text-[#1a365d]">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-[#4a5568]">
            Sign in to your EIT Track account
          </p>
        </div>

        {message && (
          <div className="rounded-lg bg-green-50 p-4 border border-green-100">
            <div className="text-sm text-green-700">{message}</div>
          </div>
        )}

        {isAlreadyLoggedIn && (
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
            <div className="text-sm text-blue-700 mb-3">
              You are currently logged in as: <strong>{currentUserEmail}</strong>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Logout and sign in with different account
              </button>
              <button
                type="button"
                onClick={() => {
                  // Redirect to appropriate dashboard
                  const checkProfile = async () => {
                    const { data: { session } } = await supabase.auth.getSession()
                    if (session) {
                      try {
                        const { data: supervisorProfile } = await supabase
                          .from('supervisor_profiles')
                          .select('*')
                          .eq('id', session.user.id)
                          .single();
                        
                        if (supervisorProfile) {
                          navigate('/dashboard/supervisor');
                          return;
                        }
                        
                        const { data: eitProfile } = await supabase
                          .from('eit_profiles')
                          .select('*')
                          .eq('id', session.user.id)
                          .single();
                        
                        if (eitProfile) {
                          navigate('/dashboard');
                          return;
                        }
                        
                        navigate('/dashboard');
                      } catch (profileError) {
                        console.error('Error checking user profile:', profileError);
                        navigate('/dashboard');
                      }
                    }
                  }
                  checkProfile()
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin} style={{ display: isAlreadyLoggedIn ? 'none' : 'block' }}>
          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-100">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-[#1a365d] mb-1">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent sm:text-sm transition-colors"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1a365d] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent sm:text-sm transition-colors"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-[#1a365d] hover:text-[#2c5282] transition-colors">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#1a365d] hover:bg-[#2c5282] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a365d] transition-all duration-300 transform hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-[#4a5568]">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-[#1a365d] hover:text-[#2c5282] transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  )
} 