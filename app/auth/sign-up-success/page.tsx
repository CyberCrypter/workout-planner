import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle2, Dumbbell, Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
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
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-accent/20">
                <CheckCircle2 className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Check your email
              </CardTitle>
              <CardDescription>
                We&apos;ve sent you a confirmation link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <Mail className="mx-auto mb-2 h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Click the link in your email to verify your account and start
                  your fitness journey.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link href="/auth/login">Go to login</Link>
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Didn&apos;t receive the email? Check your spam folder or{' '}
                  <Link href="/auth/sign-up" className="text-primary hover:underline">
                    try again
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
