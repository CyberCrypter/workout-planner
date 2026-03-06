'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Target, Ruler, Scale, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'

interface ProfileClientProps {
  user: SupabaseUser
  profile: Profile | null
}

const FITNESS_GOALS = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'maintain', label: 'Maintain Weight' },
  { value: 'endurance', label: 'Improve Endurance' },
  { value: 'flexibility', label: 'Improve Flexibility' },
]

export function ProfileClient({ user, profile }: ProfileClientProps) {
  const [formData, setFormData] = useState({
    full_name: user.user_metadata?.full_name || profile?.full_name || '',
    phone: user.user_metadata?.phone || profile?.phone || '',
    age: profile?.age?.toString() || user.user_metadata?.age?.toString() || '',
    gender: profile?.gender || user.user_metadata?.gender || '',
    height: profile?.height?.toString() || '',
    current_weight: profile?.current_weight?.toString() || '',
    target_weight: profile?.target_weight?.toString() || '',
    fitness_goal: profile?.fitness_goal || user.user_metadata?.fitness_goal || '',
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const userInitials = formData.full_name
    ? formData.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user.email?.slice(0, 2).toUpperCase() || 'U'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          phone: formData.phone,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          height: formData.height ? parseFloat(formData.height) : null,
          current_weight: formData.current_weight ? parseFloat(formData.current_weight) : null,
          target_weight: formData.target_weight ? parseFloat(formData.target_weight) : null,
          fitness_goal: formData.fitness_goal || null,
        })

      if (error) throw error

      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
        },
      })

      toast.success('Profile updated successfully!')
      router.refresh()
    } catch (error) {
      toast.error('Failed to update profile')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-2xl space-y-6"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and fitness goals
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{formData.full_name || 'Your Name'}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Edit Form */}
      <motion.div variants={item}>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min="13"
                    max="120"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Physical Stats */}
              <div className="border-t pt-6">
                <h3 className="mb-4 font-medium">Physical Stats</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="height" className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      Height (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      placeholder="175"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current_weight" className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-muted-foreground" />
                      Current Weight (kg)
                    </Label>
                    <Input
                      id="current_weight"
                      type="number"
                      step="0.1"
                      placeholder="70"
                      value={formData.current_weight}
                      onChange={(e) => setFormData({ ...formData, current_weight: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target_weight" className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      Target Weight (kg)
                    </Label>
                    <Input
                      id="target_weight"
                      type="number"
                      step="0.1"
                      placeholder="65"
                      value={formData.target_weight}
                      onChange={(e) => setFormData({ ...formData, target_weight: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Fitness Goal */}
              <div className="border-t pt-6">
                <h3 className="mb-4 font-medium">Fitness Goal</h3>
                <div className="space-y-2">
                  <Label htmlFor="fitness_goal">What&apos;s your primary fitness goal?</Label>
                  <Select
                    value={formData.fitness_goal}
                    onValueChange={(value) => setFormData({ ...formData, fitness_goal: value })}
                  >
                    <SelectTrigger id="fitness_goal">
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {FITNESS_GOALS.map((goal) => (
                        <SelectItem key={goal.value} value={goal.value}>
                          {goal.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </form>
      </motion.div>

      {/* Account Info */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Account ID</p>
                <p className="text-sm text-muted-foreground font-mono">{user.id.slice(0, 8)}...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
