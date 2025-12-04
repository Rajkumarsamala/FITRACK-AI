import { motion } from 'framer-motion';
import { 
  Crown, 
  Check, 
  Scan, 
  Sparkles, 
  Shield, 
  Zap,
  Star,
  ArrowRight,
  Activity,
  TrendingUp,
  Target,
  Brain
} from 'lucide-react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/fitness/Layout';
import { FitnessCard } from '../components/fitness/FitnessCard';
import { FitnessButton } from '../components/fitness/FitnessButton';
import { GlowOrb } from '../components/fitness/AnimatedBackground';
import { ScrollReveal } from '../components/fitness/ScrollReveal';

const PREMIUM_PRICE = 9.99;

const features = [
  {
    icon: Scan,
    title: 'Unlimited AI Body Scans',
    description: 'Analyze your posture anytime with our advanced AI-powered body scanning technology.',
    highlight: true,
  },
  {
    icon: Brain,
    title: 'Personalized Recommendations',
    description: 'Get tailored exercise and posture correction recommendations based on your scan results.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Track your posture improvements over time with detailed historical data and charts.',
  },
  {
    icon: Target,
    title: 'Custom Workout Plans',
    description: 'Access specialized workout routines designed to address your specific posture issues.',
  },
  {
    icon: Activity,
    title: 'Body Symmetry Analysis',
    description: 'Deep analysis of left-right muscle balance to prevent injuries and improve performance.',
  },
  {
    icon: Shield,
    title: 'Priority Support',
    description: 'Get fast responses from our support team for any questions or issues.',
  },
];

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Yoga Instructor',
    content: 'The body scan helped me identify posture issues I never knew I had. My back pain has significantly reduced!',
    rating: 5,
  },
  {
    name: 'James K.',
    role: 'Office Worker',
    content: 'Finally a fitness app that focuses on posture. The recommendations are spot-on for desk workers like me.',
    rating: 5,
  },
  {
    name: 'Maria L.',
    role: 'Fitness Enthusiast',
    content: 'I love tracking my posture improvements over time. The AI analysis is incredibly accurate.',
    rating: 5,
  },
];

export function Premium() {
  const { data: subscription } = useQuery({
    queryKey: ['/api/subscription'],
    queryFn: async () => {
      const res = await fetch('/api/subscription', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch subscription');
      return res.json();
    },
  });

  const { data: trialUsage } = useQuery({
    queryKey: ['/api/trial-usage'],
    queryFn: async () => {
      const res = await fetch('/api/trial-usage', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch trial usage');
      return res.json();
    },
  });

  const isPremium = subscription?.status === 'active' && subscription?.plan === 'premium';
  const trialUsed = trialUsage?.bodyScanUsed;

  const handleSubscribe = () => {
    window.location.href = '/api/create-checkout-session';
  };

  return (
    <Layout>
      <div className="relative">
        <GlowOrb color="orange" position="top-right" size="xl" />
        <GlowOrb color="purple" position="bottom-left" size="lg" />
        
        <ScrollReveal>
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 mb-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-medium">Premium Membership</span>
            </motion.div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Unlock Your Full{' '}
              <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                Fitness Potential
              </span>
            </h1>
            
            <p className="text-gray-400 text-lg leading-relaxed">
              Get unlimited AI body scans, personalized recommendations, and advanced tracking tools 
              to transform your posture and fitness.
            </p>
          </motion.div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <FitnessCard className="lg:col-span-2" variant="animated">
              <h2 className="text-section-title text-white mb-6">What's Included</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, idx) => (
                  <motion.div 
                    key={feature.title}
                    className={`p-4 rounded-xl ${feature.highlight ? 'bg-gradient-to-r from-purple-500/20 to-amber-500/20 border border-purple-500/20' : 'bg-white/5'}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${feature.highlight ? 'bg-gradient-to-br from-purple-500 to-amber-500' : 'bg-purple-500/20'}`}>
                        <feature.icon className={`w-5 h-5 ${feature.highlight ? 'text-white' : 'text-purple-400'}`} />
                      </div>
                      <div>
                        <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                        <p className="text-gray-400 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </FitnessCard>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <FitnessCard 
                className="h-full bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/30"
                variant="animated"
              >
                <div className="text-center">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4" />
                    Best Value
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-5xl font-bold text-white mb-1">
                      ${PREMIUM_PRICE}
                      <span className="text-lg text-gray-400 font-normal">/month</span>
                    </div>
                    <p className="text-gray-400 text-sm">Cancel anytime</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {[
                      'Unlimited AI Body Scans',
                      'Personalized Recommendations',
                      'Progress Tracking Dashboard',
                      'Priority Support',
                      'Early Access to New Features',
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-left">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  {isPremium ? (
                    <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                      <div className="flex items-center justify-center gap-2 text-green-400 font-medium">
                        <Check className="w-5 h-5" />
                        You're a Premium Member!
                      </div>
                      <p className="text-gray-400 text-sm mt-2">
                        Enjoy unlimited access to all premium features.
                      </p>
                    </div>
                  ) : (
                    <>
                      <FitnessButton 
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-semibold"
                        size="lg"
                        onClick={handleSubscribe}
                      >
                        <Crown className="w-5 h-5" />
                        Subscribe Now
                      </FitnessButton>
                      
                      <p className="text-gray-500 text-xs mt-4">
                        Secure payment powered by Stripe. 30-day money-back guarantee.
                      </p>
                    </>
                  )}
                </div>
              </FitnessCard>
            </motion.div>
          </div>
        </ScrollReveal>

        {!isPremium && trialUsed && (
          <ScrollReveal delay={0.2}>
            <FitnessCard className="mb-12 border border-purple-500/30" variant="animated">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Scan className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">You've used your free trial</h3>
                    <p className="text-gray-400">
                      Upgrade to Premium to continue scanning and tracking your posture improvements.
                    </p>
                  </div>
                </div>
                <FitnessButton 
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold"
                  onClick={handleSubscribe}
                >
                  Upgrade Now
                  <ArrowRight className="w-4 h-4" />
                </FitnessButton>
              </div>
            </FitnessCard>
          </ScrollReveal>
        )}

        <ScrollReveal delay={0.3}>
          <div className="mb-12">
            <h2 className="text-section-title text-white text-center mb-8">What Our Members Say</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, idx) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  <FitnessCard variant="animated" className="h-full">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-4 leading-relaxed">"{testimonial.content}"</p>
                    <div>
                      <div className="text-white font-medium">{testimonial.name}</div>
                      <div className="text-gray-400 text-sm">{testimonial.role}</div>
                    </div>
                  </FitnessCard>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <FitnessCard className="text-center" variant="animated">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-amber-400" />
              <h2 className="text-section-title text-white">Start Improving Today</h2>
            </div>
            <p className="text-gray-400 max-w-xl mx-auto mb-6">
              Join thousands of members who have transformed their posture and fitness with FitTrack AI Premium.
            </p>
            {isPremium ? (
              <Link href="/body-scan">
                <FitnessButton size="lg" className="btn-shimmer">
                  <Scan className="w-5 h-5" />
                  Go to Body Scan
                </FitnessButton>
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/body-scan">
                  <FitnessButton variant="outline" size="lg">
                    Try Free Scan
                  </FitnessButton>
                </Link>
                <FitnessButton 
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold"
                  onClick={handleSubscribe}
                >
                  <Crown className="w-5 h-5" />
                  Get Premium - ${PREMIUM_PRICE}/mo
                </FitnessButton>
              </div>
            )}
          </FitnessCard>
        </ScrollReveal>
      </div>
    </Layout>
  );
}
