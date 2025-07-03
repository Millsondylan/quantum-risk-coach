// Form validation utilities for better performance

export interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Common validation rules
export const validationRules = {
  required: (value: string): boolean => value.trim().length > 0,
  minLength: (min: number) => (value: string): boolean => value.length >= min,
  maxLength: (max: number) => (value: string): boolean => value.length <= max,
  pattern: (regex: RegExp) => (value: string): boolean => regex.test(value),
  email: (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  username: (value: string): boolean => /^[a-zA-Z0-9_-]+$/.test(value),
  noSpecialChars: (value: string): boolean => /^[a-zA-Z0-9\s]+$/.test(value),
};

// Debounced validation function
export const debouncedValidation = (
  value: string,
  rules: ValidationRule[],
  delay: number = 300
): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      const errors: string[] = [];
      
      for (const rule of rules) {
        if (!rule.test(value)) {
          errors.push(rule.message);
        }
      }
      
      resolve({
        isValid: errors.length === 0,
        errors
      });
    }, delay);
    
    // Return cleanup function
    return () => clearTimeout(timeoutId);
  });
};

// Quick validation for immediate feedback
export const quickValidation = (value: string, rules: ValidationRule[]): ValidationResult => {
  const errors: string[] = [];
  
  for (const rule of rules) {
    if (!rule.test(value)) {
      errors.push(rule.message);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Username validation rules
export const usernameValidationRules: ValidationRule[] = [
  {
    test: validationRules.required,
    message: 'Username is required'
  },
  {
    test: validationRules.minLength(3),
    message: 'Username must be at least 3 characters'
  },
  {
    test: validationRules.maxLength(20),
    message: 'Username must be less than 20 characters'
  },
  {
    test: validationRules.username,
    message: 'Username can only contain letters, numbers, underscores, and hyphens'
  }
];

// Email validation rules
export const emailValidationRules: ValidationRule[] = [
  {
    test: validationRules.required,
    message: 'Email is required'
  },
  {
    test: validationRules.email,
    message: 'Please enter a valid email address'
  }
];

// Password validation rules
export const passwordValidationRules: ValidationRule[] = [
  {
    test: validationRules.required,
    message: 'Password is required'
  },
  {
    test: validationRules.minLength(6),
    message: 'Password must be at least 6 characters'
  }
];

// Form submission with timeout
export const submitWithTimeout = async <T>(
  submitFn: () => Promise<T>,
  timeoutMs: number = 10000
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
  });
  
  return Promise.race([submitFn(), timeoutPromise]);
};

// Optimized form state management
export class FormStateManager {
  private validationTimeout: number | null = null;
  private isSubmitting = false;

  constructor(
    private validationRules: ValidationRule[],
    private debounceDelay: number = 300
  ) {}

  validate = async (value: string): Promise<ValidationResult> => {
    // Clear previous timeout
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout);
    }

    // Return quick validation for immediate feedback
    const quickResult = quickValidation(value, this.validationRules);
    
    // If quick validation fails, return immediately
    if (!quickResult.isValid) {
      return quickResult;
    }

    // For valid input, do debounced validation
    return new Promise((resolve) => {
      this.validationTimeout = setTimeout(() => {
        resolve(quickValidation(value, this.validationRules));
      }, this.debounceDelay);
    });
  };

  submit = async <T>(submitFn: () => Promise<T>): Promise<T> => {
    if (this.isSubmitting) {
      throw new Error('Form is already submitting');
    }

    this.isSubmitting = true;
    try {
      return await submitWithTimeout(submitFn);
    } finally {
      this.isSubmitting = false;
    }
  };

  cleanup = () => {
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout);
      this.validationTimeout = null;
    }
  };
} 