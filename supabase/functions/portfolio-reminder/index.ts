import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
  const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

  // Get all users with reminders enabled
  const { data: prefs, error } = await supabase
    .from('notification_preferences')
    .select('user_id, portfolio_reminder_frequency')
    .eq('portfolio_reminder_enabled', true)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  for (const pref of prefs) {
    if (!shouldSendToday(pref.portfolio_reminder_frequency)) continue

    // Get user email and name
    const { data: user, error: userError } = await supabase
      .from('eit_profiles')
      .select('email, full_name')
      .eq('id', pref.user_id)
      .single()

    if (userError || !user?.email) continue

    await resend.emails.send({
      from: 'Accreda <noreply@accreda.com>',
      to: user.email,
      subject: 'Reminder: Please update your application/portfolio',
      html: `<p>Hi ${user.full_name || ''},</p><p>This is a reminder to update your application/portfolio on Accreda.</p>`
    })
  }

  return new Response(JSON.stringify({ message: 'Reminders sent' }), { status: 200 })
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