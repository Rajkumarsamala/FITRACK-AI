import { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  User, 
  Scale, 
  Ruler, 
  Activity, 
  Zap,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { useGoal } from '../contexts/GoalContext';
import { useUser } from '../contexts/UserContext';
import { GoalToggle } from '../components/fitness/GoalToggle';
import { FitnessButton } from '../components/fitness/FitnessButton';
import { Navigation } from '../components/fitness/Navigation';
import { calculateBMI, getBMICategory, calculateBMR, calculateTDEE, getIdealWeightRange } from '../lib/calculator';
import type { ActivityLevel, UserProfile } from '../types';

interface FormData {
  name: string;
  age: string;
  gender: 'male' | 'female';
  height: string;
  currentWeight: string;
  targetWeight: string;
  activityLevel: ActivityLevel;
}

const activityLevels: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise, desk job' },
  { value: 'light', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  { value: 'active', label: 'Active', description: 'Hard exercise 6-7 days/week' },
  { value: 'very-active', label: 'Very Active', description: 'Very hard exercise, physical job' },
];

const tips = [
  { icon: '🎯', text: 'Set realistic goals - aim for 0.5-1kg change per week' },
  { icon: '💧', text: 'Stay hydrated - drink at least 2L of water daily' },
  { icon: '😴', text: 'Quality sleep (7-9 hours) is crucial for results' },
  { icon: '📊', text: 'Track your progress consistently for best results' },
];

export function Onboarding() {
  const [, setLocation] = useLocation();
  const { currentGoal } = useGoal();
  const { setProfile } = useUser();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    gender: 'male',
    height: '',
    currentWeight: '',
    targetWeight: '',
    activityLevel: 'moderate',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const isGaining = currentGoal === 'gain-weight';

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age || parseInt(formData.age) < 13 || parseInt(formData.age) > 100) {
      newErrors.age = 'Enter a valid age (13-100)';
    }
    if (!formData.height || parseFloat(formData.height) < 100 || parseFloat(formData.height) > 250) {
      newErrors.height = 'Enter valid height (100-250 cm)';
    }
    if (!formData.currentWeight || parseFloat(formData.currentWeight) < 30 || parseFloat(formData.currentWeight) > 300) {
      newErrors.currentWeight = 'Enter valid weight (30-300 kg)';
    }
    if (!formData.targetWeight || parseFloat(formData.targetWeight) < 30 || parseFloat(formData.targetWeight) > 300) {
      newErrors.targetWeight = 'Enter valid target (30-300 kg)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      name: formData.name,
      email: '',
      age: parseInt(formData.age),
      gender: formData.gender,
      height: parseFloat(formData.height),
      currentWeight: parseFloat(formData.currentWeight),
      targetWeight: parseFloat(formData.targetWeight),
      activityLevel: formData.activityLevel,
      goal: currentGoal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProfile(profile);
    setLocation('/dashboard');
  };

  const previewBMI = formData.height && formData.currentWeight
    ? calculateBMI(parseFloat(formData.currentWeight), parseFloat(formData.height))
    : null;

  const previewBMR = formData.height && formData.currentWeight && formData.age && formData.gender
    ? calculateBMR(
        parseFloat(formData.currentWeight),
        parseFloat(formData.height),
        parseInt(formData.age),
        formData.gender
      )
    : null;

  const previewTDEE = previewBMR 
    ? calculateTDEE(previewBMR, formData.activityLevel)
    : null;

  const idealRange = formData.height && formData.gender
    ? getIdealWeightRange(parseFloat(formData.height), formData.gender)
    : null;

  return (
    <div className="min-h-screen fitness-app bg-[#0f0f14] py-8 lg:py-12">
      <div className="container-responsive">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">FitTrack AI</span>
          </div>
          <GoalToggle />
        </header>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4" data-testid="text-onboarding-title">
            {isGaining ? 'Build Your Stronger Self' : 'Start Your Weight Loss Journey'}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Tell us about yourself so we can create your personalized {isGaining ? 'muscle-building' : 'fat-burning'} plan
          </p>
        </div>

        <div className="grid gap-8 lg:gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="glass rounded-2xl p-6 lg:p-8">
              <h2 className="text-section-title text-white mb-8 flex items-center gap-3">
                <User className="w-6 h-6 text-purple-400" />
                Your Information
              </h2>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-medium">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      className="fitness-input"
                      data-testid="input-name"
                    />
                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-medium">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="Your age"
                      className="fitness-input"
                      data-testid="input-age"
                    />
                    {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-medium">Gender</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'male' })}
                      className={`gender-btn ${formData.gender === 'male' ? 'active-male' : 'inactive'}`}
                      data-testid="button-gender-male"
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'female' })}
                      className={`gender-btn ${formData.gender === 'female' ? 'active-female' : 'inactive'}`}
                      data-testid="button-gender-female"
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-medium">
                      <Ruler className="inline w-4 h-4 mr-1" />
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder="e.g., 175"
                      className="fitness-input"
                      data-testid="input-height"
                    />
                    {errors.height && <p className="text-red-400 text-sm mt-1">{errors.height}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-medium">
                      <Scale className="inline w-4 h-4 mr-1" />
                      Current Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={formData.currentWeight}
                      onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                      placeholder="e.g., 75"
                      className="fitness-input"
                      data-testid="input-current-weight"
                    />
                    {errors.currentWeight && <p className="text-red-400 text-sm mt-1">{errors.currentWeight}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 font-medium">
                      <Scale className="inline w-4 h-4 mr-1" />
                      Target Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={formData.targetWeight}
                      onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                      placeholder="e.g., 70"
                      className="fitness-input"
                      data-testid="input-target-weight"
                    />
                    {errors.targetWeight && <p className="text-red-400 text-sm mt-1">{errors.targetWeight}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-3 font-medium">
                    <Activity className="inline w-4 h-4 mr-1" />
                    Activity Level
                  </label>
                  <div className="space-y-3">
                    {activityLevels.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, activityLevel: level.value })}
                        className={`activity-btn ${formData.activityLevel === level.value ? 'active' : ''}`}
                        data-testid={`button-activity-${level.value}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-white font-medium">{level.label}</span>
                            <p className="text-gray-500 text-sm">{level.description}</p>
                          </div>
                          {formData.activityLevel === level.value && (
                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <FitnessButton 
                  fullWidth 
                  size="lg" 
                  onClick={handleSubmit}
                  data-testid="button-create-profile"
                >
                  Create My Personalized Plan
                  <ArrowRight className="w-5 h-5" />
                </FitnessButton>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Profile Preview
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400">BMI</span>
                  <span className="text-white font-semibold">
                    {previewBMI ? (
                      <>
                        {previewBMI} <span className="text-sm text-gray-400">({getBMICategory(previewBMI)})</span>
                      </>
                    ) : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400">BMR</span>
                  <span className="text-white font-semibold">
                    {previewBMR ? `${previewBMR} cal/day` : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-gray-400">TDEE</span>
                  <span className="text-white font-semibold">
                    {previewTDEE ? `${previewTDEE} cal/day` : '--'}
                  </span>
                </div>
                {idealRange && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Ideal Range</span>
                    <span className="text-purple-400 font-semibold">
                      {idealRange.min}-{idealRange.max} kg
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Pro Tips
              </h3>
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-2xl">{tip.icon}</span>
                    <p className="text-gray-400 text-sm">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
