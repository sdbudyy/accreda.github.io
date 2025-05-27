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
}

function App() {
  const [token, setToken] = useState<string>('')
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    position: '',
    approved: false
  })
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

        setReferenceData(tokenData.job_references.jobs)
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
          position: formData.position,
          validation_status: formData.approved ? 'validated' : 'rejected',
          validated_at: new Date().toISOString()
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reference Request
          </h2>
          <div className="mt-4 bg-white p-6 rounded-lg shadow">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reference Details</h3>
              <p className="text-gray-600">
                <strong>{referenceData?.eit_profiles.full_name}</strong> ({referenceData?.eit_profiles.email})
                is requesting a reference for their work at <strong>{referenceData?.company}</strong> as{' '}
                <strong>{referenceData?.title}</strong>.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Your Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                  Your Position
                </label>
                <input
                  type="text"
                  id="position"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="approved"
                  checked={formData.approved}
                  onChange={(e) => setFormData(prev => ({ ...prev, approved: e.target.checked }))}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor="approved" className="ml-2 block text-sm text-gray-900">
                  I approve this reference
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Reference'}
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