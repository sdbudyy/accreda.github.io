import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import accredaLogo from '../assets/accreda-logo.png';
import { Users, BarChart3, FileText, CheckCircle2, Clock, Menu } from 'lucide-react';

const features = [
  {
    icon: 'Users',
    title: 'Supervisor Dashboard',
    description: 'Supervisors can easily monitor the progress of all their EITs, review documentation, and provide timely feedback.'
  },
  {
    icon: 'BarChart3',
    title: 'Organization-wide Insights',
    description: "Gain actionable insights into your team's development, skill gaps, and compliance with regulatory requirements."
  },
  {
    icon: 'FileText',
    title: 'Centralized Documentation',
    description: 'All EIT documentation and SAOs are securely stored and easily accessible for audits and reviews.'
  },
  {
    icon: 'CheckCircle2',
    title: 'Automated Compliance',
    description: 'Ensure your organization meets all engineering regulatory requirements with automated reminders and progress tracking.'
  },
  {
    icon: 'Clock',
    title: 'Time Savings',
    description: 'Streamline onboarding, documentation, and review processes to save valuable time for both supervisors and EITs.'
  }
];

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users className="w-8 h-8 text-teal-600" />,
  BarChart3: <BarChart3 className="w-8 h-8 text-teal-600" />,
  FileText: <FileText className="w-8 h-8 text-teal-600" />,
  CheckCircle2: <CheckCircle2 className="w-8 h-8 text-teal-600" />,
  Clock: <Clock className="w-8 h-8 text-teal-600" />,
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
                <img src={accredaLogo} alt="Accreda" className="h-12 w-auto" />
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
              Accreda for Enterprise
            </h1>
            <p className="text-2xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Empower your organization with the most advanced EIT management platform. Designed for corporations and supervisors to streamline professional development, compliance, and oversight.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                className="bg-slate-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                  {iconMap[feature.icon]}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-lg text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <div className="py-20 bg-white text-slate-900 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to transform your organization?
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
