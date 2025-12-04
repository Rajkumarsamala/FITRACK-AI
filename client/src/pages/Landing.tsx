import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Target, 
  Utensils, 
  Dumbbell, 
  LineChart, 
  Lightbulb,
  Flame,
  ArrowRight,
  Check,
  Sparkles,
  LogIn
} from 'lucide-react';
import { useGoal } from '../contexts/GoalContext';
import { useAuth } from '../hooks/useAuth';
import { FitnessButton } from '../components/fitness/FitnessButton';
import { AnimatedBackground, GridPattern, GlowOrb } from '../components/fitness/AnimatedBackground';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/fitness/ScrollReveal';
import { Navigation } from '../components/fitness/Navigation';

const features = [
  {
    icon: Target,
    title: 'Dual Goal Support',
    description: 'Whether you want to lose weight or gain healthy mass, get personalized plans tailored to your specific goal.',
    color: 'from-purple-500 to-indigo-600',
  },
  {
    icon: Utensils,
    title: 'Smart Nutrition',
    description: 'AI-calculated calorie targets and macro breakdowns with complete daily meal plans designed for your body.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Dumbbell,
    title: 'Workout Programs',
    description: 'Goal-specific exercise routines from beginner to advanced, with detailed instructions and rest timers.',
    color: 'from-orange-500 to-red-600',
  },
  {
    icon: LineChart,
    title: 'Progress Tracking',
    description: 'Log your daily activities, track weight changes, and visualize your journey with intuitive charts.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: Lightbulb,
    title: 'AI-Powered Tips',
    description: 'Get personalized advice based on your goal, from nutrition hacks to workout optimization strategies.',
    color: 'from-yellow-500 to-amber-600',
  },
  {
    icon: Zap,
    title: 'Real-time Metrics',
    description: 'BMR, TDEE, and macro calculations that update automatically as you progress toward your goals.',
    color: 'from-violet-500 to-purple-600',
  },
];

const benefitsLose = [
  'Calorie deficit meal plans',
  'Fat-burning HIIT workouts',
  'Metabolism boosting tips',
  'Weekly progress tracking',
];

const benefitsGain = [
  'Calorie surplus meal plans',
  'Muscle-building routines',
  'Mass gain strategies',
  'Strength progress tracking',
];

