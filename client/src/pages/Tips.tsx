import { useState } from 'react';
import { Link } from 'wouter';
import { Lightbulb, Utensils, Dumbbell, Heart, Brain, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { Layout } from '../components/fitness/Layout';
import { FitnessCard } from '../components/fitness/FitnessCard';
import { GoalToggle } from '../components/fitness/GoalToggle';
import { FitnessButton } from '../components/fitness/FitnessButton';
import { useGoal } from '../contexts/GoalContext';
import { useUser } from '../contexts/UserContext';
import { getTipsByGoal, getTipsByCategory, getRandomTip } from '../data/tips';
import type { AITip } from '../types';

const categories = [
  { id: 'all', label: 'All Tips', icon: Sparkles },
  { id: 'nutrition', label: 'Nutrition', icon: Utensils },
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'motivation', label: 'Motivation', icon: Heart },
  { id: 'lifestyle', label: 'Lifestyle', icon: Brain },
] as const;

export function Tips() {
  const { currentGoal } = useGoal();
  const { isCurrentGoalOnboarded } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [featuredTip, setFeaturedTip] = useState<AITip>(() => getRandomTip(currentGoal));

  if (!isCurrentGoalOnboarded) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
            <Zap className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Setup Required</h1>
          <p className="text-gray-400 max-w-md mb-8">
            Complete your profile to get personalized AI tips.
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

  const tips = selectedCategory === 'all'
    ? getTipsByGoal(currentGoal)
    : getTipsByCategory(currentGoal, selectedCategory as AITip['category']);

  const refreshFeaturedTip = () => {
    setFeaturedTip(getRandomTip(currentGoal));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'nutrition': return Utensils;
      case 'workout': return Dumbbell;
      case 'motivation': return Heart;
      case 'lifestyle': return Brain;
      default: return Lightbulb;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'nutrition': return 'text-green-400 bg-green-400/20';
      case 'workout': return 'text-blue-400 bg-blue-400/20';
      case 'motivation': return 'text-pink-400 bg-pink-400/20';
      case 'lifestyle': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-purple-400 bg-purple-400/20';
    }
  };

  return (
    <Layout>
      <header className="page-header mb-12">
        <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-page-title text-white mb-1" data-testid="text-tips-title">AI-Powered Tips</h1>
            <p className="text-body text-gray-400">
              {isGaining ? 'Smart advice for healthy weight gain' : 'Expert tips for effective weight loss'}
            </p>
          </div>
          <GoalToggle />
        </div>
      </header>

      <FitnessCard className={`mb-12 relative overflow-hidden ${isGaining ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-orange-500'}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-xl ${isGaining ? 'bg-green-500/20' : 'bg-orange-500/20'} flex items-center justify-center flex-shrink-0`}>
            <Sparkles className={`w-7 h-7 ${isGaining ? 'text-green-400' : 'text-orange-400'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(featuredTip.category)}`}>
                {featuredTip.category}
              </span>
              <span className="text-xs text-gray-500">Featured Tip</span>
            </div>
            <h3 className="text-card-title text-white mb-2">{featuredTip.title}</h3>
            <p className="text-body text-gray-300 mb-4">{featuredTip.content}</p>
            <FitnessButton size="sm" variant="outline" onClick={refreshFeaturedTip} data-testid="button-refresh-tip">
              <Sparkles className="w-4 h-4" />
              Get New Tip
            </FitnessButton>
          </div>
        </div>
      </FitnessCard>

      <div className="flex flex-wrap gap-3 mb-12">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            data-testid={`button-category-${category.id}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-body ${
              selectedCategory === category.id
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
            }`}
          >
            <category.icon className="w-4 h-4" />
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
        {tips.map((tip) => {
          const CategoryIcon = getCategoryIcon(tip.category);
          return (
            <FitnessCard key={tip.id} className="hover:border-purple-500/30 transition-all" data-testid={`card-tip-${tip.id}`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${getCategoryColor(tip.category)} flex items-center justify-center flex-shrink-0`}>
                  <CategoryIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(tip.category)}`}>
                      {tip.category}
                    </span>
                  </div>
                  <h3 className="text-card-title text-white mb-2">{tip.title}</h3>
                  <p className="text-body text-gray-400">{tip.content}</p>
                </div>
              </div>
            </FitnessCard>
          );
        })}
      </div>

      {tips.length === 0 && (
        <FitnessCard className="text-center py-12">
          <Lightbulb className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No tips found</h3>
          <p className="text-gray-400">Try selecting a different category</p>
        </FitnessCard>
      )}
    </Layout>
  );
}
