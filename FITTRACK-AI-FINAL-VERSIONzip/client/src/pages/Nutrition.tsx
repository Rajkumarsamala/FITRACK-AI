import { useState } from 'react';
import { useLocation } from 'wouter';
import { Utensils, Flame, Clock, ChevronDown, ChevronUp, Apple, Beef, Wheat, Zap, ArrowRight } from 'lucide-react';
import { Layout } from '../components/fitness/Layout';
import { FitnessCard } from '../components/fitness/FitnessCard';
import { GoalToggle } from '../components/fitness/GoalToggle';
import { BackLink } from '../components/fitness/BackLink';
import { FitnessButton } from '../components/fitness/FitnessButton';
import { useGoal } from '../contexts/GoalContext';
import { useUser } from '../contexts/UserContext';
import { calculateBMR, calculateTDEE, calculateGoalCalories, calculateMacros } from '../lib/calculator';
import { generateMealPlan } from '../data/meals';
import { Link } from 'wouter';

export function Nutrition() {
  const [, setLocation] = useLocation();
  const { currentGoal } = useGoal();
  const { profile, isCurrentGoalOnboarded } = useUser();
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  if (!isCurrentGoalOnboarded || !profile) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
            <Zap className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Setup Required</h1>
          <p className="text-gray-400 max-w-md mb-8">
            Complete your profile to get personalized nutrition plans.
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

  const bmr = calculateBMR(profile.currentWeight, profile.height, profile.age, profile.gender);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const goalCalories = calculateGoalCalories(tdee, currentGoal);
  const macros = calculateMacros(goalCalories, currentGoal, profile.currentWeight);
  const mealPlan = generateMealPlan(currentGoal, goalCalories, macros.protein, macros.carbs, macros.fats);

  const isGaining = currentGoal === 'gain-weight';

  return (
    <Layout>
      <header className="page-header mb-12">
        <BackLink />
        <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-page-title text-white mb-1" data-testid="text-nutrition-title">Nutrition Plan</h1>
            <p className="text-body text-gray-400">
              {isGaining ? 'Calorie surplus plan for healthy weight gain' : 'Calorie deficit plan for effective weight loss'}
            </p>
          </div>
          <GoalToggle />
        </div>
      </header>

      <div className="grid md:grid-cols-4 gap-6 lg:gap-8 mb-12">
        <FitnessCard className={`text-center ${isGaining ? 'border-t-4 border-t-green-500' : 'border-t-4 border-t-orange-500'}`}>
          <Flame className={`w-8 h-8 mx-auto mb-2 ${isGaining ? 'text-green-400' : 'text-orange-400'}`} />
          <div className="text-3xl font-bold text-white" data-testid="text-calories">{goalCalories}</div>
          <div className="text-gray-400">Daily Calories</div>
        </FitnessCard>
        <FitnessCard className="text-center border-t-4 border-t-blue-500">
          <Beef className="w-8 h-8 mx-auto mb-2 text-blue-400" />
          <div className="text-3xl font-bold text-white" data-testid="text-protein">{macros.protein}g</div>
          <div className="text-gray-400">Protein</div>
        </FitnessCard>
        <FitnessCard className="text-center border-t-4 border-t-yellow-500">
          <Wheat className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
          <div className="text-3xl font-bold text-white" data-testid="text-carbs">{macros.carbs}g</div>
          <div className="text-gray-400">Carbs</div>
        </FitnessCard>
        <FitnessCard className="text-center border-t-4 border-t-pink-500">
          <Apple className="w-8 h-8 mx-auto mb-2 text-pink-400" />
          <div className="text-3xl font-bold text-white" data-testid="text-fats">{macros.fats}g</div>
          <div className="text-gray-400">Fats</div>
        </FitnessCard>
      </div>

      <div className="mb-8">
        <h2 className="text-section-title text-white mb-6 flex items-center gap-3">
          <Utensils className="w-5 h-5 text-purple-400" />
          Today's Meal Plan
        </h2>
        
        <div className="space-y-6 lg:space-y-8">
          {mealPlan.meals.map((meal) => {
            const isExpanded = expandedMeal === meal.id;
            return (
              <FitnessCard key={meal.id} className="overflow-hidden" data-testid={`card-meal-${meal.id}`}>
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-card-title text-white">{meal.name}</h3>
                      <div className="flex items-center gap-2 text-gray-400 text-label">
                        <Clock className="w-4 h-4" />
                        <span>{meal.time}</span>
                        <span className="text-purple-400">-</span>
                        <span>{meal.calories} cal</span>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="space-y-3">
                      {meal.foods.map((food, index) => (
                        <div key={index} className="flex items-center justify-between py-2 px-4 bg-white/5 rounded-lg">
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
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-sm">
                      <span className="text-gray-400">Meal Total</span>
                      <span className="text-white font-bold">{meal.calories} calories</span>
                    </div>
                  </div>
                )}
              </FitnessCard>
            );
          })}
        </div>
      </div>

      <FitnessCard className={`${isGaining ? 'bg-green-500/10 border border-green-500/30' : 'bg-orange-500/10 border border-orange-500/30'}`}>
        <h3 className="text-lg font-bold text-white mb-2">
          {isGaining ? 'Weight Gain Tips' : 'Weight Loss Tips'}
        </h3>
        <ul className="space-y-2 text-gray-300">
          {isGaining ? (
            <>
              <li>- Eat calorie-dense foods like nuts, avocados, and whole grains</li>
              <li>- Have a protein shake with meals to boost calorie intake</li>
              <li>- Eat 5-6 smaller meals if large portions are difficult</li>
              <li>- Add healthy fats like olive oil to your dishes</li>
            </>
          ) : (
            <>
              <li>- Drink water before meals to reduce appetite</li>
              <li>- Fill half your plate with vegetables</li>
              <li>- Avoid liquid calories like sodas and juices</li>
              <li>- Practice mindful eating - eat slowly and enjoy your food</li>
            </>
          )}
        </ul>
      </FitnessCard>
    </Layout>
  );
}
