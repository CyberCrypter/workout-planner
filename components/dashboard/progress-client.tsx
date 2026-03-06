'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Ruler, 
  Target,
  Loader2,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import type { Profile, ProgressLog } from '@/lib/types'

interface ProgressClientProps {
  userId: string
  profile: Profile | null
  progressLogs: ProgressLog[]
}

export function ProgressClient({ userId, profile, progressLogs: initialLogs }: ProgressClientProps) {
  const [progressLogs, setProgressLogs] = useState(initialLogs)
  const [isAddingLog, setIsAddingLog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newLog, setNewLog] = useState({
    weight: '',
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    notes: '',
  })
  
  const router = useRouter()
  const supabase = createClient()

  // Calculate stats
  const latestLog = progressLogs[0]
  const previousLog = progressLogs[1]
  const firstLog = progressLogs[progressLogs.length - 1]

  const currentWeight = latestLog?.weight || 0
  const weightChange = latestLog && previousLog ? latestLog.weight - previousLog.weight : 0
  const totalChange = latestLog && firstLog ? latestLog.weight - firstLog.weight : 0

  // Prepare chart data (reverse for chronological order)
  const chartData = [...progressLogs].reverse().map((log) => ({
    date: new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: log.weight,
    chest: log.chest,
    waist: log.waist,
    hips: log.hips,
  }))

  const handleAddLog = async () => {
    if (!newLog.weight) {
      toast.error('Please enter your weight')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('progress_logs')
        .insert({
          user_id: userId,
          weight: parseFloat(newLog.weight),
          chest: newLog.chest ? parseFloat(newLog.chest) : null,
          waist: newLog.waist ? parseFloat(newLog.waist) : null,
          hips: newLog.hips ? parseFloat(newLog.hips) : null,
          arms: newLog.arms ? parseFloat(newLog.arms) : null,
          notes: newLog.notes || null,
        })
        .select()
        .single()

      if (error) throw error

      setProgressLogs([data, ...progressLogs])
      setNewLog({ weight: '', chest: '', waist: '', hips: '', arms: '', notes: '' })
      setIsAddingLog(false)
      toast.success('Progress logged!')
      router.refresh()
    } catch (error) {
      toast.error('Failed to log progress')
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
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Progress Tracker</h1>
          <p className="text-muted-foreground">
            Track your weight and body measurements
          </p>
        </div>
        <Dialog open={isAddingLog} onOpenChange={setIsAddingLog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Progress
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Progress</DialogTitle>
              <DialogDescription>
                Record your current weight and measurements
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  value={newLog.weight}
                  onChange={(e) => setNewLog({ ...newLog, weight: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chest">Chest (cm)</Label>
                  <Input
                    id="chest"
                    type="number"
                    step="0.1"
                    placeholder="100"
                    value={newLog.chest}
                    onChange={(e) => setNewLog({ ...newLog, chest: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waist">Waist (cm)</Label>
                  <Input
                    id="waist"
                    type="number"
                    step="0.1"
                    placeholder="80"
                    value={newLog.waist}
                    onChange={(e) => setNewLog({ ...newLog, waist: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hips">Hips (cm)</Label>
                  <Input
                    id="hips"
                    type="number"
                    step="0.1"
                    placeholder="95"
                    value={newLog.hips}
                    onChange={(e) => setNewLog({ ...newLog, hips: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arms">Arms (cm)</Label>
                  <Input
                    id="arms"
                    type="number"
                    step="0.1"
                    placeholder="35"
                    value={newLog.arms}
                    onChange={(e) => setNewLog({ ...newLog, arms: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="Feeling great today!"
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingLog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLog} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Weight
            </CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentWeight ? `${currentWeight} kg` : '--'}
            </div>
            {weightChange !== 0 && (
              <p className={`flex items-center text-xs ${weightChange < 0 ? 'text-accent' : 'text-destructive'}`}>
                {weightChange < 0 ? (
                  <TrendingDown className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingUp className="mr-1 h-3 w-3" />
                )}
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg from last
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Change
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalChange ? `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)} kg` : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              since you started
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Goal Weight
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.target_weight ? `${profile.target_weight} kg` : '--'}
            </div>
            {profile?.target_weight && currentWeight && (
              <p className="text-xs text-muted-foreground">
                {Math.abs(currentWeight - profile.target_weight).toFixed(1)} kg to go
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entries
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              total logs
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
            <CardDescription>
              Track your weight and measurements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="weight">
              <TabsList className="mb-4">
                <TabsTrigger value="weight">Weight</TabsTrigger>
                <TabsTrigger value="measurements">Measurements</TabsTrigger>
              </TabsList>
              <TabsContent value="weight">
                {chartData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="weightGradient2" x1="0" y1="0" x2="0" y2="1">
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
                        />
                        <Area
                          type="monotone"
                          dataKey="weight"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          fill="url(#weightGradient2)"
                          name="Weight (kg)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex h-[300px] flex-col items-center justify-center text-center">
                    <Scale className="mb-2 h-10 w-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No data yet</p>
                    <Button variant="link" size="sm" onClick={() => setIsAddingLog(true)}>
                      Log your first entry
                    </Button>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="measurements">
                {chartData.some(d => d.chest || d.waist || d.hips) ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          className="text-xs fill-muted-foreground"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          className="text-xs fill-muted-foreground"
                          tick={{ fontSize: 12 }}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="chest"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                          dot={false}
                          name="Chest (cm)"
                        />
                        <Line
                          type="monotone"
                          dataKey="waist"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          dot={false}
                          name="Waist (cm)"
                        />
                        <Line
                          type="monotone"
                          dataKey="hips"
                          stroke="hsl(var(--chart-3))"
                          strokeWidth={2}
                          dot={false}
                          name="Hips (cm)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex h-[300px] flex-col items-center justify-center text-center">
                    <Ruler className="mb-2 h-10 w-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No measurements yet</p>
                    <Button variant="link" size="sm" onClick={() => setIsAddingLog(true)}>
                      Log your measurements
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Logs */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
            <CardDescription>
              Your latest progress logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {progressLogs.length === 0 ? (
              <div className="py-8 text-center">
                <Scale className="mx-auto mb-2 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No entries yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {progressLogs.slice(0, 10).map((log, index) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Scale className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{log.weight} kg</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.logged_at).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    {index > 0 && progressLogs[index - 1] && (
                      <div className={`flex items-center text-sm ${
                        log.weight < progressLogs[index - 1].weight ? 'text-accent' : 'text-destructive'
                      }`}>
                        {log.weight < progressLogs[index - 1].weight ? (
                          <TrendingDown className="mr-1 h-4 w-4" />
                        ) : (
                          <TrendingUp className="mr-1 h-4 w-4" />
                        )}
                        {Math.abs(log.weight - progressLogs[index - 1].weight).toFixed(1)} kg
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
