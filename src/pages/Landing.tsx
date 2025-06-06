import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Award, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Users,
  Clock,
  BarChart3,
  ChevronRight,
  Menu,
  ChevronDown
} from 'lucide-react';
import accredaLogo from '../assets/accreda-logo.png';
import dashboardImage from '../assets/eit-dashboard.png';
import WaitlistForm from '../components/WaitlistForm.tsx';
import FloatingDashboardPreview from '../components/FloatingDashboardPreview';

const provinces = [
  'Alberta (APEGA)',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Northwest Territories and Nunavut',
  'Nova Scotia',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Yukon',
];

const Landing: React.FC = () => {
  const { scrollY } = useScroll();
  const navBackground = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.9)']
  );

  // Animate gradient position based on scroll
  const gradientPosition = useTransform(scrollY, [0, 600], ['0% 0%', '100% 100%']);
  // Fade white overlay as you scroll
  const fadeWhite = useTransform(scrollY, [0, 400], [0, 0.7]);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    pricingSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const [province, setProvince] = useState('Alberta (APEGA)');
  const [userType, setUserType] = useState('eit');

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav 
        className="fixed w-full z-50 border-b border-slate-200 bg-white"
        style={{ backgroundColor: navBackground }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <img src={accredaLogo} alt="Accreda" className="h-12 w-auto" />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/login" className="text-slate-600 hover:text-slate-900 transition-colors">Sign In</Link>
              <button 
                onClick={scrollToPricing}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                Pricing
              </button>
              <Link 
                to="/signup" 
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Book a Demo
              </Link>
            </div>
            <button className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section + Gradient */}
      <div className="relative pt-36 pb-4 overflow-hidden bg-white" style={{ zIndex: 0 }}>
        {/* Extended colored gradient background (covers hero + problem) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 w-full h-[1600px] md:h-[1700px] z-0"
          style={{
            background: 'linear-gradient(120deg, #f6fbff 0%, #e3f0fa 40%, #eaf6fb 80%, #fff 100%)',
            backgroundSize: '100% 100%',
            opacity: 1,
          }}
        />
        {/* White overlay that fades in with scroll, but only at the end of the problem section */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 w-full h-[110vh] md:h-[120vh] z-10"
          style={{ background: '#fff', opacity: fadeWhite }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center relative z-20">
          <motion.div 
            className="mb-12 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold text-slate-900 leading-tight mb-6">
              Save time &<br />
              <span className="text-teal-600">Engineering Excellence</span>
            </h1>
            <p className="text-2xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Track, document, and manage your professional development journey towards becoming an Engineer in Training (EIT).
            </p>
            <div className="flex justify-center">
              <Link 
                to="/signup" 
                className="relative group bg-black text-white text-lg px-8 py-4 rounded-lg inline-flex items-center justify-center overflow-hidden"
                style={{ minWidth: 180 }}
              >
                <span className="relative z-10 flex items-center">
                  Book a Demo
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                {/* Sliding highlight animation */}
                <motion.span
                  className="absolute left-0 top-0 h-full w-0 bg-lime-400 opacity-80 group-hover:w-full transition-all duration-300 z-0"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                  style={{ borderRadius: '0.5rem' }}
                />
                <span className="absolute left-0 top-0 h-full w-full group-hover:bg-lime-400/80 transition-all duration-300 z-0 rounded-lg" style={{ pointerEvents: 'none', opacity: 0 }} />
              </Link>
            </div>
          </motion.div>
          <motion.div 
            className="relative w-full flex justify-center mt-4 mb-16"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <FloatingDashboardPreview>
              <img 
                src={dashboardImage} 
                alt="Accreda Dashboard" 
                className="rounded-2xl object-contain w-full"
                style={{ width: '100%', maxWidth: '1200px', maxHeight: '700px', margin: '0 auto', objectFit: 'contain', objectPosition: 'top' }}
              />
            </FloatingDashboardPreview>
          </motion.div>
        </div>
      </div>

      {/* Problem Section */}
      <div
        className="py-20"
        style={{
          background: '#fff',
          position: 'relative',
          zIndex: 20,
          marginTop: '-4rem',
          paddingTop: '8rem'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              The EIT journey is<br />
              <span className="text-teal-600">complicated</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "How do I track my progress effectively?",
              "What documentation do I need?",
              "How do I get supervisor approval?",
              "What are the requirements for my province?",
              "How do I manage my SAOs?",
              "What skills do I need to develop?"
            ].map((question, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <p className="text-xl font-medium text-slate-900">{question}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Solution Section */}
      <div className="py-20 bg-white" style={{ position: 'relative', zIndex: 30 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Accreda is your complete<br />
              <span className="text-teal-600">EIT management system</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Progress Tracking",
                description: "Track your progress across all required engineering competencies with our intuitive skill assessment system.",
                icon: <BarChart3 className="w-8 h-8 text-teal-600" />
              },
              {
                title: "Documentation",
                description: "Document your engineering experiences with our structured templates and guidance.",
                icon: <FileText className="w-8 h-8 text-teal-600" />
              },
              {
                title: "SAO Management",
                description: "Create and manage your Self-Assessment Outcomes with our AI-powered writing assistant.",
                icon: <BookOpen className="w-8 h-8 text-teal-600" />
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-slate-50 rounded-xl p-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-lg text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              The only platform that<br />
              <span className="text-teal-600">pays for itself</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mt-4">
              No additional fees or hidden costs. Get started today.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                title: "Start",
                subtitle: "For developers and early-stage engineers",
                price: "Free",
                period: "forever",
                features: [
                  "Up to 5 documents",
                  "Up to 5 SAOs",
                  "Connect with 1 supervisor",
                  "Standard support"
                ],
                buttonText: "Join Today",
                buttonLink: "/signup",
                highlighted: false
              },
              {
                title: "Pro",
                subtitle: "For fast-growing engineers",
                price: "$19.99",
                period: "per month",
                subtext: "or $17.49/month billed yearly",
                features: [
                  "Unlimited documents",
                  "Unlimited SAOs",
                  "Unlimited supervisors",
                  "Priority support"
                ],
                buttonText: "Join Today",
                buttonLink: "/signup?plan=pro",
                highlighted: true
              },
              {
                title: "Enterprise",
                subtitle: "For large organizations",
                price: "Custom",
                period: "tailored to your needs",
                features: [
                  "Everything in Pro",
                  "Priority support",
                  "Dedicated account manager",
                  "Access to Supervisor Dashboard"
                ],
                buttonText: "Contact Sales",
                buttonLink: "/support",
                highlighted: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                className={`relative border rounded-2xl p-8 flex flex-col ${
                  plan.highlighted 
                    ? 'border-teal-500 bg-white shadow-xl' 
                    : 'border-slate-200 bg-white'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">{plan.title}</h3>
                  <p className="text-slate-600 mt-2">{plan.subtitle}</p>
                </div>
                <div className="mb-6">
                  <p className="text-5xl font-extrabold text-slate-900">{plan.price}</p>
                  <p className="text-slate-600">{plan.period}</p>
                  {plan.subtext && (
                    <p className="text-teal-600 font-medium mt-2">{plan.subtext}</p>
                  )}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-teal-600 mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  to={plan.buttonLink}
                  className={`mt-auto text-center text-lg px-8 py-4 rounded-lg transition-colors ${
                    plan.highlighted
                      ? 'bg-black text-white hover:bg-slate-800'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Waitlist Section - moved above CTA and color adjusted */}
      <div className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Not in Alberta?
            </h2>
            <p className="text-xl text-slate-600 max-w-xl mx-auto">
              Join our waitlist and be the first to know when Accreda launches in your province. Select your province and role below!
            </p>
          </div>
          <WaitlistForm />
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Start Saving Time Today
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of engineers who are using Accreda to streamline their path to becoming an Engineer in Training.
            </p>
            <Link 
              to="/signup" 
              className="bg-white text-black text-lg px-8 py-4 rounded-lg inline-flex items-center group hover:bg-slate-100 transition-colors"
            >
              Book a Demo
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
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
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/features" className="text-slate-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/enterprise" className="text-slate-400 hover:text-white transition-colors">Enterprise</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-slate-400 hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/careers" className="text-slate-400 hover:text-white transition-colors">Careers</Link></li>
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

export default Landing; 