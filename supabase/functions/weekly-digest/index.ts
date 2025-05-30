import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    // Get all supervisors with weekly digest enabled
    const { data: supervisors, error: supervisorsError } = await supabaseClient
      .from('supervisor_profiles')
      .select(`
        id,
        email,
        full_name,
        notification_preferences
      `)
      .eq('notification_preferences->weeklyDigest', true)

    if (supervisorsError) throw supervisorsError

    for (const supervisor of supervisors) {
      // Get all connected EITs for this supervisor
      const { data: eits, error: eitsError } = await supabaseClient
        .from('supervisor_eit_relationships')
        .select(`
          eit_profiles (
            id,
            full_name,
            email,
            start_date,
            target_date
          )
        `)
        .eq('supervisor_id', supervisor.id)
        .eq('status', 'active')

      if (eitsError) throw eitsError

      // Get recent activities for each EIT
      const eitActivities = await Promise.all(
        eits.map(async (eit) => {
          const eitProfile = eit.eit_profiles
          const { data: recentActivities } = await supabaseClient
            .from('skill_validations')
            .select(`
              score,
              feedback,
              validated_at,
              skills (
                name
              )
            `)
            .eq('eit_id', eitProfile.id)
            .gte('validated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('validated_at', { ascending: false })

          return {
            eit: eitProfile,
            activities: recentActivities || []
          }
        })
      )

      // Generate email content
      const emailContent = `
        <h1>Weekly EIT Progress Report</h1>
        <p>Dear ${supervisor.full_name},</p>
        <p>Here's a summary of your EITs' progress over the past week:</p>
        
        ${eitActivities.map(({ eit, activities }) => `
          <div style="margin: 20px 0; padding: 15px; border: 1px solid #eee; border-radius: 5px;">
            <h2>${eit.full_name}</h2>
            <p>Email: ${eit.email}</p>
            <p>Program Start: ${new Date(eit.start_date).toLocaleDateString()}</p>
            <p>Target Completion: ${new Date(eit.target_date).toLocaleDateString()}</p>
            
            <h3>Recent Activities</h3>
            ${activities.length > 0 ? `
              <ul>
                ${activities.map(activity => `
                  <li>
                    <strong>${activity.skills.name}</strong> - Score: ${activity.score}/5
                    <br>
                    <small>${new Date(activity.validated_at).toLocaleDateString()}</small>
                    ${activity.feedback ? `<br>Feedback: ${activity.feedback}` : ''}
                  </li>
                `).join('')}
              </ul>
            ` : '<p>No recent activities</p>'}
          </div>
        `).join('')}
        
        <p>Best regards,<br>The Accreda Team</p>
      `

      // Send email using Resend
      await resend.emails.send({
        from: 'Accreda <noreply@accreda.com>',
        to: supervisor.email,
        subject: 'Your Weekly EIT Progress Report',
        html: emailContent,
      })
    }

    return new Response(
      JSON.stringify({ message: 'Weekly digest emails sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 