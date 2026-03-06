-- Create progress_logs table
CREATE TABLE IF NOT EXISTS public.progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL,
  body_fat DECIMAL,
  chest DECIMAL,
  waist DECIMAL,
  hips DECIMAL,
  arms DECIMAL,
  notes TEXT,
  logged_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for progress_logs
CREATE POLICY "progress_logs_select_own" ON public.progress_logs 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "progress_logs_insert_own" ON public.progress_logs 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "progress_logs_update_own" ON public.progress_logs 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "progress_logs_delete_own" ON public.progress_logs 
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_progress_logs_user_id ON public.progress_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_logged_at ON public.progress_logs(logged_at);
