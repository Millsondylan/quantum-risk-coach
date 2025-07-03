import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Eye, 
  EyeOff, 
  GripVertical,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  isVisible: boolean;
  settings?: Record<string, any>;
}

interface DashboardWidgetProps {
  config: WidgetConfig;
  children: React.ReactNode;
  onRemove?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  onResize?: (id: string, size: { w: number; h: number }) => void;
  onSettingsChange?: (id: string, settings: Record<string, any>) => void;
  isDragging?: boolean;
  isResizable?: boolean;
  className?: string;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({ 
  config, 
  children, 
  onRemove,
  onToggleVisibility,
  onResize,
  onSettingsChange,
  isDragging = false,
  isResizable = true,
  className
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleMaximize = () => {
    if (!onResize) return;
    
    if (isMaximized) {
      // Restore to original size
      setIsMaximized(false);
    } else {
      // Maximize to full width
      onResize(config.id, { w: 7, h: 4 });
      setIsMaximized(true);
    }
  };

  return (
    <Card 
      className={cn(
        "holo-card relative group transition-all duration-200",
        isDragging && "opacity-50 cursor-move",
        !config.isVisible && "opacity-30",
        className
      )}
    >
      {/* Drag Handle */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
        <GripVertical className="w-4 h-4 text-slate-400" />
      </div>

      {/* Widget Controls */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onToggleVisibility && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => onToggleVisibility(config.id)}
          >
            {config.isVisible ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3" />
            )}
          </Button>
        )}
        
        {isResizable && onResize && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={handleMaximize}
          >
            {isMaximized ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
          </Button>
        )}

        {onSettingsChange && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-3 h-3" />
          </Button>
        )}
        
        {onRemove && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
            onClick={() => onRemove(config.id)}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Widget Content */}
      <div className={cn(
        "h-full",
        !config.isVisible && "pointer-events-none"
      )}>
        {children}
      </div>

      {/* Resize Handle */}
      {isResizable && (
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            viewBox="0 0 8 8"
            className="w-full h-full text-slate-400"
          >
            <path
              d="M8 8H0L8 0V8Z"
              fill="currentColor"
              opacity="0.2"
            />
          </svg>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && onSettingsChange && (
        <div className="absolute top-12 right-2 z-50 w-64 p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
          <h4 className="text-sm font-medium mb-3">Widget Settings</h4>
          <div className="space-y-3">
            {/* Add widget-specific settings here */}
            <p className="text-xs text-slate-400">
              Settings for {config.title} widget
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-3"
            onClick={() => setShowSettings(false)}
          >
            Close
          </Button>
        </div>
      )}
    </Card>
  );
}; 