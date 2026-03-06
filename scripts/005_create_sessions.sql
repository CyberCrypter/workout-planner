-- Create workout_sessions table (completed workouts)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  workout_name TEXT,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_sessions
CREATE POLICY "workout_sessions_select_own" ON public.workout_sessions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "workout_sessions_insert_own" ON public.workout_sessions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_sessions_update_own" ON public.workout_sessions 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "workout_sessions_delete_own" ON public.workout_sessions 
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_completed_at ON public.workout_sessions(completed_at);
