import type { AITip, GoalType } from '../types';

const tips: AITip[] = [
  {
    id: '1',
    category: 'nutrition',
    title: 'Protein Timing Matters',
    content: 'Distribute your protein intake evenly across meals. Aim for 20-40g per meal to maximize muscle protein synthesis and keep you feeling full longer.',
    goalType: 'lose-weight',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    category: 'workout',
    title: 'Add Strength Training',
    content: 'Include resistance training 2-3 times per week. Building muscle increases your resting metabolic rate, helping you burn more calories even at rest.',
    goalType: 'lose-weight',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    category: 'motivation',
    title: 'Track Non-Scale Victories',
    content: 'Celebrate improvements in energy, sleep quality, and how clothes fit. The scale doesn\'t show the full picture of your progress.',
    goalType: 'lose-weight',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    category: 'lifestyle',
    title: 'Prioritize Sleep',
    content: 'Aim for 7-9 hours of quality sleep. Poor sleep increases hunger hormones and makes weight loss significantly harder.',
    goalType: 'lose-weight',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    category: 'nutrition',
    title: 'Stay Hydrated',
    content: 'Drink water before meals to reduce appetite. Often, what feels like hunger is actually thirst in disguise.',
    goalType: 'lose-weight',
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    category: 'nutrition',
    title: 'Calorie-Dense Foods Are Key',
    content: 'Focus on nutrient-rich, calorie-dense foods like nuts, avocados, olive oil, and whole milk to hit your calorie surplus without feeling overly stuffed.',
    goalType: 'gain-weight',
    createdAt: new Date().toISOString(),
  },
  {
    id: '7',
    category: 'workout',
    title: 'Progressive Overload',
    content: 'Gradually increase weights, reps, or sets over time. This progressive overload is essential for continuous muscle growth and strength gains.',
    goalType: 'gain-weight',
    createdAt: new Date().toISOString(),
  },
  {
    id: '8',
    category: 'nutrition',
    title: 'Eat More Frequently',
    content: 'If large meals are difficult, eat 5-6 smaller meals throughout the day. This makes it easier to consume enough calories for weight gain.',
    goalType: 'gain-weight',
    createdAt: new Date().toISOString(),
  },
  {
    id: '9',
    category: 'lifestyle',
    title: 'Rest for Growth',
    content: 'Muscles grow during rest, not during workouts. Ensure adequate recovery with 48-72 hours between training the same muscle groups.',
    goalType: 'gain-weight',
    createdAt: new Date().toISOString(),
  },
  {
    id: '10',
    category: 'motivation',
    title: 'Be Patient with Progress',
    content: 'Healthy weight gain takes time. Aim for 0.5-1 pound per week to ensure you\'re gaining muscle, not just fat.',
    goalType: 'gain-weight',
    createdAt: new Date().toISOString(),
  },
  {
    id: '11',
    category: 'nutrition',
    title: 'Post-Workout Nutrition',
    content: 'Consume protein and carbs within 30-60 minutes after your workout. This window is optimal for muscle recovery and growth.',
    goalType: 'gain-weight',
    createdAt: new Date().toISOString(),
  },
  {
    id: '12',
    category: 'workout',
    title: 'Compound Exercises First',
    content: 'Prioritize compound movements like squats, deadlifts, and bench press. These exercises work multiple muscle groups and stimulate maximum muscle growth.',
    goalType: 'gain-weight',
    createdAt: new Date().toISOString(),
  },
];

export function getTipsByGoal(goal: GoalType): AITip[] {
  return tips.filter(tip => tip.goalType === goal);
}

export function getRandomTip(goal: GoalType): AITip {
  const goalTips = getTipsByGoal(goal);
  return goalTips[Math.floor(Math.random() * goalTips.length)];
}

export function getTipsByCategory(goal: GoalType, category: AITip['category']): AITip[] {
  return tips.filter(tip => tip.goalType === goal && tip.category === category);
}
