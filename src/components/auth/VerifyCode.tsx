import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AccredaLogo from '../../assets/accreda-logo.png'

export default function VerifyCode() {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Get email from URL parameters
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    } else {
      // If no email in URL, redirect to forgot password
      navigate('/forgot-password')
    }
  }, [searchParams, navigate])

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Get the stored code data
      const storedCodeData = sessionStorage.getItem('password_reset_code')
      if (!storedCodeData) {
        throw new Error('No verification code found. Please request a new one.')
      }

      const codeData = JSON.parse(storedCodeData)
      
      // Check if code has expired
      if (Date.now() > codeData.expires) {
        sessionStorage.removeItem('password_reset_code')
        throw new Error('Verification code has expired. Please request a new one.')
      }

      // Check if email matches
      if (codeData.email !== email) {
        throw new Error('Email does not match. Please request a new code.')
      }

      // Verify the code
      if (codeData.code !== code) {
        throw new Error('Invalid verification code. Please try again.')
      }

      // Code is valid
      setIsVerified(true)
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    } catch (err) {
      console.error('Error verifying code:', err)
      setError(err instanceof Error ? err.message : 'Invalid verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    
    // Validate password complexity (uppercase, lowercase, digits)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
    if (!passwordRegex.test(newPassword)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one digit')
      return
    }

    setLoading(true)

    try {
      // Get the stored code data to verify we have a valid session
      const storedCodeData = sessionStorage.getItem('password_reset_code')
      if (!storedCodeData) {
        throw new Error('Session expired. Please request a new verification code.')
      }

      const codeData = JSON.parse(storedCodeData)
      
      // Check if code has expired
      if (Date.now() > codeData.expires) {
        sessionStorage.removeItem('password_reset_code')
        throw new Error('Session expired. Please request a new verification code.')
      }

      // For now, we'll show a message that the password reset is complete
      // In a real implementation, you'd need a server-side endpoint to update the password
      // without requiring authentication
      console.log('Password reset requested for:', email)
      console.log('New password would be:', newPassword)
      
      // Clear the stored code
      sessionStorage.removeItem('password_reset_code')
      
      // For demonstration, we'll just show a success message
      // In production, you'd implement a secure server-side password update
      
      // Navigate to login with success message
      navigate('/login', {
        state: { message: 'Password reset verification complete! In production, your password would be updated. For now, please use your existing password to sign in.' }
      })
    } catch (err) {
      console.error('Error updating password:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while resetting your password')
    } finally {
      setLoading(false)
    }
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div className="flex flex-col items-center">
            <img src={AccredaLogo} alt="Accreda Logo" className="h-24 w-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-800">
              Verify Your Email
            </h2>
            <p className="mt-2 text-sm text-slate-600 text-center">
              We've sent a verification code to <strong>{email}</strong>
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-100">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleVerifyCode}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-1">
                Verification Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm transition-colors"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="font-medium text-teal-600 hover:text-teal-500 transition-colors"
                >
                  Request a new one
                </button>
              </p>
            </div>
          </form>
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
              <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-1">
                New Password
              </label>
              <input
                id="new-password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent sm:text-sm transition-colors"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-new-password" className="block text-sm font-medium text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirm-new-password"
                name="confirm-new-password"
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
