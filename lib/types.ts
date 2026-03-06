export type Goal = 'weight_loss' | 'weight_gain' | 'maintenance'

export interface Profile {
  id: string
  name: string | null
  phone: string | null
  weight: number | null
  height: number | null
  age: number | null
  goal: Goal | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Workout {
  id: string
  user_id: string
  day_of_week: number
  name: string
  created_at: string
  exercises?: Exercise[]
}

export interface Exercise {
  id: string
  workout_id: string
  name: string
  sets: number
  reps: number
  weight: number | null
  order_index: number
  created_at: string
}

export interface ProgressLog {
  id: string
  user_id: string
  weight: number | null
  body_fat: number | null
  chest: number | null
  waist: number | null
  hips: number | null
  arms: number | null
  notes: string | null
  logged_at: string
  created_at: string
}

export interface WorkoutSession {
  id: string
  user_id: string
  workout_id: string | null
  workout_name: string | null
  duration_minutes: number | null
  calories_burned: number | null
  completed_at: string
}

export interface DietPlan {
  id: string
  user_id: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  created_at: string
  updated_at: string
}

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
] as const

export const GOALS = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'weight_gain', label: 'Weight Gain' },
  { value: 'maintenance', label: 'Maintenance' },
] as const
