'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, Loader2, CheckCircle2, Phone } from 'lucide-react'
import { toast } from 'sonner'

// Mock OTP verification (in production, this would call your SMS service)
const MOCK_OTP = '123456'

function VerifyOTPContent() {
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [resendTimer, setResendTimer] = useState(30)
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone') || ''

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  useEffect(() => {
    // Show mock OTP hint in development
    toast.info(`Demo Mode: Use OTP "${MOCK_OTP}" to verify`, {
      duration: 10000,
    })
  }, [])

  const handleVerify = async () => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (otp === MOCK_OTP) {
      setIsVerified(true)
      toast.success('Phone verified successfully!')
      
      // Redirect to dashboard after showing success
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } else {
      toast.error('Invalid OTP. Please try again.')
      setOtp('')
    }

    setIsLoading(false)
  }

  const handleResend = async () => {
    setResendTimer(30)
    toast.info(`Demo Mode: OTP "${MOCK_OTP}" has been resent`, {
      duration: 5000,
    })
  }

  if (isVerified) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-6 md:p-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20">
            <CheckCircle2 className="h-10 w-10 text-accent" />
          </div>
          <h2 className="text-2xl font-bold">Verified!</h2>
          <p className="mt-2 text-muted-foreground">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <motion.div 
            className="flex items-center justify-center gap-2"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Dumbbell className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">FitForge</span>
          </motion.div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Verify your phone</CardTitle>
              <CardDescription>
                We&apos;ve sent a 6-digit code to{' '}
                <span className="font-medium text-foreground">{phone || 'your phone'}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button 
                onClick={handleVerify}
                className="h-11 w-full font-semibold" 
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Didn&apos;t receive the code?{' '}
                {resendTimer > 0 ? (
                  <span>Resend in {resendTimer}s</span>
                ) : (
                  <button
                    onClick={handleResend}
                    className="font-medium text-primary hover:underline"
                  >
                    Resend
                  </button>
                )}
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Demo: Enter <span className="font-mono font-medium">123456</span> to verify
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  )
}
