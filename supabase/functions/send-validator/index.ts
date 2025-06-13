import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { validator_id, email } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialize Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    // Get validator data
    const { data: validator, error: validatorError } = await supabaseClient
      .from('validators')
      .select(`*, skill_id, eit_id`)
      .eq('id', validator_id)
      .single();

    if (validatorError) throw validatorError;

    // Get EIT and skill/job info (customize as needed)
    const { data: eitProfile, error: eitError } = await supabaseClient
      .from('eit_profiles')
      .select('full_name, email')
      .eq('id', validator.eit_id)
      .single();
    if (eitError) throw eitError;

    // You may want to join to skills or jobs for more info (title, company, etc.)

    // Generate a unique token
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

    // Store token in validator_tokens table
    const { error: tokenError } = await supabaseClient
      .from('validator_tokens')
      .insert({
        token,
        validator_id,
        email,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days expiry
      });
    if (tokenError) throw tokenError;

    // Construct the validator form URL
    const validatorFormUrl = `${Deno.env.get('REFERENCE_FORM_URL')}/validator/${token}`;

    // Send email using Resend
    const { error: emailError } = await resend.emails.send({
      from: 'Accreda Validation <noreply@references.accreda.ca>',
      to: email,
      subject: `Validation Request for EIT Experience`,
      html: `
        <h2>Validation Request</h2>
        <p>Hello ${validator.first_name || ''} ${validator.last_name || ''},</p>
        <p>${eitProfile.full_name} has requested you to validate their experience.</p>
        <p>Please click the button below to provide your validation:</p>
        <a href="${validatorFormUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1a365d; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Validate Experience</a>
        <p>This link will expire in 7 days.</p>
        <p>If you have any questions, please contact us at support@accreda.com</p>
      `
    });
    if (emailError) throw emailError;

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending validator:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}); 