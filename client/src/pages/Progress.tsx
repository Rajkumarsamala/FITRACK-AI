import { useState } from 'react';
import { Link } from 'wouter';
import { LineChart, Scale, Flame, Droplets, Moon, Plus, Check, TrendingUp, TrendingDown, Zap, ArrowRight } from 'lucide-react';
import { Layout } from '../components/fitness/Layout';
import { FitnessCard, StatCard } from '../components/fitness/FitnessCard';
import { ProgressRing } from '../components/fitness/ProgressRing';
import { GoalToggle } from '../components/fitness/GoalToggle';
import { FitnessButton } from '../components/fitness/FitnessButton';
import { useGoal } from '../contexts/GoalContext';
import { useUser } from '../contexts/UserContext';
import type { DailyLog } from '../types';

export function Progress() {
  const { currentGoal } = useGoal();
  const { profile, dailyLogs, metrics, addDailyLog, isCurrentGoalOnboarded } = useUser();
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({
    weight: '',
    caloriesConsumed: '',
    caloriesBurned: '',
    workoutCompleted: false,
    waterIntake: '',
    sleepHours: '',
    mood: 'good' as DailyLog['mood'],
    notes: '',
  });

  if (!isCurrentGoalOnboarded || !profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
            <Zap className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Setup Required</h1>
          <p className="text-gray-400 max-w-md mb-8">
            Complete your profile to start tracking progress.
          </p>
          <Link href="/onboarding">
            <FitnessButton size="lg" data-testid="button-setup-profile">
              Setup Profile
              <ArrowRight className="w-5 h-5" />
            </FitnessButton>
          </Link>
        </div>
      </Layout>
    );
  }

  const isGaining = currentGoal === 'gain-weight';
  const today = new Date().toISOString().split('T')[0];
  const todayLog = dailyLogs.find(log => log.date === today);

  const last7DaysLogs = dailyLogs
    .filter(log => {
      const logDate = new Date(log.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleSubmitLog = () => {
    const newLog: DailyLog = {
      id: `log-${Date.now()}`,
      date: today,
      weight: parseFloat(logForm.weight) || profile.currentWeight,
      caloriesConsumed: parseInt(logForm.caloriesConsumed) || 0,
      caloriesBurned: parseInt(logForm.caloriesBurned) || 0,
      workoutCompleted: logForm.workoutCompleted,
      waterIntake: parseFloat(logForm.waterIntake) || 0,
      sleepHours: parseFloat(logForm.sleepHours) || 0,
      mood: logForm.mood,
      notes: logForm.notes,
    };
    addDailyLog(newLog);
    setShowLogForm(false);
    setLogForm({
      weight: '',
      caloriesConsumed: '',
      caloriesBurned: '',
      workoutCompleted: false,
      waterIntake: '',
      sleepHours: '',
      mood: 'good',
      notes: '',
    });
  };

  const weightProgress = metrics?.percentageComplete || 0;
  const weightChange = metrics?.weightChange || 0;
  const isPositiveProgress = isGaining ? weightChange > 0 : weightChange < 0;

  return (
    <Layout>
      <header className="page-header mb-12">
        <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-page-title text-white mb-1" data-testid="text-progress-title">Progress Tracking</h1>
            <p className="text-body text-gray-400">Monitor your journey and log daily activities</p>
          </div>
          <GoalToggle />
        </div>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
        <StatCard
          title="Weight Change"
          value={`${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`}
          subtitle={isPositiveProgress ? 'On track!' : 'Keep going!'}
          trend={isPositiveProgress ? 'up' : 'down'}
          icon={<Scale className="w-6 h-6 text-white" />}
          color="purple"
        />
        <StatCard
          title="Avg Daily Calories"
          value={metrics?.averageCalories || 0}
          subtitle="Last 7 days"
          icon={<Flame className="w-6 h-6 text-white" />}
          color={isGaining ? 'green' : 'orange'}
        />
        <StatCard
          title="Workouts Done"
          value={metrics?.workoutsCompleted || 0}
          subtitle="Total workouts"
          icon={<Check className="w-6 h-6 text-white" />}
          color="blue"
        />
        <StatCard
          title="Current Streak"
          value={metrics?.streak || 0}
          subtitle="days in a row"
          icon={isPositiveProgress ? <TrendingUp className="w-6 h-6 text-white" /> : <TrendingDown className="w-6 h-6 text-white" />}
          color="purple"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <FitnessCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-section-title text-white flex items-center gap-2">
              <LineChart className="w-5 h-5 text-purple-400" />
              Weight Progress
            </h2>
          </div>
          
          <div className="flex items-center justify-around py-8">
            <ProgressRing progress={weightProgress} size={160} color={isGaining ? '#22c55e' : '#f97316'}>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">{Math.round(weightProgress)}%</div>
                <div className="text-gray-400">Complete</div>
              </div>
            </ProgressRing>
            
            <div className="space-y-6">
              <div>
                <div className="text-gray-400 text-sm">Start</div>
                <div className="text-2xl font-bold text-white">{metrics?.startWeight || profile.currentWeight} kg</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Current</div>
                <div className="text-2xl font-bold text-white">{metrics?.currentWeight || profile.currentWeight} kg</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Goal</div>
                <div className={`text-2xl font-bold ${isGaining ? 'text-green-400' : 'text-orange-400'}`}>
                  {profile.targetWeight} kg
                </div>
              </div>
            </div>
          </div>

          {last7DaysLogs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-sm text-gray-400 mb-3">Last 7 days weight</div>
              <div className="flex items-end justify-between gap-2 h-24">
                {last7DaysLogs.slice(-7).map((log) => {
                  const maxWeight = Math.max(...last7DaysLogs.map(l => l.weight));
                  const minWeight = Math.min(...last7DaysLogs.map(l => l.weight));
                  const range = maxWeight - minWeight || 1;
                  const height = ((log.weight - minWeight) / range) * 100;
                  return (
                    <div key={log.id} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t ${isGaining ? 'bg-green-500' : 'bg-orange-500'}`}
                        style={{ height: `${Math.max(height, 10)}%` }}
                      />
                      <span className="text-xs text-gray-500">
                        {new Date(log.date).toLocaleDateString('en', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </FitnessCard>

        <FitnessCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Today's Log</h2>
            {!todayLog && !showLogForm && (
              <FitnessButton size="sm" onClick={() => setShowLogForm(true)} data-testid="button-add-log">
                <Plus className="w-4 h-4" />
                Add
              </FitnessButton>
            )}
          </div>

          {showLogForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={logForm.weight}
                  onChange={(e) => setLogForm({ ...logForm, weight: e.target.value })}
                  placeholder={profile.currentWeight.toString()}
                  className="fitness-input"
                  data-testid="input-log-weight"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Calories Consumed</label>
                <input
                  type="number"
                  value={logForm.caloriesConsumed}
                  onChange={(e) => setLogForm({ ...logForm, caloriesConsumed: e.target.value })}
                  placeholder="e.g., 2000"
                  className="fitness-input"
                  data-testid="input-log-calories"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Water Intake (L)</label>
                <input
                  type="number"
                  step="0.5"
                  value={logForm.waterIntake}
                  onChange={(e) => setLogForm({ ...logForm, waterIntake: e.target.value })}
                  placeholder="e.g., 2.5"
                  className="fitness-input"
                  data-testid="input-log-water"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={logForm.workoutCompleted}
                    onChange={(e) => setLogForm({ ...logForm, workoutCompleted: e.target.checked })}
                    className="w-5 h-5 rounded bg-white/5 border-white/10"
                    data-testid="input-log-workout"
                  />
                  <span className="text-white">Completed Workout</span>
                </label>
              </div>
              <div className="flex gap-2">
                <FitnessButton size="sm" variant="ghost" onClick={() => setShowLogForm(false)} fullWidth data-testid="button-cancel-log">
                  Cancel
                </FitnessButton>
                <FitnessButton size="sm" onClick={handleSubmitLog} fullWidth data-testid="button-save-log">
                  Save Log
                </FitnessButton>
              </div>
            </div>
          ) : todayLog ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Scale className="w-4 h-4" />
                  Weight
                </div>
                <span className="text-white font-semibold">{todayLog.weight} kg</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Flame className="w-4 h-4" />
                  Calories
                </div>
                <span className="text-white font-semibold">{todayLog.caloriesConsumed}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Droplets className="w-4 h-4" />
                  Water
                </div>
                <span className="text-white font-semibold">{todayLog.waterIntake}L</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Check className="w-4 h-4" />
                  Workout
                </div>
                <span className={todayLog.workoutCompleted ? 'text-green-400' : 'text-gray-500'}>
                  {todayLog.workoutCompleted ? 'Completed' : 'Not yet'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Moon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No log for today</p>
              <p className="text-gray-500 text-sm">Click Add to log your daily progress</p>
            </div>
          )}
        </FitnessCard>
      </div>

      {dailyLogs.length > 0 && (
        <FitnessCard>
          <h2 className="text-xl font-bold text-white mb-4">Recent Logs</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 py-3 px-2">Date</th>
                  <th className="text-left text-gray-400 py-3 px-2">Weight</th>
                  <th className="text-left text-gray-400 py-3 px-2">Calories</th>
                  <th className="text-left text-gray-400 py-3 px-2">Water</th>
                  <th className="text-left text-gray-400 py-3 px-2">Workout</th>
                </tr>
              </thead>
              <tbody>
                {dailyLogs.slice(-7).reverse().map((log) => (
                  <tr key={log.id} className="border-b border-white/5" data-testid={`row-log-${log.id}`}>
                    <td className="py-3 px-2 text-white">
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2 text-white">{log.weight} kg</td>
                    <td className="py-3 px-2 text-white">{log.caloriesConsumed}</td>
                    <td className="py-3 px-2 text-white">{log.waterIntake}L</td>
                    <td className="py-3 px-2">
                      <span className={log.workoutCompleted ? 'text-green-400' : 'text-gray-500'}>
                        {log.workoutCompleted ? 'Done' : '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FitnessCard>
      )}
    </Layout>
  );
}
