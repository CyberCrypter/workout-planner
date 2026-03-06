import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />
      <main className="pb-20 pt-4 md:pb-8 md:pl-64">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
    </div>
  )
}
