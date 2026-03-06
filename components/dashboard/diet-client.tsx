'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion } from 'framer-motion'
import { 
  Calculator, 
  Flame,
  Apple,
  Beef,
  Wheat,
  Droplets,
  Loader2,
  Save,
  Info
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Profile, DietPlan } from '@/lib/types'

interface DietClientProps {
  userId: string
  profile: Profile | null
  dietPlan: DietPlan | null
}

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)', multiplier: 1.2 },
  { value: 'light', label: 'Light (exercise 1-3 days/week)', multiplier: 1.375 },
  { value: 'moderate', label: 'Moderate (exercise 3-5 days/week)', multiplier: 1.55 },
  { value: 'active', label: 'Active (exercise 6-7 days/week)', multiplier: 1.725 },
  { value: 'very_active', label: 'Very Active (hard exercise daily)', multiplier: 1.9 },
]

const GOALS = [
  { value: 'lose', label: 'Lose Weight', calorieAdjustment: -500 },
  { value: 'maintain', label: 'Maintain Weight', calorieAdjustment: 0 },
  { value: 'gain', label: 'Gain Weight', calorieAdjustment: 500 },
]

const FOOD_RECOMMENDATIONS = {
  protein: [
    'Chicken breast', 'Turkey', 'Lean beef', 'Fish (salmon, tuna)', 'Eggs',
    'Greek yogurt', 'Cottage cheese', 'Tofu', 'Lentils', 'Chickpeas'
  ],
  carbs: [
    'Brown rice', 'Oatmeal', 'Sweet potatoes', 'Quinoa', 'Whole wheat bread',
    'Fruits', 'Vegetables', 'Beans', 'Whole grain pasta'
  ],
  fats: [
    'Avocado', 'Nuts (almonds, walnuts)', 'Olive oil', 'Nut butter',
    'Chia seeds', 'Flaxseeds', 'Fatty fish', 'Dark chocolate (in moderation)'
  ],
}

