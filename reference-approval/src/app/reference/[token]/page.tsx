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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#e6f0f7] via-[#f8fafc] to-[#e6f0f7] flex flex-col items-center justify-center font-sans">
      {/* Header */}
      <header className="w-full bg-white/80 shadow-sm py-4 px-6 flex items-center justify-between border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Image src="/accreda-logo.png" alt="Accreda Logo" width={40} height={40} />
          <span className="text-2xl font-bold text-[#1a365d] tracking-tight">Accreda</span>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 w-full flex items-center justify-center py-12 px-2">
        <div className={`w-full max-w-2xl transition-all duration-700 ${cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ease-out`}>
          <div className="bg-white/90 rounded-3xl shadow-2xl border border-slate-100 p-10 animate-fade-in backdrop-blur-md">
            <h2 className="text-3xl font-extrabold text-[#1a365d] text-center mb-2 tracking-tight">Reference Approval</h2>
            <p className="text-center text-slate-500 mb-8">Help us verify the work experience of an EIT. Your response is confidential and only used for validation.</p>
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#1a365d] mb-2">Reference Details</h3>
              <div className="text-slate-700 text-base space-y-1">
                <div><span className="font-medium">EIT Name:</span> {referenceData?.eit_profiles.full_name}</div>
                <div><span className="font-medium">EIT Email:</span> {referenceData?.eit_profiles.email}</div>
                <div><span className="font-medium">Job Title:</span> {referenceData?.title}</div>
                <div><span className="font-medium">Company:</span> {referenceData?.company}</div>
                {referenceData?.description && (
                  <div className="mt-2 p-3 bg-[#e6f0f7] border border-slate-200 rounded">
                    <div className="font-medium text-[#1a365d] mb-1">EIT's Reference Description:</div>
                    <div className="text-slate-700 whitespace-pre-line">{referenceData.description}</div>
                  </div>
                )}
              </div>
            </div>
            {loading ? (
              <div className="flex flex-col items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a365d]"></div>
                <span className="mt-4 text-[#1a365d] text-lg">Loading reference request...</span>
              </div>
            ) : error ? (
              <div className="text-center text-red-600 font-semibold py-4 text-lg animate-fade-in bg-red-50 border border-red-200 rounded-xl">{error}</div>
            ) : submitted ? (
              <div className="text-center animate-fade-in flex flex-col items-center gap-2">
                <div className="text-green-500 text-6xl mb-2">✓</div>
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
                      className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d] transition bg-[#f8fafc] text-slate-900 placeholder:text-slate-400"
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
                      className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d] transition bg-[#f8fafc] text-slate-900 placeholder:text-slate-400"
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
                      className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d] transition bg-[#f8fafc] text-slate-900 placeholder:text-slate-400"
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
                      className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d] transition bg-[#f8fafc] text-slate-900 placeholder:text-slate-400"
                      placeholder="e.g. Supervisor, Manager, Colleague"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-lg font-semibold text-white bg-[#1a365d] hover:bg-[#17407b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a365d] disabled:opacity-50 transition-all duration-200"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>Submitting...</span>
                    ) : 'Approve Reference'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <footer className="w-full text-center text-xs text-slate-400 py-4 mt-8">&copy; {new Date().getFullYear()} Accreda. All rights reserved.</footer>
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