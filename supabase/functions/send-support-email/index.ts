import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@2.0.0'

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
    const { email, subject, message } = await req.json()

    // Initialize Resend with your API key
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    const supportEmail = Deno.env.get('SUPPORT_EMAIL')

    if (!supportEmail) {
      throw new Error('Support email not configured')
    }

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'Accreda Support <onboarding@resend.dev>',
      to: supportEmail,
      reply_to: email,
      subject: `Support Request: ${subject}`,
      text: `
New support request from ${email}

Subject: ${subject}

Message:
${message}
      `,
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 