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
  BarChart3,
  Shield,
  Zap,
  Star,
  ChevronRight,
  XCircle
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#1a365d] to-[#0f2942]">
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#2c5282] opacity-20 rounded-full"
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
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#4299e1] opacity-10 rounded-full"
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
              className="text-5xl md:text-6xl font-bold text-white mb-6"
            >
              Streamline Your Engineering Journey
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-blue-100 mb-8"
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
                className="px-8 py-3 bg-[#4299e1] text-white rounded-full font-medium hover:bg-[#3182ce] transition-all duration-300 transform hover:scale-105"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 bg-white/10 text-white rounded-full font-medium border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#1a365d] mb-2">500+</div>
              <div className="text-gray-600">Active Engineers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#1a365d] mb-2">98%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#1a365d] mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#1a365d] mb-2">12+</div>
              <div className="text-gray-600">Provinces Coming Soon</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-[#1a365d] text-center mb-12"
            >
              Why Choose EIT Track?
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-[#1a365d] rounded-lg flex items-center justify-center text-white mb-4">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-semibold text-[#1a365d] mb-4">Smart Progress Tracking</h3>
                <p className="text-gray-600">Automatically track your progress across all required competencies and skills with our intelligent dashboard.</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-[#1a365d] rounded-lg flex items-center justify-center text-white mb-4">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-semibold text-[#1a365d] mb-4">Supervisor Integration</h3>
                <p className="text-gray-600">Seamlessly connect with your supervisor for approvals and feedback in real-time.</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-12 h-12 bg-[#1a365d] rounded-lg flex items-center justify-center text-white mb-4">
                  <FileText size={24} />
                </div>
                <h3 className="text-xl font-semibold text-[#1a365d] mb-4">Documentation Made Easy</h3>
                <p className="text-gray-600">Streamlined process for documenting your engineering experiences with AI-powered suggestions.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-[#1a365d] text-center mb-12"
            >
              Simple, Transparent Pricing
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-[#1a365d] mb-2">Free</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="text-4xl font-bold text-[#1a365d] mb-2">$0</div>
                      <p className="text-gray-600">Forever free</p>
                    </div>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-[#1a365d] mr-2" />
                    Up to 5 documents
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-[#1a365d] mr-2" />
                    Up to 5 SAOs
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-[#1a365d] mr-2" />
                    Connect with 1 supervisor
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-[#1a365d] mr-2" />
                    Standard support
                  </li>
                  <li className="flex items-center text-gray-400">
                    <XCircle className="w-5 h-5 mr-2" />
                    AI Features
                  </li>
                </ul>
                <Link
                  to="/signup"
                  className="block w-full text-center px-6 py-3 bg-[#1a365d] text-white rounded-full font-medium hover:bg-[#2c5282] transition-colors"
                >
                  Get Started
                </Link>
              </motion.div>

              {/* Pro Plan */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-white border-2 border-[#1a365d] hover:shadow-lg transition-shadow duration-300 relative"
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#1a365d] text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-[#1a365d] mb-2">Pro</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="text-4xl font-bold text-[#1a365d] mb-2">$19.99<span className="text-lg text-gray-600">/month</span></div>
                      <p className="text-gray-600">Monthly billing</p>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="text-4xl font-bold text-[#1a365d] mb-2">$17.49<span className="text-lg text-gray-600">/month</span></div>
                      <p className="text-gray-600">Billed annually ($209.88/year)</p>
                      <p className="text-green-600 text-sm mt-1">Save 13% with annual billing</p>
                    </div>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-[#1a365d] mr-2" />
                    Unlimited documents
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-[#1a365d] mr-2" />
                    Unlimited SAOs
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-[#1a365d] mr-2" />
                    Unlimited supervisors
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-[#1a365d] mr-2" />
                    Priority support
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-[#1a365d] mr-2" />
                    AI Features
                  </li>
                </ul>
                <Link
                  to="/signup"
                  className="block w-full text-center px-6 py-3 bg-[#1a365d] text-white rounded-full font-medium hover:bg-[#2c5282] transition-colors"
                >
                  Get Started
                </Link>
              </motion.div>

              {/* Enterprise Plan */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-[#1a365d] text-white hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="text-4xl font-bold mb-2">Custom</div>
                      <p className="text-blue-200">Contact us for pricing</p>
                    </div>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <CheckCircle2 className="w-5 h-5 text-blue-300 mr-2" />
                    Everything in EIT Plan
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-5 h-5 text-blue-300 mr-2" />
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-5 h-5 text-blue-300 mr-2" />
                    Dedicated account manager
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="w-5 h-5 text-blue-300 mr-2" />
                    Access to Supervisor Dashboard
                  </li>
                </ul>
                <Link
                  to="/contact"
                  className="block w-full text-center px-6 py-3 bg-white text-[#1a365d] rounded-full font-medium hover:bg-blue-50 transition-colors"
                >
                  Contact Us
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-[#1a365d] text-center mb-12"
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
                <div className="w-16 h-16 bg-[#1a365d] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">1</div>
                <h3 className="text-xl font-semibold text-[#1a365d] mb-2">Create Account</h3>
                <p className="text-gray-600">Sign up as an EIT or Supervisor</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[#1a365d] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">2</div>
                <h3 className="text-xl font-semibold text-[#1a365d] mb-2">Document Experiences</h3>
                <p className="text-gray-600">Record your engineering work</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[#1a365d] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">3</div>
                <h3 className="text-xl font-semibold text-[#1a365d] mb-2">Get Approval</h3>
                <p className="text-gray-600">Submit for supervisor review</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-[#1a365d] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">4</div>
                <h3 className="text-xl font-semibold text-[#1a365d] mb-2">Track Progress</h3>
                <p className="text-gray-600">Monitor your certification journey</p>
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
              className="text-3xl font-bold text-[#1a365d] text-center mb-12"
            >
              What Our Users Say
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-gray-50 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} className="fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"EIT Track has revolutionized how I document my engineering experiences. The platform is intuitive and makes the certification process much smoother."</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#1a365d] rounded-full flex items-center justify-center text-white font-bold mr-4">SJ</div>
                  <div>
                    <p className="font-semibold text-[#1a365d]">Sarah Johnson</p>
                    <p className="text-gray-500 text-sm">EIT, Mechanical Engineering</p>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-gray-50 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} className="fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"As a supervisor, I appreciate how easy it is to review and approve my team's experiences. The platform saves us valuable time and ensures consistency."</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#1a365d] rounded-full flex items-center justify-center text-white font-bold mr-4">MC</div>
                  <div>
                    <p className="font-semibold text-[#1a365d]">Michael Chen</p>
                    <p className="text-gray-500 text-sm">P.Eng., Civil Engineering</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-[#1a365d] to-[#0f2942]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-white mb-6"
            >
              Ready to Start Your Journey?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-blue-100 mb-8"
            >
              Join thousands of engineering professionals using EIT Track to advance their careers.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/signup"
                className="px-8 py-3 bg-[#4299e1] text-white rounded-full font-medium hover:bg-[#3182ce] transition-all duration-300 transform hover:scale-105"
              >
                Get Started Free
              </Link>
              <Link
                to="/contact"
                className="px-8 py-3 bg-white/10 text-white rounded-full font-medium border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                Contact Sales
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f2942] py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><Link to="/features" className="text-blue-200 hover:text-white transition-colors">Features</Link></li>
                  <li><Link to="/pricing" className="text-blue-200 hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link to="/security" className="text-blue-200 hover:text-white transition-colors">Security</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><Link to="/about" className="text-blue-200 hover:text-white transition-colors">About</Link></li>
                  <li><Link to="/blog" className="text-blue-200 hover:text-white transition-colors">Blog</Link></li>
                  <li><Link to="/careers" className="text-blue-200 hover:text-white transition-colors">Careers</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li><Link to="/help" className="text-blue-200 hover:text-white transition-colors">Help Center</Link></li>
                  <li><Link to="/documentation" className="text-blue-200 hover:text-white transition-colors">Documentation</Link></li>
                  <li><Link to="/guides" className="text-blue-200 hover:text-white transition-colors">Guides</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><Link to="/privacy" className="text-blue-200 hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-blue-200 hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link to="/contact" className="text-blue-200 hover:text-white transition-colors">Contact Us</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-blue-800 pt-8 text-center">
              <p className="text-blue-200">© 2024 EIT Track. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Waitlist Section */}
      <div className="py-32 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.h2
            className="text-3xl font-bold text-[#1a365d] mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Currently Available Only in Alberta (APEGA)
          </motion.h2>
          <motion.p
            className="text-gray-600 mb-8"
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
              className="w-full sm:w-auto px-6 py-3 rounded-full border-2 border-gray-200 focus:outline-none focus:border-[#1a365d] transition-colors"
              value={waitlistEmail}
              onChange={e => setWaitlistEmail(e.target.value)}
              disabled={waitlistStatus === 'loading'}
            />
            <select
              required
              className="w-full sm:w-auto px-6 py-3 rounded-full border-2 border-gray-200 focus:outline-none focus:border-[#1a365d] transition-colors"
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
              className="w-full sm:w-auto px-8 py-3 bg-[#1a365d] text-white rounded-full font-medium hover:bg-[#2c5282] transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              disabled={waitlistStatus === 'loading'}
            >
              {waitlistStatus === 'loading' ? 'Joining...' : 'Join Waitlist'}
            </button>
          </motion.form>
          
          {waitlistStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-500 mt-4"
            >
              Thank you! You've been added to the waitlist.
            </motion.div>
          )}
          {waitlistStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 mt-4"
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