import { createClient } from '@/lib/supabase/server'
import { ProgressClient } from '@/components/dashboard/progress-client'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  // Fetch progress logs
  const { data: progressLogs } = await supabase
    .from('progress_logs')
    .select('*')
    .eq('user_id', user?.id)
    .order('logged_at', { ascending: false })

  return (
    <ProgressClient
      userId={user?.id || ''}
      profile={profile}
      progressLogs={progressLogs || []}
    />
  )
}
