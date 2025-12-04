import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Dumbbell, 
  Target, 
  Utensils, 
  LineChart, 
  Lightbulb,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Zap,
  Sparkles
} from 'lucide-react';
import { Layout } from '../components/fitness/Layout';
import { FitnessCard, StatCard } from '../components/fitness/FitnessCard';
import { GoalToggle } from '../components/fitness/GoalToggle';
import { ProgressRing } from '../components/fitness/ProgressRing';
import { FitnessButton } from '../components/fitness/FitnessButton';
import { useGoal } from '../contexts/GoalContext';
import { useUser } from '../contexts/UserContext';
import { calculateBMR, calculateTDEE, calculateGoalCalories, calculateMacros, calculateWeeksToGoal } from '../lib/calculator';
import { getRandomTip } from '../data/tips';
import { GlowOrb } from '../components/fitness/AnimatedBackground';
import { ScrollReveal, FadeIn } from '../components/fitness/ScrollReveal';

export function Dashboard() {
  const [, setLocation] = useLocation();
  const { currentGoal } = useGoal();
  const { profile, metrics, isCurrentGoalOnboarded } = useUser();

  if (!isCurrentGoalOnboarded || !profile) {
    return (
      <Layout>
        <div className="relative">
          <GlowOrb color="purple" position="center" size="xl" />
          <motion.div 
            className="flex flex-col items-center justify-center min-h-[60vh] text-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-6 shadow-xl shadow-purple-500/30"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <Zap className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h1 
              className="text-3xl lg:text-4xl font-bold text-white mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Welcome to FitTrack AI
            </motion.h1>
            <motion.p 
              className="text-gray-400 max-w-md mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Complete your profile setup to get personalized nutrition plans, workouts, and AI-powered tips.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/onboarding">
                <FitnessButton size="lg" className="btn-shimmer shadow-xl shadow-purple-500/25" data-testid="button-setup-profile">
                  Setup Your Profile
                  <ArrowRight className="w-5 h-5" />
                </FitnessButton>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  const isGaining = currentGoal === 'gain-weight';
  const bmr = calculateBMR(profile.currentWeight, profile.height, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const goalCalories = calculateGoalCalories(tdee, currentGoal);
  const macros = calculateMacros(goalCalories, currentGoal, profile.currentWeight);
  const weeksToGoal = calculateWeeksToGoal(profile.currentWeight, profile.targetWeight);
  const randomTip = getRandomTip(currentGoal);
  
  const weightProgress = metrics?.percentageComplete || 0;
  const weightChange = metrics?.weightChange || 0;
  const isPositiveProgress = isGaining ? weightChange > 0 : weightChange < 0;

  const quickLinks = [
    { path: '/nutrition', icon: Utensils, label: 'Nutrition Plan', color: 'purple' },
    { path: '/workouts', icon: Dumbbell, label: 'Workouts', color: isGaining ? 'green' : 'orange' },
    { path: '/progress', icon: LineChart, label: 'Track Progress', color: 'blue' },
    { path: '/tips', icon: Lightbulb, label: 'AI Tips', color: 'yellow' },
  ];

  return (
    <Layout>
      <FadeIn duration={0.6}>
        <header className="page-header mb-12">
          <div className="flex-1">
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGaining ? 'Muscle Building Mode' : 'Fat Burning Mode'}</span>
            </motion.div>
            <motion.h1 
              className="text-page-title text-white mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              data-testid="text-dashboard-title"
            >
              Welcome back, {profile.name.split(' ')[0]}!
            </motion.h1>
            <motion.p 
              className="text-body text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isGaining ? 'Building strength and gaining healthy weight' : 'On track to reach your weight loss goals'}
            </motion.p>
          </div>
          <GoalToggle />
        </header>
      </FadeIn>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
        <StatCard
          title="Daily Calories"
          value={goalCalories}
          subtitle={isGaining ? 'Surplus target' : 'Deficit target'}
          icon={<Flame className="w-6 h-6 text-white" />}
          color={isGaining ? 'green' : 'orange'}
          delay={0}
        />
        <StatCard
          title="Weight Goal"
          value={`${profile.targetWeight} kg`}
          subtitle={`${weeksToGoal} weeks estimated`}
          icon={<Target className="w-6 h-6 text-white" />}
          color="purple"
          delay={0.1}
        />
        <StatCard
          title="Weight Change"
          value={`${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`}
          subtitle={isPositiveProgress ? 'On track!' : 'Keep going!'}
          trend={isPositiveProgress ? 'up' : 'down'}
          icon={isPositiveProgress ? <TrendingUp className="w-6 h-6 text-white" /> : <TrendingDown className="w-6 h-6 text-white" />}
          color={isPositiveProgress ? 'green' : 'orange'}
          delay={0.2}
        />
        <StatCard
          title="Current Streak"
          value={metrics?.streak || 0}
          subtitle="days in a row"
          icon={<Zap className="w-6 h-6 text-white" />}
          color="blue"
          delay={0.3}
        />
      </div>

      <ScrollReveal delay={0.2}>
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <FitnessCard className="lg:col-span-2" variant="animated">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <h2 className="text-section-title text-white">Your Progress</h2>
              <Link href="/progress">
                <FitnessButton variant="outline" size="sm" className="btn-shimmer" data-testid="button-view-details">
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </FitnessButton>
              </Link>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-around gap-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <ProgressRing 
                  progress={weightProgress} 
                  size={180} 
                  strokeWidth={12}
                  color={isGaining ? '#22c55e' : '#f97316'}
                >
                  <div className="text-center">
                    <motion.div 
                      className="text-4xl font-bold text-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {Math.round(weightProgress)}%
                    </motion.div>
                    <div className="text-gray-400 text-sm">Complete</div>
                  </div>
                </ProgressRing>
              </motion.div>
              
              <div className="grid grid-cols-2 gap-6 lg:gap-8">
                {[
                  { label: 'Current', value: `${profile.currentWeight} kg`, color: 'text-white' },
                  { label: 'Target', value: `${profile.targetWeight} kg`, color: isGaining ? 'text-green-400' : 'text-orange-400' },
                  { label: 'Protein', value: `${macros.protein}g`, color: 'text-blue-400' },
                  { label: 'Carbs', value: `${macros.carbs}g`, color: 'text-yellow-400' },
                ].map((item, index) => (
                  <motion.div 
                    key={item.label}
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="text-gray-400 text-sm mb-1">{item.label}</div>
                    <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </FitnessCard>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <FitnessCard 
              className={`border-l-4 h-full ${isGaining ? 'border-l-green-500' : 'border-l-orange-500'}`}
              variant="animated"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div 
                  className={`w-10 h-10 rounded-xl ${isGaining ? 'bg-green-500/20' : 'bg-orange-500/20'} flex items-center justify-center`}
                  whileHover={{ rotate: 10 }}
                >
                  <Lightbulb className={`w-5 h-5 ${isGaining ? 'text-green-400' : 'text-orange-400'}`} />
                </motion.div>
                <span className="text-sm text-gray-400 font-medium">AI Tip of the Day</span>
              </div>
              <h3 className="text-card-title text-white mb-3">{randomTip.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{randomTip.content}</p>
              <Link href="/tips">
                <FitnessButton variant="ghost" size="sm" data-testid="button-more-tips">
                  More Tips
                  <ArrowRight className="w-4 h-4" />
                </FitnessButton>
              </Link>
            </FitnessCard>
          </motion.div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.3}>
        <h2 className="text-section-title text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {quickLinks.map((link, index) => {
            const colorClasses: Record<string, { gradient: string; glow: string }> = {
              purple: { gradient: 'from-purple-500 to-purple-700', glow: 'group-hover:shadow-purple-500/30' },
              orange: { gradient: 'from-orange-500 to-orange-700', glow: 'group-hover:shadow-orange-500/30' },
              green: { gradient: 'from-green-500 to-green-700', glow: 'group-hover:shadow-green-500/30' },
              blue: { gradient: 'from-blue-500 to-blue-700', glow: 'group-hover:shadow-blue-500/30' },
              yellow: { gradient: 'from-yellow-500 to-amber-600', glow: 'group-hover:shadow-yellow-500/30' },
            };
            
            const colorConfig = colorClasses[link.color] || colorClasses.purple;
            
            return (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              >
                <Link href={link.path}>
                  <FitnessCard 
                    className={`text-center group hover:scale-[1.02] transition-all duration-300 ${colorConfig.glow} hover:shadow-lg`}
                    onClick={() => setLocation(link.path)}
                    variant="animated"
                  >
                    <motion.div 
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorConfig.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <link.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <span className="text-white font-medium">{link.label}</span>
                  </FitnessCard>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </ScrollReveal>
    </Layout>
  );
}