export function DietClient({ userId, profile, dietPlan: initialDietPlan }: DietClientProps) {
  const [formData, setFormData] = useState({
    age: profile?.age?.toString() || '',
    gender: profile?.gender || 'male',
    weight: profile?.current_weight?.toString() || '',
    height: profile?.height?.toString() || '',
    activityLevel: 'moderate',
    goal: 'maintain',
  })
  
  const [results, setResults] = useState<{
    bmr: number
    tdee: number
    targetCalories: number
    protein: number
    carbs: number
    fats: number
  } | null>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Calculate on form change
  useEffect(() => {
    if (formData.age && formData.weight && formData.height) {
      calculateMacros()
    }
  }, [formData])

  const calculateMacros = () => {
    const age = parseInt(formData.age)
    const weight = parseFloat(formData.weight)
    const height = parseFloat(formData.height)
    
    if (!age || !weight || !height) return

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr: number
    if (formData.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161
    }

    // Calculate TDEE
    const activityMultiplier = ACTIVITY_LEVELS.find(a => a.value === formData.activityLevel)?.multiplier || 1.55
    const tdee = bmr * activityMultiplier

    // Adjust for goal
    const calorieAdjustment = GOALS.find(g => g.value === formData.goal)?.calorieAdjustment || 0
    const targetCalories = Math.round(tdee + calorieAdjustment)

    // Calculate macros (40% carbs, 30% protein, 30% fat)
    const protein = Math.round((targetCalories * 0.30) / 4) // 4 cal per gram
    const carbs = Math.round((targetCalories * 0.40) / 4) // 4 cal per gram
    const fats = Math.round((targetCalories * 0.30) / 9) // 9 cal per gram

    setResults({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories,
      protein,
      carbs,
      fats,
    })
  }

  const handleSave = async () => {
    if (!results) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('diet_plans')
        .upsert({
          user_id: userId,
          calories: results.targetCalories,
          protein: results.protein,
          carbs: results.carbs,
          fat: results.fats,
        })

      if (error) throw error

      toast.success('Diet plan saved!')
      router.refresh()
    } catch (error) {
      toast.error('Failed to save diet plan')
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
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Diet Planner</h1>
        <p className="text-muted-foreground">
          Calculate your daily calorie and macro needs
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calculator Form */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Macro Calculator
              </CardTitle>
              <CardDescription>
                Enter your details to calculate your daily needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity">Activity Level</Label>
                <Select
                  value={formData.activityLevel}
                  onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}
                >
                  <SelectTrigger id="activity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Goal</Label>
                <Select
                  value={formData.goal}
                  onValueChange={(value) => setFormData({ ...formData, goal: value })}
                >
                  <SelectTrigger id="goal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOALS.map((goal) => (
                      <SelectItem key={goal.value} value={goal.value}>
                        {goal.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {results && (
                <Button onClick={handleSave} className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Diet Plan
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <motion.div variants={item} className="space-y-4">
          {results ? (
            <>
              {/* Calorie Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      BMR (Basal Metabolic Rate)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{results.bmr} cal</div>
                    <p className="text-xs text-muted-foreground">
                      Calories burned at rest
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      TDEE (Total Daily Energy)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{results.tdee} cal</div>
                    <p className="text-xs text-muted-foreground">
                      With activity level
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Target Calories */}
              <Card className="border-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Flame className="h-5 w-5" />
                    Daily Target
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{results.targetCalories} cal</div>
                  <p className="text-sm text-muted-foreground">
                    {formData.goal === 'lose' && 'To lose ~0.5kg per week'}
                    {formData.goal === 'maintain' && 'To maintain your weight'}
                    {formData.goal === 'gain' && 'To gain ~0.5kg per week'}
                  </p>
                </CardContent>
              </Card>

              {/* Macros */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Macros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg bg-chart-1/10 p-4 text-center">
                      <Beef className="mx-auto mb-2 h-6 w-6 text-chart-1" />
                      <p className="text-2xl font-bold">{results.protein}g</p>
                      <p className="text-sm text-muted-foreground">Protein</p>
                    </div>
                    <div className="rounded-lg bg-chart-2/10 p-4 text-center">
                      <Wheat className="mx-auto mb-2 h-6 w-6 text-chart-2" />
                      <p className="text-2xl font-bold">{results.carbs}g</p>
                      <p className="text-sm text-muted-foreground">Carbs</p>
                    </div>
                    <div className="rounded-lg bg-chart-3/10 p-4 text-center">
                      <Droplets className="mx-auto mb-2 h-6 w-6 text-chart-3" />
                      <p className="text-2xl font-bold">{results.fats}g</p>
                      <p className="text-sm text-muted-foreground">Fats</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Calculator className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">Enter your details</h3>
                <p className="text-sm text-muted-foreground">
                  Fill in the form to calculate your daily calorie and macro needs
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Food Recommendations */}
      {results && (
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5" />
                Food Recommendations
              </CardTitle>
              <CardDescription>
                Suggested foods to help you meet your macro goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-medium">
                    <Beef className="h-4 w-4 text-chart-1" />
                    Protein Sources
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {FOOD_RECOMMENDATIONS.protein.map((food) => (
                      <li key={food}>- {food}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-medium">
                    <Wheat className="h-4 w-4 text-chart-2" />
                    Carb Sources
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {FOOD_RECOMMENDATIONS.carbs.map((food) => (
                      <li key={food}>- {food}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-medium">
                    <Droplets className="h-4 w-4 text-chart-3" />
                    Healthy Fats
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {FOOD_RECOMMENDATIONS.fats.map((food) => (
                      <li key={food}>- {food}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Info Note */}
      <motion.div variants={item}>
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <Info className="h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium">Important Note</p>
            <p className="text-muted-foreground">
              These calculations are estimates based on general formulas. 
              For personalized nutrition advice, please consult with a registered dietitian or healthcare provider.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
