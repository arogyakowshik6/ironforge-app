export type Gender = 'male' | 'female' | 'undisclosed'
export type BodyType = 'ectomorph' | 'mesomorph' | 'endomorph'
export type Experience = 'beginner' | 'intermediate' | 'advanced'
export type FitnessGoal = 'weight-loss' | 'bulking' | 'cutting' | 'shredding'
export type Equipment = 'home' | 'gym' | 'both'
export type HealthFlag = 'none' | 'injury' | 'medical'

export interface UserProfile {
  name: string
  age: number
  gender: Gender
  heightCm: number
  currentWeightKg: number
  targetWeightKg: number
  bodyType: BodyType
  experience: Experience
  goal: FitnessGoal
  daysAvailable: number
  equipment: Equipment
  healthFlag: HealthFlag
}

export interface Exercise {
  name: string
  prescription: string
  description: string
}

export interface Session {
  label: string | null
  exercises: Exercise[]
}

export interface WorkoutDay {
  day: number
  dayName: string
  title: string
  isRestDay: boolean
  restNote: string | null
  sessions: Session[]
}

export interface MacroTarget {
  label: string
  kcal: string | null
  protein: string | null
  carbs: string | null
  fats: string | null
}

export interface ProgrammeMacros {
  female: MacroTarget | null
  male: MacroTarget | null
  generalRule: string | null
  highCarbDays: string | null
  lowCarbDays: string | null
}

export interface Meal {
  meal: string
  name: string
  items_note: string
}

export interface DietPlan {
  intro: string
  carbCycle: boolean
  dailyMeals?: Meal[]
  trainingDayMeals?: Meal[]
  restDayMeals?: Meal[]
  foodsToAvoid: string[]
  healthySnacks: string[]
  supplements: string[]
}

export interface Programme {
  key: FitnessGoal
  name: string
  blurb: string
  description: string
  macros: ProgrammeMacros
  days: WorkoutDay[]
  diet: DietPlan
}

export interface CalculationResult {
  bmi: number
  bmr: number
  tdee: number
  targetCalories: number
  calorieDelta: number
  macros: { protein: number; carbs: number; fats: number }
  proteinPerKg: number
}
