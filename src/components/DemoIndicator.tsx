import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DemoIndicatorProps {
  className?: string;
  showWarning?: boolean;
}

const DemoIndicator: React.FC<DemoIndicatorProps> = ({ 
  className = '', 
  showWarning = false 
}) => {
  const { user } = useAuth();
  
  // Check if user is in demo mode
  const isDemoUser = user?.email === 'demo@quantumrisk.coach' || user?.user_metadata?.demo;

  if (!isDemoUser) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showWarning ? (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Demo Mode
        </Badge>
      ) : (
        <Badge variant="secondary" className="flex items-center gap-1 bg-blue-500/20 text-blue-300 border-blue-500/30">
          <Info className="w-3 h-3" />
          Demo Account
        </Badge>
      )}
      
      {showWarning && (
        <span className="text-xs text-amber-400">
          This is a demo account with simulated data. Real trading features are disabled.
        </span>
      )}
    </div>
  );
};

export default DemoIndicator; 