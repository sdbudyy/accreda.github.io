import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Users,
  Clock,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

const Landing: React.FC = () => {
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistProvince, setWaitlistProvince] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [waitlistError, setWaitlistError] = useState('');

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistStatus('loading');
    setWaitlistError('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail, province: waitlistProvince })
      });
      const data = await res.json();
      if (data.success) {
        setWaitlistStatus('success');
        setWaitlistEmail('');
        setWaitlistProvince('');
      } else {
        setWaitlistStatus('error');
        setWaitlistError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setWaitlistStatus('error');
      setWaitlistError('Network error.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-teal-50 to-white overflow-hidden">
        {/* Animated background shapes */}
        <motion.div
          className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-teal-100 rounded-full opacity-30 -translate-x-1/2 -z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-slate-900 mb-4"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            Streamline Your EIT Journey
          </motion.h1>
          <motion.p
            className="text-2xl text-teal-700 mb-2 font-semibold"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Your path to engineering excellence starts here.
          </motion.p>
          <motion.p
            className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Accreda helps engineers track, document, and manage their professional development journey towards becoming an Engineer in Training (EIT).
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Link 
              to="/signup" 
              className="btn btn-primary text-lg px-8 py-3"
            >
              Get Started
            </Link>
            <Link 
              to="/login" 
              className="btn btn-secondary text-lg px-8 py-3"
            >
              Sign In
            </Link>
            <a
              href="#features"
              className="btn btn-outline text-lg px-8 py-3 border-teal-500 text-teal-700 hover:bg-teal-50 transition"
            >
              Learn More
            </a>
          </motion.div>
        </div>
      </div>

      {/* Availability Notice & Waitlist Section */}
      <div className="bg-yellow-50 border-b border-yellow-200 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">
            Currently Available Only in Alberta (APEGA)
          </h2>
          <p className="text-yellow-700 mb-6">
            We're working hard to expand Accreda to other provinces. Join our waitlist to be notified when we launch in your area!
          </p>
          <form className="flex flex-col sm:flex-row gap-3 justify-center items-center" onSubmit={handleWaitlistSubmit}>
            <input
              type="email"
              required
              placeholder="Your email"
              className="border border-yellow-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={waitlistEmail}
              onChange={e => setWaitlistEmail(e.target.value)}
              disabled={waitlistStatus === 'loading'}
            />
            <select
              required
              className="border border-yellow-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={waitlistProvince}
              onChange={e => setWaitlistProvince(e.target.value)}
              disabled={waitlistStatus === 'loading'}
            >
              <option value="">Select province</option>
              <option value="AB">Alberta</option>
              <option value="BC">British Columbia</option>
              <option value="MB">Manitoba</option>
              <option value="NB">New Brunswick</option>
              <option value="NL">Newfoundland and Labrador</option>
              <option value="NS">Nova Scotia</option>
              <option value="ON">Ontario</option>
              <option value="PE">Prince Edward Island</option>
              <option value="QC">Quebec</option>
              <option value="SK">Saskatchewan</option>
              <option value="NT">Northwest Territories</option>
              <option value="NU">Nunavut</option>
              <option value="YT">Yukon</option>
            </select>
            <button
              type="submit"
              className="btn btn-primary px-6 py-2"
              disabled={waitlistStatus === 'loading'}
            >
              {waitlistStatus === 'loading' ? 'Joining...' : 'Join Waitlist'}
            </button>
          </form>
          {waitlistStatus === 'success' && (
            <div className="text-green-700 mt-3">Thank you! You've been added to the waitlist.</div>
          )}
          {waitlistStatus === 'error' && (
            <div className="text-red-700 mt-3">{waitlistError}</div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl font-bold text-center text-slate-900 mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Everything You Need to Succeed
          </motion.h2>
          <motion.p
            className="text-lg text-center text-slate-600 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Accreda provides a comprehensive suite of tools to help you document, track, and showcase your engineering journey with confidence.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[0,1,2].map((i) => (
              <motion.div
                key={i}
                className="card hover:scale-105 transition-transform"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.7 }}
              >
                {i === 0 && (
                  <div className="p-6">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                      <Award className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Skill Tracking</h3>
                    <p className="text-slate-600">
                      Track your progress across all required engineering competencies with our intuitive skill assessment system.
                    </p>
                  </div>
                )}
                {i === 1 && (
                  <div className="p-6">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Experience Documentation</h3>
                    <p className="text-slate-600">
                      Document your engineering experiences with our structured templates and guidance.
                    </p>
                  </div>
                )}
                {i === 2 && (
                  <div className="p-6">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                      <BookOpen className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">SAO Management</h3>
                    <p className="text-slate-600">
                      Create and manage your Self-Assessment Outcomes with our AI-powered writing assistant.
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl font-bold text-center text-slate-900 mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Why Choose Accreda?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[0,1,2,3].map((i) => (
              <motion.div
                key={i}
                className="flex items-start space-x-4"
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.7 }}
              >
                {i === 0 && (
                  <>
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Structured Progress Tracking</h3>
                      <p className="text-slate-600">
                        Stay organized with our comprehensive tracking system for skills, experiences, and documentation.
                      </p>
                    </div>
                  </>
                )}
                {i === 1 && (
                  <>
                    <div className="flex-shrink-0">
                      <Users className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Supervisor Collaboration</h3>
                      <p className="text-slate-600">
                        Streamline the approval process with our integrated supervisor review system.
                      </p>
                    </div>
                  </>
                )}
                {i === 2 && (
                  <>
                    <div className="flex-shrink-0">
                      <Clock className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Time-Saving Tools</h3>
                      <p className="text-slate-600">
                        Our AI-powered writing assistant helps you draft professional documentation quickly.
                      </p>
                    </div>
                  </>
                )}
                {i === 3 && (
                  <>
                    <div className="flex-shrink-0">
                      <BarChart3 className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Progress Analytics</h3>
                      <p className="text-slate-600">
                        Get clear insights into your progress with detailed analytics and visualizations.
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
          {/* Testimonial */}
          <motion.div
            className="mt-16 max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <p className="text-lg italic text-slate-700 mb-4">
              "Accreda made my EIT journey so much easier. The skill tracking and supervisor collaboration features are game changers!"
            </p>
            <div className="font-semibold text-slate-900">— Alex P., EIT Candidate</div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-3xl font-bold text-slate-900 mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Ready to Start Your EIT Journey?
          </motion.h2>
          <motion.p
            className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Join thousands of engineers who are using Accreda to streamline their path to becoming an Engineer in Training.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link 
              to="/signup" 
              className="btn btn-primary text-lg px-8 py-3 inline-flex items-center"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="btn btn-outline text-lg px-8 py-3 border-teal-500 text-teal-700 hover:bg-teal-50 transition"
            >
              See How It Works
            </a>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Accreda</h3>
              <p className="text-slate-400">
                Helping engineers achieve their professional goals through structured development and documentation.
              </p>
              {/* Social icons */}
              <div className="flex space-x-4 mt-4">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="text-slate-400 hover:text-white transition"
                  aria-label="Twitter"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195A4.92 4.92 0 0 0 16.616 3c-2.73 0-4.942 2.21-4.942 4.932 0 .386.045.762.127 1.124C7.728 8.807 4.1 6.884 1.671 3.965c-.423.722-.666 1.561-.666 2.475 0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.239-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A9.936 9.936 0 0 0 24 4.557z"/></svg>
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.2, rotate: -10 }}
                  className="text-slate-400 hover:text-white transition"
                  aria-label="LinkedIn"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.28c-.966 0-1.75-.79-1.75-1.76s.784-1.76 1.75-1.76 1.75.79 1.75 1.76-.784 1.76-1.75 1.76zm13.5 11.28h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.89v1.36h.04c.4-.76 1.37-1.56 2.82-1.56 3.01 0 3.57 1.98 3.57 4.56v5.64z"/></svg>
                </motion.a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-slate-400 hover:text-white">Sign In</Link></li>
                <li><Link to="/signup" className="text-slate-400 hover:text-white">Sign Up</Link></li>
                <li><Link to="/help" className="text-slate-400 hover:text-white">Help & Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Email: support@accreda.com</li>
                <li>Phone: (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; {new Date().getFullYear()} Accreda. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 