import type { WorkoutPlan, GoalType } from '../types';

export const workoutPlans: WorkoutPlan[] = [
  {
    id: 'fat-burn-hiit',
    goalType: 'lose-weight',
    name: 'Fat Burning HIIT',
    description: 'High-intensity interval training to maximize calorie burn and boost metabolism.',
    difficulty: 'intermediate',
    duration: 30,
    exercises: [
      { id: '1', name: 'Jumping Jacks', sets: 3, reps: '45 sec', restTime: 15, category: 'cardio' },
      { id: '2', name: 'Burpees', sets: 3, reps: '30 sec', restTime: 20, category: 'hiit' },
      { id: '3', name: 'Mountain Climbers', sets: 3, reps: '45 sec', restTime: 15, category: 'cardio' },
      { id: '4', name: 'High Knees', sets: 3, reps: '45 sec', restTime: 15, category: 'cardio' },
      { id: '5', name: 'Squat Jumps', sets: 3, reps: '30 sec', restTime: 20, category: 'hiit' },
      { id: '6', name: 'Plank', sets: 3, reps: '45 sec', restTime: 15, category: 'strength' },
    ],
  },
  {
    id: 'cardio-blast',
    goalType: 'lose-weight',
    name: 'Cardio Blast',
    description: 'Steady-state cardio workout for fat loss and endurance building.',
    difficulty: 'beginner',
    duration: 45,
    exercises: [
      { id: '1', name: 'Walking Lunges', sets: 3, reps: '20 reps', restTime: 30, category: 'cardio' },
      { id: '2', name: 'Step-Ups', sets: 3, reps: '15 each leg', restTime: 30, category: 'cardio' },
      { id: '3', name: 'Jumping Jacks', sets: 4, reps: '60 sec', restTime: 20, category: 'cardio' },
      { id: '4', name: 'Bicycle Crunches', sets: 3, reps: '20 reps', restTime: 20, category: 'cardio' },
      { id: '5', name: 'Push-Ups', sets: 3, reps: '15 reps', restTime: 30, category: 'strength' },
    ],
  },
  {
    id: 'core-crusher',
    goalType: 'lose-weight',
    name: 'Core Crusher',
    description: 'Target your midsection with this intense core-focused workout.',
    difficulty: 'intermediate',
    duration: 25,
    exercises: [
      { id: '1', name: 'Plank', sets: 3, reps: '60 sec', restTime: 20, category: 'strength' },
      { id: '2', name: 'Crunches', sets: 4, reps: '25 reps', restTime: 15, category: 'strength' },
      { id: '3', name: 'Bicycle Crunches', sets: 3, reps: '20 each side', restTime: 20, category: 'strength' },
      { id: '4', name: 'Leg Raises', sets: 3, reps: '15 reps', restTime: 20, category: 'strength' },
      { id: '5', name: 'Mountain Climbers', sets: 3, reps: '45 sec', restTime: 20, category: 'cardio' },
    ],
  },
  {
    id: 'muscle-builder',
    goalType: 'gain-weight',
    name: 'Muscle Builder',
    description: 'Compound movements to build strength and increase muscle mass.',
    difficulty: 'intermediate',
    duration: 45,
    exercises: [
      { id: '1', name: 'Push-Ups', sets: 4, reps: '15 reps', restTime: 60, category: 'strength' },
      { id: '2', name: 'Squats', sets: 4, reps: '12 reps', restTime: 90, category: 'strength' },
      { id: '3', name: 'Lunges', sets: 3, reps: '12 each leg', restTime: 60, category: 'strength' },
      { id: '4', name: 'Plank', sets: 3, reps: '60 sec', restTime: 45, category: 'strength' },
      { id: '5', name: 'Diamond Push-Ups', sets: 3, reps: '12 reps', restTime: 60, category: 'strength' },
      { id: '6', name: 'Glute Bridges', sets: 3, reps: '15 reps', restTime: 45, category: 'strength' },
    ],
  },
  {
    id: 'strength-foundation',
    goalType: 'gain-weight',
    name: 'Strength Foundation',
    description: 'Build a solid foundation with these essential strength exercises.',
    difficulty: 'beginner',
    duration: 40,
    exercises: [
      { id: '1', name: 'Wall Push-Ups', sets: 3, reps: '15 reps', restTime: 45, category: 'strength' },
      { id: '2', name: 'Bodyweight Squats', sets: 4, reps: '15 reps', restTime: 60, category: 'strength' },
      { id: '3', name: 'Assisted Lunges', sets: 3, reps: '10 each leg', restTime: 45, category: 'strength' },
      { id: '4', name: 'Knee Push-Ups', sets: 3, reps: '12 reps', restTime: 45, category: 'strength' },
      { id: '5', name: 'Calf Raises', sets: 3, reps: '20 reps', restTime: 30, category: 'strength' },
    ],
  },
  {
    id: 'mass-gain-power',
    goalType: 'gain-weight',
    name: 'Mass Gain Power',
    description: 'Advanced workout designed for maximum muscle growth and strength gains.',
    difficulty: 'advanced',
    duration: 60,
    exercises: [
      { id: '1', name: 'Wide Push-Ups', sets: 4, reps: '15 reps', restTime: 90, category: 'strength' },
      { id: '2', name: 'Jump Squats', sets: 4, reps: '12 reps', restTime: 90, category: 'strength' },
      { id: '3', name: 'Pike Push-Ups', sets: 4, reps: '10 reps', restTime: 90, category: 'strength' },
      { id: '4', name: 'Bulgarian Split Squats', sets: 3, reps: '10 each leg', restTime: 75, category: 'strength' },
      { id: '5', name: 'Tricep Dips', sets: 4, reps: '12 reps', restTime: 60, category: 'strength' },
      { id: '6', name: 'Plank to Push-Up', sets: 3, reps: '10 reps', restTime: 60, category: 'strength' },
    ],
  },
];

export function getWorkoutsByGoal(goal: GoalType): WorkoutPlan[] {
  return workoutPlans.filter(workout => workout.goalType === goal);
}

export function getWorkoutById(id: string): WorkoutPlan | undefined {
  return workoutPlans.find(workout => workout.id === id);
}
