'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown,
  Flame,
  Target,
  Calendar,
  Dumbbell,
  ArrowRight,
  Plus
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import type { User } from '@supabase/supabase-js'
import type { Profile, Workout, ProgressLog, WorkoutSession } from '@/lib/types'

interface DashboardClientProps {
  user: User
  profile: Profile | null
  workouts: (Workout & { exercises: { id: string; name: string }[] })[]
  progressLogs: ProgressLog[]
  recentSessions: WorkoutSession[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function DashboardClient({
  user,
  profile,
  workouts,
  progressLogs,
  recentSessions,
}: DashboardClientProps) {
  const userName = user.user_metadata?.full_name?.split(' ')[0] || 'there'
  
  // Calculate stats
  const currentWeight = progressLogs.length > 0 
    ? progressLogs[progressLogs.length - 1].weight 
    : profile?.current_weight || 0
  
  const startWeight = progressLogs.length > 0 
    ? progressLogs[0].weight 
    : profile?.current_weight || 0
  
  const weightChange = currentWeight && startWeight ? currentWeight - startWeight : 0
  const weightTrend = weightChange < 0 ? 'down' : weightChange > 0 ? 'up' : 'stable'

  const workoutsThisWeek = recentSessions.length
  const weeklyGoal = 5
  const weeklyProgress = Math.min((workoutsThisWeek / weeklyGoal) * 100, 100)

  // Prepare chart data
  const chartData = progressLogs.map((log) => ({
    date: new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: log.weight,
  }))

  // Create weekly overview
  const today = new Date().getDay()
  const weeklyOverview = DAYS.map((day, index) => {
    const hasWorkout = workouts.some((w) => w.day_of_week === index)
    const isCompleted = recentSessions.some((s) => {
      const sessionDay = new Date(s.completed_at).getDay()
      return sessionDay === index
    })
    return {
      day,
      hasWorkout,
      isCompleted,
      isToday: index === today,
    }
  })

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
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {userName}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s your fitness overview for today
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/workouts">
            <Plus className="mr-2 h-4 w-4" />
            New Workout
          </Link>
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Weight
            </CardTitle>
            <div className={`rounded-full p-1.5 ${
              weightTrend === 'down' ? 'bg-accent/20 text-accent' : 
              weightTrend === 'up' ? 'bg-destructive/20 text-destructive' : 
              'bg-muted text-muted-foreground'
            }`}>
              {weightTrend === 'down' ? (
                <TrendingDown className="h-4 w-4" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentWeight ? `${currentWeight} kg` : '--'}
            </div>
            {weightChange !== 0 && (
              <p className={`text-xs ${weightTrend === 'down' ? 'text-accent' : 'text-destructive'}`}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg from start
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weekly Progress
            </CardTitle>
            <div className="rounded-full bg-primary/20 p-1.5 text-primary">
              <Target className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workoutsThisWeek}/{weeklyGoal}
            </div>
            <Progress value={weeklyProgress} className="mt-2 h-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              workouts this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Streak
            </CardTitle>
            <div className="rounded-full bg-chart-3/20 p-1.5 text-chart-3">
              <Flame className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workoutsThisWeek > 0 ? workoutsThisWeek : 0} days
            </div>
            <p className="text-xs text-muted-foreground">
              Keep it going!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Workouts Planned
            </CardTitle>
            <div className="rounded-full bg-chart-4/20 p-1.5 text-chart-4">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workouts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              this week
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weight Progress Chart */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Weight Progress</CardTitle>
              <CardDescription>
                Your weight over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        className="text-xs fill-muted-foreground"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        className="text-xs fill-muted-foreground"
                        tick={{ fontSize: 12 }}
                        domain={['dataMin - 2', 'dataMax + 2']}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#weightGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[250px] flex-col items-center justify-center text-center">
                  <TrendingUp className="mb-2 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No data yet</p>
                  <Button variant="link" size="sm" asChild>
                    <Link href="/dashboard/progress">
                      Log your first weight
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Overview */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>This Week</CardTitle>
              <CardDescription>
                Your workout schedule overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weeklyOverview.map((day) => (
                  <div
                    key={day.day}
                    className={`flex flex-col items-center gap-2 rounded-lg p-3 transition-colors ${
                      day.isToday ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted/50'
                    }`}
                  >
                    <span className={`text-xs font-medium ${day.isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                      {day.day}
                    </span>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                        day.isCompleted
                          ? 'bg-accent text-accent-foreground'
                          : day.hasWorkout
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {day.isCompleted ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : day.hasWorkout ? (
                        <Dumbbell className="h-5 w-5" />
                      ) : (
                        <span className="text-xs">--</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-accent" />
                    <span className="text-muted-foreground">Completed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-primary/20" />
                    <span className="text-muted-foreground">Planned</span>
                  </div>
                </div>
                <Button variant="link" size="sm" className="h-auto p-0" asChild>
                  <Link href="/dashboard/workouts">
                    View all
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Jump into your workout routine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/dashboard/workouts">
                  <Calendar className="h-6 w-6 text-primary" />
                  <span>Plan Workout</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/dashboard/progress">
                  <TrendingUp className="h-6 w-6 text-accent" />
                  <span>Log Progress</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/dashboard/diet">
                  <Target className="h-6 w-6 text-chart-3" />
                  <span>Calculate Macros</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/dashboard/timer">
                  <Flame className="h-6 w-6 text-chart-5" />
                  <span>Start Timer</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
