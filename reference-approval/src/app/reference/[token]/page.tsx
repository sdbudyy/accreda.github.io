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
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    relation: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const { data: tokenData, error: tokenError } = await supabase
          .from("reference_tokens")
          .select(`*, job_references:reference_id ( id, description, jobs ( title, company, eit_profiles ( full_name, email ) ) )`)
          .eq("token", token)
          .single();
        if (tokenError || !tokenData) throw new Error("This reference link has expired or has already been completed.");
        if (new Date(tokenData.expires_at) < new Date()) {
          throw new Error("This reference link has expired. Please request a new one if needed.");
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
      const { error: updateError } = await supabase
        .from("job_references")
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          position: formData.position,
          relation: formData.relation,
          validation_status: "validated",
          validated_at: new Date().toISOString(),
        })
        .eq("id", referenceData.referenceId);
      if (updateError) throw updateError;
      await supabase.from("reference_tokens").delete().eq("token", token);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#e6f0f7] via-[#f8fafc] to-[#e6f0f7] flex flex-col font-sans">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-8 py-6 bg-white/80 border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/accreda-logo.png" alt="Accreda Logo" width={40} height={40} />
        </div>
        <div></div>
      </header>
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center justify-center py-16 px-4 bg-white">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1a365d] tracking-tight text-center mb-4">
          Reference <span className="text-[#1cc8ae]">Approval</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 text-center max-w-2xl mb-2">
          Help us verify the work experience of an EIT. Your response is confidential and only used for validation.
        </p>
      </section>
      <main className="flex-1 w-full flex flex-col items-center justify-center px-2 py-10 gap-10">
        {/* Reference Details Card or Error Card */}
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-10 mb-8">
            <h2 className="text-xl font-bold text-[#1a365d] mb-4 flex items-center gap-2">
              <span className="inline-block w-6 h-6 bg-[#e6f0f7] rounded-full flex items-center justify-center">
                <span className="text-[#1a365d] font-bold">i</span>
              </span>
              Reference Details
            </h2>
            {loading ? (
              <div className="text-[#1a365d] text-lg py-8 text-center">Loading...</div>
            ) : error ? (
              <div className="w-full flex flex-col items-center justify-center">
                <div className="w-full bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center font-semibold text-lg">
                  {error}
                </div>
              </div>
            ) : (
              <div className="text-slate-700 text-base grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                <div><span className="font-medium">EIT Name:</span> {referenceData?.eit_profiles.full_name}</div>
                <div><span className="font-medium">EIT Email:</span> {referenceData?.eit_profiles.email}</div>
                <div><span className="font-medium">Job Title:</span> {referenceData?.title}</div>
                <div><span className="font-medium">Company:</span> {referenceData?.company}</div>
                {referenceData?.description && (
                  <div className="col-span-2 mt-4 p-4 bg-[#f0f6ff] border border-blue-100 rounded-xl">
                    <div className="font-medium text-[#2563eb] mb-1">EIT's Reference Description:</div>
                    <div className="text-slate-700 whitespace-pre-line">{referenceData.description}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Form Card */}
        {!loading && !error && !submitted && (
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-10">
              <h3 className="text-lg font-semibold text-[#1a365d] mb-6">Your Information</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-[#1a365d] mb-1">Your First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#1cc8ae] focus:border-[#1cc8ae] transition bg-[#f8fafc] text-slate-900 placeholder:text-slate-400"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-[#1a365d] mb-1">Your Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#1cc8ae] focus:border-[#1cc8ae] transition bg-[#f8fafc] text-slate-900 placeholder:text-slate-400"
                      placeholder="Enter your last name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#1a365d] mb-1">Your Email</label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#1cc8ae] focus:border-[#1cc8ae] transition bg-[#f8fafc] text-slate-900 placeholder:text-slate-400"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-[#1a365d] mb-1">Your Position</label>
                    <input
                      type="text"
                      id="position"
                      required
                      value={formData.position}
                      onChange={e => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#1cc8ae] focus:border-[#1cc8ae] transition bg-[#f8fafc] text-slate-900 placeholder:text-slate-400"
                      placeholder="Enter your position"
                    />
                  </div>
                  <div>
                    <label htmlFor="relation" className="block text-sm font-medium text-[#1a365d] mb-1">Your Relation to the EIT</label>
                    <input
                      type="text"
                      id="relation"
                      required
                      value={formData.relation}
                      onChange={e => setFormData(prev => ({ ...prev, relation: e.target.value }))}
                      className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#1cc8ae] focus:border-[#1cc8ae] transition bg-[#f8fafc] text-slate-900 placeholder:text-slate-400"
                      placeholder="e.g. Supervisor, Manager, Colleague"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-lg font-semibold text-white bg-[#1cc8ae] hover:bg-[#179e8c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1cc8ae] disabled:opacity-50 transition-all duration-200"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>Submitting...</span>
                    ) : 'Approve Reference'}
                  </button>
                </div>
                {error && <div className="text-center text-red-600 font-semibold py-2 text-sm animate-fade-in bg-red-50 border border-red-200 rounded-xl mt-2">{error}</div>}
              </form>
            </div>
          </div>
        )}
        {/* Success Message */}
        {submitted && (
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 md:p-10 text-center flex flex-col items-center">
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <h1 className="text-2xl font-semibold text-[#1a365d] mb-2">Thank You!</h1>
              <p className="text-slate-600">Your reference has been submitted successfully.</p>
            </div>
          </div>
        )}
      </main>
      <footer className="w-full text-center text-xs text-slate-400 py-6 mt-8 border-t border-slate-100 bg-[#f8fafc]">&copy; {new Date().getFullYear()} Accreda. All rights reserved.</footer>
    </div>
  );
} 