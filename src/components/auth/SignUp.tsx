import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import AccredaLogo from '../../assets/accreda-logo.png'
import { AccountType } from '../../types/auth'

export default function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organization: '',
    accountType: 'eit' as 'eit' | 'supervisor'
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

      console.log('Creating auth user with:', { email: formData.email, accountType: formData.accountType })

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        throw new Error(`Authentication error: ${authError.message}`)
      }
      
      if (!authData.user) {
        console.error('No user data returned from auth signup')
        throw new Error('Failed to create user account')
      }

      console.log('Auth user created:', authData.user.id)

      // Create profile in appropriate table
      const profileData = {
        id: authData.user.id,
        email: formData.email,
        full_name: formData.fullName,
        account_type: formData.accountType,
        ...(formData.accountType === 'supervisor' && {
          organization: formData.organization
        })
      }

      console.log('Creating profile with data:', profileData)

      const { error: profileError } = await supabase
        .from(formData.accountType === 'eit' ? 'eit_profiles' : 'supervisor_profiles')
        .insert([profileData])

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw new Error(`Failed to create profile: ${profileError.message}`)
      }

      console.log('Profile created successfully')

      // Show success message
      setSuccess('Account created successfully! Please check your email for verification.')
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        organization: '',
        accountType: 'eit'
      })

      navigate('/login', { 
        state: { 
          message: 'Please check your email to confirm your account. You can now sign in.' 
        } 
      })
    } catch (error) {
      console.error('Signup error:', error)
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
        // User is logged in and verified
        // Redirect to dashboard or show success
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <img src={AccredaLogo} alt="Accreda Logo" className="h-24 w-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Join Accreda to start your journey
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
                className={`px-4 py-2 rounded-lg border font-semibold transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-teal-400
                  ${formData.accountType === 'eit'
                    ? 'bg-teal-600 text-white scale-105 shadow-lg'
                    : 'bg-white text-teal-600 border-teal-600 hover:scale-105 hover:brightness-95'}
                `}
                onClick={() => setFormData({ ...formData, accountType: 'eit' })}
              >
                EIT
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg border font-semibold transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-teal-400
                  ${formData.accountType === 'supervisor'
                    ? 'bg-teal-600 text-white scale-105 shadow-lg'
                    : 'bg-white text-teal-600 border-teal-600 hover:scale-105 hover:brightness-95'}
                `}
                onClick={() => setFormData({ ...formData, accountType: 'supervisor' })}
              >
                Supervisor
              </button>
            </div>

            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                id="full-name"
                name="full-name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm transition-colors"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-slate-700 mb-1">
                Organization
              </label>
              <input
                id="organization"
                name="organization"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm transition-colors"
                placeholder="Enter your organization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 mb-1">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm transition-colors"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm transition-colors"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm transition-colors"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
} 