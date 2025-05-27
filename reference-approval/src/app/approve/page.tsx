"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface ReferenceData {
  eit_name: string;
  eit_email: string;
  job_title: string;
  job_company: string;
  reference_email: string;
  approved: boolean;
  reference_name: string | null;
  reference_position: string | null;
}

export default function ApprovePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReferenceData | null>(null);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No token provided.");
      setLoading(false);
      return;
    }
    fetch(`/api/get-magic-link?token=${token}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Invalid or expired link.");
        const json = await res.json();
        setData(json.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/approve-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, reference_name: name, reference_position: position }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to approve.");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data) return null;
  if (data.approved || success)
    return <div className="p-8 text-center text-green-700">Reference approved! Thank you.</div>;

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Reference Approval</h2>
      <div className="mb-4">
        <div><b>EIT Name:</b> {data.eit_name}</div>
        <div><b>EIT Email:</b> {data.eit_email}</div>
        <div><b>Job Title:</b> {data.job_title}</div>
        <div><b>Company:</b> {data.job_company}</div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Your Name</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block mb-1">Your Position</label>
          <input type="text" className="w-full border rounded px-3 py-2" value={position} onChange={e => setPosition(e.target.value)} required />
        </div>
        <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded" disabled={submitting}>{submitting ? "Submitting..." : "Approve"}</button>
      </form>
    </div>
  );
} 