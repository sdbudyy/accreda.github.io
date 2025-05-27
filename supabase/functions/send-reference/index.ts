import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'http://localhost:3000'
const REFERENCE_URL = Deno.env.get('REFERENCE_URL') || 'http://localhost:3001'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { reference_id, email } = await req.json()

    if (!reference_id || !email) {
      throw new Error('Missing required fields')
    }

    // Get reference details
    const { data: reference, error: referenceError } = await supabaseClient
      .from('job_references')
      .select(`
        *,
        jobs (
          title,
          company,
          eit_profiles (
            full_name,
            email
          )
        )
      `)
      .eq('id', reference_id)
      .single()

    if (referenceError) throw referenceError

    // Generate a unique token
    const token = crypto.randomUUID()

    // Store the token in the database
    const { error: tokenError } = await supabaseClient
      .from('reference_tokens')
      .insert([{
        reference_id,
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        email
      }])

    if (tokenError) throw tokenError

    // Generate the magic link
    const magicLink = `${REFERENCE_URL}/reference/${token}`

    // Send email using your email service
    // This is a placeholder - you'll need to implement your email sending logic
    // For example, using SendGrid, AWS SES, etc.
    const emailContent = `
      Hello,

      ${reference.jobs.eit_profiles.full_name} (${reference.jobs.eit_profiles.email}) has requested a reference for their work at ${reference.jobs.company} as ${reference.jobs.title}.

      Please click the link below to provide your reference:
      ${magicLink}

      This link will expire in 7 days.

      Best regards,
      Accreda Team
    `

    // TODO: Implement email sending
    console.log('Would send email:', {
      to: email,
      subject: `Reference Request from ${reference.jobs.eit_profiles.full_name}`,
      content: emailContent
    })

    // Update reference status
    const { error: updateError } = await supabaseClient
      .from('job_references')
      .update({ validation_status: 'pending' })
      .eq('id', reference_id)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 