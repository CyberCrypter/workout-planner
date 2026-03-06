import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle, Dumbbell } from 'lucide-react'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Dumbbell className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">FitForge</span>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Authentication Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              {params?.error ? (
                <p className="text-sm text-muted-foreground">
                  Error: {params.error}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  An unexpected error occurred during authentication.
                </p>
              )}
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link href="/auth/login">Try again</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Go home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
