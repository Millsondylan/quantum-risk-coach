import { toast } from 'sonner';
import { apiKeyManager } from './secureStorage';

// Button action types
export type ButtonAction = 
  | 'save'
  | 'run'
  | 'generate'
  | 'import'
  | 'export'
  | 'test'
  | 'connect'
  | 'delete'
  | 'clear'
  | 'refresh'
  | 'submit'
  | 'cancel'
  | 'retry'
  | 'validate'
  | 'process'
  | 'upload'
  | 'download'
  | 'sync'
  | 'backup'
  | 'restore'
  | 'encrypt'
  | 'decrypt'
  | 'authenticate'
  | 'logout'
  | 'reset'
  | 'optimize'
  | 'analyze'
  | 'simulate'
  | 'backtest'
  | 'deploy';

// Button validation result
export interface ButtonValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

// Button action context
export interface ButtonActionContext {
  action: ButtonAction;
  data?: any;
  options?: {
    requireApiKey?: string;
    requireData?: boolean;
    requireValidation?: boolean;
    requireConfirmation?: boolean;
    timeout?: number;
    retryCount?: number;
    showProgress?: boolean;
    allowOffline?: boolean;
    validateFormat?: boolean;
    checkPermissions?: boolean;
  };
}

// Button state management
export interface ButtonState {
  isLoading: boolean;
  isDisabled: boolean;
  error: string | null;
  lastAction?: ButtonAction;
  retryCount: number;
  progress?: number;
  lastUpdated: string;
}

// Enhanced button validation manager
class ButtonValidationManager {
  private static instance: ButtonValidationManager;
  private activeButtons: Map<string, ButtonState> = new Map();
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly MAX_RETRY_COUNT = 3;
  private readonly PROGRESS_UPDATE_INTERVAL = 100; // 100ms

  private constructor() {}

  static getInstance(): ButtonValidationManager {
    if (!ButtonValidationManager.instance) {
      ButtonValidationManager.instance = new ButtonValidationManager();
    }
    return ButtonValidationManager.instance;
  }

  // Get button state
  getButtonState(buttonId: string): ButtonState | undefined {
    return this.activeButtons.get(buttonId);
  }

  // Reset button state
  resetButtonState(buttonId: string): void {
    this.activeButtons.delete(buttonId);
  }

  // Validate button action before execution
  async validateAction(context: ButtonActionContext): Promise<ButtonValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check if API key is required and available
    if (context.options?.requireApiKey) {
      const apiKey = await apiKeyManager.getApiKey(context.options.requireApiKey);
      if (!apiKey) {
        errors.push(`${context.options.requireApiKey} API key is required`);
        suggestions.push(`Add your ${context.options.requireApiKey} API key in settings`);
      } else {
        // Test connection if key exists
        const isConnected = await apiKeyManager.testConnection(context.options.requireApiKey);
        if (!isConnected) {
          warnings.push(`${context.options.requireApiKey} API connection failed`);
          suggestions.push('Check your internet connection and API key validity');
        }
      }
    }

    // Check if data is required
    if (context.options?.requireData && !context.data) {
      errors.push('Data is required for this action');
    }

    // Validate data structure if provided
    if (context.data && context.options?.requireValidation) {
      const dataValidation = this.validateDataStructure(context.data, context.action);
      errors.push(...dataValidation.errors);
      warnings.push(...dataValidation.warnings);
    }

    // Check permissions if required
    if (context.options?.checkPermissions) {
      const permissionCheck = await this.checkPermissions(context.action);
      if (!permissionCheck.hasPermission) {
        errors.push(permissionCheck.error || 'Insufficient permissions');
      }
    }

