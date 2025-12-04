import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, DailyLog, ProgressMetrics, GoalType } from '../types';
import { useGoal } from './GoalContext';

interface GoalData {
  profile: UserProfile | null;
  dailyLogs: DailyLog[];
}

interface UserContextType {
  profile: UserProfile | null;
  dailyLogs: DailyLog[];
  metrics: ProgressMetrics | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addDailyLog: (log: DailyLog) => void;
  updateDailyLog: (id: string, updates: Partial<DailyLog>) => void;
  isOnboarded: boolean;
  isCurrentGoalOnboarded: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const getStorageKey = (goal: GoalType, type: string) => `fittrack_${goal}_${type}`;

export function UserProvider({ children }: { children: ReactNode }) {
  const { currentGoal } = useGoal();

  const loadGoalData = (goal: GoalType): GoalData => {
    const profileKey = getStorageKey(goal, 'profile');
    const logsKey = getStorageKey(goal, 'logs');
    
    const savedProfile = localStorage.getItem(profileKey);
    const savedLogs = localStorage.getItem(logsKey);
    
    return {
      profile: savedProfile ? JSON.parse(savedProfile) : null,
      dailyLogs: savedLogs ? JSON.parse(savedLogs) : [],
    };
  };

  const [goalData, setGoalData] = useState<Record<GoalType, GoalData>>(() => ({
    'lose-weight': loadGoalData('lose-weight'),
    'gain-weight': loadGoalData('gain-weight'),
  }));

  const currentData = goalData[currentGoal] || { profile: null, dailyLogs: [] };
  const profile = currentData.profile;
  const dailyLogs = currentData.dailyLogs;

  useEffect(() => {
    const profileKey = getStorageKey(currentGoal, 'profile');
    const logsKey = getStorageKey(currentGoal, 'logs');
    
    if (profile) {
      localStorage.setItem(profileKey, JSON.stringify(profile));
    }
    localStorage.setItem(logsKey, JSON.stringify(dailyLogs));
  }, [currentGoal, profile, dailyLogs]);

  const setProfile = (newProfile: UserProfile) => {
    setGoalData(prev => ({
      ...prev,
      [currentGoal]: {
        ...prev[currentGoal],
        profile: { ...newProfile, goal: currentGoal },
      },
    }));
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (profile) {
      setGoalData(prev => ({
        ...prev,
        [currentGoal]: {
          ...prev[currentGoal],
          profile: { ...profile, ...updates, updatedAt: new Date().toISOString() },
        },
      }));
    }
  };

  const addDailyLog = (log: DailyLog) => {
    setGoalData(prev => ({
      ...prev,
      [currentGoal]: {
        ...prev[currentGoal],
        dailyLogs: [...prev[currentGoal].dailyLogs.filter(l => l.date !== log.date), log],
      },
    }));
  };

  const updateDailyLog = (id: string, updates: Partial<DailyLog>) => {
    setGoalData(prev => ({
      ...prev,
      [currentGoal]: {
        ...prev[currentGoal],
        dailyLogs: prev[currentGoal].dailyLogs.map(log => 
          log.id === id ? { ...log, ...updates } : log
        ),
      },
    }));
  };

  const calculateMetrics = (): ProgressMetrics | null => {
    if (!profile || dailyLogs.length === 0) return null;

    const sortedLogs = [...dailyLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const startWeight = sortedLogs[0]?.weight || profile.currentWeight;
    const currentWeight = sortedLogs[sortedLogs.length - 1]?.weight || profile.currentWeight;
    const weightChange = currentWeight - startWeight;
    const totalWeightGoal = Math.abs(profile.targetWeight - startWeight);
    const progressMade = Math.abs(currentWeight - startWeight);
    const percentageComplete = totalWeightGoal > 0 ? Math.min((progressMade / totalWeightGoal) * 100, 100) : 0;

    const last7Days = sortedLogs.slice(-7);
    const averageCalories = last7Days.length > 0
      ? last7Days.reduce((acc, log) => acc + log.caloriesConsumed, 0) / last7Days.length
      : 0;

    const workoutsCompleted = dailyLogs.filter(log => log.workoutCompleted).length;

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const log = dailyLogs.find(l => l.date === dateStr);
      if (log?.workoutCompleted) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return {
      startWeight,
      currentWeight,
      targetWeight: profile.targetWeight,
      weightChange,
      percentageComplete,
      averageCalories: Math.round(averageCalories),
      workoutsCompleted,
      streak,
    };
  };

  const metrics = calculateMetrics();
  const isCurrentGoalOnboarded = profile !== null;
  const isOnboarded = goalData['lose-weight'].profile !== null || goalData['gain-weight'].profile !== null;

  return (
    <UserContext.Provider value={{
      profile,
      dailyLogs,
      metrics,
      setProfile,
      updateProfile,
      addDailyLog,
      updateDailyLog,
      isOnboarded,
      isCurrentGoalOnboarded,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
