import { createClient } from '@/lib/supabase/server'
import { WorkoutsClient } from '@/components/dashboard/workouts-client'

export default async function WorkoutsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all workouts with exercises
  const { data: workouts } = await supabase
    .from('workouts')
    .select('*, exercises(*)')
    .eq('user_id', user?.id)
    .order('day_of_week', { ascending: true })

  return <WorkoutsClient workouts={workouts || []} userId={user?.id || ''} />
}
