import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import accredaLogo from '../assets/accreda-logo.png';
import accredaSmall from '../assets/accreda-small.webp';
import { Users, BarChart3, FileText, CheckCircle2, Clock, Menu, Award, Bell, MessageSquare, TrendingUp, Shield, Zap, Mail, Send, AlertCircle } from 'lucide-react';
import SuperFlowSlider from '../components/SuperFlowSlider';
import MobileLandingMenu from '../components/MobileLandingMenu';

const Enterprise: React.FC = () => {
  // Scroll to top on mount for clean navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Contact Sales Modal State
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCorporation, setContactCorporation] = useState('');
  const [contactEitCount, setContactEitCount] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState(false);

  // Add mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav 
        className="fixed w-full z-50 border-b border-slate-200 bg-white"
        style={{ backgroundColor: 'rgba(255,255,255,1)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <button
                onClick={() => window.location.assign('/')}
                className="focus:outline-none"
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                <img src={accredaSmall} alt="Accreda" className="h-16 w-auto" />
              </button>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/login" className="text-slate-600 hover:text-slate-900 transition-colors">Sign In</Link>
              <a
                href="/"
                className="text-slate-600 hover:text-slate-900 transition-colors"
                onClick={e => { e.preventDefault(); navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                Features
              </a>
              <a
                href="/?scroll=pricing"
                className="text-slate-600 hover:text-slate-900 transition-colors"
                onClick={e => { e.preventDefault(); navigate('/?scroll=pricing'); }}
              >
                Pricing
              </a>
              <Link to="/enterprise" className="text-slate-600 hover:text-slate-900 transition-colors">Enterprise</Link>
              <a 
                href="https://cal.com/accreda" 
                target="_blank" 
                rel="noopener" 
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Book a Demo
              </a>
            </div>
            <button 
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <MobileLandingMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      {/* Hero Section */}
      <div className="pt-36 pb-20 bg-gradient-to-br from-slate-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <motion.div 
            className="mb-16 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold text-slate-900 leading-tight mb-6">
              Supervise Your Engineering Team
            </h1>
            <p className="text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Streamline EIT development, ensure compliance, and drive team success with our comprehensive supervisor platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://cal.com/accreda" 
                target="_blank" 
                rel="noopener" 
                className="bg-black text-white text-lg px-8 py-4 rounded-lg inline-flex items-center justify-center group hover:bg-slate-800 transition-colors"
              >
                Book a Demo
              </a>
              <Link to="/?scroll=pricing" className="border-2 border-slate-300 text-slate-700 text-lg px-8 py-4 rounded-lg inline-flex items-center justify-center hover:bg-slate-50 transition-colors">View Pricing</Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Key Benefits Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Everything you need to manage your EITs
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From progress tracking to documentation review, Accreda provides the tools your supervisors need to guide their teams effectively.
            </p>
          </motion.div>

          {/* Super Flow Slider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <SuperFlowSlider />
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-5xl font-bold text-teal-600 mb-2">22</div>
              <p className="text-xl text-slate-600">Required Skills Tracked</p>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-5xl font-bold text-teal-600 mb-2">50%</div>
              <p className="text-xl text-slate-600">Time Saved on Reviews</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Value Proposition Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Why leading engineering firms choose Accreda
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Clear Guidelines</h3>
                    <p className="text-slate-600">EITs always know exactly what is expected of them. Accreda provides step-by-step requirements, transparent criteria, and actionable checklists so there's never any confusion about what to do next.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Increased Efficiency</h3>
                    <p className="text-slate-600">Reduce administrative overhead and focus on what matters most - developing your engineering talent.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Better Outcomes</h3>
                    <p className="text-slate-600">Accreda helps EITs retain knowledge, build real skills, and structured development programs lead to higher retention rates and more successful P.Eng applications.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Risk Mitigation</h3>
                    <p className="text-slate-600">Stay up to date with your documentation and actively learn as you go—don't just rush to finish. Accreda ensures all information is neatly presented and ready in case of an audit.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="bg-slate-50 rounded-2xl p-8 flex flex-col items-center justify-center border border-slate-100 shadow-sm"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Icon for visual interest */}
              <div className="mb-4">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3v4M8 3v4M2 13h20"/></svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Enterprise Features</h3>
              <div className="space-y-3 w-full">
                {[
                  'Unlimited EIT accounts',
                  'Bulk discounts on EIT accounts',
                  'Advanced analytics & reporting',
                  'Validate and score EITs within the native app',
                  'Dedicated account manager',
                  'Priority support',
                  'Custom onboarding',
                  'One-button CSAW exports',
                ].map((feature, idx) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg"
                  >
                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                    <span className="text-slate-700 text-base font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Start improving your team today
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Book a personalized demo and see how Accreda can help your supervisors and EITs achieve more, together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://cal.com/accreda" 
                target="_blank" 
                rel="noopener" 
                className="bg-black text-white text-lg px-8 py-4 rounded-lg inline-flex items-center justify-center group hover:bg-slate-800 transition-colors"
              >
                Book a Demo
              </a>
              <Link to="/?scroll=pricing" className="border-2 border-slate-300 text-slate-700 text-lg px-8 py-4 rounded-lg inline-flex items-center justify-center hover:bg-slate-50 transition-colors">View Pricing</Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contact Sales Section */}
      <div className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">Ready to see Accreda in action?</h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">Contact our enterprise team for a personalized walkthrough and answers to your specific needs.</p>
          <button
            onClick={() => setShowContactModal(true)}
            className="bg-black text-white text-lg px-8 py-4 rounded-lg inline-flex items-center justify-center group hover:bg-slate-800 transition-colors"
          >
            <Mail className="w-5 h-5 mr-2" /> Contact Sales
          </button>
        </div>
      </div>

      {/* Contact Sales Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
              onClick={() => {
                setShowContactModal(false);
                setContactSuccess(false);
                setContactError(null);
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-purple-800">Contact Sales</h2>
            {contactSuccess ? (
              <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm mb-4">
                Your inquiry has been sent successfully. We'll get back to you soon!
              </div>
            ) : (
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  setContactLoading(true);
                  setContactError(null);
                  setContactSuccess(false);
                  try {
                    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-support-email`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                      },
                      body: JSON.stringify({
                        email: contactEmail,
                        subject: 'Enterprise Contact Request',
                        message: `Name: ${contactName}\nCorporation: ${contactCorporation}\nCurrent EIT Count: ${contactEitCount}\n\n${contactMessage}`,
                        issueType: 'enterprise',
                        mode: 'help',
                      }),
                    });
                    const data = await response.json();
                    if (!response.ok) {
                      throw new Error(data.error || 'Failed to send message');
                    }
                    setContactSuccess(true);
                    setContactName('');
                    setContactEmail('');
                    setContactCorporation('');
                    setContactMessage('');
                    setContactEitCount('');
                  } catch (err) {
                    setContactError(err instanceof Error ? err.message : 'Failed to send message. Please try again later.');
                  } finally {
                    setContactLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="contactName" className="label">Full Name</label>
                  <input
                    type="text"
                    id="contactName"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="label">Email Address</label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contactCorporation" className="label">Organization</label>
                  <input
                    type="text"
                    id="contactCorporation"
                    value={contactCorporation}
                    onChange={e => setContactCorporation(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contactEitCount" className="label">Current EIT Count</label>
                  <input
                    type="number"
                    id="contactEitCount"
                    value={contactEitCount}
                    onChange={e => setContactEitCount(e.target.value)}
                    className="input"
                    min="0"
                    placeholder="Enter number of EITs"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contactMessage" className="label">Message</label>
                  <textarea
                    id="contactMessage"
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    className="input h-32"
                    required
                    placeholder="Tell us about your needs and how we can help..."
                  />
                </div>
                {contactError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {contactError}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowContactModal(false);
                      setContactSuccess(false);
                      setContactError(null);
                    }}
                    disabled={contactLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={contactLoading}
                  >
                    {contactLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <img src={accredaLogo} alt="Accreda" className="h-12 w-auto mb-4" />
              <p className="text-slate-400 max-w-md">
                Helping engineers achieve their professional goals through structured development and documentation.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-2">
                <li><a
                  href="/"
                  className="text-slate-400 hover:text-white transition-colors"
                  onClick={e => { e.preventDefault(); navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  Features
                </a></li>
                <li><a
                  href="/?scroll=pricing"
                  className="text-slate-400 hover:text-white transition-colors"
                  onClick={e => { e.preventDefault(); navigate('/?scroll=pricing'); }}
                >
                  Pricing
                </a></li>
                <li><button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Enterprise
                </button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2">
                <li><a href="mailto:accreda.info@gmail.com" className="text-slate-400 hover:text-white transition-colors">accreda.info@gmail.com</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400">&copy; {new Date().getFullYear()} Accreda. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Enterprise;
