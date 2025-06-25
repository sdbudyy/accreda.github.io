import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import accredaLogo from '../assets/accreda-logo.png';
import accredaSmall from '../assets/accreda-small.webp';
import { Menu } from 'lucide-react';
import MobileLandingMenu from '../components/MobileLandingMenu';

const Privacy: React.FC = () => {
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
              Privacy Policy
            </h1>
            <div className="text-center text-slate-600 mb-8">
              <div>Effective Date: <span className="font-semibold">May 24, 2025</span></div>
              <div>Last Revision: <span className="font-semibold">June 24, 2025</span></div>
              <div>Governing Entity: Accreda Inc., a private Alberta corporation</div>
            </div>
            <div className="prose prose-slate max-w-none mx-auto text-lg">
              <h2>1. General Provisions and Scope</h2>
              <p>This Privacy Policy (the "Policy") is incorporated by reference into the Terms and Conditions of Accreda Inc. and shall govern the manner in which we collect, access, utilize, store, disclose, transfer, and otherwise process personal data and personally identifiable information (“PII”) in connection with the use of the digital properties, interfaces, software, and associated services operated and maintained by Accreda (collectively, the "Platform").</p>
              <p>This Policy is enacted in compliance with the Personal Information Protection and Electronic Documents Act (PIPEDA), the General Data Protection Regulation (Regulation (EU) 2016/679) ("GDPR"), and other applicable privacy legislation. In the event of a conflict between applicable legal standards, the stricter interpretation shall prevail unless explicitly waived.</p>
              <h2>2. Acknowledgement of Capacity and Consent</h2>
              <p>By accessing or utilizing any component of the Platform, the User (as defined herein) hereby affirms:</p>
              <ul>
                <li>That they possess the legal capacity to enter into a binding agreement,</li>
                <li>That they have reviewed and comprehended the terms of this Policy,</li>
                <li>That they provide freely given, specific, informed, and unambiguous consent for the collection and processing of their personal data, and</li>
                <li>That such consent may be withdrawn subject to the lawful exceptions outlined under applicable law.</li>
              </ul>
              <h2>3. Definitions</h2>
              <ul>
                <li><strong>"User"</strong> shall mean any natural person, legal entity, or digital agent interacting with the Platform.</li>
                <li><strong>"Personal Data"</strong> shall include any information relating to an identified or identifiable natural person, as defined under Section 3 of the GDPR and corresponding sections of PIPEDA.</li>
                <li><strong>"Processing"</strong> shall mean any operation or set of operations performed upon Personal Data, whether or not by automated means.</li>
                <li><strong>"Third Party"</strong> shall include any person or entity other than the User and Accreda, whether directly or indirectly involved in data handling, unless otherwise stated.</li>
              </ul>
              <h2>4. Categories of Data Collected</h2>
              <p>The following categories of data may be collected and processed, subject to statutory and contractual limitations:</p>
              <h3>4.1. Identifying Information</h3>
              <p>Includes name, institutional affiliation, contact address, email, phone number, and other account-specific identifiers.</p>
              <h3>4.2. Transactional and Financial Data</h3>
              <p>Includes payment method details, transaction timestamps, billing address, and subscription metadata.</p>
              <h3>4.3. Behavioral and Analytical Data</h3>
              <p>Includes access logs, error traces, session metadata, user-agent string, IP address, device information, geolocation (where applicable), clickstream data, heatmaps, and telemetry diagnostics.</p>
              <h3>4.4. Voluntary Submissions</h3>
              <p>Includes competency records, uploaded documents, internal notes, and any data actively entered by the User on a non-compulsory basis.</p>
              <h2>5. Legal Basis for Processing</h2>
              <p>The lawful bases upon which Personal Data is processed include, but are not limited to:</p>
              <ul>
                <li>Contractual necessity under Article 6(1)(b) GDPR, where data is required for the fulfillment of services expressly requested by the User;</li>
                <li>Informed consent under Article 6(1)(a), particularly for optional data or communications;</li>
                <li>Legitimate interests under Article 6(1)(f), including security monitoring, analytics, fraud prevention, and operational maintenance;</li>
                <li>Legal obligation under Article 6(1)(c), where processing is mandated by applicable Canadian or foreign statutory instruments.</li>
              </ul>
              <h2>6. Purposes for Processing</h2>
              <p>Personal Data shall be processed exclusively for the following delineated purposes:</p>
              <ul>
                <li>To enable the creation, authentication, and management of user accounts;</li>
                <li>To facilitate delivery of subscribed services, including competency tracking and related support functions;</li>
                <li>To administer payment workflows, including billing, invoicing, and audit compliance;</li>
                <li>To monitor system performance, enhance product features, and ensure operational continuity;</li>
                <li>To comply with legal obligations, regulatory mandates, and enforceable governmental requests;</li>
                <li>To defend legal claims, resolve disputes, or assert contractual rights;</li>
                <li>To inform Users of updates, system notices, or policy modifications consistent with service operations.</li>
              </ul>
              <h2>7. Third-Party Data Sharing</h2>
              <p>Accreda may disclose Personal Data to third parties strictly under the following circumstances:</p>
              <ul>
                <li>Service Providers and Subprocessors under binding contractual clauses, including confidentiality and data protection standards consistent with Article 28 GDPR and equivalent provincial law;</li>
                <li>Regulatory and Legal Authorities in response to subpoenas, court orders, or binding legal processes;</li>
                <li>Corporate Transactions, including mergers, acquisitions, divestitures, or reorganizations, provided that such third parties agree in writing to uphold materially equivalent data protection obligations.</li>
              </ul>
              <p>No Personal Data shall be sold, rented, leased, or traded for direct monetary compensation or marketing purposes.</p>
              <h2>8. International Data Transfers</h2>
              <p>Where Personal Data is transferred outside of Canada, including to jurisdictions without equivalent data protection laws, such transfers shall occur pursuant to:</p>
              <ul>
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission;</li>
                <li>Binding Corporate Rules (BCRs) where applicable;</li>
                <li>User consent, when expressly obtained for such transfer.</li>
              </ul>
              <h2>9. Data Retention and Disposal</h2>
              <p>Personal Data shall be retained only for so long as is reasonably necessary to fulfill the processing purposes stated herein, or as required to satisfy legal or regulatory obligations.</p>
              <p>Upon expiration of such retention period, Personal Data shall be securely disposed of by means of anonymization, cryptographic erasure, or irreversible deletion from active and backup systems.</p>
              <h2>10. Data Security</h2>
              <p>Accreda shall employ commercially reasonable physical, administrative, and technical measures to safeguard Personal Data, which may include:</p>
              <ul>
                <li>Transport Layer Security (TLS) encryption;</li>
                <li>Role-based access controls (RBAC);</li>
                <li>Encrypted storage and hashed authentication;</li>
                <li>Secure logging, monitoring, and incident response protocols;</li>
                <li>Periodic vulnerability assessments and software patching cycles.</li>
              </ul>
              <p>However, no system can be guaranteed to be impervious. The User hereby acknowledges the residual risk inherent in data transmission and storage and waives any claim arising from incidents beyond Accreda's reasonable control.</p>
              <h2>11. User Rights and Remedies</h2>
              <p>Where applicable by law, the User may exercise the following rights by submitting a formal request to <a href="mailto:privacy@accreda.ca">privacy@accreda.ca</a>:</p>
              <ul>
                <li>Right to access and obtain a copy of their Personal Data;</li>
                <li>Right to rectification of inaccurate or incomplete information;</li>
                <li>Right to erasure ("right to be forgotten") under applicable limitations;</li>
                <li>Right to data portability, where technically feasible;</li>
                <li>Right to withdraw consent, subject to the lawfulness of prior processing;</li>
                <li>Right to lodge a complaint with a supervisory authority.</li>
              </ul>
              <p>All requests shall be subject to identity verification and may be declined where legally permissible.</p>
              <h2>12. Children's Data</h2>
              <p>The Platform is not intended for use by individuals under the age of 13. We do not knowingly collect or solicit data from minors. Any data inadvertently collected from such individuals will be deleted upon discovery.</p>
              <h2>13. Modifications and Updates</h2>
              <p>Accreda reserves the right to modify this Policy at its sole discretion, with or without notice, to reflect changes in law, best practices, or service offerings. Material changes will be reflected by an updated "Last Revision" date. Continued use of the Platform following such modifications shall constitute binding acceptance.</p>
              <h2>14. Contact and Data Protection Officer</h2>
              <p>For inquiries, concerns, or requests related to this Policy, please contact:</p>
              <p><strong>Data Protection Office<br/>Accreda Inc.<br/>📧 Email: <a href="mailto:accreda.info@gmail.com">accreda.info@gmail.com</a><br/>📍 Calgary, Alberta, Canada</strong></p>
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

export default Privacy; 