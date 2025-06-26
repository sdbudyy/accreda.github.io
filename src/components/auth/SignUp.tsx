import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import AccredaLogo from '../../assets/accreda-logo.png'
import { motion, AnimatePresence } from 'framer-motion'
import { recordTermsAcceptance, getUserAgent } from '../../utils/termsAcceptance'

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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState(1)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
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
      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }

      // Validate password complexity (uppercase, lowercase, digits)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
      if (!passwordRegex.test(formData.password)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one digit')
      }

      // Validate full name
      if (!formData.fullName.trim()) {
        throw new Error('Full name is required')
      }

      // Validate organization for supervisors
      if (formData.accountType === 'supervisor' && !formData.organization.trim()) {
        throw new Error('Organization is required for supervisors')
      }

      // Validate terms acceptance
      if (!agreedToTerms) {
        throw new Error('You must agree to the Terms and Conditions')
      }

      // Remove required validation for EIT start and target date
      // if (formData.accountType === 'eit') {
      //   if (!formData.startDate || !formData.targetDate) {
      //     throw new Error('Please provide your program start and expected end date.');
      //   }
      // }

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

      // Record terms acceptance
      const userAgent = getUserAgent();
      const { error: termsError } = await recordTermsAcceptance(
        authData.user.id,
        '1.0', // Current terms version
        undefined, // IP address will be handled by the server
        userAgent
      );

      if (termsError) {
        console.warn('Failed to record terms acceptance:', termsError);
        // Don't throw error here as the account was created successfully
      }

      // Create profile in appropriate table
      const profileData = {
        id: authData.user.id,
        email: formData.email,
        full_name: formData.fullName,
        ...(formData.accountType === 'supervisor' && {
          account_type: 'supervisor',
          organization: formData.organization
        }),
        // Only include start_date and target_date if provided
        ...(formData.accountType === 'eit' && formData.startDate && { start_date: formData.startDate }),
        ...(formData.accountType === 'eit' && formData.targetDate && { target_date: formData.targetDate }),
        // Include organization for EIT if provided
        ...(formData.accountType === 'eit' && formData.organization && { organization: formData.organization })
      }

      const profileTable = formData.accountType === 'eit' ? 'eit_profiles' : 'supervisor_profiles';
      console.log('SIGNUP DEBUG: Inserting profile', profileData, 'into', profileTable);

      const { error: profileError } = await supabase
        .from(profileTable)
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

      // After successful login
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!subscription) {
          await supabase.from('subscriptions').insert([{ user_id: user.id, tier: 'free' }]);
        }
      }
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
          <h2 className="text-2xl font-bold text-[#1a365d] mb-1">
            Create your account
          </h2>
          <div className="text-sm text-[#4a5568] mb-2">Step {step} of 2</div>
        </div>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
              onSubmit={e => { e.preventDefault(); setStep(2); }}
            >
              {error && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-semibold text-[#1a365d] mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50 text-lg"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="you@email.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-[#1a365d] mb-1">Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50 text-lg"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="Password"
                  />
                  <button type="button" className="text-xs text-teal-600 mt-1" onClick={() => setShowPassword(v => !v)}>{showPassword ? 'Hide' : 'Show'} Password</button>
                </div>
                <div>
                  <label className="block text-base font-semibold text-[#1a365d] mb-1">Confirm Password</label>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50 text-lg"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    placeholder="Confirm Password"
                  />
                  <button type="button" className="text-xs text-teal-600 mt-1" onClick={() => setShowConfirmPassword(v => !v)}>{showConfirmPassword ? 'Hide' : 'Show'} Password</button>
                </div>
                <div className="flex justify-center gap-3 mt-2">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg border font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1a365d] ${formData.accountType === 'eit' ? 'bg-[#1a365d] text-white scale-105 shadow-lg' : 'bg-white text-[#1a365d] border-[#1a365d] hover:scale-105 hover:brightness-95'}`}
                    onClick={() => setFormData({ ...formData, accountType: 'eit' })}
                  >
                    EIT
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg border font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1a365d] ${formData.accountType === 'supervisor' ? 'bg-[#1a365d] text-white scale-105 shadow-lg' : 'bg-white text-[#1a365d] border-[#1a365d] hover:scale-105 hover:brightness-95'}`}
                    onClick={() => setFormData({ ...formData, accountType: 'supervisor' })}
                  >
                    Supervisor
                  </button>
                </div>
              </div>
              <div className="flex items-center mt-4">
                <input
                  id="terms-checkbox"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms-checkbox" className="ml-2 block text-sm text-[#1a365d] select-none">
                  I agree to the{' '}
                  <Link
                    to="/terms"
                    className="underline font-semibold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
                    style={{ textDecorationThickness: '2px', textUnderlineOffset: '3px', background: 'linear-gradient(90deg, #a7f3d0 0%, #5eead4 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: '#0f766e' }}
                  >
                    Terms and Conditions
                  </Link>
                </label>
              </div>
              <div className="flex justify-end mt-6">
                <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-all duration-150 text-lg" disabled={!agreedToTerms}>Next</button>
              </div>
            </motion.form>
          )}
          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
              onSubmit={handleSignUp}
            >
              {error && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-semibold text-[#1a365d] mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50 text-lg"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    placeholder="Your full name"
                  />
                </div>
                {formData.accountType === 'supervisor' && (
                  <div>
                    <label className="block text-base font-semibold text-[#1a365d] mb-1">Organization</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50 text-lg"
                      value={formData.organization}
                      onChange={e => setFormData({ ...formData, organization: e.target.value })}
                      required
                      placeholder="Your organization"
                    />
                  </div>
                )}
                {formData.accountType === 'eit' && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-base font-semibold text-[#1a365d] mb-1">Start Date (optional)</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50 text-lg"
                        value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-base font-semibold text-[#1a365d] mb-1">Target Date (optional)</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 bg-slate-50 text-lg"
                        value={formData.targetDate}
                        onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-6">
                <button type="button" onClick={() => setStep(1)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-6 rounded-xl shadow-sm transition-all duration-150 text-lg">Back</button>
                <button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-all duration-150 text-lg">{loading ? 'Creating...' : 'Create Account'}</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        <div className="text-center mt-6">
          <p className="text-sm text-[#4a5568]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#1a365d] hover:text-[#2c5282] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
} 