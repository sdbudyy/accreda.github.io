"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ReferenceApprovalPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referenceData, setReferenceData] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    position: "",
    relation: "",
  });
  const [approved, setApproved] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setCardVisible(true), 200); // Fade-in animation
    const fetchReferenceData = async () => {
      try {
        const { data: tokenData, error: tokenError } = await supabase
          .from("reference_tokens")
          .select(`*, job_references:reference_id ( id, description, jobs ( title, company, eit_profiles ( full_name, email ) ) )`)
          .eq("token", token)
          .single();
        if (tokenError) throw tokenError;
        if (new Date(tokenData.expires_at) < new Date()) {
          throw new Error("This reference link has expired");
        }
        setReferenceData({
          ...tokenData.job_references.jobs,
          description: tokenData.job_references.description,
          referenceId: tokenData.job_references.id,
        });
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchReferenceData();
    else {
      setLoading(false);
      setError("Invalid reference link");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // Update reference with provided information
      const { error: updateError } = await supabase
        .from("job_references")
        .update({
          full_name: formData.fullName,
          email: formData.email,
          position: formData.position,
          relation: formData.relation,
          validation_status: approved ? "validated" : "rejected",
          validated_at: new Date().toISOString(),
        })
        .eq("id", referenceData.referenceId);
      if (updateError) throw updateError;
      // Delete the used token
      const { error: deleteError } = await supabase
        .from("reference_tokens")
        .delete()
        .eq("token", token);
      if (deleteError) throw deleteError;
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f8fafc] font-sans">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-[#1a365d] via-[#2563eb] to-[#38bdf8] py-12 px-4 flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none" style={{background: 'url(/grid.svg) repeat'}}></div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Image src="/accreda-logo.png" alt="Accreda Logo" width={56} height={56} className="rounded-xl shadow-md" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight text-center drop-shadow-lg">Reference Approval</h1>
          <p className="text-lg sm:text-xl text-blue-100 text-center max-w-2xl mt-2">Help us verify the work experience of an EIT. Your response is confidential and only used for validation.</p>
        </div>
      </section>

      {/* Main Content Sectors */}
      <main className="flex-1 w-full flex flex-col items-center justify-center px-2 py-10 gap-10">
        {/* Reference Details Card */}
        <section className={`w-full max-w-2xl transition-all duration-700 ${cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ease-out`}>
          <div className="bg-gradient-to-br from-[#e6f0f7] via-white to-[#e6f0f7] rounded-2xl shadow-xl border border-slate-100 p-8 md:p-10 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-7 h-7 text-[#1a365d]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <h2 className="text-2xl font-bold text-[#1a365d] tracking-tight">Reference Details</h2>
            </div>
            <div className="text-slate-700 text-base grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <div><span className="font-medium">EIT Name:</span> {referenceData?.eit_profiles.full_name}</div>
              <div><span className="font-medium">EIT Email:</span> {referenceData?.eit_profiles.email}</div>
              <div><span className="font-medium">Job Title:</span> {referenceData?.title}</div>
              <div><span className="font-medium">Company:</span> {referenceData?.company}</div>
            </div>
            {referenceData?.description && (
              <div className="mt-3 p-4 bg-[#f0f6ff] border border-blue-100 rounded-xl">
                <div className="font-medium text-[#2563eb] mb-1">EIT's Reference Description:</div>
                <div className="text-slate-700 whitespace-pre-line">{referenceData.description}</div>
              </div>
            )}
          </div>
        </section>

        {/* Form Card */}
        <section className={`w-full max-w-2xl transition-all duration-700 ${cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ease-out`}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 md:p-10 animate-fade-in flex flex-col gap-6">
            {loading ? (
              <div className="flex flex-col items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a365d]"></div>
                <span className="mt-4 text-[#1a365d] text-lg">Loading reference request...</span>
              </div>
            ) : error ? (
              <div className="text-center text-red-600 font-semibold py-4 text-lg animate-fade-in bg-red-50 border border-red-200 rounded-xl">{error}</div>
            ) : submitted ? (
              <div className="text-center animate-fade-in flex flex-col items-center gap-2">
                <svg className="w-16 h-16 text-green-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <h1 className="text-2xl font-semibold text-[#1a365d] mb-1">Thank You!</h1>
                <p className="text-slate-600">Your reference has been submitted successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-[#1a365d] mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition bg-[#f8fafc] text-slate-900 placeholder:text-slate-400"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#1a365d] mb-1">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition bg-[#f8fafc] text-slate-900 placeholder:text-slate-400"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-[#1a365d] mb-1">
                      Your Position
                    </label>
                    <input
                      type="text"
                      id="position"
                      required
                      value={formData.position}
                      onChange={e => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition bg-[#f8fafc] text-slate-900 placeholder:text-slate-400"
                      placeholder="Enter your position"
                    />
                  </div>
                  <div>
                    <label htmlFor="relation" className="block text-sm font-medium text-[#1a365d] mb-1">
                      Your Relation to the EIT
                    </label>
                    <input
                      type="text"
                      id="relation"
                      required
                      value={formData.relation}
                      onChange={e => setFormData(prev => ({ ...prev, relation: e.target.value }))}
                      className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition bg-[#f8fafc] text-slate-900 placeholder:text-slate-400"
                      placeholder="e.g. Supervisor, Manager, Colleague"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-lg font-semibold text-white bg-gradient-to-r from-[#2563eb] to-[#1a365d] hover:from-[#1a365d] hover:to-[#2563eb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563eb] disabled:opacity-50 transition-all duration-200"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>Submitting...</span>
                    ) : 'Approve Reference'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
      <footer className="w-full text-center text-xs text-slate-400 py-6 mt-8 border-t border-slate-100 bg-[#f8fafc]">&copy; {new Date().getFullYear()} Accreda. All rights reserved.</footer>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </div>
  );
} 