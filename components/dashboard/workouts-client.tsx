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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, Dumbbell, Loader2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Workout, Exercise } from '@/lib/types'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface WorkoutsClientProps {
  workouts: (Workout & { exercises: Exercise[] })[]
  userId: string
}

export function WorkoutsClient({ workouts: initialWorkouts, userId }: WorkoutsClientProps) {
  const [workouts, setWorkouts] = useState(initialWorkouts)
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay())
  const [isAddingWorkout, setIsAddingWorkout] = useState(false)
  const [isAddingExercise, setIsAddingExercise] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const [newWorkout, setNewWorkout] = useState({ name: '', day_of_week: selectedDay })
  const [newExercise, setNewExercise] = useState({ name: '', sets: 3, reps: 10, weight: '' })
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const workoutsForDay = workouts.filter((w) => w.day_of_week === selectedDay)

  const handleAddWorkout = async () => {
    if (!newWorkout.name.trim()) {
      toast.error('Please enter a workout name')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('workouts')
        .insert({
          name: newWorkout.name,
          day_of_week: newWorkout.day_of_week,
          user_id: userId,
        })
        .select()
        .single()

      if (error) throw error

      setWorkouts([...workouts, { ...data, exercises: [] }])
      setNewWorkout({ name: '', day_of_week: selectedDay })
      setIsAddingWorkout(false)
      toast.success('Workout added!')
      router.refresh()
    } catch (error) {
      toast.error('Failed to add workout')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteWorkout = async (workoutId: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId)

      if (error) throw error

      setWorkouts(workouts.filter((w) => w.id !== workoutId))
      toast.success('Workout deleted')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete workout')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddExercise = async () => {
    if (!newExercise.name.trim() || !selectedWorkoutId) {
      toast.error('Please enter an exercise name')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert({
          workout_id: selectedWorkoutId,
          name: newExercise.name,
          sets: newExercise.sets,
          reps: newExercise.reps,
          weight: newExercise.weight ? parseFloat(newExercise.weight) : null,
        })
        .select()
        .single()

      if (error) throw error

      setWorkouts(workouts.map((w) => {
        if (w.id === selectedWorkoutId) {
          return { ...w, exercises: [...w.exercises, data] }
        }
        return w
      }))
      setNewExercise({ name: '', sets: 3, reps: 10, weight: '' })
      setIsAddingExercise(false)
      toast.success('Exercise added!')
      router.refresh()
    } catch (error) {
      toast.error('Failed to add exercise')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteExercise = async (exerciseId: string, workoutId: string) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId)

      if (error) throw error

      setWorkouts(workouts.map((w) => {
        if (w.id === workoutId) {
          return { ...w, exercises: w.exercises.filter((e) => e.id !== exerciseId) }
        }
        return w
      }))
      toast.success('Exercise deleted')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete exercise')
      console.error(error)
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Workout Planner</h1>
          <p className="text-muted-foreground">
            Plan your weekly workout routine
          </p>
        </div>
        <Dialog open={isAddingWorkout} onOpenChange={setIsAddingWorkout}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Workout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Workout</DialogTitle>
              <DialogDescription>
                Create a new workout for your weekly plan
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="workout-name">Workout Name</Label>
                <Input
                  id="workout-name"
                  placeholder="e.g., Upper Body, Leg Day"
                  value={newWorkout.name}
                  onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workout-day">Day</Label>
                <Select
                  value={newWorkout.day_of_week.toString()}
                  onValueChange={(value) => setNewWorkout({ ...newWorkout, day_of_week: parseInt(value) })}
                >
                  <SelectTrigger id="workout-day">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day, index) => (
                      <SelectItem key={day} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingWorkout(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddWorkout} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Workout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {SHORT_DAYS.map((day, index) => {
          const hasWorkouts = workouts.some((w) => w.day_of_week === index)
          const isToday = index === new Date().getDay()
          return (
            <Button
              key={day}
              variant={selectedDay === index ? 'default' : 'outline'}
              className={`relative min-h-[88px] min-w-[72px] flex-col justify-center gap-1 px-3 py-3 ${
                isToday && selectedDay !== index ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedDay(index)}
            >
              <span className="text-xs opacity-70">{day}</span>
              <span className="text-lg font-semibold">
                {new Date(Date.now() + (index - new Date().getDay()) * 24 * 60 * 60 * 1000).getDate()}
              </span>
              {hasWorkouts && selectedDay !== index && (
                <div className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
              )}
            </Button>
          )
        })}
      </div>

      {/* Workouts for Selected Day */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{DAYS[selectedDay]}</h2>
        
        {workoutsForDay.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Dumbbell className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">No workouts planned</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Add a workout for {DAYS[selectedDay]}
              </p>
              <Button onClick={() => {
                setNewWorkout({ ...newWorkout, day_of_week: selectedDay })
                setIsAddingWorkout(true)
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Workout
              </Button>
            </CardContent>
          </Card>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {workoutsForDay.map((workout) => (
              <motion.div key={workout.id} variants={item}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-xl">{workout.name}</CardTitle>
                      <CardDescription>
                        {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={isAddingExercise && selectedWorkoutId === workout.id} onOpenChange={(open) => {
                        setIsAddingExercise(open)
                        if (open) setSelectedWorkoutId(workout.id)
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="mr-1 h-4 w-4" />
                            Exercise
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Exercise</DialogTitle>
                            <DialogDescription>
                              Add an exercise to {workout.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="exercise-name">Exercise Name</Label>
                              <Input
                                id="exercise-name"
                                placeholder="e.g., Bench Press, Squats"
                                value={newExercise.name}
                                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="sets">Sets</Label>
                                <Input
                                  id="sets"
                                  type="number"
                                  min="1"
                                  value={newExercise.sets}
                                  onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || 1 })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="reps">Reps</Label>
                                <Input
                                  id="reps"
                                  type="number"
                                  min="1"
                                  value={newExercise.reps}
                                  onChange={(e) => setNewExercise({ ...newExercise, reps: parseInt(e.target.value) || 1 })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="weight">Weight (kg)</Label>
                                <Input
                                  id="weight"
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  placeholder="Optional"
                                  value={newExercise.weight}
                                  onChange={(e) => setNewExercise({ ...newExercise, weight: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddingExercise(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddExercise} disabled={isLoading}>
                              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Add Exercise
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteWorkout(workout.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {workout.exercises.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        No exercises added yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <AnimatePresence mode="popLayout">
                          {workout.exercises.map((exercise, index) => (
                            <motion.div
                              key={exercise.id}
                              layout
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{exercise.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {exercise.sets} sets x {exercise.reps} reps
                                  {exercise.weight && ` @ ${exercise.weight}kg`}
                                </p>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteExercise(exercise.id, workout.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
