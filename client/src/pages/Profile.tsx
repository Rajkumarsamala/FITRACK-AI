import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { User, Scale, Ruler, Activity, Target, Save, LogOut, Trash2, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Layout } from '../components/fitness/Layout';
import { FitnessCard } from '../components/fitness/FitnessCard';
import { GoalToggle } from '../components/fitness/GoalToggle';
import { FitnessButton } from '../components/fitness/FitnessButton';
import { GlowOrb } from '../components/fitness/AnimatedBackground';
import { ScrollReveal, FadeIn } from '../components/fitness/ScrollReveal';
import { useGoal } from '../contexts/GoalContext';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../hooks/useAuth';
import { calculateBMI, getBMICategory, calculateBMR, calculateTDEE } from '../lib/calculator';
import type { ActivityLevel } from '../types';

const activityLevels: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Lightly Active' },
  { value: 'moderate', label: 'Moderately Active' },
  { value: 'active', label: 'Active' },
  { value: 'very-active', label: 'Very Active' },
];

export function Profile() {
  const [, setLocation] = useLocation();
  const { currentGoal } = useGoal();
  const { profile, updateProfile, metrics, isCurrentGoalOnboarded } = useUser();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    age: profile?.age?.toString() || '',
    height: profile?.height?.toString() || '',
    currentWeight: profile?.currentWeight?.toString() || '',
    targetWeight: profile?.targetWeight?.toString() || '',
    activityLevel: profile?.activityLevel || 'moderate',
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
              Complete your profile to view and edit your information.
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

  const bmi = calculateBMI(profile.currentWeight, profile.height);
  const bmiCategory = getBMICategory(bmi);
  const bmr = calculateBMR(profile.currentWeight, profile.height, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activityLevel);

  const isGaining = currentGoal === 'gain-weight';

  const handleSave = () => {
    updateProfile({
      name: formData.name,
      age: parseInt(formData.age),
      height: parseFloat(formData.height),
      currentWeight: parseFloat(formData.currentWeight),
      targetWeight: parseFloat(formData.targetWeight),
      activityLevel: formData.activityLevel as ActivityLevel,
    });
    setIsEditing(false);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      localStorage.clear();
      setLocation('/');
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    await logout.mutateAsync();
  };

  return (
    <Layout>
      <div className="relative">
        <GlowOrb color="purple" position="top-right" size="lg" />
        <GlowOrb color={isGaining ? "green" : "orange"} position="bottom-left" size="md" />

        <FadeIn duration={0.6}>
          <header className="page-header mb-12 relative z-10">
            <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-page-title text-white mb-1" data-testid="text-profile-title">Your Profile</h1>
                <p className="text-body text-gray-400">Manage your personal information and settings</p>
              </div>
              <GoalToggle />
            </div>
          </header>
        </FadeIn>

        <div className="grid lg:grid-cols-3 gap-8 mb-12 relative z-10">
          <ScrollReveal className="lg:col-span-2">
            <FitnessCard variant="animated" className="h-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-section-title text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-400" />
                  </div>
                  Personal Information
                </h2>
                {!isEditing ? (
                  <FitnessButton size="sm" variant="outline" onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
                    Edit
                  </FitnessButton>
                ) : (
                  <div className="flex gap-2">
                    <FitnessButton size="sm" variant="ghost" onClick={() => setIsEditing(false)} data-testid="button-cancel-edit">
                      Cancel
                    </FitnessButton>
                    <FitnessButton size="sm" className="btn-shimmer" onClick={handleSave} data-testid="button-save-profile">
                      <Save className="w-4 h-4" />
                      Save
                    </FitnessButton>
                  </div>
                )}
              </div>

              {isEditing ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid md:grid-cols-2 gap-6 lg:gap-8 bg-white/5 p-6 rounded-2xl border border-white/10 saas-glass"
                >
                  <div>
                    <label className="block text-label text-gray-400 mb-2 font-medium">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      data-testid="input-edit-name"
                    />
                  </div>
                  <div>
                    <label className="block text-label text-gray-400 mb-2 font-medium">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      data-testid="input-edit-age"
                    />
                  </div>
                  <div>
                    <label className="block text-label text-gray-400 mb-2 font-medium">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      data-testid="input-edit-height"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Current Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.currentWeight}
                      onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      data-testid="input-edit-current-weight"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Target Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.targetWeight}
                      onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      data-testid="input-edit-target-weight"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Activity Level</label>
                    <select
                      value={formData.activityLevel}
                      onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      data-testid="select-edit-activity"
                    >
                      {activityLevels.map((level) => (
                        <option key={level.value} value={level.value} className="bg-[#1a1a1f]">
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid md:grid-cols-2 gap-6"
                >
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Name</div>
                      <div className="text-white font-semibold">{profile.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Ruler className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Height</div>
                      <div className="text-white font-semibold">{profile.height} cm</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <Scale className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Current Weight</div>
                      <div className="text-white font-semibold">{profile.currentWeight} kg</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className={`w-12 h-12 rounded-xl ${isGaining ? 'bg-green-500/20' : 'bg-orange-500/20'} flex items-center justify-center`}>
                      <Target className={`w-6 h-6 ${isGaining ? 'text-green-400' : 'text-orange-400'}`} />
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Target Weight</div>
                      <div className={`font-semibold ${isGaining ? 'text-green-400' : 'text-orange-400'}`}>
                        {profile.targetWeight} kg
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-pink-400" />
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Activity Level</div>
                      <div className="text-white font-semibold capitalize">{profile.activityLevel.replace('-', ' ')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Age & Gender</div>
                      <div className="text-white font-semibold">{profile.age} years, {profile.gender}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </FitnessCard>
          </ScrollReveal>

          <ScrollReveal delay={0.2} className="space-y-6">
            <FitnessCard variant="animated">
              <h3 className="text-lg font-bold text-white mb-4">Body Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-gray-400">BMI</span>
                  <div className="text-right">
                    <span className="text-white font-bold">{bmi}</span>
                    <span className={`ml-2 text-sm ${
                      bmiCategory === 'Normal' ? 'text-green-400' :
                      bmiCategory === 'Underweight' ? 'text-yellow-400' :
                      'text-orange-400'
                    }`}>
                      ({bmiCategory})
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-gray-400">BMR</span>
                  <span className="text-white font-bold">{bmr} cal/day</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-gray-400">TDEE</span>
                  <span className="text-white font-bold">{tdee} cal/day</span>
                </div>
              </div>
            </FitnessCard>

            <FitnessCard variant="animated">
              <h3 className="text-lg font-bold text-white mb-4">Journey Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-gray-400">Workouts Done</span>
                  <span className="text-white font-bold">{metrics?.workoutsCompleted || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-gray-400">Current Streak</span>
                  <span className="text-white font-bold">{metrics?.streak || 0} days</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-purple-400 font-bold">{Math.round(metrics?.percentageComplete || 0)}%</span>
                </div>
              </div>
            </FitnessCard>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.3}>
          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            <FitnessCard variant="animated" className="border-t-4 border-t-purple-500">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-purple-400" />
                </div>
                Account
              </h3>
              <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-white/5 border border-white/5">
                {user?.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  {(user?.firstName || user?.lastName) && (
                    <div className="text-white font-medium">
                      {user?.firstName} {user?.lastName}
                    </div>
                  )}
                  {user?.email && (
                    <div className="text-gray-400 text-sm">{user.email}</div>
                  )}
                </div>
              </div>
              
              <FitnessButton 
                variant="outline" 
                onClick={handleLogout}
                disabled={logout.isPending}
                className="w-full hover:bg-white/10"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
                {logout.isPending ? "Signing out..." : "Sign Out"}
              </FitnessButton>
            </FitnessCard>

            <FitnessCard variant="animated" className="border border-red-500/30 bg-red-500/5">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </div>
                Danger Zone
              </h3>
              <p className="text-gray-400 mb-6 text-sm">Reset all your data and start fresh. This action cannot be undone and will clear all progress metrics.</p>
              <FitnessButton 
                variant="outline" 
                onClick={handleReset} 
                className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-500"
                data-testid="button-reset-data"
              >
                <Trash2 className="w-4 h-4" />
                Reset All Data
              </FitnessButton>
            </FitnessCard>
          </div>
        </ScrollReveal>
      </div>
    </Layout>
  );
}
