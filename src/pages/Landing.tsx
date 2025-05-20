import React, { useState, useEffect } from 'react';
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
import { motion, useScroll, useTransform } from 'framer-motion';

const Landing: React.FC = () => {
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistProvince, setWaitlistProvince] = useState('');
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [waitlistError, setWaitlistError] = useState('');
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

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
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FDFBF7]">
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#3498DB] opacity-10 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#E8E4D9] opacity-20 rounded-full"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="container mx-auto px-4 z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold text-[#2C3E50] mb-6"
            >
              Streamline Your Engineering Journey
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-[#34495E] mb-8"
            >
              Track your progress, document your experiences, and get certified with EIT Track. The modern platform for engineering professionals.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/signup"
                className="px-8 py-3 bg-[#3498DB] text-white rounded-full font-medium hover:bg-[#2980B9] transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 bg-white text-[#2C3E50] rounded-full font-medium border border-[#E8E4D9] hover:bg-[#FDFBF7] transition-all duration-300 transform hover:scale-105"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-[#2C3E50] text-center mb-12"
            >
              Why Choose EIT Track?
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-[#FDFBF7] hover:shadow-md transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-[#2C3E50] mb-4">Smart Progress Tracking</h3>
                <p className="text-[#34495E]">Automatically track your progress across all required competencies and skills.</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-[#FDFBF7] hover:shadow-md transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-[#2C3E50] mb-4">Supervisor Integration</h3>
                <p className="text-[#34495E]">Seamlessly connect with your supervisor for approvals and feedback.</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-[#FDFBF7] hover:shadow-md transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-[#2C3E50] mb-4">Documentation Made Easy</h3>
                <p className="text-[#34495E]">Streamlined process for documenting your engineering experiences.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-[#FDFBF7]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-[#2C3E50] text-center mb-12"
            >
              How It Works
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[#3498DB] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">1</div>
                <h3 className="text-xl font-semibold text-[#2C3E50] mb-2">Create Account</h3>
                <p className="text-[#34495E]">Sign up as an EIT or Supervisor</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[#3498DB] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">2</div>
                <h3 className="text-xl font-semibold text-[#2C3E50] mb-2">Document Experiences</h3>
                <p className="text-[#34495E]">Record your engineering work</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[#3498DB] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">3</div>
                <h3 className="text-xl font-semibold text-[#2C3E50] mb-2">Get Approval</h3>
                <p className="text-[#34495E]">Submit for supervisor review</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[#3498DB] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">4</div>
                <h3 className="text-xl font-semibold text-[#2C3E50] mb-2">Track Progress</h3>
                <p className="text-[#34495E]">Monitor your certification journey</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-[#2C3E50] text-center mb-12"
            >
              What Our Users Say
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-[#FDFBF7] hover:shadow-md transition-shadow duration-300"
              >
                <p className="text-[#34495E] mb-4">"EIT Track has revolutionized how I document my engineering experiences. The platform is intuitive and makes the certification process much smoother."</p>
                <p className="font-semibold text-[#2C3E50]">- Sarah Johnson, EIT</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-[#FDFBF7] hover:shadow-md transition-shadow duration-300"
              >
                <p className="text-[#34495E] mb-4">"As a supervisor, I appreciate how easy it is to review and approve my team's experiences. The platform saves us valuable time."</p>
                <p className="font-semibold text-[#2C3E50]">- Michael Chen, P.Eng.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#FDFBF7]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-[#2C3E50] mb-6"
            >
              Ready to Start Your Journey?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-[#34495E] mb-8"
            >
              Join thousands of engineering professionals using EIT Track to advance their careers.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Link
                to="/signup"
                className="px-8 py-3 bg-[#3498DB] text-white rounded-full font-medium hover:bg-[#2980B9] transition-all duration-300 transform hover:scale-105"
              >
                Get Started Now
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[#34495E] mb-4">© 2024 EIT Track. All rights reserved.</p>
            <div className="flex justify-center space-x-6">
              <Link to="/privacy" className="text-[#3498DB] hover:text-[#2980B9] transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-[#3498DB] hover:text-[#2980B9] transition-colors">Terms of Service</Link>
              <Link to="/contact" className="text-[#3498DB] hover:text-[#2980B9] transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Waitlist Section */}
      <div className="py-32 bg-[#FDFBF7]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl font-bold text-[#2C3E50] mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Currently Available Only in Alberta (APEGA)
          </motion.h2>
          <motion.p
            className="text-[#34495E] mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            We're working hard to expand Accreda to other provinces. Join our waitlist to be notified when we launch in your area!
          </motion.p>
          
          <motion.form
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            onSubmit={handleWaitlistSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <input
              type="email"
              required
              placeholder="Your email"
              className="w-full sm:w-auto px-6 py-3 rounded-full border-2 border-[#E8E4D9] focus:outline-none focus:border-[#3498DB] transition-colors"
              value={waitlistEmail}
              onChange={e => setWaitlistEmail(e.target.value)}
              disabled={waitlistStatus === 'loading'}
            />
            <select
              required
              className="w-full sm:w-auto px-6 py-3 rounded-full border-2 border-[#E8E4D9] focus:outline-none focus:border-[#3498DB] transition-colors"
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
              className="w-full sm:w-auto px-8 py-3 bg-[#3498DB] text-white rounded-full font-medium hover:bg-[#2980B9] transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              disabled={waitlistStatus === 'loading'}
            >
              {waitlistStatus === 'loading' ? 'Joining...' : 'Join Waitlist'}
            </button>
          </motion.form>
          
          {waitlistStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#27AE60] mt-4"
            >
              Thank you! You've been added to the waitlist.
            </motion.div>
          )}
          {waitlistStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#E74C3C] mt-4"
            >
              {waitlistError}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing; 