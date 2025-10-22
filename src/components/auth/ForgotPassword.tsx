import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'
import AccredaLogo from '../../assets/accreda-logo.png'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      const loggedIn = !!session
      setIsLoggedIn(loggedIn)
      
      // Don't auto-redirect logged-in users from forgot password page
      // They might be here to reset their password even if they're logged in
      // The UI will show them a logout option instead
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setMessage('You have been logged out. You can now request a login link.')
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      // Send magic link that redirects to dashboard
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false, // Don't create user if they don't exist
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        console.error('EmailLogin: Supabase error:', error)
        throw error
      }
      
      setMessage('A login link has been sent to your email address. Click the link to sign in.')
      setEmail('')
    } catch (err) {
      console.error('EmailLogin: Error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while sending login link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <img src={AccredaLogo} alt="Accreda Logo" className="h-24 w-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800">
            Login with email
          </h2>
          <p className="mt-2 text-sm text-slate-600 text-center">
            Enter your email address and we'll send you a secure login link
          </p>
        </div>

        {isLoggedIn && (
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
            <div className="text-sm text-blue-700 mb-3">
              You are currently logged in. You can still request a login link if needed, or log out first.
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm text-teal-600 hover:text-teal-500 font-medium transition-colors"
              >
                Log out first
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className="rounded-lg bg-green-50 p-4 border border-green-100">
            <div className="text-sm text-green-700">{message}</div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-100">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending login link...' : 'Send login link'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-600">
              Remember your password?{' '}
              <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500 transition-colors">
                Sign in with password
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
} 