import React from 'react';
import { cn } from '@/lib/utils';
import { 
  PlusCircle, 
  Camera, 
  Target, 
  Upload, 
  Goal 
} from 'lucide-react';
import { Button } from './button';
import { useToast } from '@/hooks/use-toast';

type FloatingActionButtonProps = {
  type?: 'add-trade' | 'upload-screenshot' | 'set-goal' | 'custom';
  icon?: React.ReactNode;
  label?: string;
  onClick?: () => void;
  className?: string;
};

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  type = 'custom',
  icon,
  label,
  onClick,
  className
}) => {
  const { toast } = useToast();

  const defaultIcons = {
    'add-trade': <PlusCircle className="w-6 h-6" />,
    'upload-screenshot': <Camera className="w-6 h-6" />,
    'set-goal': <Goal className="w-6 h-6" />,
    'custom': <Target className="w-6 h-6" />
  };

  const defaultLabels = {
    'add-trade': 'Add Trade',
    'upload-screenshot': 'Upload Screenshot',
    'set-goal': 'Set Goal',
    'custom': 'Action'
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toast({
        title: `${defaultLabels[type]} Action`,
        description: 'Performing action...',
        duration: 1500
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={cn(
        "fixed bottom-20 right-4 z-50 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95",
        "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2",
        "flex items-center justify-center space-x-2 px-4 py-3",
        className
      )}
      aria-label={label || defaultLabels[type]}
    >
      {icon || defaultIcons[type]}
      {label && <span className="ml-2 font-medium">{label}</span>}
    </Button>
  );
}; 