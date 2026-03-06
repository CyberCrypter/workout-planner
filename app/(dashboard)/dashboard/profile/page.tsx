import { createClient } from '@/lib/supabase/server'
import { ProfileClient } from '@/components/dashboard/profile-client'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <ProfileClient
      user={user!}
      profile={profile}
    />
  )
}
