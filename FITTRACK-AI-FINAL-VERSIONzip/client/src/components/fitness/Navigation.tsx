import { Link, useLocation } from 'wouter';
import { motion, useReducedMotion } from 'framer-motion';
import { Home, Utensils, Dumbbell, LineChart, Scan, User } from 'lucide-react';
import { useGoal } from '../../contexts/GoalContext';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/nutrition', icon: Utensils, label: 'Nutrition' },
  { path: '/workouts', icon: Dumbbell, label: 'Workouts' },
  { path: '/body-scan', icon: Scan, label: 'AI Scan' },
  { path: '/progress', icon: LineChart, label: 'Progress' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function Navigation() {
  const [location] = useLocation();
  const { currentGoal } = useGoal();
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50"
      initial={prefersReducedMotion ? false : { y: 100 }}
      animate={{ y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 20 }}
      data-testid="navigation"
    >
      <div className="absolute inset-0 bg-[#0f0f14]/95 backdrop-blur-xl border-t border-purple-500/20" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      <div className="container-responsive relative z-10">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center justify-around gap-1 w-full">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <motion.div
                    className={`relative flex flex-col items-center gap-1 px-2 sm:px-3 py-2 rounded-xl transition-colors ${
                      isActive
                        ? 'text-purple-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-purple-500/15 rounded-xl"
                        layoutId="activeNav"
                        transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <item.icon className="w-5 h-5 relative z-10" />
                    <span className="text-[10px] sm:text-xs relative z-10">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
