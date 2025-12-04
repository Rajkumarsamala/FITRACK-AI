import type { NutritionPlan, MealPlan, GoalType } from '../types';

export function generateMealPlan(
  goalType: GoalType,
  dailyCalories: number,
  protein: number,
  carbs: number,
  fats: number
): NutritionPlan {
  const meals: MealPlan[] = goalType === 'lose-weight' 
    ? generateWeightLossMeals(dailyCalories, protein, carbs, fats)
    : generateWeightGainMeals(dailyCalories, protein, carbs, fats);

  return {
    id: `plan-${Date.now()}`,
    goalType,
    dailyCalories,
    protein,
    carbs,
    fats,
    meals,
  };
}

function generateWeightLossMeals(calories: number, _protein: number, _carbs: number, _fats: number): MealPlan[] {
  const breakfastCal = Math.round(calories * 0.25);
  const lunchCal = Math.round(calories * 0.35);
  const dinnerCal = Math.round(calories * 0.30);
  const snackCal = Math.round(calories * 0.10);

  return [
    {
      id: 'breakfast',
      name: 'Breakfast',
      time: '7:00 AM',
      calories: breakfastCal,
      foods: [
        { name: 'Greek Yogurt (non-fat)', portion: '1 cup', calories: 100, protein: 17, carbs: 6, fats: 1 },
        { name: 'Mixed Berries', portion: '1/2 cup', calories: 40, protein: 1, carbs: 10, fats: 0 },
        { name: 'Almonds', portion: '10 pieces', calories: 70, protein: 3, carbs: 2, fats: 6 },
        { name: 'Green Tea', portion: '1 cup', calories: 0, protein: 0, carbs: 0, fats: 0 },
      ],
    },
    {
      id: 'lunch',
      name: 'Lunch',
      time: '12:30 PM',
      calories: lunchCal,
      foods: [
        { name: 'Grilled Chicken Breast', portion: '5 oz', calories: 165, protein: 31, carbs: 0, fats: 4 },
        { name: 'Mixed Salad Greens', portion: '2 cups', calories: 20, protein: 2, carbs: 4, fats: 0 },
        { name: 'Quinoa', portion: '1/2 cup cooked', calories: 111, protein: 4, carbs: 20, fats: 2 },
        { name: 'Olive Oil Dressing', portion: '1 tbsp', calories: 60, protein: 0, carbs: 0, fats: 7 },
      ],
    },
    {
      id: 'dinner',
      name: 'Dinner',
      time: '7:00 PM',
      calories: dinnerCal,
      foods: [
        { name: 'Baked Salmon', portion: '4 oz', calories: 200, protein: 23, carbs: 0, fats: 12 },
        { name: 'Steamed Broccoli', portion: '1 cup', calories: 55, protein: 4, carbs: 11, fats: 1 },
        { name: 'Brown Rice', portion: '1/2 cup cooked', calories: 108, protein: 3, carbs: 22, fats: 1 },
      ],
    },
    {
      id: 'snack',
      name: 'Afternoon Snack',
      time: '4:00 PM',
      calories: snackCal,
      foods: [
        { name: 'Apple', portion: '1 medium', calories: 95, protein: 0, carbs: 25, fats: 0 },
        { name: 'Peanut Butter', portion: '1 tbsp', calories: 95, protein: 4, carbs: 3, fats: 8 },
      ],
    },
  ];
}

function generateWeightGainMeals(calories: number, _protein: number, _carbs: number, _fats: number): MealPlan[] {
  const breakfastCal = Math.round(calories * 0.25);
  const lunchCal = Math.round(calories * 0.30);
  const dinnerCal = Math.round(calories * 0.30);
  const snackCal = Math.round(calories * 0.15);

  return [
    {
      id: 'breakfast',
      name: 'Power Breakfast',
      time: '7:00 AM',
      calories: breakfastCal,
      foods: [
        { name: 'Whole Eggs', portion: '3 large', calories: 210, protein: 18, carbs: 1, fats: 15 },
        { name: 'Oatmeal', portion: '1 cup cooked', calories: 150, protein: 5, carbs: 27, fats: 3 },
        { name: 'Banana', portion: '1 large', calories: 120, protein: 1, carbs: 31, fats: 0 },
        { name: 'Whole Milk', portion: '1 cup', calories: 150, protein: 8, carbs: 12, fats: 8 },
        { name: 'Honey', portion: '1 tbsp', calories: 60, protein: 0, carbs: 17, fats: 0 },
      ],
    },
    {
      id: 'lunch',
      name: 'Muscle Building Lunch',
      time: '12:30 PM',
      calories: lunchCal,
      foods: [
        { name: 'Lean Ground Beef', portion: '6 oz', calories: 280, protein: 36, carbs: 0, fats: 15 },
        { name: 'Pasta', portion: '1.5 cups cooked', calories: 300, protein: 11, carbs: 60, fats: 2 },
        { name: 'Marinara Sauce', portion: '1/2 cup', calories: 70, protein: 2, carbs: 12, fats: 2 },
        { name: 'Parmesan Cheese', portion: '2 tbsp', calories: 40, protein: 4, carbs: 0, fats: 3 },
      ],
    },
    {
      id: 'dinner',
      name: 'Recovery Dinner',
      time: '7:00 PM',
      calories: dinnerCal,
      foods: [
        { name: 'Grilled Steak', portion: '6 oz', calories: 300, protein: 42, carbs: 0, fats: 14 },
        { name: 'Baked Potato', portion: '1 large', calories: 160, protein: 4, carbs: 37, fats: 0 },
        { name: 'Butter', portion: '1 tbsp', calories: 100, protein: 0, carbs: 0, fats: 11 },
        { name: 'Steamed Vegetables', portion: '1 cup', calories: 50, protein: 2, carbs: 10, fats: 0 },
      ],
    },
    {
      id: 'snack1',
      name: 'Pre-Workout Snack',
      time: '3:00 PM',
      calories: Math.round(snackCal * 0.5),
      foods: [
        { name: 'Protein Shake', portion: '1 scoop + milk', calories: 200, protein: 25, carbs: 10, fats: 5 },
        { name: 'Trail Mix', portion: '1/4 cup', calories: 175, protein: 5, carbs: 15, fats: 12 },
      ],
    },
    {
      id: 'snack2',
      name: 'Evening Snack',
      time: '9:00 PM',
      calories: Math.round(snackCal * 0.5),
      foods: [
        { name: 'Cottage Cheese', portion: '1 cup', calories: 220, protein: 28, carbs: 8, fats: 10 },
        { name: 'Almonds', portion: '1/4 cup', calories: 170, protein: 6, carbs: 6, fats: 15 },
      ],
    },
  ];
}

export function getSampleMealsByGoal(goal: GoalType): MealPlan[] {
  if (goal === 'lose-weight') {
    return generateWeightLossMeals(1800, 140, 180, 50);
  }
  return generateWeightGainMeals(2800, 180, 350, 90);
}
