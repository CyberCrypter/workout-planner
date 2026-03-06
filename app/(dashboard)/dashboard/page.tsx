import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user's profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  // Fetch recent workouts
  const { data: workouts } = await supabase
    .from('workouts')
    .select('*, exercises(*)')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .limit(7)

  // Fetch progress logs for chart
  const { data: progressLogs } = await supabase
    .from('progress_logs')
    .select('*')
    .eq('user_id', user?.id)
    .order('logged_at', { ascending: true })
    .limit(30)

  // Fetch workout sessions for stats
  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', user?.id)
    .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  return (
    <DashboardClient
      user={user!}
      profile={profile}
      workouts={workouts || []}
      progressLogs={progressLogs || []}
      recentSessions={sessions || []}
    />
  )
}
