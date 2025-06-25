import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import accredaLogo from '../assets/accreda-logo.png';
import accredaSmall from '../assets/accreda-small.webp';
import { Menu } from 'lucide-react';
import MobileLandingMenu from '../components/MobileLandingMenu';

const Terms: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Add mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - copied from Landing/Enterprise for consistency */}
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

      <div className="pt-36 pb-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="mb-12 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6 text-center">
              Terms and Conditions
            </h1>
            <div className="text-center text-slate-600 mb-8">
              <div>Effective Date: <span className="font-semibold">May 24, 2025</span></div>
              <div>Jurisdiction: <span className="font-semibold">Province of Alberta, Canada</span></div>
            </div>
            <div className="prose prose-slate max-w-none mx-auto text-lg">
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
                <li><Link to="/enterprise" className="text-slate-400 hover:text-white transition-colors">Enterprise</Link></li>
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

export default Terms; 