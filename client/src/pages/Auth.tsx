import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, User as UserIcon, ArrowRight, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { FitnessButton } from "@/components/fitness/FitnessButton";
import { GlowOrb } from "@/components/fitness/AnimatedBackground";
import { useToast } from "@/hooks/use-toast";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        await login.mutateAsync({ email, password });
        toast({ title: "Welcome back!", description: "Successfully logged in." });
      } else {
        await register.mutateAsync({ email, password, firstName, lastName });
        toast({ title: "Account created!", description: "Welcome to FitTrack AI." });
      }
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message || "Something went wrong", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center p-4 relative overflow-hidden">
      <GlowOrb color="purple" position="top-left" size="xl" />
      <GlowOrb color="indigo" position="bottom-right" size="lg" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 mb-6 saas-glass">
            <Zap className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-400">
            {isLogin ? "Enter your details to access your dashboard" : "Start your fitness journey today"}
          </p>
        </div>

        <div className="saas-glass border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">First Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      placeholder="John"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Last Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <FitnessButton 
              type="submit" 
              className="w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-500 border-0 btn-shimmer"
              disabled={login.isPending || register.isPending}
            >
              {isLogin ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </FitnessButton>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
