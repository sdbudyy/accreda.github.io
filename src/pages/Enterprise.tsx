import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import accredaLogo from '../assets/accreda-logo.png';
import accredaSmall from '../assets/accreda-small.webp';
import smallSkill from '../assets/small-skill.png';
import eitSkills from '../assets/eit-skills.png';
import { Users, BarChart3, FileText, CheckCircle2, Clock, Menu, Award, Bell, MessageSquare, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: 'Users',
    title: 'Team Overview Dashboard',
    description: 'Get a comprehensive view of your entire team\'s progress. Monitor completion rates, skill assessments, and documentation status at a glance.',
    image: smallSkill,
    imageAlt: 'Team progress overview showing skill comparisons'
  },
  {
    icon: 'BarChart3',
    title: 'Skill Comparison Analytics',
    description: 'Compare EIT self-assessments with your evaluations. Track progress against required mean scores and identify areas for improvement with detailed analytics.',
    image: eitSkills,
    imageAlt: 'EIT skills comparison showing average scores and required means'
  },
  {
    icon: 'FileText',
    title: 'Documentation Review System',
    description: 'Streamline the review and approval process for EIT documentation. Our structured templates ensure consistency and compliance with regulatory requirements.',
    image: smallSkill,
    imageAlt: 'Documentation review interface'
  },
  {
    icon: 'CheckCircle2',
    title: 'Progress Tracking',
    description: 'Track progress across 22 required skills and competencies. Get automated alerts for pending reviews and approvals.',
    image: smallSkill,
    imageAlt: 'Progress tracking dashboard'
  },
  {
    icon: 'Bell',
    title: 'Smart Notifications',
    description: 'Stay informed with intelligent notifications for pending reviews, approvals, and important milestones.',
    image: smallSkill,
    imageAlt: 'Notification system interface'
  },
  {
    icon: 'Award',
    title: 'Compliance Management',
    description: 'Ensure your team meets all regulatory requirements with our comprehensive compliance tracking system.',
    image: smallSkill,
    imageAlt: 'Compliance management interface'
  }
];

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users className="w-8 h-8 text-teal-600" />,
  BarChart3: <BarChart3 className="w-8 h-8 text-teal-600" />,
  FileText: <FileText className="w-8 h-8 text-teal-600" />,
  CheckCircle2: <CheckCircle2 className="w-8 h-8 text-teal-600" />,
  Clock: <Clock className="w-8 h-8 text-teal-600" />,
  Bell: <Bell className="w-8 h-8 text-teal-600" />,
  Award: <Award className="w-8 h-8 text-teal-600" />
};

const Enterprise: React.FC = () => {
  // Scroll to top on mount for clean navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Pricing scroll stub for menu bar consistency
  const scrollToPricing = () => {
    // No-op or could navigate to /#pricing if desired
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - copied from Landing for consistency */}
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
              <Link to="/" className="text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
              <Link to="/?scroll=pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Pricing</Link>
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
            <button className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.nav>
      <div className="pt-36 pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <motion.div 
            className="mb-12 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold text-slate-900 leading-tight mb-6">
              Supervise Your Engineering Team
            </h1>
            <p className="text-2xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Streamline EIT development, ensure compliance, and drive team success with our comprehensive supervisor platform.
            </p>
            <a 
              href="https://cal.com/accreda" 
              target="_blank" 
              rel="noopener" 
              className="bg-black text-white text-lg px-8 py-4 rounded-lg inline-flex items-center group hover:bg-slate-800 transition-colors"
            >
              Book a Demo
            </a>
          </motion.div>
        </div>
      </div>
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                className="bg-slate-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                    {iconMap[feature.icon]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                    <p className="text-lg text-slate-600 mb-6">{feature.description}</p>
                    <div className="rounded-lg overflow-hidden border border-slate-200">
                      <img 
                        src={feature.image} 
                        alt={feature.imageAlt}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <div className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-4xl font-bold text-teal-600 mb-2">22</div>
              <p className="text-lg text-slate-600">Required Skills Tracked</p>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-4xl font-bold text-teal-600 mb-2">50%</div>
              <p className="text-lg text-slate-600">Time Saved on Reviews</p>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-4xl font-bold text-teal-600 mb-2">100%</div>
              <p className="text-lg text-slate-600">Compliance Guaranteed</p>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Start Improving Your Team Today
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Book a personalized demo and see how Accreda can help your supervisors and EITs achieve more, together.
            </p>
            <a 
              href="https://cal.com/accreda" 
              target="_blank" 
              rel="noopener" 
              className="bg-black text-white text-lg px-8 py-4 rounded-lg inline-flex items-center group hover:bg-slate-800 transition-colors"
            >
              Book a Demo
            </a>
          </motion.div>
        </div>
      </div>

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
                <li><Link to="/" className="text-slate-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/?scroll=pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
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
