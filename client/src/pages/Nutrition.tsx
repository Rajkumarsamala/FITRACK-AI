import { useState } from 'react';
import { Link } from 'wouter';
import { Flame, Droplets, Check, Utensils, ShoppingCart, Beef, Apple, Zap, ArrowRight, Clock, ChevronDown, ChevronUp, Wheat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/fitness/Layout';
import { FitnessCard, StatCard } from '../components/fitness/FitnessCard';
import { GoalToggle } from '../components/fitness/GoalToggle';
import { FitnessButton } from '../components/fitness/FitnessButton';
import { GlowOrb } from '../components/fitness/AnimatedBackground';
import { ScrollReveal, FadeIn } from '../components/fitness/ScrollReveal';
import { useGoal } from '../contexts/GoalContext';
import { useUser } from '../contexts/UserContext';
import { calculateBMR, calculateTDEE, calculateGoalCalories, calculateMacros } from '../lib/calculator';
import { generateMealPlan } from '../data/meals';

export function Nutrition() {
  const { currentGoal } = useGoal();
  const { profile, dailyLogs, isCurrentGoalOnboarded } = useUser();
  const [activeTab, setActiveTab] = useState<'meals' | 'groceries'>('meals');
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  
  if (!isCurrentGoalOnboarded || !profile) {
    return (
      <Layout>
        <div className="relative">
          <GlowOrb color="green" position="center" size="xl" />
          <motion.div 
            className="flex flex-col items-center justify-center min-h-[60vh] text-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-700/20 border border-green-500/30 flex items-center justify-center mb-6 saas-glass">
              <Apple className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Setup Required</h1>
            <p className="text-gray-400 max-w-md mb-8">
              Complete your profile to view personalized nutrition recommendations.
            </p>
            <Link href="/onboarding">
              <FitnessButton size="lg" className="btn-shimmer shadow-lg shadow-green-500/20" data-testid="button-setup-profile">
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
  const bmr = calculateBMR(profile.currentWeight, profile.height, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const goalCalories = calculateGoalCalories(tdee, currentGoal);
  const macros = calculateMacros(goalCalories, currentGoal, profile.currentWeight);
  const mealPlan = generateMealPlan(currentGoal, goalCalories, macros.protein, macros.carbs, macros.fats);
  
  const today = new Date().toISOString().split('T')[0];
  const todayLog = dailyLogs.find(log => log.date === today);
  const caloriesConsumed = todayLog?.caloriesConsumed || 0;
  
  const calPercent = Math.min(Math.round((caloriesConsumed / goalCalories) * 100), 100);

  const groceries = [
    { category: 'Proteins', items: ['Chicken Breast', 'Eggs', 'Greek Yogurt', 'Whey Protein'] },
    { category: 'Carbs', items: ['Oats', 'Jasmine Rice', 'Sweet Potatoes', 'Bananas'] },
    { category: 'Fats', items: ['Almonds', 'Peanut Butter', 'Olive Oil', 'Avocado'] },
    { category: 'Vegetables', items: ['Broccoli', 'Spinach', 'Bell Peppers', 'Asparagus'] },
  ];

  return (
    <Layout>
      <div className="relative">
        <GlowOrb color={isGaining ? "green" : "orange"} position="top-right" size="lg" />
        <GlowOrb color="blue" position="bottom-left" size="md" />

        <FadeIn duration={0.6}>
          <header className="page-header mb-12 relative z-10">
            <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-page-title text-white mb-1" data-testid="text-nutrition-title">Nutrition Plan</h1>
                <p className="text-body text-gray-400">Your personalized macros and meal recommendations</p>
              </div>
              <GoalToggle />
            </div>
          </header>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12 relative z-10">
          <StatCard
            title="Target Calories"
            value={goalCalories}
            subtitle={`${isGaining ? 'Surplus' : 'Deficit'} for goal`}
            icon={<Flame className="w-6 h-6 text-white" />}
            color={isGaining ? 'green' : 'orange'}
            delay={0}
          />
          <StatCard
            title="Protein Target"
            value={`${macros.protein}g`}
            subtitle={`${Math.round((macros.protein*4/goalCalories)*100)}% of calories`}
            icon={<Beef className="w-6 h-6 text-white" />}
            color="blue"
            delay={0.1}
          />
          <StatCard
            title="Carbs Target"
            value={`${macros.carbs}g`}
            subtitle={`${Math.round((macros.carbs*4/goalCalories)*100)}% of calories`}
            icon={<Wheat className="w-6 h-6 text-white" />}
            color="yellow"
            delay={0.2}
          />
          <StatCard
            title="Fat Target"
            value={`${macros.fats}g`}
            subtitle={`${Math.round((macros.fats*9/goalCalories)*100)}% of calories`}
            icon={<Droplets className="w-6 h-6 text-white" />}
            color="pink"
            delay={0.3}
          />
        </div>

        <ScrollReveal delay={0.2}>
          <FitnessCard variant="animated" className="mb-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                Today's Calories
              </h2>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  {caloriesConsumed} <span className="text-lg text-gray-400 font-normal">/ {goalCalories} kcal</span>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-black/40 h-6 rounded-full overflow-hidden border border-white/10 p-0.5">
              <motion.div 
                className={`h-full rounded-full ${
                  calPercent > 100 
                    ? 'bg-red-500' 
                    : isGaining 
                      ? 'bg-gradient-to-r from-green-600 to-green-400' 
                      : 'bg-gradient-to-r from-orange-600 to-orange-400'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${calPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-gray-400 font-medium">{calPercent}% of daily goal</span>
              <span className={calPercent > 100 ? 'text-red-400 font-medium' : 'text-gray-400'}>
                {Math.abs(goalCalories - caloriesConsumed)} kcal {calPercent > 100 ? 'over' : 'remaining'}
              </span>
            </div>
          </FitnessCard>
        </ScrollReveal>

        <div className="flex gap-4 mb-8 relative z-10">
          <FitnessButton
            variant={activeTab === 'meals' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('meals')}
            className={`flex-1 md:flex-none ${activeTab === 'meals' ? 'btn-shimmer' : 'hover:bg-white/5'}`}
          >
            <Utensils className="w-4 h-4" />
            Meal Plan
          </FitnessButton>
          <FitnessButton
            variant={activeTab === 'groceries' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('groceries')}
            className={`flex-1 md:flex-none ${activeTab === 'groceries' ? 'btn-shimmer' : 'hover:bg-white/5'}`}
          >
            <ShoppingCart className="w-4 h-4" />
            Grocery List
          </FitnessButton>
        </div>

        <div className="relative z-10 min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'meals' && (
              <motion.div
                key="meals"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {mealPlan.meals.map((meal, index) => {
                  const isExpanded = expandedMeal === meal.id;
                  return (
                    <motion.div 
                      key={meal.id} 
                      className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all rounded-2xl saas-glass overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div
                        className="flex flex-col md:flex-row md:items-center justify-between p-5 cursor-pointer"
                        onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}
                      >
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                            <Utensils className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <div className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {meal.time}
                            </div>
                            <div className="text-lg text-white font-semibold">{meal.name}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm bg-black/20 p-3 rounded-xl border border-white/5 shrink-0 relative pr-12">
                          <div className="flex flex-col items-center">
                            <span className="text-gray-400 mb-1">Calories</span>
                            <span className="text-white font-bold">{meal.calories}</span>
                          </div>
                          <div className="w-px h-8 bg-white/10"></div>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-400 mb-1">P</span>
                            <span className="text-blue-400 font-bold">{Math.round(meal.foods.reduce((acc, f) => acc + f.protein, 0))}g</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-400 mb-1">C</span>
                            <span className="text-yellow-400 font-bold">{Math.round(meal.foods.reduce((acc, f) => acc + f.carbs, 0))}g</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-gray-400 mb-1">F</span>
                            <span className="text-pink-400 font-bold">{Math.round(meal.foods.reduce((acc, f) => acc + f.fats, 0))}g</span>
                          </div>

                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-5 pb-5 overflow-hidden"
                          >
                            <div className="pt-4 border-t border-white/10 space-y-3">
                              {meal.foods.map((food, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2 px-4 bg-black/20 rounded-xl border border-white/5">
                                  <div>
                                    <div className="text-white font-medium">{food.name}</div>
                                    <div className="text-gray-400 text-sm">{food.portion}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-white font-medium">{food.calories} cal</div>
                                    <div className="text-gray-400 text-xs">
                                      P: {food.protein}g | C: {food.carbs}g | F: {food.fats}g
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === 'groceries' && (
              <motion.div
                key="groceries"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {groceries.map((group, i) => (
                  <motion.div 
                    key={group.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <FitnessCard variant="animated" className="h-full border-t-4 border-t-purple-500/50">
                      <h3 className="text-lg font-bold text-white mb-4 pb-4 border-b border-white/10">
                        {group.category}
                      </h3>
                      <ul className="space-y-3">
                        {group.items.map((item, j) => (
                          <motion.li 
                            key={j} 
                            className="flex items-center gap-3 text-gray-300 group cursor-pointer"
                            whileHover={{ x: 5 }}
                          >
                            <div className="w-5 h-5 rounded border border-white/20 flex items-center justify-center group-hover:border-purple-500/50 transition-colors bg-black/20">
                              <Check className="w-3 h-3 text-transparent group-hover:text-purple-400 transition-colors" />
                            </div>
                            <span className="group-hover:text-white transition-colors">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </FitnessCard>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
