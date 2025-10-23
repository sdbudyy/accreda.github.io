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
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    // Get all users with reminders enabled
    const { data: prefs, error } = await supabase
      .from('notification_preferences')
      .select('user_id, portfolio_reminder_frequency')
      .eq('portfolio_reminder_enabled', true)

    if (error) {
      console.error('Error fetching notification preferences:', error)
      return new Response(JSON.stringify({ error: error.message }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      })
    }

    let emailsSent = 0
    let errors = []

    for (const pref of prefs) {
      if (!shouldSendToday(pref.portfolio_reminder_frequency)) continue

      // Get user email and name from both EIT and supervisor profiles
      let user = null
      
      // Try EIT profile first
      const { data: eitProfile } = await supabase
        .from('eit_profiles')
        .select('email, full_name')
        .eq('id', pref.user_id)
        .single()

      if (eitProfile?.email) {
        user = eitProfile
      } else {
        // Try supervisor profile
        const { data: supervisorProfile } = await supabase
          .from('supervisor_profiles')
          .select('email, full_name')
          .eq('id', pref.user_id)
          .single()
        
        if (supervisorProfile?.email) {
          user = supervisorProfile
        }
      }

      if (!user?.email) {
        errors.push(`No email found for user ${pref.user_id}`)
        continue
      }

      try {
        const frequencyText = {
          daily: 'daily',
          weekly: 'weekly',
          biweekly: 'bi-weekly',
          monthly: 'monthly'
        }[pref.portfolio_reminder_frequency] || pref.portfolio_reminder_frequency

        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Accreda</h1>
              <p style="color: #ccfbf1; margin: 8px 0 0 0;">Your Professional Development Journey</p>
            </div>
            
            <div style="padding: 30px;">
              <h2 style="color: #1e293b; margin: 0 0 16px 0;">Portfolio Update Reminder</h2>
              <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
                Hi ${user.full_name || 'User'},
              </p>
              <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
                This is your ${frequencyText} reminder to update your application/portfolio on Accreda.
              </p>
              <div style="background: #f1f5f9; border-left: 4px solid #0d9488; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #1e293b; font-weight: 600;">Keep your portfolio current!</p>
                <p style="margin: 8px 0 0 0; color: #64748b;">Regular updates help showcase your progress and achievements to supervisors and potential employers.</p>
              </div>
              <p style="color: #64748b; font-size: 16px; line-height: 1.5;">
                Log in to your Accreda account to update your portfolio with recent achievements, skills, and experiences.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://accreda.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Update Portfolio
                </a>
              </div>
            </div>
            
            <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                This email was sent to ${user.email} because you have portfolio reminders enabled (${frequencyText}).
              </p>
              <p style="color: #64748b; font-size: 14px; margin: 8px 0 0 0;">
                You can change your reminder preferences in your account settings.
              </p>
            </div>
          </div>
        `

        await resend.emails.send({
          from: 'Accreda <noreply@accreda.com>',
          to: user.email,
          subject: 'Reminder: Please update your application/portfolio',
          html
        })
        
        emailsSent++
      } catch (emailError) {
        console.error(`Error sending email to ${user.email}:`, emailError)
        errors.push(`Failed to send email to ${user.email}: ${emailError.message}`)
      }
    }

    return new Response(JSON.stringify({ 
      message: 'Portfolio reminders processed',
      emailsSent,
      errors: errors.length > 0 ? errors : undefined
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    })
  } catch (error) {
    console.error('Portfolio reminder error:', error)
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    })
  }
})

function shouldSendToday(freq: string) {
  const today = new Date()
  const day = today.getDay() // 0 = Sunday, 1 = Monday, ...
  if (freq === 'daily') return day >= 1 && day <= 5 // Mon-Fri
  if (freq === 'weekly') return day === 1 // Monday
  if (freq === 'biweekly') return day === 1 && isBiweekly(today)
  if (freq === 'monthly') return today.getDate() === 1
  return false
}

function isBiweekly(date: Date) {
  // Odd weeks of the year (ISO week)
  const firstJan = new Date(date.getFullYear(), 0, 1)
  const days = Math.floor((date.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000))
  const week = Math.ceil((days + firstJan.getDay() + 1) / 7)
  return week % 2 === 1
} 