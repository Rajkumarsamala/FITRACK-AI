import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoalProvider } from "./contexts/GoalContext";
import { UserProvider } from "./contexts/UserContext";
import { useAuth } from "./hooks/useAuth";
import { Landing } from "./pages/Landing";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { Nutrition } from "./pages/Nutrition";
import { Workouts } from "./pages/Workouts";
import { Progress } from "./pages/Progress";
import { Tips } from "./pages/Tips";
import { Profile } from "./pages/Profile";
import { BodyScan } from "./pages/BodyScan";
import { Premium } from "./pages/Premium";
import { Auth } from "./pages/Auth";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }
  
  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/auth">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Auth />}
      </Route>
      <Route path="/">
        {isLoading || !isAuthenticated ? <Landing /> : <Redirect to="/dashboard" />}
      </Route>
      <Route path="/onboarding">
        <ProtectedRoute component={Onboarding} />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/nutrition">
        <ProtectedRoute component={Nutrition} />
      </Route>
      <Route path="/workouts">
        <ProtectedRoute component={Workouts} />
      </Route>
      <Route path="/progress">
        <ProtectedRoute component={Progress} />
      </Route>
      <Route path="/tips">
        <ProtectedRoute component={Tips} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>
      <Route path="/body-scan">
        <ProtectedRoute component={BodyScan} />
      </Route>
      <Route path="/premium">
        <ProtectedRoute component={Premium} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GoalProvider>
          <UserProvider>
            <div className="fitness-app">
              <Toaster />
              <Router />
            </div>
          </UserProvider>
        </GoalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
