import { useGoal } from '../../contexts/GoalContext';
import { Flame, Dumbbell } from 'lucide-react';

interface GoalToggleProps {
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export function GoalToggle({ size = 'md', showLabels = true }: GoalToggleProps) {
  const { currentGoal, setGoal, goals } = useGoal();

  const sizeClasses = {
    sm: 'p-1 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-2 glass rounded-full p-1" data-testid="goal-toggle">
      {goals.map((goal) => {
        const isActive = currentGoal === goal.id;
        const Icon = goal.id === 'lose-weight' ? Flame : Dumbbell;
        
        return (
          <button
            key={goal.id}
            onClick={() => setGoal(goal.id)}
            data-testid={`goal-toggle-${goal.id}`}
            className={`flex items-center gap-2 ${sizeClasses[size]} rounded-full transition-all ${
              isActive
                ? goal.id === 'lose-weight'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon className={iconSizes[size]} />
            {showLabels && (
              <span className="pr-2">
                {goal.id === 'lose-weight' ? 'Lose Weight' : 'Gain Weight'}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
