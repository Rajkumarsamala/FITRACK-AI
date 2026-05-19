import { useState } from 'react';
import { Link } from 'wouter';
import { LineChart, Scale, Flame, Droplets, Moon, Plus, Check, TrendingUp, TrendingDown, Zap, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/fitness/Layout';
import { FitnessCard, StatCard } from '../components/fitness/FitnessCard';
import { ProgressRing } from '../components/fitness/ProgressRing';
import { GoalToggle } from '../components/fitness/GoalToggle';
import { FitnessButton } from '../components/fitness/FitnessButton';
import { GlowOrb } from '../components/fitness/AnimatedBackground';
import { ScrollReveal, FadeIn } from '../components/fitness/ScrollReveal';
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
        <div className="relative">
          <GlowOrb color="purple" position="center" size="xl" />
          <motion.div 
            className="flex flex-col items-center justify-center min-h-[60vh] text-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-500/30 flex items-center justify-center mb-6 saas-glass">
              <Zap className="w-10 h-10 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Setup Required</h1>
            <p className="text-gray-400 max-w-md mb-8">
              Complete your profile to start tracking progress.
            </p>
            <Link href="/onboarding">
              <FitnessButton size="lg" className="btn-shimmer shadow-lg shadow-purple-500/20" data-testid="button-setup-profile">
                Setup Profile
                <ArrowRight className="w-5 h-5" />
              </FitnessButton>
            </Link>
          </motion.div>
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
      <div className="relative">
        <GlowOrb color="blue" position="top-right" size="lg" />
        <GlowOrb color="purple" position="bottom-left" size="md" />

        <FadeIn duration={0.6}>
          <header className="page-header mb-12 relative z-10">
            <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-page-title text-white mb-1" data-testid="text-progress-title">Progress Tracking</h1>
                <p className="text-body text-gray-400">Monitor your journey and log daily activities</p>
              </div>
              <GoalToggle />
            </div>
          </header>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12 relative z-10">
          <StatCard
            title="Weight Change"
            value={`${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`}
            subtitle={isPositiveProgress ? 'On track!' : 'Keep going!'}
            trend={isPositiveProgress ? 'up' : 'down'}
            icon={<Scale className="w-6 h-6 text-white" />}
            color="purple"
            delay={0}
          />
          <StatCard
            title="Avg Daily Calories"
            value={metrics?.averageCalories || 0}
            subtitle="Last 7 days"
            icon={<Flame className="w-6 h-6 text-white" />}
            color={isGaining ? 'green' : 'orange'}
            delay={0.1}
          />
          <StatCard
            title="Workouts Done"
            value={metrics?.workoutsCompleted || 0}
            subtitle="Total workouts"
            icon={<Check className="w-6 h-6 text-white" />}
            color="blue"
            delay={0.2}
          />
          <StatCard
            title="Current Streak"
            value={metrics?.streak || 0}
            subtitle="days in a row"
            icon={isPositiveProgress ? <TrendingUp className="w-6 h-6 text-white" /> : <TrendingDown className="w-6 h-6 text-white" />}
            color="purple"
            delay={0.3}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12 relative z-10">
          <ScrollReveal className="lg:col-span-2">
            <FitnessCard variant="animated" className="h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-section-title text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <LineChart className="w-5 h-5 text-purple-400" />
                  </div>
                  Weight Progress
                </h2>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-around py-8 gap-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <ProgressRing progress={weightProgress} size={180} strokeWidth={12} color={isGaining ? '#22c55e' : '#f97316'}>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white">{Math.round(weightProgress)}%</div>
                      <div className="text-gray-400 text-sm">Complete</div>
                    </div>
                  </ProgressRing>
                </motion.div>
                
                <div className="grid grid-cols-1 gap-6 w-full md:w-auto">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between gap-8"
                  >
                    <div className="text-gray-400 text-sm">Start</div>
                    <div className="text-xl font-bold text-white">{metrics?.startWeight || profile.currentWeight} kg</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between gap-8"
                  >
                    <div className="text-gray-400 text-sm">Current</div>
                    <div className="text-xl font-bold text-white">{metrics?.currentWeight || profile.currentWeight} kg</div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20 flex items-center justify-between gap-8"
                  >
                    <div className="text-purple-400 text-sm font-medium">Goal</div>
                    <div className={`text-xl font-bold ${isGaining ? 'text-green-400' : 'text-orange-400'}`}>
                      {profile.targetWeight} kg
                    </div>
                  </motion.div>
                </div>
              </div>

              {last7DaysLogs.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="text-sm text-gray-400 mb-4 font-medium">Last 7 Days Weight Trend</div>
                  <div className="flex items-end justify-between gap-2 h-32 relative">
                    {last7DaysLogs.slice(-7).map((log, i) => {
                      const maxWeight = Math.max(...last7DaysLogs.map(l => l.weight));
                      const minWeight = Math.min(...last7DaysLogs.map(l => l.weight));
                      const range = maxWeight - minWeight || 1;
                      const height = ((log.weight - minWeight) / range) * 100;
                      return (
                        <motion.div 
                          key={log.id} 
                          className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + (i * 0.1) }}
                        >
                          <div className="relative w-full h-full flex items-end justify-center">
                            <motion.div
                              className={`w-full max-w-[40px] rounded-t-lg ${isGaining ? 'bg-gradient-to-t from-green-600/20 to-green-500' : 'bg-gradient-to-t from-orange-600/20 to-orange-500'}`}
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(height, 15)}%` }}
                              transition={{ duration: 0.8, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                            />
                            <div className="absolute -top-8 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {log.weight}kg
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {new Date(log.date).toLocaleDateString('en', { weekday: 'short' })}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </FitnessCard>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <FitnessCard variant="animated" className="h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-blue-400" />
                  </div>
                  Today's Log
                </h2>
                {!todayLog && !showLogForm && (
                  <FitnessButton size="sm" onClick={() => setShowLogForm(true)} className="btn-shimmer" data-testid="button-add-log">
                    <Plus className="w-4 h-4" />
                    Add Log
                  </FitnessButton>
                )}
              </div>

              <AnimatePresence mode="wait">
                {showLogForm ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        value={logForm.weight}
                        onChange={(e) => setLogForm({ ...logForm, weight: e.target.value })}
                        placeholder={profile.currentWeight.toString()}
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
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
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
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
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                        data-testid="input-log-water"
                      />
                    </div>
                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className={`w-6 h-6 rounded flex items-center justify-center border ${logForm.workoutCompleted ? 'bg-green-500 border-green-500' : 'bg-black/40 border-white/20'}`}>
                          {logForm.workoutCompleted && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={logForm.workoutCompleted}
                          onChange={(e) => setLogForm({ ...logForm, workoutCompleted: e.target.checked })}
                          className="hidden"
                          data-testid="input-log-workout"
                        />
                        <span className="text-white font-medium">Completed Workout</span>
                      </label>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <FitnessButton size="sm" variant="ghost" onClick={() => setShowLogForm(false)} fullWidth data-testid="button-cancel-log">
                        Cancel
                      </FitnessButton>
                      <FitnessButton size="sm" onClick={handleSubmitLog} className="btn-shimmer" fullWidth data-testid="button-save-log">
                        Save Log
                      </FitnessButton>
                    </div>
                  </motion.div>
                ) : todayLog ? (
                  <motion.div
                    key="log"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-3 text-gray-400">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                          <Scale className="w-4 h-4 text-orange-400" />
                        </div>
                        Weight
                      </div>
                      <span className="text-white font-semibold text-lg">{todayLog.weight} kg</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-3 text-gray-400">
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                          <Flame className="w-4 h-4 text-red-400" />
                        </div>
                        Calories
                      </div>
                      <span className="text-white font-semibold text-lg">{todayLog.caloriesConsumed}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-3 text-gray-400">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Droplets className="w-4 h-4 text-blue-400" />
                        </div>
                        Water
                      </div>
                      <span className="text-white font-semibold text-lg">{todayLog.waterIntake}L</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-3 text-gray-400">
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-400" />
                        </div>
                        Workout
                      </div>
                      <span className={`font-semibold ${todayLog.workoutCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                        {todayLog.workoutCompleted ? 'Completed' : 'Not yet'}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                      <Moon className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-300 font-medium mb-1">No log for today</p>
                    <p className="text-gray-500 text-sm">Click Add Log to track your daily progress</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </FitnessCard>
          </ScrollReveal>
        </div>

        {dailyLogs.length > 0 && (
          <ScrollReveal delay={0.4}>
            <FitnessCard variant="animated" className="relative z-10 overflow-hidden">
              <h2 className="text-xl font-bold text-white mb-6">Recent Logs History</h2>
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 text-sm">
                      <th className="text-left text-gray-400 py-4 px-4 font-medium uppercase tracking-wider">Date</th>
                      <th className="text-left text-gray-400 py-4 px-4 font-medium uppercase tracking-wider">Weight</th>
                      <th className="text-left text-gray-400 py-4 px-4 font-medium uppercase tracking-wider">Calories</th>
                      <th className="text-left text-gray-400 py-4 px-4 font-medium uppercase tracking-wider">Water</th>
                      <th className="text-left text-gray-400 py-4 px-4 font-medium uppercase tracking-wider">Workout</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {dailyLogs.slice(-7).reverse().map((log, index) => (
                      <motion.tr 
                        key={log.id} 
                        className="hover:bg-white/5 transition-colors group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        data-testid={`row-log-${log.id}`}
                      >
                        <td className="py-4 px-4 text-white font-medium">
                          {new Date(log.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-4 text-white">
                          <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-gray-500 group-hover:text-orange-400 transition-colors" />
                            {log.weight} kg
                          </div>
                        </td>
                        <td className="py-4 px-4 text-white">
                          <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors" />
                            {log.caloriesConsumed}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-white">
                          <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                            {log.waterIntake}L
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            log.workoutCompleted 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}>
                            {log.workoutCompleted ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            {log.workoutCompleted ? 'Done' : 'Missed'}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FitnessCard>
          </ScrollReveal>
        )}
      </div>
    </Layout>
  );
}
