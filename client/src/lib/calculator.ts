import type { ActivityLevel, GoalType } from '../types';

const activityMultipliers: Record<ActivityLevel, number> = {
  'sedentary': 1.2,
  'light': 1.375,
  'moderate': 1.55,
  'active': 1.725,
  'very-active': 1.9,
};

export function calculateBMR(weight: number, height: number, age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    return Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
  }
  return Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * activityMultipliers[activityLevel]);
}

export function calculateGoalCalories(
  tdee: number,
  goal: GoalType,
  intensity: 'mild' | 'moderate' | 'aggressive' = 'moderate'
): number {
  const adjustments = {
    mild: 250,
    moderate: 500,
    aggressive: 750,
  };

  const adjustment = adjustments[intensity];
  
  if (goal === 'lose-weight') {
    return Math.round(tdee - adjustment);
  }
  return Math.round(tdee + adjustment);
}

export function calculateMacros(
  calories: number,
  goal: GoalType,
  _weight: number
): { protein: number; carbs: number; fats: number } {
  let proteinRatio: number;
  let fatRatio: number;
  
  if (goal === 'lose-weight') {
    proteinRatio = 0.35;
    fatRatio = 0.25;
  } else {
    proteinRatio = 0.30;
    fatRatio = 0.25;
  }

  const carbRatio = 1 - proteinRatio - fatRatio;

  const protein = Math.round((calories * proteinRatio) / 4);
  const fats = Math.round((calories * fatRatio) / 9);
  const carbs = Math.round((calories * carbRatio) / 4);

  return { protein, carbs, fats };
}

export function calculateWeeksToGoal(
  currentWeight: number,
  targetWeight: number,
  weeklyChange: number = 0.5
): number {
  const weightDifference = Math.abs(targetWeight - currentWeight);
  return Math.ceil(weightDifference / weeklyChange);
}

export function getIdealWeightRange(height: number, _gender: 'male' | 'female'): { min: number; max: number } {
  const heightInMeters = height / 100;
  const minBMI = 18.5;
  const maxBMI = 24.9;

  return {
    min: Math.round(minBMI * heightInMeters * heightInMeters),
    max: Math.round(maxBMI * heightInMeters * heightInMeters),
  };
}

export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}
