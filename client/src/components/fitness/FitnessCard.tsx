import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FitnessCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'gradient' | 'glow' | 'animated';
  hoverEffect?: boolean;
}

export function FitnessCard({ 
  children, 
  className = '', 
  onClick, 
  variant = 'default',
  hoverEffect = true 
}: FitnessCardProps) {
  const baseClasses = 'rounded-2xl p-6 lg:p-8 transition-all relative overflow-hidden';
  
  const variantClasses = {
    default: 'saas-glass saas-card-hover',
    gradient: 'gradient-border saas-card-hover',
    glow: 'saas-glass saas-card-hover card-glow',
    animated: 'saas-glass saas-card-hover',
  };

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      whileHover={hoverEffect && onClick ? { 
        y: -4, 
        scale: 1.01,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
    >
      {children}
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon, trend, color = 'purple', delay = 0 }: StatCardProps) {
  const colorClasses: Record<string, { gradient: string; glow: string }> = {
    purple: { gradient: 'from-purple-500 to-purple-700', glow: 'shadow-purple-500/20' },
    orange: { gradient: 'from-orange-500 to-orange-700', glow: 'shadow-orange-500/20' },
    green: { gradient: 'from-green-500 to-green-700', glow: 'shadow-green-500/20' },
    blue: { gradient: 'from-blue-500 to-blue-700', glow: 'shadow-blue-500/20' },
  };

  const colorConfig = colorClasses[color] || colorClasses.purple;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <FitnessCard className="relative overflow-hidden group icon-hover-bounce" hoverEffect>
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
        
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex-1">
            <p className="text-gray-400 text-sm mb-2 font-medium">{title}</p>
            <motion.p 
              className="text-3xl font-bold text-white mb-1 stat-number-glow"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: delay + 0.2 }}
            >
              {value}
            </motion.p>
            {subtitle && (
              <p className={`text-sm ${
                trend === 'up' ? 'text-green-400' : 
                trend === 'down' ? 'text-red-400' : 
                'text-gray-400'
              }`}>
                {trend === 'up' && '+ '}
                {trend === 'down' && '- '}
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <motion.div 
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorConfig.gradient} flex items-center justify-center flex-shrink-0 shadow-lg ${colorConfig.glow}`}
              whileHover={{ rotate: 5, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {icon}
            </motion.div>
          )}
        </div>
      </FitnessCard>
    </motion.div>
  );
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color?: string;
  delay?: number;
}

export function FeatureCard({ icon, title, description, color = 'purple', delay = 0 }: FeatureCardProps) {
  const colorClasses: Record<string, string> = {
    purple: 'from-purple-500 to-indigo-600',
    orange: 'from-orange-500 to-red-600',
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600',
    yellow: 'from-yellow-500 to-amber-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <FitnessCard variant="animated" className="h-full flex flex-col">
        <motion.div 
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-5 shadow-lg`}
          whileHover={{ rotate: 5, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-gray-400 flex-1 leading-relaxed">{description}</p>
      </FitnessCard>
    </motion.div>
  );
}
