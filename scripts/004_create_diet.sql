-- Create diet_plans table
CREATE TABLE IF NOT EXISTS public.diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fat INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for diet_plans
CREATE POLICY "diet_plans_select_own" ON public.diet_plans 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "diet_plans_insert_own" ON public.diet_plans 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "diet_plans_update_own" ON public.diet_plans 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "diet_plans_delete_own" ON public.diet_plans 
  FOR DELETE USING (auth.uid() = user_id);

-- Create unique constraint to ensure one diet plan per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_diet_plans_user_unique ON public.diet_plans(user_id);
