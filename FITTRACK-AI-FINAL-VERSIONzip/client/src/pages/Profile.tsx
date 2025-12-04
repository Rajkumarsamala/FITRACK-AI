import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { User, Scale, Ruler, Activity, Target, Save, LogOut, Trash2, Zap, ArrowRight } from 'lucide-react';
import { Layout } from '../components/fitness/Layout';
import { FitnessCard } from '../components/fitness/FitnessCard';
import { GoalToggle } from '../components/fitness/GoalToggle';
import { FitnessButton } from '../components/fitness/FitnessButton';
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
  const { user } = useAuth();
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
            <Zap className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Setup Required</h1>
          <p className="text-gray-400 max-w-md mb-8">
            Complete your profile to view and edit your information.
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

  return (
    <Layout>
      <header className="page-header mb-12">
        <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-page-title text-white mb-1" data-testid="text-profile-title">Your Profile</h1>
            <p className="text-body text-gray-400">Manage your personal information and settings</p>
          </div>
          <GoalToggle />
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <FitnessCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-section-title text-white flex items-center gap-3">
              <User className="w-5 h-5 text-purple-400" />
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
                <FitnessButton size="sm" onClick={handleSave} data-testid="button-save-profile">
                  <Save className="w-4 h-4" />
                  Save
                </FitnessButton>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              <div>
                <label className="block text-label text-gray-400 mb-3 font-medium">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="fitness-input"
                  data-testid="input-edit-name"
                />
              </div>
              <div>
                <label className="block text-label text-gray-400 mb-3 font-medium">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="fitness-input"
                  data-testid="input-edit-age"
                />
              </div>
              <div>
                <label className="block text-label text-gray-400 mb-3 font-medium">Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="fitness-input"
                  data-testid="input-edit-height"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Current Weight (kg)</label>
                <input
                  type="number"
                  value={formData.currentWeight}
                  onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                  className="fitness-input"
                  data-testid="input-edit-current-weight"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Target Weight (kg)</label>
                <input
                  type="number"
                  value={formData.targetWeight}
                  onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                  className="fitness-input"
                  data-testid="input-edit-target-weight"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Activity Level</label>
                <select
                  value={formData.activityLevel}
                  onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })}
                  className="fitness-input"
                  data-testid="select-edit-activity"
                >
                  {activityLevels.map((level) => (
                    <option key={level.value} value={level.value} className="bg-[#1a1a1f]">
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Name</div>
                  <div className="text-white font-semibold">{profile.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Ruler className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Height</div>
                  <div className="text-white font-semibold">{profile.height} cm</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Scale className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Current Weight</div>
                  <div className="text-white font-semibold">{profile.currentWeight} kg</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
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
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Activity Level</div>
                  <div className="text-white font-semibold capitalize">{profile.activityLevel.replace('-', ' ')}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Age & Gender</div>
                  <div className="text-white font-semibold">{profile.age} years, {profile.gender}</div>
                </div>
              </div>
            </div>
          )}
        </FitnessCard>

        <div className="space-y-6">
          <FitnessCard>
            <h3 className="text-lg font-bold text-white mb-4">Body Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
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
              <div className="flex items-center justify-between">
                <span className="text-gray-400">BMR</span>
                <span className="text-white font-bold">{bmr} cal/day</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">TDEE</span>
                <span className="text-white font-bold">{tdee} cal/day</span>
              </div>
            </div>
          </FitnessCard>

          <FitnessCard>
            <h3 className="text-lg font-bold text-white mb-4">Journey Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Workouts Completed</span>
                <span className="text-white font-bold">{metrics?.workoutsCompleted || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Current Streak</span>
                <span className="text-white font-bold">{metrics?.streak || 0} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Progress</span>
                <span className="text-purple-400 font-bold">{Math.round(metrics?.percentageComplete || 0)}%</span>
              </div>
            </div>
          </FitnessCard>
        </div>
      </div>

      <FitnessCard className="mb-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-400" />
          Account
        </h3>
        <div className="flex items-center gap-4 mb-4">
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
        <a href="/api/logout">
          <FitnessButton variant="outline" data-testid="button-logout">
            <LogOut className="w-4 h-4" />
            Sign Out
          </FitnessButton>
        </a>
      </FitnessCard>

      <FitnessCard className="border border-red-500/30 bg-red-500/5">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-400" />
          Danger Zone
        </h3>
        <p className="text-gray-400 mb-4">Reset all your data and start fresh. This action cannot be undone.</p>
        <FitnessButton 
          variant="outline" 
          onClick={handleReset} 
          className="border-red-500 text-red-400 hover:bg-red-500/10"
          data-testid="button-reset-data"
        >
          <Trash2 className="w-4 h-4" />
          Reset All Data
        </FitnessButton>
      </FitnessCard>
    </Layout>
  );
}
