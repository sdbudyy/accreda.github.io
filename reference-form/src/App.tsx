import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

interface ReferenceData {
  title: string
  company: string
  eit_profiles: {
    full_name: string
    email: string
  }
  description?: string
}

function App() {
  const [token, setToken] = useState<string>('')
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    position: '',
    relation: '',
  })
  const [approved, setApproved] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    // Get token from URL
    const pathParts = window.location.pathname.split('/')
    const tokenFromUrl = pathParts[pathParts.length - 1]
    setToken(tokenFromUrl)

    const fetchReferenceData = async () => {
      try {
        // Get reference data using token
        const { data: tokenData, error: tokenError } = await supabase
          .from('reference_tokens')
          .select(`
            *,
            job_references (
              description,
              jobs (
                title,
                company,
                eit_profiles (
                  full_name,
                  email
                )
              )
            )
          `)
          .eq('token', tokenFromUrl)
          .single()

        if (tokenError) throw tokenError

        // Check if token is expired
        if (new Date(tokenData.expires_at) < new Date()) {
          throw new Error('This reference link has expired')
        }

        // Merge job_references.description into jobs for easier access
        setReferenceData({
          ...tokenData.job_references.jobs,
          description: tokenData.job_references.description,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (tokenFromUrl) {
      fetchReferenceData()
    } else {
      setLoading(false)
      setError('Invalid reference link')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Update reference with provided information
      const { error: updateError } = await supabase
        .from('job_references')
        .update({
          full_name: formData.fullName,
          email: formData.email,
          position: formData.position,
          relation: formData.relation,
          validation_status: approved ? 'validated' : 'rejected',
          validated_at: new Date().toISOString(),
        })
        .eq('token', token)

      if (updateError) throw updateError

      // Delete the used token
      const { error: deleteError } = await supabase
        .from('reference_tokens')
        .delete()
        .eq('token', token)

      if (deleteError) throw deleteError

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reference request...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4 p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4 p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h1>
            <p className="text-gray-600">Your reference has been submitted successfully.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            Accreda Reference Approval
          </h2>
          <div className="mt-4 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
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
            <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition"
                >
                  {submitting ? 'Submitting...' : 'Approve Reference'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 