export function Landing() {
  const { setGoal } = useGoal();
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen fitness-app bg-[#0f0f14] overflow-hidden pb-24">
      <div className="relative">
        <AnimatedBackground />
        <GridPattern />
        
        <div className="relative z-10">
          <motion.header 
            className="container-responsive py-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div 
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Zap className="w-6 h-6 text-white" />
                </motion.div>
                <span className="text-xl font-bold text-gradient-animated" data-testid="text-brand">FitTrack AI</span>
              </motion.div>
              <div className="flex items-center gap-3">
                {!isLoading && !isAuthenticated && (
                  <a href="/api/login">
                    <FitnessButton variant="primary" size="sm" className="btn-shimmer" data-testid="button-login">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </FitnessButton>
                  </a>
                )}
                {isAuthenticated && (
                  <Link href="/dashboard">
                    <FitnessButton variant="outline" size="sm" className="btn-shimmer" data-testid="button-go-to-dashboard">
                      Dashboard
                    </FitnessButton>
                  </Link>
                )}
              </div>
            </div>
          </motion.header>

          <section className="container-responsive py-16 lg:py-24 text-center relative">
            <GlowOrb color="purple" position="top-left" size="xl" />
            <GlowOrb color="blue" position="bottom-right" size="lg" />
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6 animate-float-subtle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>AI-Powered Fitness Platform</span>
              </motion.div>
              
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight text-glow" data-testid="text-hero-title">
                Transform Your Body with
                <motion.span 
                  className="block text-gradient-animated mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  AI-Powered Fitness
                </motion.span>
              </h1>
              <motion.p 
                className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                data-testid="text-hero-description"
              >
                Whether you want to lose weight or build muscle, get personalized nutrition plans, 
                workout routines, and smart tips tailored to your unique goals.
              </motion.p>
            </motion.div>
            
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Link href="/onboarding">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <FitnessButton size="lg" className="btn-shimmer animate-breathing-glow" data-testid="button-get-started">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </FitnessButton>
                </motion.div>
              </Link>
              <Link href="#features">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <FitnessButton variant="ghost" size="lg" data-testid="button-learn-more">
                    Learn More
                  </FitnessButton>
                </motion.div>
              </Link>
            </motion.div>
            
            <motion.div 
              className="mt-16 flex justify-center gap-8 text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Personalized plans</span>
              </div>
            </motion.div>
          </section>
        </div>
      </div>

      <section id="features" className="container-responsive py-16 lg:py-24 relative">
        <ScrollReveal>
          <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-gray-400 text-center max-w-xl mx-auto mb-16">
            A complete fitness ecosystem designed to help you reach your goals faster
          </p>
        </ScrollReveal>
        
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" staggerDelay={0.1}>
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <motion.div 
                className="card-animated p-6 lg:p-8 h-full flex flex-col interactive-card"
                whileHover={{ y: -5 }}
                data-testid={`card-feature-${index}`}
              >
                <div className="relative mb-5">
                  <motion.div 
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}
                    whileHover={{ rotate: 5, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 flex-1 leading-relaxed">{feature.description}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="container-responsive py-16 lg:py-24 relative">
        <ScrollReveal>
          <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-4">
            Choose Your Path
          </h2>
          <p className="text-gray-400 text-center max-w-xl mx-auto mb-16">
            Two distinct journeys, both powered by science and personalization
          </p>
        </ScrollReveal>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <ScrollReveal delay={0.1} direction="left">
            <Link href="/onboarding" onClick={() => setGoal('lose-weight')}>
              <motion.div 
                className="goal-card lose-weight h-full"
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
                data-testid="card-goal-lose-weight"
              >
                <div className="flex items-center gap-4 mb-6">
                  <motion.div 
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30"
                    whileHover={{ rotate: 10 }}
                  >
                    <Flame className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Lose Weight</h3>
                    <p className="text-orange-400 font-medium">& Get Fit</p>
                  </div>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Burn fat, build lean muscle, and achieve your ideal weight with personalized calorie deficit plans.
                </p>
                <ul className="space-y-3 flex-1">
                  {benefitsLose.map((benefit, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-center gap-3 text-gray-300"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-orange-400" />
                      </div>
                      <span>{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <span className="text-orange-400 font-medium flex items-center gap-2 group">
                    Start Your Journey
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </motion.div>
            </Link>
          </ScrollReveal>

          <ScrollReveal delay={0.2} direction="right">
            <Link href="/onboarding" onClick={() => setGoal('gain-weight')}>
              <motion.div 
                className="goal-card gain-weight h-full"
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
                data-testid="card-goal-gain-weight"
              >
                <div className="flex items-center gap-4 mb-6">
                  <motion.div 
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
                    whileHover={{ rotate: 10 }}
                  >
                    <Dumbbell className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Gain Weight</h3>
                    <p className="text-green-400 font-medium">& Build Muscle</p>
                  </div>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Build healthy mass, increase strength, and reach your weight goals with smart calorie surplus plans.
                </p>
                <ul className="space-y-3 flex-1">
                  {benefitsGain.map((benefit, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-center gap-3 text-gray-300"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      <span>{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <span className="text-green-400 font-medium flex items-center gap-2 group">
                    Start Your Journey
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </motion.div>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <section className="container-responsive py-16 lg:py-24">
        <ScrollReveal>
          <motion.div 
            className="relative text-center rounded-3xl p-8 lg:p-16 overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-purple-900/10 to-indigo-900/20 rounded-3xl" />
            <div className="absolute inset-0 card-animated rounded-3xl" />
            <GlowOrb color="purple" position="center" size="xl" />
            
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  Ready to Start Your Transformation?
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
                  Join thousands who have already transformed their bodies with our AI-powered fitness platform.
                </p>
                <Link href="/onboarding">
                  <motion.div 
                    className="inline-block"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FitnessButton size="lg" className="btn-shimmer shadow-xl shadow-purple-500/30" data-testid="button-cta-get-started">
                      Get Started Now
                      <ArrowRight className="w-5 h-5" />
                    </FitnessButton>
                  </motion.div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </ScrollReveal>
      </section>

      <footer className="container-responsive py-8 border-t border-purple-500/20 mb-8 relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        <motion.div 
          className="flex flex-col md:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 group">
            <motion.div
              className="p-1.5 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Zap className="w-4 h-4 text-purple-400" />
            </motion.div>
            <span className="text-gray-400 font-medium hover-underline">FitTrack AI</span>
          </div>
          <p className="text-gray-500 text-sm">
            Transform your body with science-backed fitness plans
          </p>
        </motion.div>
      </footer>
      
      <Navigation />
    </div>
  );
}
