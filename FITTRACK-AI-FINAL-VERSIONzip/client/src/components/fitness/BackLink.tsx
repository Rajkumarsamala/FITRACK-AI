import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';

interface BackLinkProps {
  fallback?: string;
}

export function BackLink({ fallback = '/dashboard' }: BackLinkProps) {
  const [, setLocation] = useLocation();
  
  const handleClick = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation(fallback);
    }
  };

  return (
    <button
      onClick={handleClick}
      data-testid="button-back"
      className="back-link flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-500/25 hover:bg-purple-500/10 transition-colors text-sm font-medium text-gray-300 hover:text-white"
      aria-label="Go back"
      title="Go back (or Dashboard if history unavailable)"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  );
}
