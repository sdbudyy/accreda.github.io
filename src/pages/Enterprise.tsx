import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import accredaLogo from '../assets/accreda-logo.png';
import accredaSmall from '../assets/accreda-small.webp';
import smallSkill from '../assets/small-skill.png';
import eitSkills from '../assets/eit-skills.png';
import { Users, BarChart3, FileText, CheckCircle2, Clock, Menu, Award, Bell, MessageSquare, TrendingUp, Shield, Lock, Database } from 'lucide-react';

const features = [
  {
    icon: 'Users',
    title: 'Team Overview Dashboard',
    description: 'Get a bird\'s eye view of your entire team\'s progress. Monitor completion rates, skill assessments, and documentation status at a glance.',
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
    title: 'Streamlined Documentation Review',
    description: 'Review and approve EIT documentation efficiently. Our structured templates ensure consistency and compliance with regulatory requirements.',
    image: smallSkill,
    imageAlt: 'Documentation review interface'
  },
  {
    icon: 'CheckCircle2',
    title: 'Automated Progress Tracking',
    description: 'Track progress across 22 required skills and competencies. Get automated alerts for pending reviews and approvals.',
    image: smallSkill,
    imageAlt: 'Progress tracking dashboard'
  },
  {
    icon: 'Clock',
    title: 'Time-Saving Workflows',
    description: 'Reduce administrative overhead with automated reminders, bulk actions, and streamlined approval processes.',
    image: smallSkill,
    imageAlt: 'Time-saving workflow interface'
  },
  {
    icon: 'Bell',
    title: 'Smart Notifications',
    description: 'Stay informed with intelligent notifications for pending reviews, approvals, and important milestones.',
    image: smallSkill,
    imageAlt: 'Notification system interface'
  }
];

const securityFeatures = [
  {
    icon: 'Shield',
    title: 'SOC 2 Certified',
    description: 'We are committed to the highest standard of security and are SOC 2 Type 2 certified.'
  },
  {
    icon: 'Lock',
    title: 'Data Encryption',
    description: 'Industry-standard encryption at rest (AES-256) and in transit (TLS).'
  },
  {
    icon: 'Database',
    title: 'Automated Backups',
    description: 'Daily backups with one week retention period for all your data.'
  }
];

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users className="w-8 h-8 text-teal-600" />,
  BarChart3: <BarChart3 className="w-8 h-8 text-teal-600" />,
  FileText: <FileText className="w-8 h-8 text-teal-600" />,
  CheckCircle2: <CheckCircle2 className="w-8 h-8 text-teal-600" />,
  Clock: <Clock className="w-8 h-8 text-teal-600" />,
  Bell: <Bell className="w-8 h-8 text-teal-600" />,
  Shield: <Shield className="w-8 h-8 text-teal-600" />,
  Lock: <Lock className="w-8 h-8 text-teal-600" />,
  Database: <Database className="w-8 h-8 text-teal-600" />
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
              <a 
                href="/#pricing"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Pricing
              </a>
              {window.location.pathname === '/enterprise' ? (
                <button
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Enterprise
                </button>
              ) : (
                <Link to="/enterprise" className="text-slate-600 hover:text-slate-900 transition-colors">Enterprise</Link>
              )}
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
              Built for Engineering Teams
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
      <div className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {securityFeatures.map((feature, idx) => (
              <motion.div
                key={feature.title}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mb-6">
                  {iconMap[feature.icon]}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-lg text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
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
    </div>
  );
};

export default Enterprise;