    // Check format validation if required
    if (context.options?.validateFormat && context.data) {
      const formatValidation = this.validateDataFormat(context.data, context.action);
      errors.push(...formatValidation.errors);
      warnings.push(...formatValidation.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  // Validate data structure based on action type
  private validateDataStructure(data: any, action: ButtonAction): ButtonValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (action) {
      case 'save':
        if (typeof data !== 'object' || data === null) {
          errors.push('Data must be an object');
        }
        break;

      case 'import':
        if (!data.file && !data.content) {
          errors.push('File or content is required for import');
        }
        if (data.file && data.file.size > 10 * 1024 * 1024) {
          errors.push('File size must be less than 10MB');
        }
        break;

      case 'export':
        if (!data.content && !data.filename) {
          errors.push('Content or filename is required for export');
        }
        break;

      case 'submit':
        if (!data.formData) {
          errors.push('Form data is required');
        }
        break;

      case 'upload':
        if (!data.file) {
          errors.push('File is required for upload');
        }
        if (data.file && !data.file.type.startsWith('image/') && !data.file.name.endsWith('.csv')) {
          errors.push('Only image and CSV files are supported');
        }
        break;

      case 'process':
        if (!data.content) {
          errors.push('Content is required for processing');
        }
        break;

      case 'backtest':
        if (!data.strategy || !data.historicalData) {
          errors.push('Strategy and historical data are required for backtesting');
        }
        break;

      case 'simulate':
        if (!data.scenario || !data.parameters) {
          errors.push('Scenario and parameters are required for simulation');
        }
        break;

      case 'analyze':
        if (!data.dataset) {
          errors.push('Dataset is required for analysis');
        }
        break;

      case 'optimize':
        if (!data.parameters || !data.objective) {
          errors.push('Parameters and objective are required for optimization');
        }
        break;

      default:
        // No specific validation for other actions
        break;
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Validate data format
  private validateDataFormat(data: any, action: ButtonAction): ButtonValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (action) {
      case 'import':
        if (data.file && !data.file.name.toLowerCase().endsWith('.csv')) {
          errors.push('Only CSV files are supported for import');
        }
        break;

      case 'upload':
        if (data.file) {
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/csv'];
          if (!allowedTypes.includes(data.file.type)) {
            errors.push('Unsupported file type');
          }
        }
        break;

      case 'save':
        if (data && typeof data === 'object') {
          // Check for required fields based on data type
          if (data.type === 'trade' && !data.symbol) {
            errors.push('Trade symbol is required');
          }
          if (data.type === 'portfolio' && !data.name) {
            errors.push('Portfolio name is required');
          }
        }
        break;

      default:
        break;
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Check permissions for action
  private async checkPermissions(action: ButtonAction): Promise<{ hasPermission: boolean; error?: string }> {
    // This would integrate with your permission system
    // For now, return true for all actions
    return { hasPermission: true };
  }

  // Execute button action with validation and feedback
  async executeAction(
    buttonId: string,
    context: ButtonActionContext,
    actionFn: () => Promise<any>
  ): Promise<any> {
    // Check if button is already active
    if (this.activeButtons.has(buttonId)) {
      const state = this.activeButtons.get(buttonId)!;
      if (state.isLoading) {
        toast.warning('Action already in progress');
        return null;
      }
    }

    // Initialize button state
    this.activeButtons.set(buttonId, {
      isLoading: true,
      isDisabled: true,
      error: null,
      lastAction: context.action,
      retryCount: 0,
      progress: 0,
      lastUpdated: new Date().toISOString()
    });

    try {
      // Validate action before execution
      const validation = await this.validateAction(context);
      
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => toast.warning(warning));
      }

      if (validation.suggestions && validation.suggestions.length > 0) {
        validation.suggestions.forEach(suggestion => toast.info(suggestion));
      }

      // Show confirmation if required
      if (context.options?.requireConfirmation) {
        const confirmed = window.confirm(`Are you sure you want to ${context.action}?`);
        if (!confirmed) {
          throw new Error('Action cancelled by user');
        }
      }

      // Execute action with timeout and progress tracking
      const timeout = context.options?.timeout || this.DEFAULT_TIMEOUT;
      const showProgress = context.options?.showProgress || false;

      let progressInterval: NodeJS.Timeout | null = null;
      
      if (showProgress) {
        progressInterval = setInterval(() => {
          const state = this.activeButtons.get(buttonId);
          if (state && state.progress !== undefined && state.progress < 90) {
            state.progress = Math.min(state.progress + 5, 90);
            state.lastUpdated = new Date().toISOString();
          }
        }, this.PROGRESS_UPDATE_INTERVAL);
      }

      const result = await Promise.race([
        actionFn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Action timed out')), timeout)
        )
      ]);

      // Clear progress interval
      if (progressInterval) {
        clearInterval(progressInterval);
      }

      // Show success feedback
      this.showSuccessFeedback(context.action);
      
      // Update button state
      this.activeButtons.set(buttonId, {
        isLoading: false,
        isDisabled: false,
        error: null,
        lastAction: context.action,
        retryCount: 0,
        progress: showProgress ? 100 : undefined,
        lastUpdated: new Date().toISOString()
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Action failed';
      
      // Update button state with error
      const currentState = this.activeButtons.get(buttonId)!;
      const newRetryCount = currentState.retryCount + 1;
      
      this.activeButtons.set(buttonId, {
        isLoading: false,
        isDisabled: newRetryCount >= (context.options?.retryCount || this.MAX_RETRY_COUNT),
        error: errorMessage,
        lastAction: context.action,
        retryCount: newRetryCount,
        progress: 0,
        lastUpdated: new Date().toISOString()
      });

      // Show error feedback
      this.showErrorFeedback(context.action, errorMessage, newRetryCount);
      
      throw error;
    }
  }

  // Retry failed action
  async retryAction(
    buttonId: string,
    context: ButtonActionContext,
    actionFn: () => Promise<any>
  ): Promise<any> {
    const state = this.activeButtons.get(buttonId);
    if (!state || state.retryCount === 0) {
      throw new Error('No failed action to retry');
    }

    // Reset retry count and try again
    context.options = {
      ...context.options,
      retryCount: (context.options?.retryCount || this.MAX_RETRY_COUNT) - 1
    };

    return this.executeAction(buttonId, context, actionFn);
  }

  // Show success feedback based on action type
  private showSuccessFeedback(action: ButtonAction): void {
    const messages = {
      save: 'Data saved successfully',
      run: 'Process completed successfully',
      generate: 'Content generated successfully',
      import: 'Data imported successfully',
      export: 'Data exported successfully',
      test: 'Test completed successfully',
      connect: 'Connection established successfully',
      delete: 'Item deleted successfully',
      clear: 'Data cleared successfully',
      refresh: 'Data refreshed successfully',
      submit: 'Form submitted successfully',
      cancel: 'Action cancelled',
      retry: 'Action retried successfully',
      validate: 'Validation passed',
      process: 'Processing completed',
      upload: 'File uploaded successfully',
      download: 'Download completed',
      sync: 'Sync completed successfully',
      backup: 'Backup created successfully',
      restore: 'Data restored successfully',
      encrypt: 'Data encrypted successfully',
      decrypt: 'Data decrypted successfully',
      authenticate: 'Authentication successful',
      logout: 'Logged out successfully',
      reset: 'Reset completed successfully',
      optimize: 'Optimization completed successfully',
      analyze: 'Analysis completed successfully',
      simulate: 'Simulation completed successfully',
      backtest: 'Backtest completed successfully',
      deploy: 'Deployment completed successfully'
    };

    const message = messages[action] || 'Action completed successfully';
    toast.success(message);
  }

  // Show error feedback based on action type
  private showErrorFeedback(action: ButtonAction, error: string, retryCount: number): void {
    const baseMessages = {
      save: 'Failed to save data',
      run: 'Process failed',
      generate: 'Failed to generate content',
      import: 'Failed to import data',
      export: 'Failed to export data',
      test: 'Test failed',
      connect: 'Connection failed',
      delete: 'Failed to delete item',
      clear: 'Failed to clear data',
      refresh: 'Failed to refresh data',
      submit: 'Form submission failed',
      cancel: 'Failed to cancel action',
      retry: 'Retry failed',
      validate: 'Validation failed',
      process: 'Processing failed',
      upload: 'Upload failed',
      download: 'Download failed',
      sync: 'Sync failed',
      backup: 'Backup failed',
      restore: 'Restore failed',
      encrypt: 'Encryption failed',
      decrypt: 'Decryption failed',
      authenticate: 'Authentication failed',
      logout: 'Logout failed',
      reset: 'Reset failed',
      optimize: 'Optimization failed',
      analyze: 'Analysis failed',
      simulate: 'Simulation failed',
      backtest: 'Backtest failed',
      deploy: 'Deployment failed'
    };

    const baseMessage = baseMessages[action] || 'Action failed';
    const retryMessage = retryCount > 0 ? ` (Retry ${retryCount}/${this.MAX_RETRY_COUNT})` : '';
    
    toast.error(`${baseMessage}: ${error}${retryMessage}`);
  }

  // Disable all buttons (useful for logout)
  disableAllButtons(): void {
    this.activeButtons.forEach((state, buttonId) => {
      this.activeButtons.set(buttonId, {
        ...state,
        isDisabled: true,
        isLoading: false
      });
    });
  }

  // Get all active button states
  getAllButtonStates(): Map<string, ButtonState> {
    return new Map(this.activeButtons);
  }

  // Clear all button states
  clearAllButtonStates(): void {
    this.activeButtons.clear();
  }
}

// Export the manager for direct access
export const buttonValidationManager = ButtonValidationManager.getInstance();

// Utility functions for common button actions
export const buttonActions = {
  // Save data with validation
  async saveData(data: any, options?: { requireApiKey?: string; requireConfirmation?: boolean }): Promise<void> {
    return buttonValidationManager.executeAction(
      'save-button',
      {
        action: 'save',
        data,
        options: { requireData: true, requireValidation: true, ...options }
      },
      async () => {
        // Implement actual save logic here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
        return true;
      }
    );
  },

  // Run process with validation
  async runProcess(processData: any, options?: { requireApiKey?: string; showProgress?: boolean }): Promise<any> {
    return buttonValidationManager.executeAction(
      'run-button',
      {
        action: 'run',
        data: processData,
        options: { requireData: true, showProgress: options?.showProgress, ...options }
      },
      async () => {
        // Implement actual process logic here
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate process
        return { result: 'success', data: processData };
      }
    );
  },

  // Generate content with AI
  async generateContent(prompt: string, options?: { requireApiKey?: string; showProgress?: boolean }): Promise<string> {
    return buttonValidationManager.executeAction(
      'generate-button',
      {
        action: 'generate',
        data: { prompt },
        options: { requireData: true, requireApiKey: options?.requireApiKey || 'openai', showProgress: options?.showProgress }
      },
      async () => {
        // Implement actual AI generation logic here
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate AI generation
        return `Generated content for: ${prompt}`;
      }
    );
  },

  // Import data with validation
  async importData(file: File, options?: { requireValidation?: boolean; validateFormat?: boolean }): Promise<any> {
    return buttonValidationManager.executeAction(
      'import-button',
      {
        action: 'import',
        data: { file },
        options: { requireData: true, requireValidation: true, validateFormat: true, ...options }
      },
      async () => {
        // Implement actual import logic here
        const content = await file.text();
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate import
        return { imported: true, rows: content.split('\n').length - 1 };
      }
    );
  },

  // Export data
  async exportData(data: any, filename?: string): Promise<string> {
    return buttonValidationManager.executeAction(
      'export-button',
      {
        action: 'export',
        data: { content: data, filename },
        options: { requireData: true, requireValidation: true }
      },
      async () => {
        // Implement actual export logic here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate export
        return `data-export-${Date.now()}.json`;
      }
    );
  },

  // Test connection
  async testConnection(provider: string): Promise<boolean> {
    return buttonValidationManager.executeAction(
      'test-button',
      {
        action: 'test',
        data: { provider },
        options: { requireApiKey: provider }
      },
      async () => {
        return await apiKeyManager.testConnection(provider);
      }
    );
  },

  // Connect to service
  async connectService(service: string, credentials: any): Promise<boolean> {
    return buttonValidationManager.executeAction(
      'connect-button',
      {
        action: 'connect',
        data: { service, credentials },
        options: { requireData: true, requireValidation: true }
      },
      async () => {
        // Implement actual connection logic here
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate connection
        return true;
      }
    );
  },

  // Delete item with confirmation
  async deleteItem(itemId: string, itemType: string): Promise<void> {
    return buttonValidationManager.executeAction(
      'delete-button',
      {
        action: 'delete',
        data: { itemId, itemType },
        options: { requireData: true, requireConfirmation: true }
      },
      async () => {
        // Implement actual delete logic here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delete
      }
    );
  },

  // Clear data with confirmation
  async clearData(dataType: string): Promise<void> {
    return buttonValidationManager.executeAction(
      'clear-button',
      {
        action: 'clear',
        data: { dataType },
        options: { requireData: true, requireConfirmation: true }
      },
      async () => {
        // Implement actual clear logic here
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate clear
      }
    );
  },

  // Refresh data
  async refreshData(dataType: string): Promise<any> {
    return buttonValidationManager.executeAction(
      'refresh-button',
      {
        action: 'refresh',
        data: { dataType },
        options: { requireData: true }
      },
      async () => {
        // Implement actual refresh logic here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate refresh
        return { refreshed: true, timestamp: new Date().toISOString() };
      }
    );
  },

  // Submit form with validation
  async submitForm(formData: any, validationRules?: any): Promise<void> {
    return buttonValidationManager.executeAction(
      'submit-button',
      {
        action: 'submit',
        data: { formData, validationRules },
        options: { requireData: true, requireValidation: true }
      },
      async () => {
        // Implement actual form submission logic here
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate submission
      }
    );
  },

  // Upload file with validation
  async uploadFile(file: File, uploadType: string): Promise<string> {
    return buttonValidationManager.executeAction(
      'upload-button',
      {
        action: 'upload',
        data: { file, uploadType },
        options: { requireData: true, requireValidation: true, validateFormat: true, showProgress: true }
      },
      async () => {
        // Implement actual upload logic here
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate upload
        return `https://example.com/uploads/${file.name}`;
      }
    );
  },

  // Process data
  async processData(data: any, processType: string): Promise<any> {
    return buttonValidationManager.executeAction(
      'process-button',
      {
        action: 'process',
        data: { data, processType },
        options: { requireData: true, requireValidation: true, showProgress: true }
      },
      async () => {
        // Implement actual processing logic here
        await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate processing
        return { processed: true, result: 'Processed data' };
      }
    );
  },

  // Backtest strategy
  async backtestStrategy(strategy: any, historicalData: any): Promise<any> {
    return buttonValidationManager.executeAction(
      'backtest-button',
      {
        action: 'backtest',
        data: { strategy, historicalData },
        options: { requireData: true, requireValidation: true, showProgress: true, timeout: 60000 }
      },
      async () => {
        // Implement actual backtest logic here
        await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate backtest
        return { backtestResults: 'Backtest completed', performance: 0.85 };
      }
    );
  },

  // Simulate scenario
  async simulateScenario(scenario: any, parameters: any): Promise<any> {
    return buttonValidationManager.executeAction(
      'simulate-button',
      {
        action: 'simulate',
        data: { scenario, parameters },
        options: { requireData: true, requireValidation: true, showProgress: true }
      },
      async () => {
        // Implement actual simulation logic here
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate simulation
        return { simulationResults: 'Simulation completed', outcomes: ['success', 'failure'] };
      }
    );
  },

  // Analyze data
  async analyzeData(dataset: any): Promise<any> {
    return buttonValidationManager.executeAction(
      'analyze-button',
      {
        action: 'analyze',
        data: { dataset },
        options: { requireData: true, requireValidation: true, showProgress: true }
      },
      async () => {
        // Implement actual analysis logic here
        await new Promise(resolve => setTimeout(resolve, 4000)); // Simulate analysis
        return { analysisResults: 'Analysis completed', insights: ['insight1', 'insight2'] };
      }
    );
  },

  // Optimize parameters
  async optimizeParameters(parameters: any, objective: any): Promise<any> {
    return buttonValidationManager.executeAction(
      'optimize-button',
      {
        action: 'optimize',
        data: { parameters, objective },
        options: { requireData: true, requireValidation: true, showProgress: true, timeout: 120000 }
      },
      async () => {
        // Implement actual optimization logic here
        await new Promise(resolve => setTimeout(resolve, 8000)); // Simulate optimization
        return { optimizedParameters: 'Optimization completed', bestResult: 0.95 };
      }
    );
  }
};

// React hook for button state management
export const useButtonState = (buttonId: string) => {
  const getState = () => buttonValidationManager.getButtonState(buttonId);
  const resetState = () => buttonValidationManager.resetButtonState(buttonId);
  
  return {
    getState,
    resetState,
    isActive: () => {
      const state = getState();
      return state?.isLoading || false;
    },
    isDisabled: () => {
      const state = getState();
      return state?.isDisabled || false;
    },
    getError: () => {
      const state = getState();
      return state?.error || null;
    },
    getProgress: () => {
      const state = getState();
      return state?.progress || 0;
    },
    getLastAction: () => {
      const state = getState();
      return state?.lastAction;
    },
    getRetryCount: () => {
      const state = getState();
      return state?.retryCount || 0;
    }
  };
};
