import React, { useState } from 'react';
import { Mail, Send, AlertCircle, BookOpen, FileText, HelpCircle, ChevronDown, ChevronUp, ExternalLink, MessageSquare } from 'lucide-react';

const Support: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [issueType, setIssueType] = useState('general');
  const [mode, setMode] = useState<'help' | 'feedback'>('help');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-support-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email,
          subject,
          message,
          issueType,
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSuccess(true);
      setEmail('');
      setSubject('');
      setMessage('');
      setIssueType('general');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again later.');
      console.error('Error sending support message:', err);
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      id: 'sao',
      question: 'What is an SAO?',
      answer: 'A Situation-Action-Outcome (SAO) is a structured way to document your experiences and demonstrate your competencies. It helps you reflect on specific situations, the actions you took, and the outcomes achieved. This format is crucial for showcasing your professional growth and meeting EIT program requirements.'
    },
    {
      id: 'progress',
      question: 'How do I track my progress?',
      answer: 'Your progress is automatically tracked as you complete skills and document experiences. Visit the Dashboard to see your overall progress and skill-specific achievements. The progress bar shows your completion rate for skills, documented experiences, and supervisor approvals.'
    },
    {
      id: 'supervisor',
      question: 'How do I connect with my supervisor?',
      answer: 'You can connect with your supervisor through the "My Supervisor" section on your dashboard. If you haven\'t connected yet, you\'ll see an option to send a connection request. Once connected, your supervisor can review and validate your skills and experiences.'
    },
    {
      id: 'skills',
      question: 'How do I mark skills as complete?',
      answer: 'To mark a skill as complete, navigate to the Skills section, select the skill you want to mark, and provide your self-assessment score. You\'ll need to document relevant experiences (SAOs) that demonstrate your competency in that skill. Your supervisor will then review and validate your assessment.'
    },
    {
      id: 'experiences',
      question: 'How many experiences do I need to document?',
      answer: 'You need to document at least 24 experiences (SAOs) across different skills. Each experience should demonstrate your competency in specific skills. Make sure to provide detailed descriptions of situations, your actions, and the outcomes achieved.'
    }
  ];

  const resources = [
    {
      title: 'EIT Program Guide',
      description: 'Comprehensive guide to the EIT program requirements and process',
      icon: <BookOpen size={20} />,
      link: '/resources/eit-guide'
    },
    {
      title: 'SAO Writing Tips',
      description: 'Best practices for writing effective Situation-Action-Outcome statements',
      icon: <FileText size={20} />,
      link: '/resources/sao-tips'
    },
    {
      title: 'Skills Framework',
      description: 'Detailed breakdown of all required skills and competencies',
      icon: <HelpCircle size={20} />,
      link: '/resources/skills-framework'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Help & Support</h1>
        <p className="text-slate-500 mt-2 text-lg">Get help with your EIT program journey</p>
        
        {/* Mode Toggle */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-white">
            <button
              onClick={() => setMode('help')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                mode === 'help'
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle size={16} />
              Help
            </button>
            <button
              onClick={() => setMode('feedback')}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                mode === 'feedback'
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare size={16} />
              Feedback
            </button>
          </div>
        </div>
      </div>

      {mode === 'help' ? (
        <>
          {/* Quick Help Section */}
          <div className="bg-teal-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-teal-800 mb-4">Quick Help</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/dashboard" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-medium text-teal-700">View Progress</h3>
                <p className="text-sm text-slate-600 mt-1">Check your current progress and achievements</p>
              </a>
              <a href="/skills" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-medium text-teal-700">Manage Skills</h3>
                <p className="text-sm text-slate-600 mt-1">Update and track your skill assessments</p>
              </a>
              <a href="/experiences" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-medium text-teal-700">Document Experiences</h3>
                <p className="text-sm text-slate-600 mt-1">Add new experiences and SAOs</p>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="issueType" className="block text-sm font-medium text-slate-700 mb-1">
                    Issue Type
                  </label>
                  <select
                    id="issueType"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                    disabled={loading}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Issue</option>
                    <option value="skills">Skills & Assessment</option>
                    <option value="supervisor">Supervisor Related</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="What's your question about?"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[150px]"
                    placeholder="Describe your issue or question..."
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
                    Your message has been sent successfully. We'll get back to you soon!
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="space-y-8">
              {/* FAQ Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="border-b border-slate-200 last:border-0 pb-4 last:pb-0">
                      <button
                        className="w-full flex items-center justify-between text-left"
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      >
                        <h3 className="font-medium text-slate-900">{faq.question}</h3>
                        {expandedFaq === faq.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedFaq === faq.id && (
                        <p className="text-sm text-slate-600 mt-2">{faq.answer}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Helpful Resources</h2>
                <div className="space-y-4">
                  {resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.link}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="text-teal-600 mt-1">{resource.icon}</div>
                      <div>
                        <h3 className="font-medium text-slate-900">{resource.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{resource.description}</p>
                      </div>
                      <ExternalLink size={16} className="text-slate-400 ml-auto mt-1" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Share Your Feedback</h2>
            <p className="text-slate-600 mb-6">
              We value your feedback! Let us know what you think about the EIT program platform, 
              what's working well, and what we can improve.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Brief summary of your feedback"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                  Your Feedback
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[200px]"
                  placeholder="Share your thoughts, suggestions, or concerns..."
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
                  Thank you for your feedback! We appreciate your input.
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Feedback
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support; 