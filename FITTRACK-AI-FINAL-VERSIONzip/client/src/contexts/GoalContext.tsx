import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { GoalType, GoalConfig } from '../types';

interface GoalContextType {
  currentGoal: GoalType;
  goalConfig: GoalConfig;
  setGoal: (goal: GoalType) => void;
  goals: GoalConfig[];
}

const goals: GoalConfig[] = [
  {
    id: 'lose-weight',
    label: 'Lose Weight & Get Fit',
    description: 'Burn fat, build lean muscle, and achieve your ideal weight with personalized calorie deficit plans.',
    icon: 'flame',
    color: '#f97316',
    calorieAdjustment: 'deficit',
  },
  {
    id: 'gain-weight',
    label: 'Gain Weight & Build Muscle',
    description: 'Build healthy mass, increase strength, and reach your weight goals with smart calorie surplus plans.',
    icon: 'dumbbell',
    color: '#22c55e',
    calorieAdjustment: 'surplus',
  },
];

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export function GoalProvider({ children }: { children: ReactNode }) {
  const [currentGoal, setCurrentGoal] = useState<GoalType>(() => {
    const saved = localStorage.getItem('fitnessGoal');
    return (saved as GoalType) || 'lose-weight';
  });

  const goalConfig = goals.find(g => g.id === currentGoal) || goals[0];

  useEffect(() => {
    localStorage.setItem('fitnessGoal', currentGoal);
  }, [currentGoal]);

  const setGoal = (goal: GoalType) => {
    setCurrentGoal(goal);
  };

  return (
    <GoalContext.Provider value={{ currentGoal, goalConfig, setGoal, goals }}>
      {children}
    </GoalContext.Provider>
  );
}

export function useGoal() {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error('useGoal must be used within a GoalProvider');
  }
  return context;
}
