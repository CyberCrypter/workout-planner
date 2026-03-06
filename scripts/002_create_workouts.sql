-- Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sets INTEGER NOT NULL DEFAULT 3,
  reps INTEGER NOT NULL DEFAULT 10,
  weight DECIMAL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on workouts
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workouts
CREATE POLICY "workouts_select_own" ON public.workouts 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "workouts_insert_own" ON public.workouts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workouts_update_own" ON public.workouts 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "workouts_delete_own" ON public.workouts 
  FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on exercises
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercises (check via workout ownership)
CREATE POLICY "exercises_select_own" ON public.exercises 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "exercises_insert_own" ON public.exercises 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "exercises_update_own" ON public.exercises 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "exercises_delete_own" ON public.exercises 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workouts 
      WHERE workouts.id = exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_day ON public.workouts(day_of_week);
CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON public.exercises(workout_id);
