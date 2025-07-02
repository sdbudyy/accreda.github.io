import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate, Link } from 'react-router-dom'
import AccredaLogo from '../../assets/accreda-logo.png'
import { motion, AnimatePresence } from 'framer-motion'
import { recordTermsAcceptance, getUserAgent } from '../../utils/termsAcceptance'
import { Dialog } from '@headlessui/react'

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
  const [showTermsModal, setShowTermsModal] = useState(false)
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

      if (authError) {
        // Custom error for duplicate email
        if (
          authError.message.toLowerCase().includes('user already registered') ||
          authError.message.toLowerCase().includes('email') && authError.message.toLowerCase().includes('exists')
        ) {
          setError('An account with this email already exists. Please log in or use a different email address.');
        } else {
          setError(`Authentication error: ${authError.message}`);
        }
        return;
      }
      
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
              onSubmit={e => {
                e.preventDefault();
                setError(null);
                // Validate email
                if (!formData.email.trim()) {
                  setError('Email is required');
                  return;
                }
                // Validate password length
                if (formData.password.length < 8) {
                  setError('Password must be at least 8 characters long');
                  return;
                }
                // Validate password complexity (uppercase, lowercase, digits)
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
                if (!passwordRegex.test(formData.password)) {
                  setError('Password must contain at least one uppercase letter, one lowercase letter, and one digit');
                  return;
                }
                // Validate password match
                if (formData.password !== formData.confirmPassword) {
                  setError('Passwords do not match');
                  return;
                }
                // Validate terms acceptance
                if (!agreedToTerms) {
                  setError('You must agree to the Terms and Conditions');
                  return;
                }
                setError(null);
                setStep(2);
              }}
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
                  <button
                    type="button"
                    className="underline font-semibold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer bg-transparent border-0 p-0"
                    style={{ textDecorationThickness: '2px', textUnderlineOffset: '3px', background: 'linear-gradient(90deg, #a7f3d0 0%, #5eead4 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: '#0f766e' }}
                    onClick={() => setShowTermsModal(true)}
                  >
                    Terms and Conditions
                  </button>
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
      {/* Terms Modal */}
      <Dialog open={showTermsModal} onClose={() => setShowTermsModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black bg-opacity-40" aria-hidden="true" />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-auto p-8 z-50 overflow-y-auto max-h-[90vh]">
            <Dialog.Title className="text-2xl font-bold mb-4 text-center">Terms and Conditions</Dialog.Title>
            <div className="text-center text-slate-600 mb-4">
              <div>Effective Date: <span className="font-semibold">May 24, 2025</span></div>
              <div>Jurisdiction: <span className="font-semibold">Province of Alberta, Canada</span></div>
            </div>
            <div className="prose prose-slate max-w-none mx-auto text-left text-base mb-6" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <h2>1. Introduction</h2>
              <p>These Terms and Conditions (“Terms”) govern access to and use of the Accreda platform (the “Platform”), a proprietary tool developed by Accreda Inc. (“Accreda,” “we,” “us,” or “our”). By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms, which form a legally binding agreement between you and Accreda.</p>
              <p>Your use of the Platform constitutes an offer to engage with our services. Accessing or continuing to use our Platform represents your acceptance of these Terms. You acknowledge your awareness of this agreement and affirm that you possess the capacity to be legally bound. Access to certain functionalities may be contingent on consideration, which includes but is not limited to paid subscription fees.</p>
              <h2>2. Eligibility</h2>
              <p>You must be at least 13 years of age to access the Platform. If you are under the age of majority in your jurisdiction, you must have obtained the consent of your legal guardian. By using the Platform, you represent that you have the legal capacity to enter into this agreement and that all information provided is accurate and complete.</p>
              <h2>3. User Guidelines</h2>
              <p>Users are expected to conduct themselves in accordance with the following guidelines:</p>
              <ul>
                <li><strong>Accuracy:</strong> Information entered into the Platform must be truthful and not misleading.</li>
                <li><strong>Respect:</strong> Users shall not harass, intimidate, or infringe upon the rights of others, including other users and administrators.</li>
                <li><strong>Integrity:</strong> Manipulating the platform for unintended uses, circumventing intended processes, or engaging in unauthorized data scraping, reverse-engineering, or interference with system operations is strictly prohibited.</li>
                <li><strong>Compliance:</strong> Users must comply with all applicable local, provincial, and federal laws when using the Platform.</li>
                <li><strong>Security:</strong> Users are responsible for safeguarding login credentials and must not share accounts. Any unauthorized access must be reported immediately.</li>
              </ul>
              <p>Violation of any of the above may result in account suspension, termination, or legal proceedings, at our discretion.</p>
              <h2>4. Subscription and Payment Terms</h2>
              <p>Certain features of the Platform may be available only through paid subscription plans. By initiating a subscription, you agree to:</p>
              <ul>
                <li>Pay all applicable fees in full, including taxes and any processing charges.</li>
                <li>Allow Accreda to charge your designated payment method on a recurring basis, unless you cancel prior to the renewal date.</li>
                <li>Understand that early termination of a subscription does not entitle the user to a refund. Full payment of the billing cycle is required upon termination initiated by either party.</li>
                <li>All subscription fees constitute consideration in exchange for access to defined services.</li>
              </ul>
              <h2>5. Refund Policy</h2>
              <p>Refunds will only be issued under exceptional and demonstrable circumstances, including prolonged service unavailability caused solely by our fault. Refund requests must be submitted in writing and are granted entirely at our discretion.</p>
              <h2>6. Termination</h2>
              <p>We reserve the right to suspend, restrict, or terminate your access to the Platform at any time, with or without notice, for any breach of these Terms or conduct that we determine, in our sole discretion, to be unlawful, unethical, or inconsistent with the integrity of the Platform.</p>
              <p>In all cases of early termination, whether voluntary or involuntary, the user remains financially responsible for the full amount of any active billing period.</p>
              <h2>7. Third-Party Tools and Integrations</h2>
              <p>Users shall not use third-party tools, extensions, or scripts that alter, bypass, or interfere with the Platform’s functionality. Any integration of third-party software must not contradict the values, security principles, or operational integrity of Accreda. Violations may result in legal action and permanent account suspension.</p>
              <h2>8. Data Security and Cyber Risk</h2>
              <p>While Accreda employs industry-standard cybersecurity measures, no system is entirely immune from vulnerabilities. By using the Platform, you agree that:</p>
              <ul>
                <li>You are solely responsible for maintaining local device security and protecting your own data.</li>
                <li>Accreda shall not be held liable for any losses, damages, or breaches resulting from external attacks, third-party exploits, or events beyond our control.</li>
                <li>Continued use of the Platform affirms your awareness and acceptance of these inherent risks.</li>
              </ul>
              <h2>9. Limitation of Liability</h2>
              <p>To the maximum extent permitted by applicable law, Accreda shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of or related to your use of the Platform. Our liability in any matter shall be limited to the amount paid by the user in the twelve months preceding the claim.</p>
              <h2>10. Intellectual Property</h2>
              <p>All content, software, branding, and design on the Platform is the intellectual property of Accreda Inc. You may not reproduce, modify, or distribute any part of the Platform without prior written authorization.</p>
              <h2>11. Amendments</h2>
              <p>We may update these Terms at any time without prior notice. Continued use of the Platform after any change constitutes acceptance of the revised Terms. It is the responsibility of the user to review these Terms periodically.</p>
              <h2>12. Governing Law</h2>
              <p>These Terms shall be governed by the laws of the Province of Alberta and the applicable federal laws of Canada. Any disputes shall be resolved in the courts located in Calgary, Alberta, unless otherwise agreed in writing by both parties.</p>
              <h2>13. Entire Agreement</h2>
              <p>These Terms constitute the entire agreement between you and Accreda and supersede any prior or contemporaneous agreements, communications, or understandings, whether oral or written.</p>
              <h2>14. Contact Information</h2>
              <p>For questions regarding these Terms, you may contact us.</p>
            </div>
            <button
              type="button"
              className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-all duration-150 text-lg"
              onClick={() => setShowTermsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
} 