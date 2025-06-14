// @ts-nocheck
import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { reference_id, email } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Initialize Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    // Get reference data
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

    // Generate a unique token using Web Crypto API
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

    // Store token in reference_tokens table
    const { error: tokenError } = await supabaseClient
      .from('reference_tokens')
      .insert({
        token,
        reference_id,
        email,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days expiry
      })

    if (tokenError) throw tokenError

    // Update reference status
    const { error: updateError } = await supabaseClient
      .from('job_references')
      .update({ validation_status: 'pending' })
      .eq('id', reference_id)

    if (updateError) throw updateError

    // Construct the reference form URL
    // Use a dedicated environment variable for the public, no-auth reference form app
    // Set REFERENCE_FORM_URL to your deployed reference form app, e.g., https://references.accreda.ca
    const referenceFormUrl = `${Deno.env.get('REFERENCE_FORM_URL')}/reference/${token}`

    // Send email using Resend
    const { error: emailError } = await resend.emails.send({
      from: 'Accreda References <noreply@references.accreda.ca>',
      to: email,
      subject: `Reference Request: ${reference.jobs.title} at ${reference.jobs.company}`,
      html: `
        <h2>Reference Request</h2>
        <p>Hello ${reference.first_name || ''} ${reference.last_name || ''},</p>
        <p>${reference.jobs.eit_profiles.full_name} has requested a reference for their work at ${reference.jobs.company} as ${reference.jobs.title}.</p>
        <p>Please click the button below to provide your reference:</p>
        <a href="${referenceFormUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1a365d; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Provide Reference</a>
        <p>This link will expire in 7 days.</p>
        <p>If you have any questions, please contact us at support@accreda.com</p>
      `
    })

    if (emailError) throw emailError

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending reference:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 