import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import AccredaLogo from '../../assets/accreda-logo.png'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Handle URL hash parameters from Supabase auth
    const handleAuthCallback = async () => {
      try {
        console.log('ResetPassword: Current URL:', window.location.href)
        console.log('ResetPassword: Hash:', window.location.hash)
        console.log('ResetPassword: Search:', window.location.search)
        
        // Check if there are error parameters in the URL hash first
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const errorParam = hashParams.get('error')
        const errorDescription = hashParams.get('error_description')
        
        if (errorParam) {
          console.log('ResetPassword: URL contains error parameters', { error: errorParam, description: errorDescription })
          setError(errorDescription || 'Password reset link is invalid or has expired. Please try again.')
          return
        }

        // Check for URL parameters that might contain the reset token
        const urlParams = new URLSearchParams(window.location.search)
        const accessToken = urlParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token')
        const type = urlParams.get('type')

        console.log('ResetPassword: URL params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type })

        // If we have tokens in the URL, set the session
        if (accessToken && refreshToken && type === 'recovery') {
          console.log('ResetPassword: Setting session from URL parameters')
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (sessionError) {
            console.error('ResetPassword: Error setting session', sessionError)
            setError('Invalid or expired reset link. Please request a new password reset.')
            return
          }
          
          // Clear the URL parameters after successful session setup
          window.history.replaceState({}, document.title, window.location.pathname)
        }

        // Check for a valid session (user should be logged in via the reset link)
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('ResetPassword: Auth error', error)
          setError('Authentication error. Please try requesting a new password reset link.')
          return
        }

        if (!data.session) {
          console.log('ResetPassword: No session found - user needs to click the reset link')
          setError('Please click the password reset link from your email to continue.')
        } else {
          console.log('ResetPassword: Valid session found', { user: data.session.user?.email })
        }
      } catch (err) {
        console.error('ResetPassword: Error handling auth callback', err)
        setError('An error occurred while processing the password reset link.')
      }
    }

    handleAuthCallback()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    console.log('ResetPassword: Form submitted')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    
    // Validate password complexity (uppercase, lowercase, digits)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
    if (!passwordRegex.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one digit')
      return
    }

    setLoading(true)
    console.log('ResetPassword: Updating password')

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error
      console.log('ResetPassword: Password updated successfully')

      // Sign out the user after password reset
      await supabase.auth.signOut()
      
      // Navigate to login with success message
      navigate('/login', {
        state: { message: 'Your password has been reset successfully. Please sign in with your new password.' }
      })
    } catch (err) {
      console.error('ResetPassword: Error updating password', err)
      setError(err instanceof Error ? err.message : 'An error occurred while resetting your password')
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
            Set new password
          </h2>
          <p className="mt-2 text-sm text-slate-600 text-center">
            Please enter your new password below
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-100">
            <div className="text-sm text-red-700 mb-3">{error}</div>
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-teal-600 hover:text-teal-500 font-medium transition-colors"
              >
                Request a new password reset link
              </button>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm transition-colors"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm transition-colors"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting password...' : 'Reset password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 