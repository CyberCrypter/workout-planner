'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer as TimerIcon,
  Clock,
  Repeat,
  Volume2,
  VolumeX
} from 'lucide-react'

type TimerMode = 'countdown' | 'interval' | 'rest'

interface TimerState {
  mode: TimerMode
  isRunning: boolean
  seconds: number
  totalSeconds: number
  rounds: number
  currentRound: number
  workSeconds: number
  restSeconds: number
  isWorkPhase: boolean
}

const PRESETS = {
  countdown: [30, 60, 90, 120, 180, 300],
  rest: [30, 60, 90, 120],
}

export default function TimerPage() {
  const [timer, setTimer] = useState<TimerState>({
    mode: 'countdown',
    isRunning: false,
    seconds: 60,
    totalSeconds: 60,
    rounds: 8,
    currentRound: 1,
    workSeconds: 45,
    restSeconds: 15,
    isWorkPhase: true,
  })
  
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [customTime, setCustomTime] = useState({ minutes: 1, seconds: 0 })
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onbq5r6ucj4N+e4F8Z2JxeoWVo6+4vb28uLKrnpOKhX5+f4OJjpOYnaCgoJ2bmZeUkY+Njo+QkZKUlpeZmpubnJuamZiYl5aVlJOSkZCPjo6NjY2MjIuLioqJiYiIh4eGhoWFhISEg4ODg4KCgoKCgoKBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYKCgoKCgoKDg4ODg4SEhISEhYWFhYaGhoeHh4eIiImJiYmKiouLi4yMjI2Njo6Oj4+QkJGRkpKTk5SUlZWWlpeXmJiZmZqam5ucnJ2dnp6fn6CgoaGioqOjpKSlpaampqeoqKmpqqurq6ysra2urq+vsLCxsbKys7O0tLW1tra3t7i4ubm6urq7u7y8vb2+vr+/wMDBwcLCw8PExMXFxsbHx8jIycnKysvLzMzNzc7Oz8/Q0NHR0tLT09TU1dXW1tfX2NjZ2dra29vc3N3d3t7f3+Dg4eHi4uPj5OTl5ebm5+fo6Onp6urr6+zs7e3u7u/v8PDx8fLy8/P09PX19vb39/j4+fn6+vv7/Pz9/f7+')
  }, [])

  const playSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }, [soundEnabled])

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timer.isRunning && timer.seconds > 0) {
      interval = setInterval(() => {
        setTimer((prev) => ({ ...prev, seconds: prev.seconds - 1 }))
      }, 1000)
    } else if (timer.isRunning && timer.seconds === 0) {
      playSound()
      
      if (timer.mode === 'interval') {
        if (timer.isWorkPhase) {
          // Switch to rest phase
          setTimer((prev) => ({
            ...prev,
            seconds: prev.restSeconds,
            isWorkPhase: false,
          }))
        } else {
          // Switch to work phase or finish
          if (timer.currentRound < timer.rounds) {
            setTimer((prev) => ({
              ...prev,
              seconds: prev.workSeconds,
              currentRound: prev.currentRound + 1,
              isWorkPhase: true,
            }))
          } else {
            // Finished all rounds
            setTimer((prev) => ({
              ...prev,
              isRunning: false,
              currentRound: 1,
              seconds: prev.workSeconds,
              isWorkPhase: true,
            }))
          }
        }
      } else {
        // Countdown or rest timer finished
        setTimer((prev) => ({ ...prev, isRunning: false }))
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timer.isRunning, timer.seconds, timer.mode, timer.isWorkPhase, timer.currentRound, timer.rounds, playSound])

  const toggleTimer = () => {
    setTimer((prev) => ({ ...prev, isRunning: !prev.isRunning }))
  }

  const resetTimer = () => {
    if (timer.mode === 'interval') {
      setTimer((prev) => ({
        ...prev,
        isRunning: false,
        seconds: prev.workSeconds,
        currentRound: 1,
        isWorkPhase: true,
      }))
    } else {
      setTimer((prev) => ({
        ...prev,
        isRunning: false,
        seconds: prev.totalSeconds,
      }))
    }
  }

  const setPresetTime = (seconds: number) => {
    setTimer((prev) => ({
      ...prev,
      seconds,
      totalSeconds: seconds,
      isRunning: false,
    }))
  }

  const setCustomTimerValue = () => {
    const totalSeconds = customTime.minutes * 60 + customTime.seconds
    if (totalSeconds > 0) {
      setTimer((prev) => ({
        ...prev,
        seconds: totalSeconds,
        totalSeconds: totalSeconds,
        isRunning: false,
      }))
    }
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`
  }

  const progress = timer.mode === 'interval'
    ? ((timer.isWorkPhase ? timer.workSeconds : timer.restSeconds) - timer.seconds) / 
      (timer.isWorkPhase ? timer.workSeconds : timer.restSeconds) * 100
    : ((timer.totalSeconds - timer.seconds) / timer.totalSeconds) * 100

  const circumference = 2 * Math.PI * 120

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Workout Timer</h1>
          <p className="text-muted-foreground">
            Stay on track with your workout intervals
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Tabs 
        value={timer.mode} 
        onValueChange={(value) => {
          const mode = value as TimerMode
          setTimer((prev) => ({
            ...prev,
            mode,
            isRunning: false,
            seconds: mode === 'interval' ? prev.workSeconds : prev.totalSeconds,
            isWorkPhase: true,
            currentRound: 1,
          }))
        }}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="countdown" className="gap-2">
            <TimerIcon className="h-4 w-4" />
            Countdown
          </TabsTrigger>
          <TabsTrigger value="interval" className="gap-2">
            <Repeat className="h-4 w-4" />
            Interval
          </TabsTrigger>
          <TabsTrigger value="rest" className="gap-2">
            <Clock className="h-4 w-4" />
            Rest
          </TabsTrigger>
        </TabsList>

        {/* Timer Display */}
        <div className="mt-8 flex flex-col items-center">
          <div className="relative">
            {/* Circular Progress */}
            <svg className="h-64 w-64 -rotate-90 transform">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className={
                  timer.mode === 'interval' && !timer.isWorkPhase
                    ? 'text-accent'
                    : 'text-primary'
                }
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (progress / 100) * circumference}
                initial={false}
                animate={{
                  strokeDashoffset: circumference - (progress / 100) * circumference,
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </svg>
            
            {/* Timer Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={timer.seconds}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="text-center"
                >
                  <span className="text-5xl font-bold tabular-nums">
                    {formatTime(timer.seconds)}
                  </span>
                  {timer.mode === 'interval' && (
                    <div className="mt-2">
                      <span className={`text-sm font-medium ${
                        timer.isWorkPhase ? 'text-primary' : 'text-accent'
                      }`}>
                        {timer.isWorkPhase ? 'WORK' : 'REST'}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Round {timer.currentRound} of {timer.rounds}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={resetTimer}
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              className={`h-16 w-16 rounded-full ${
                timer.isRunning ? 'bg-destructive hover:bg-destructive/90' : ''
              }`}
              onClick={toggleTimer}
            >
              {timer.isRunning ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>
            <div className="h-12 w-12" /> {/* Spacer for alignment */}
          </div>
        </div>

        {/* Tab Content */}
        <TabsContent value="countdown" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Countdown Timer</CardTitle>
              <CardDescription>
                Set a countdown for your exercises
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Quick Presets</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PRESETS.countdown.map((secs) => (
                    <Button
                      key={secs}
                      variant={timer.totalSeconds === secs ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPresetTime(secs)}
                    >
                      {formatTime(secs)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-mins">Minutes</Label>
                  <Input
                    id="custom-mins"
                    type="number"
                    min="0"
                    max="60"
                    value={customTime.minutes}
                    onChange={(e) => setCustomTime({ ...customTime, minutes: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-secs">Seconds</Label>
                  <Input
                    id="custom-secs"
                    type="number"
                    min="0"
                    max="59"
                    value={customTime.seconds}
                    onChange={(e) => setCustomTime({ ...customTime, seconds: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <Button onClick={setCustomTimerValue} className="w-full">
                Set Custom Time
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interval" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Interval Timer</CardTitle>
              <CardDescription>
                Perfect for HIIT and circuit training
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Work Time</Label>
                  <span className="text-sm text-muted-foreground">
                    {timer.workSeconds}s
                  </span>
                </div>
                <Slider
                  value={[timer.workSeconds]}
                  onValueChange={([value]) => {
                    setTimer((prev) => ({
                      ...prev,
                      workSeconds: value,
                      seconds: prev.isWorkPhase ? value : prev.seconds,
                    }))
                  }}
                  min={10}
                  max={120}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Rest Time</Label>
                  <span className="text-sm text-muted-foreground">
                    {timer.restSeconds}s
                  </span>
                </div>
                <Slider
                  value={[timer.restSeconds]}
                  onValueChange={([value]) => {
                    setTimer((prev) => ({
                      ...prev,
                      restSeconds: value,
                      seconds: !prev.isWorkPhase ? value : prev.seconds,
                    }))
                  }}
                  min={5}
                  max={60}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Rounds</Label>
                  <span className="text-sm text-muted-foreground">
                    {timer.rounds}
                  </span>
                </div>
                <Slider
                  value={[timer.rounds]}
                  onValueChange={([value]) => {
                    setTimer((prev) => ({ ...prev, rounds: value }))
                  }}
                  min={1}
                  max={20}
                  step={1}
                />
              </div>
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">Total Workout Time</p>
                <p className="text-2xl font-bold">
                  {formatTime((timer.workSeconds + timer.restSeconds) * timer.rounds)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rest" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Rest Timer</CardTitle>
              <CardDescription>
                Time your rest periods between sets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Quick Presets</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PRESETS.rest.map((secs) => (
                    <Button
                      key={secs}
                      variant={timer.totalSeconds === secs ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPresetTime(secs)}
                    >
                      {formatTime(secs)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="font-medium">Rest Time Guidelines</h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>Strength (heavy): 2-3 minutes</li>
                  <li>Hypertrophy (moderate): 60-90 seconds</li>
                  <li>Endurance (light): 30-60 seconds</li>
                  <li>HIIT: 15-30 seconds</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
