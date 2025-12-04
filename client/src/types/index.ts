export type GoalType = 'lose-weight' | 'gain-weight';

export interface GoalConfig {
  id: GoalType;
  label: string;
  description: string;
  icon: string;
  color: string;
  calorieAdjustment: 'deficit' | 'surplus';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female';
  height: number;
  currentWeight: number;
  targetWeight: number;
  activityLevel: ActivityLevel;
  goal: GoalType;
  createdAt: string;
  updatedAt: string;
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';

export interface NutritionPlan {
  id: string;
  goalType: GoalType;
  dailyCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  meals: MealPlan[];
}

export interface MealPlan {
  id: string;
  name: string;
  time: string;
  calories: number;
  foods: FoodItem[];
}

export interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface WorkoutPlan {
  id: string;
  goalType: GoalType;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  duration?: number;
  restTime: number;
  category: ExerciseCategory;
  image?: string;
}

export type ExerciseCategory = 'cardio' | 'strength' | 'flexibility' | 'hiit';

export interface DailyLog {
  id: string;
  date: string;
  weight: number;
  caloriesConsumed: number;
  caloriesBurned: number;
  workoutCompleted: boolean;
  waterIntake: number;
  sleepHours: number;
  notes: string;
  mood: 'great' | 'good' | 'okay' | 'bad';
}

export interface ProgressMetrics {
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  weightChange: number;
  percentageComplete: number;
  averageCalories: number;
  workoutsCompleted: number;
  streak: number;
}

export interface AITip {
  id: string;
  category: 'nutrition' | 'workout' | 'motivation' | 'lifestyle';
  title: string;
  content: string;
  goalType: GoalType;
  createdAt: string;
}
