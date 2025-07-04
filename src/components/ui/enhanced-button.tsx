import React, { useState, useCallback } from 'react';
import { Button as BaseButton, ButtonProps as BaseButtonProps } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  ButtonAction, 
  ButtonActionContext, 
  buttonValidationManager,
  useButtonState 
} from '@/lib/buttonValidation';

export interface EnhancedButtonProps extends Omit<BaseButtonProps, 'onClick' | 'onError'> {
  buttonId: string;
  action: ButtonAction;
  actionContext?: Omit<ButtonActionContext, 'action'>;
  onAction?: () => Promise<any>;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  onRetry?: () => Promise<any>;
  showProgress?: boolean;
  showError?: boolean;
  showRetry?: boolean;
  confirmMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
  retryMessage?: string;
  timeout?: number;
  maxRetries?: number;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  buttonId,
  action,
  actionContext,
  onAction,
  onSuccess,
  onError,
  onRetry,
  showProgress = false,
  showError = true,
  showRetry = true,
  confirmMessage,
  successMessage,
  errorMessage,
  loadingMessage,
  retryMessage,
  timeout,
  maxRetries,
  disabled = false,
  children,
  className,
  variant = 'default',
  size = 'default',
  ...props
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localProgress, setLocalProgress] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  // Get button state from validation manager
  const buttonState = useButtonState(buttonId);
  const isActive = buttonState.isActive() || localLoading;
  const isDisabled = buttonState.isDisabled() || disabled;
  const error = buttonState.getError() || localError;
  const progress = buttonState.getProgress() || localProgress;
  const retryCount = buttonState.getRetryCount();

  // Handle button click
  const handleClick = useCallback(async () => {
    if (isActive || isDisabled) return;

    // Show confirmation if required
    if (confirmMessage) {
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) return;
    }

    if (!onAction) {
      console.warn('EnhancedButton: No action provided');
      return;
    }

    try {
      setLocalLoading(true);
      setLocalError(null);
      setLocalProgress(0);

      // Create action context
      const context: ButtonActionContext = {
        action,
        data: actionContext?.data,
        options: {
          ...actionContext?.options,
          timeout,
          retryCount: maxRetries,
          showProgress,
          requireConfirmation: !!confirmMessage
        }
      };

      // Execute action through validation manager
      const result = await buttonValidationManager.executeAction(
        buttonId,
        context,
        async () => {
          // Simulate progress if enabled
          if (showProgress) {
            const progressInterval = setInterval(() => {
              setLocalProgress(prev => {
                if (prev >= 90) {
                  clearInterval(progressInterval);
                  return 90;
                }
                return prev + 10;
              });
            }, 200);
          }

          const actionResult = await onAction();
          
          if (showProgress) {
            setLocalProgress(100);
          }

          return actionResult;
        }
      );

      // Handle success
      if (successMessage) {
        toast.success(successMessage);
      }
      
      onSuccess?.(result);
      setLocalProgress(0);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Action failed';
      setLocalError(errorMsg);
      
      if (showError && errorMessage) {
        toast.error(errorMessage);
      } else if (showError) {
        toast.error(errorMsg);
      }
      
      onError?.(error instanceof Error ? error : new Error(errorMsg));
      setLocalProgress(0);
    } finally {
      setLocalLoading(false);
    }
  }, [
    buttonId,
    action,
    actionContext,
    onAction,
    onSuccess,
    onError,
    confirmMessage,
    successMessage,
    errorMessage,
    showError,
    showProgress,
    timeout,
    maxRetries,
    isActive,
    isDisabled
  ]);

  // Handle retry
  const handleRetry = useCallback(async () => {
    if (!onRetry) {
      // Use the original action as retry
      await handleClick();
      return;
    }

    try {
      setLocalLoading(true);
      setLocalError(null);
      setLocalProgress(0);

      const result = await onRetry();
      
      if (retryMessage) {
        toast.success(retryMessage);
      }
      
      onSuccess?.(result);
      setLocalProgress(0);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Retry failed';
      setLocalError(errorMsg);
      
      if (showError) {
        toast.error(errorMsg);
      }
      
      onError?.(error instanceof Error ? error : new Error(errorMsg));
      setLocalProgress(0);
    } finally {
      setLocalLoading(false);
    }
  }, [onRetry, onSuccess, onError, retryMessage, showError, handleClick]);

  // Get button content based on state
  const getButtonContent = () => {
    if (isActive) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {loadingMessage || 'Processing...'}
        </>
      );
    }

    if (error && showRetry) {
      return (
        <>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </>
      );
    }

    return children;
  };

  // Get button variant based on state
  const getButtonVariant = (): BaseButtonProps['variant'] => {
    if (error && showRetry) {
      return 'outline';
    }
    return variant;
  };

  // Get button icon based on state
  const getButtonIcon = () => {
    if (isActive) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }

    if (error && showRetry) {
      return <RefreshCw className="h-4 w-4" />;
    }

    return null;
  };

  return (
    <div className="space-y-2">
      {/* Main Button */}
      <BaseButton
        onClick={error && showRetry ? handleRetry : handleClick}
        disabled={isDisabled}
        variant={getButtonVariant()}
        size={size}
        className={className}
        {...props}
      >
        {getButtonContent()}
      </BaseButton>

      {/* Progress Bar */}
      {showProgress && progress > 0 && progress < 100 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      )}

      {/* Error Display */}
      {error && showError && (
        <Alert variant="destructive" className="text-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            {retryCount > 0 && (
              <Badge variant="outline" className="text-xs">
                Retry {retryCount}/{maxRetries || 3}
              </Badge>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Indicator */}
      {progress === 100 && !error && (
        <div className="flex items-center gap-2 text-green-500 text-sm">
          <CheckCircle className="h-4 w-4" />
          <span>Completed successfully</span>
        </div>
      )}

      {/* Warning for retries */}
      {retryCount > 0 && retryCount < (maxRetries || 3) && (
        <Alert className="text-sm">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Action failed. You can retry {maxRetries ? maxRetries - retryCount : 3 - retryCount} more time(s).
          </AlertDescription>
        </Alert>
      )}

      {/* Info for disabled state */}
      {isDisabled && !isActive && (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Info className="h-4 w-4" />
          <span>Button is disabled</span>
        </div>
      )}
    </div>
  );
};

