import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import AccredaLogo from '../../assets/accreda-logo.png'
import { motion } from 'framer-motion'

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organization: '',
    accountType: 'eit' as 'eit' | 'supervisor',
    startDate: '',
    targetDate: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      // Validate password length
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }

      // Validate full name
      if (!formData.fullName.trim()) {
        throw new Error('Full name is required')
      }

      // Validate organization for supervisors
      if (formData.accountType === 'supervisor' && !formData.organization.trim()) {
        throw new Error('Organization is required for supervisors')
      }

      if (formData.accountType === 'eit') {
        if (!formData.startDate || !formData.targetDate) {
          throw new Error('Please provide your program start and expected end date.');
        }
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      })

      if (authError) throw new Error(`Authentication error: ${authError.message}`)
      
      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      // Create profile in appropriate table
      const profileData = {
        id: authData.user.id,
        email: formData.email,
        full_name: formData.fullName,
        account_type: formData.accountType,
        ...(formData.accountType === 'supervisor' && {
          organization: formData.organization
        }),
        ...(formData.accountType === 'eit' && {
          start_date: formData.startDate,
          target_date: formData.targetDate
        })
      }

      const { error: profileError } = await supabase
        .from(formData.accountType === 'eit' ? 'eit_profiles' : 'supervisor_profiles')
        .insert([profileData])

      if (profileError) {
        throw new Error(`Failed to create profile: ${profileError.message}`)
      }

      // Show success message
      setSuccess('Account created successfully! Please check your email for verification.')
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        organization: '',
        accountType: 'eit',
        startDate: '',
        targetDate: ''
      })

      navigate('/login', { 
        state: { 
          message: 'Please check your email to confirm your account. You can now sign in.' 
        } 
      })
    } catch (error) {
      let message = error instanceof Error ? error.message : 'An error occurred during signup';
      if (
        message.includes('duplicate key value') ||
        message.includes('unique constraint') ||
        message.toLowerCase().includes('already exists')
      ) {
        message = 'An account with this email already exists. Please log in or use a different email address.';
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard')
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a365d] to-[#0f2942] py-12 px-4 sm:px-6 lg:px-8">
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
            className="h-24 w-auto mb-6 cursor-pointer"
            onClick={() => navigate('/')}
          />
          <h2 className="text-2xl font-bold text-[#1a365d]">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-[#4a5568]">
            Join EIT Track to start your journey
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-100">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-green-50 p-4 border border-green-100">
              <div className="text-sm text-green-700">{success}</div>
            </div>
          )}
          <div className="space-y-4">
            <div className="flex justify-center mb-4 gap-3">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg border font-semibold transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-[#1a365d]
                  ${formData.accountType === 'eit'
                    ? 'bg-[#1a365d] text-white scale-105 shadow-lg'
                    : 'bg-white text-[#1a365d] border-[#1a365d] hover:scale-105 hover:brightness-95'}
                `}
                onClick={() => setFormData({ ...formData, accountType: 'eit' })}
              >
                EIT
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg border font-semibold transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-[#1a365d]
                  ${formData.accountType === 'supervisor'
                    ? 'bg-[#1a365d] text-white scale-105 shadow-lg'
                    : 'bg-white text-[#1a365d] border-[#1a365d] hover:scale-105 hover:brightness-95'}
                `}
                onClick={() => setFormData({ ...formData, accountType: 'supervisor' })}
              >
                Supervisor
              </button>
            </div>

            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-[#1a365d] mb-1">
                Full Name
              </label>
              <input
                id="full-name"
                name="full-name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent sm:text-sm transition-colors"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            {formData.accountType === 'supervisor' && (
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-[#1a365d] mb-1">
                  Organization
                </label>
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent sm:text-sm transition-colors"
                  placeholder="Enter your organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                />
              </div>
            )}

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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1a365d] mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent sm:text-sm transition-colors"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-[#1a365d] mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent sm:text-sm transition-colors"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
            {formData.accountType === 'eit' && (
              <div className="card p-4 mb-2 bg-blue-50/50 border border-blue-100 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="font-semibold text-blue-800">Program Timeline</span>
                </div>
                <p className="text-xs text-blue-700 mb-3">Set your program start and expected end date for personalized progress tracking.</p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-medium text-blue-900 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full border border-blue-200 rounded px-3 py-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-blue-900 mb-1">Expected End Date</label>
                    <input
                      type="date"
                      className="w-full border border-blue-200 rounded px-3 py-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={formData.targetDate}
                      onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#1a365d] hover:bg-[#2c5282] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a365d] transition-all duration-300 transform hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-[#4a5568]">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-[#1a365d] hover:text-[#2c5282] transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  )
} 