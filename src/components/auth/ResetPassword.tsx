import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AccredaLogo from '../../assets/accreda-logo.png'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isValidLink, setIsValidLink] = useState(false)
  const [isCheckingLink, setIsCheckingLink] = useState(true)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        console.log('ResetPassword: Current URL:', window.location.href)
        console.log('ResetPassword: Search params:', Object.fromEntries(searchParams.entries()))
        
        // Get the access token and refresh token from URL parameters
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const type = searchParams.get('type')

        console.log('ResetPassword: Tokens found:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          type 
        })

        // Check if this is a password recovery link
        if (type !== 'recovery') {
          console.log('ResetPassword: Invalid type:', type)
          setError('Invalid password reset link. Please request a new one.')
          setIsCheckingLink(false)
          return
        }

        if (!accessToken || !refreshToken) {
          console.log('ResetPassword: Missing tokens')
          setError('Invalid password reset link. Please request a new one.')
          setIsCheckingLink(false)
          return
        }

        // Store the tokens for later use but DON'T set the session yet
        // This prevents auto-login and app initialization
        sessionStorage.setItem('reset_tokens', JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken
        }))

        // Clear the URL parameters for security
        window.history.replaceState({}, document.title, window.location.pathname)
        
        setIsValidLink(true)
        setIsCheckingLink(false)
      } catch (err) {
        console.error('Error handling password reset:', err)
        setError('An error occurred while processing the password reset link.')
        setIsCheckingLink(false)
      }
    }

    // Prevent any Supabase auth initialization on this page
    console.log('ResetPassword: Preventing auth initialization')
    
    handlePasswordReset()
  }, [searchParams])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

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

    try {
      // Get the stored tokens
      const storedTokens = sessionStorage.getItem('reset_tokens')
      if (!storedTokens) {
        throw new Error('Reset tokens not found. Please request a new password reset link.')
      }

      const { access_token, refresh_token } = JSON.parse(storedTokens)

      // Set the session temporarily to update the password
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token
      })

      if (sessionError) {
        throw new Error('Invalid or expired reset link. Please request a new one.')
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      // Clear the stored tokens
      sessionStorage.removeItem('reset_tokens')

      // Sign out the user after password reset
      await supabase.auth.signOut()
      
      // Navigate to login with success message
      navigate('/login', {
        state: { message: 'Your password has been reset successfully. Please sign in with your new password.' }
      })
    } catch (err) {
      console.error('Error updating password:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while resetting your password')
    } finally {
      setLoading(false)
    }
  }

  if (isCheckingLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div className="flex flex-col items-center">
            <img src={AccredaLogo} alt="Accreda Logo" className="h-24 w-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-800">Verifying reset link...</h2>
            <p className="mt-2 text-sm text-slate-600 text-center">
              Please wait while we verify your password reset link.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isValidLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div className="flex flex-col items-center">
            <img src={AccredaLogo} alt="Accreda Logo" className="h-24 w-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-800">Invalid Reset Link</h2>
            <p className="mt-2 text-sm text-slate-600 text-center">
              {error || 'This password reset link is invalid or has expired.'}
            </p>
            <div className="mt-6 space-y-4">
              <button
                onClick={() => navigate('/forgot-password')}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
              >
                Request New Reset Link
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2.5 px-4 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <img src={AccredaLogo} alt="Accreda Logo" className="h-24 w-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-slate-600 text-center">
            Please enter your new password below
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-100">
            <div className="text-sm text-red-700">{error}</div>
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