// Convenience components for common button types
export const SaveButton: React.FC<Omit<EnhancedButtonProps, 'action'> & { data?: any }> = (props) => (
  <EnhancedButton
    action="save"
    variant="default"
    {...props}
    actionContext={{
      ...props.actionContext,
      data: props.data,
      options: {
        requireData: true,
        requireValidation: true,
        ...props.actionContext?.options
      }
    }}
  />
);

export const TestButton: React.FC<Omit<EnhancedButtonProps, 'action'> & { provider?: string }> = (props) => (
  <EnhancedButton
    action="test"
    variant="outline"
    {...props}
    actionContext={{
      ...props.actionContext,
      data: { provider: props.provider },
      options: {
        requireApiKey: props.provider,
        ...props.actionContext?.options
      }
    }}
  />
);

export const DeleteButton: React.FC<Omit<EnhancedButtonProps, 'action'> & { itemType: string }> = (props) => (
  <EnhancedButton
    action="delete"
    variant="destructive"
    confirmMessage={`Are you sure you want to delete this ${props.itemType}?`}
    {...props}
    actionContext={{
      ...props.actionContext,
      options: {
        requireConfirmation: true,
        ...props.actionContext?.options
      }
    }}
  />
);

export const ImportButton: React.FC<Omit<EnhancedButtonProps, 'action'>> = (props) => (
  <EnhancedButton
    action="import"
    variant="outline"
    showProgress={true}
    {...props}
    actionContext={{
      ...props.actionContext,
      options: {
        requireData: true,
        requireValidation: true,
        validateFormat: true,
        showProgress: true,
        ...props.actionContext?.options
      }
    }}
  />
);

export const ExportButton: React.FC<Omit<EnhancedButtonProps, 'action'>> = (props) => (
  <EnhancedButton
    action="export"
    variant="outline"
    {...props}
    actionContext={{
      ...props.actionContext,
      options: {
        requireData: true,
        requireValidation: true,
        ...props.actionContext?.options
      }
    }}
  />
);

export const GenerateButton: React.FC<Omit<EnhancedButtonProps, 'action'> & { prompt: string; apiProvider?: string }> = (props) => (
  <EnhancedButton
    action="generate"
    variant="default"
    showProgress={true}
    {...props}
    actionContext={{
      ...props.actionContext,
      data: { prompt: props.prompt },
      options: {
        requireData: true,
        requireApiKey: props.apiProvider || 'openai',
        showProgress: true,
        ...props.actionContext?.options
      }
    }}
  />
);

export const AnalyzeButton: React.FC<Omit<EnhancedButtonProps, 'action'> & { dataset: any }> = (props) => (
  <EnhancedButton
    action="analyze"
    variant="outline"
    showProgress={true}
    {...props}
    actionContext={{
      ...props.actionContext,
      data: { dataset: props.dataset },
      options: {
        requireData: true,
        requireValidation: true,
        showProgress: true,
        timeout: 60000,
        ...props.actionContext?.options
      }
    }}
  />
);

export const BacktestButton: React.FC<Omit<EnhancedButtonProps, 'action'> & { strategy: any; historicalData: any }> = (props) => (
  <EnhancedButton
    action="backtest"
    variant="outline"
    showProgress={true}
    {...props}
    actionContext={{
      ...props.actionContext,
      data: { strategy: props.strategy, historicalData: props.historicalData },
      options: {
        requireData: true,
        requireValidation: true,
        showProgress: true,
        timeout: 120000,
        ...props.actionContext?.options
      }
    }}
  />
);

export const OptimizeButton: React.FC<Omit<EnhancedButtonProps, 'action'> & { parameters: any; objective: any }> = (props) => (
  <EnhancedButton
    action="optimize"
    variant="outline"
    showProgress={true}
    {...props}
    actionContext={{
      ...props.actionContext,
      data: { parameters: props.parameters, objective: props.objective },
      options: {
        requireData: true,
        requireValidation: true,
        showProgress: true,
        timeout: 180000,
        ...props.actionContext?.options
      }
    }}
  />
); 