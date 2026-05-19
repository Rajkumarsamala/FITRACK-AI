import { useState } from 'react';
import { Link } from 'wouter';
import { Dumbbell, Clock, Flame, Play, ChevronRight, Trophy, Target, Zap, ArrowRight, X } from 'lucide-react';
import { Layout } from '../components/fitness/Layout';
import { FitnessCard } from '../components/fitness/FitnessCard';
import { GoalToggle } from '../components/fitness/GoalToggle';
import { BackLink } from '../components/fitness/BackLink';
import { StaggerContainer, StaggerItem, FadeIn } from '../components/fitness/ScrollReveal';
import { FitnessButton } from '../components/fitness/FitnessButton';
import { useGoal } from '../contexts/GoalContext';
import { useUser } from '../contexts/UserContext';
import { getWorkoutsByGoal } from '../data/workouts';
import type { WorkoutPlan } from '../types';

export function Workouts() {
  const { currentGoal } = useGoal();
  const { isCurrentGoalOnboarded } = useUser();
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);

  if (!isCurrentGoalOnboarded) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
            <Zap className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Setup Required</h1>
          <p className="text-gray-400 max-w-md mb-8">
            Complete your profile to access workout plans.
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

  const workouts = getWorkoutsByGoal(currentGoal);
  const isGaining = currentGoal === 'gain-weight';

  const startWorkout = (workout: WorkoutPlan) => {
    setSelectedWorkout(workout);
    setCurrentExercise(0);
    setIsWorkoutActive(true);
  };

  const nextExercise = () => {
    if (selectedWorkout && currentExercise < selectedWorkout.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      setIsWorkoutActive(false);
      setSelectedWorkout(null);
    }
  };

  const exitWorkout = () => {
    setIsWorkoutActive(false);
    setSelectedWorkout(null);
    setCurrentExercise(0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-400/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (isWorkoutActive && selectedWorkout) {
    const exercise = selectedWorkout.exercises[currentExercise];
    const progress = ((currentExercise + 1) / selectedWorkout.exercises.length) * 100;

    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={exitWorkout}
              className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              data-testid="button-exit-workout"
            >
              <X className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white">{selectedWorkout.name}</h1>
            <span className="text-gray-400">
              {currentExercise + 1} / {selectedWorkout.exercises.length}
            </span>
          </div>

          <div className="w-full bg-white/10 rounded-full h-2 mb-8">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <FitnessCard className="text-center mb-6 saas-glass border border-purple-500/30 shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)]">
            <motion.div 
              className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-6 relative"
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: ['0 0 0px rgba(168,85,247,0)', '0 0 30px rgba(168,85,247,0.4)', '0 0 0px rgba(168,85,247,0)']
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 border-dashed animate-spin" style={{ animationDuration: '8s' }} />
              <Dumbbell className="w-16 h-16 text-purple-400 z-10 animate-pulse-slow" />
            </motion.div>
            <motion.h3 
              className="text-section-title text-white mb-2 saas-gradient-text text-3xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={exercise.name}
            >
              {exercise.name}
            </motion.h3>
            <div className="flex items-center justify-center gap-4 text-gray-400 text-body mb-6">
              <span>{exercise.sets} sets</span>
              <span>-</span>
              <span>{exercise.reps}</span>
              <span>-</span>
              <span>{exercise.restTime}s rest</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{exercise.sets}</div>
                <div className="text-gray-400 text-sm">Sets</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{exercise.reps}</div>
                <div className="text-gray-400 text-sm">Reps/Duration</div>
              </div>
            </div>
          </FitnessCard>

          <div className="flex gap-4">
            <FitnessButton
              variant="ghost"
              onClick={exitWorkout}
              fullWidth
              data-testid="button-exit"
            >
              Exit
            </FitnessButton>
            <FitnessButton 
              onClick={nextExercise} 
              fullWidth
              data-testid="button-next-exercise"
            >
              {currentExercise < selectedWorkout.exercises.length - 1 ? 'Next Exercise' : 'Finish Workout'}
              <ChevronRight className="w-4 h-4" />
            </FitnessButton>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <header className="page-header mb-12">
        <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-page-title text-white mb-1" data-testid="text-workouts-title">Workout Plans</h1>
            <p className="text-body text-gray-400">
              {isGaining ? 'Strength training for muscle building' : 'Fat-burning workouts for weight loss'}
            </p>
          </div>
          <GoalToggle />
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12">
        <FitnessCard className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl ${isGaining ? 'bg-green-500/20' : 'bg-orange-500/20'} flex items-center justify-center`}>
            <Target className={`w-7 h-7 ${isGaining ? 'text-green-400' : 'text-orange-400'}`} />
          </div>
          <div>
            <div className="text-gray-400 text-sm">Focus</div>
            <div className="text-xl font-bold text-white">
              {isGaining ? 'Muscle Building' : 'Fat Burning'}
            </div>
          </div>
        </FitnessCard>
        <FitnessCard className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <div className="text-gray-400 text-sm">Available Plans</div>
            <div className="text-xl font-bold text-white">{workouts.length} workouts</div>
          </div>
        </FitnessCard>
      </div>

      <StaggerContainer className="space-y-4" staggerDelay={0.15}>
        {workouts.map((workout) => (
          <StaggerItem key={workout.id}>
            <FitnessCard className="saas-card-hover group border border-transparent hover:border-purple-500/30" data-testid={`card-workout-${workout.id}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl ${isGaining ? 'bg-green-500/20' : 'bg-orange-500/20'} flex items-center justify-center flex-shrink-0`}>
                  <Dumbbell className={`w-7 h-7 ${isGaining ? 'text-green-400' : 'text-orange-400'}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{workout.name}</h3>
                  <p className="text-gray-400 mb-2">{workout.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className={`px-2 py-1 rounded-full ${getDifficultyColor(workout.difficulty)}`}>
                      {workout.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Clock className="w-4 h-4" />
                      {workout.duration} min
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Flame className="w-4 h-4" />
                      {workout.exercises.length} exercises
                    </span>
                  </div>
                </div>
              </div>
              <FitnessButton 
                onClick={() => startWorkout(workout)} 
                className="md:flex-shrink-0"
                data-testid={`button-start-${workout.id}`}
              >
                <Play className="w-4 h-4" />
                Start
              </FitnessButton>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-sm text-gray-400 mb-2">Exercises:</div>
              <div className="flex flex-wrap gap-2">
                {workout.exercises.map((exercise) => (
                  <span key={exercise.id} className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-300">
                    {exercise.name}
                  </span>
                ))}
              </div>
            </div>
            </FitnessCard>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </Layout>
  );
}
