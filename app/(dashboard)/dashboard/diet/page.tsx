import { createClient } from '@/lib/supabase/server'
import { DietClient } from '@/components/dashboard/diet-client'

export default async function DietPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  // Fetch diet plan if exists
  const { data: dietPlan } = await supabase
    .from('diet_plans')
    .select('*')
    .eq('user_id', user?.id)
    .single()

  return (
    <DietClient
      userId={user?.id || ''}
      profile={profile}
      dietPlan={dietPlan}
    />
  )
}
