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

  useEffect(() => {
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
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e6f0f7] flex flex-col">
      {/* Header */}
      <header className="w-full bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/accreda-logo.png" alt="Accreda Logo" width={40} height={40} />
          <span className="text-2xl font-bold text-[#1a365d] tracking-tight">Accreda</span>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-8 px-2">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-2">Reference Approval</h2>
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Reference Details</h3>
              <div className="text-slate-700 text-sm space-y-1">
                <div><span className="font-medium">EIT Name:</span> {referenceData?.eit_profiles.full_name}</div>
                <div><span className="font-medium">EIT Email:</span> {referenceData?.eit_profiles.email}</div>
                <div><span className="font-medium">Job Title:</span> {referenceData?.title}</div>
                <div><span className="font-medium">Company:</span> {referenceData?.company}</div>
                {referenceData?.description && (
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded">
                    <div className="font-medium text-slate-800 mb-1">EIT's Reference Description:</div>
                    <div className="text-slate-700 whitespace-pre-line">{referenceData.description}</div>
                  </div>
                )}
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
                <span className="ml-4 text-gray-600">Loading reference request...</span>
              </div>
            ) : error ? (
              <div className="text-center text-red-600 font-semibold py-4">{error}</div>
            ) : submitted ? (
              <div className="text-center">
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h1>
                <p className="text-gray-600">Your reference has been submitted successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-slate-700">
                      Your Position
                    </label>
                    <input
                      type="text"
                      id="position"
                      required
                      value={formData.position}
                      onChange={e => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="relation" className="block text-sm font-medium text-slate-700">
                      Your Relation to the EIT
                    </label>
                    <input
                      type="text"
                      id="relation"
                      required
                      value={formData.relation}
                      onChange={e => setFormData(prev => ({ ...prev, relation: e.target.value }))}
                      className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-[#1a365d] hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition"
                  >
                    {submitting ? 'Submitting...' : 'Approve Reference'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 