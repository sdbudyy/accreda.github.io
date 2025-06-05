import React from 'react';
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
  ChevronRight
} from 'lucide-react';
import accredaLogo from '../assets/accreda-logo.png';
import dashboardImage from '../assets/eit-dashboard.png';
import WaitlistForm from '../components/WaitlistForm.tsx';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <img src={accredaLogo} alt="Accreda" className="h-12 w-auto" />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/login" className="text-slate-600 hover:text-slate-900">Sign In</Link>
              <Link to="/signup" className="btn btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-36 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="mb-12 lg:mb-0">
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6 animate-fade-in">
                Streamline Your Journey to
                <span className="text-teal-600"> Engineering Excellence</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl">
                Accreda helps engineers track, document, and manage their professional development journey towards becoming an Engineer in Training (EIT).
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/signup" 
                  className="btn btn-primary text-lg px-8 py-3 inline-flex items-center justify-center group"
                >
                  Get Started Free
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/login" 
                  className="btn btn-secondary text-lg px-8 py-3"
                >
                  Sign In
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
                <img 
                  src={dashboardImage} 
                  alt="Accreda Dashboard" 
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: '600px' }}
                />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-blue-500/20 blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive tools and features designed to streamline your EIT journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card hover:scale-105 transition-transform group">
              <div className="p-6">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
                  <Award className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Skill Tracking</h3>
                <p className="text-slate-600">
                  Track your progress across all required engineering competencies with our intuitive skill assessment system.
                </p>
              </div>
            </div>

            <div className="card hover:scale-105 transition-transform group">
              <div className="p-6">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Experience Documentation</h3>
                <p className="text-slate-600">
                  Document your engineering experiences with our structured templates and guidance.
                </p>
              </div>
            </div>

            <div className="card hover:scale-105 transition-transform group">
              <div className="p-6">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
                  <BookOpen className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">SAO Management</h3>
                <p className="text-slate-600">
                  Create and manage your Self-Assessment Outcomes with our AI-powered writing assistant.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Choose Accreda?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join thousands of engineers who trust Accreda for their professional development
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4 p-6 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-teal-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Structured Progress Tracking</h3>
                <p className="text-slate-600">
                  Stay organized with our comprehensive tracking system for skills, experiences, and documentation.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-teal-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Supervisor Collaboration</h3>
                <p className="text-slate-600">
                  Streamline the approval process with our integrated supervisor review system.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-teal-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Time-Saving Tools</h3>
                <p className="text-slate-600">
                  Our AI-powered writing assistant helps you draft professional documentation quickly.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-teal-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Progress Analytics</h3>
                <p className="text-slate-600">
                  Get clear insights into your progress with detailed analytics and visualizations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Choose the plan that best fits your needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Free Plan */}
            <div className="border border-slate-200 rounded-2xl p-8 bg-white flex flex-col items-center shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Free</h3>
              <div className="text-center mb-4">
                <p className="text-5xl font-extrabold text-slate-800">$0</p>
                <p className="text-sm text-slate-600">forever</p>
              </div>
              <ul className="mb-6 w-full space-y-3">
                <li className="flex items-center text-slate-700"><span className="text-green-500 mr-2">✓</span> 5 documents</li>
                <li className="flex items-center text-slate-700"><span className="text-green-500 mr-2">✓</span> 5 SAOs</li>
                <li className="flex items-center text-slate-700"><span className="text-green-500 mr-2">✓</span> 1 supervisor</li>
                <li className="flex items-center text-slate-700"><span className="text-green-500 mr-2">✓</span> Basic support</li>
              </ul>
              <Link 
                to="/signup" 
                className="btn btn-secondary text-lg px-8 py-3 w-full text-center"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="border border-teal-500 rounded-2xl p-8 bg-gradient-to-br from-teal-50 to-white flex flex-col items-center shadow-sm relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
              </div>
              <h3 className="text-2xl font-bold text-teal-900 mb-2">Pro</h3>
              <div className="text-center mb-4">
                <p className="text-5xl font-extrabold text-teal-800">$19.99</p>
                <p className="text-sm text-slate-600">per month</p>
                <p className="text-sm text-teal-600 font-medium mt-1">or $17.49/month billed yearly</p>
              </div>
              <ul className="mb-6 w-full space-y-3">
                <li className="flex items-center text-slate-700"><span className="text-green-500 mr-2">✓</span> Unlimited documents</li>
                <li className="flex items-center text-slate-700"><span className="text-green-500 mr-2">✓</span> Unlimited SAOs</li>
                <li className="flex items-center text-slate-700"><span className="text-green-500 mr-2">✓</span> Unlimited supervisors</li>
                <li className="flex items-center text-slate-700"><span className="text-green-500 mr-2">✓</span> Priority support</li>
              </ul>
              <Link 
                to="/signup" 
                className="btn btn-primary text-lg px-8 py-3 w-full text-center group"
              >
                Get Started
                <ChevronRight className="ml-2 w-5 h-5 inline-block group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="border border-slate-200 rounded-2xl p-8 bg-white flex flex-col items-center shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Enterprise</h3>
              <div className="text-center mb-4">
                <p className="text-5xl font-extrabold text-slate-800">Custom</p>
                <p className="text-sm text-slate-600">tailored to your needs</p>
              </div>
              <ul className="mb-6 w-full space-y-3">
                <li className="flex items-center text-slate-700"><span className="text-green-500 mr-2">✓</span> Everything in Pro</li>
                <li className="flex items-center text-slate-700"><span className="text-green-500 mr-2">✓</span> Custom integrations</li>
                <li className="flex items-center text-slate-700"><span className="text-green-500 mr-2">✓</span> Dedicated support</li>
                <li className="flex items-center text-slate-700"><span className="text-green-500 mr-2">✓</span> Team management</li>
              </ul>
              <Link 
                to="/support" 
                className="btn btn-secondary text-lg px-8 py-3 w-full text-center group"
              >
                Contact Us
                <ChevronRight className="ml-2 w-5 h-5 inline-block group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            Ready to Start Your EIT Journey?
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Join thousands of engineers who are using Accreda to streamline their path to becoming an Engineer in Training.
          </p>
          <Link 
            to="/signup" 
            className="btn btn-primary text-lg px-8 py-3 inline-flex items-center group"
          >
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Waitlist Section */}
      <div className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Join the Waitlist for Your Province</h2>
          <p className="text-slate-600 mb-6">Currently, Accreda only supports APEGA. Let us know where you are and we'll notify you when your province is supported!</p>
          <WaitlistForm />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img src={accredaLogo} alt="Accreda" className="h-12 w-auto mb-4" />
              <p className="text-slate-400">
                Helping engineers achieve their professional goals through structured development and documentation.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-slate-400 hover:text-white transition-colors">Sign In</Link></li>
                <li><Link to="/signup" className="text-slate-400 hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/help" className="text-slate-400 hover:text-white transition-colors">Help & Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Email: <a href="mailto:accreda.info@gmail.com" className="hover:text-white transition-colors">accreda.info@gmail.com</a></li>
                <li><Link to="/support" className="hover:text-white transition-colors">Contact Support</Link></li>
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