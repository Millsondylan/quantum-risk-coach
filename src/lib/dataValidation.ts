import { toast } from 'sonner';

// Data validation types
export interface ValidationError {
  row?: number;
  column?: string;
  message: string;
  severity: 'error' | 'warning';
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  data?: any;
  preview?: any[];
}

export interface DataStructure {
  required: string[];
  optional: string[];
  types: Record<string, 'string' | 'number' | 'date' | 'boolean'>;
  validators?: Record<string, (value: any) => boolean>;
}

// CSV parsing and validation
export class CSVValidator {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly MAX_ROWS = 10000;
  private static readonly SUPPORTED_TYPES = ['.csv', '.txt'];

  static async validateCSVFile(file: File): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // File size validation
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push({
        message: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (10MB)`,
        severity: 'error'
      });
    }

    // File type validation
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!this.SUPPORTED_TYPES.includes(fileExtension)) {
      errors.push({
        message: `Unsupported file type. Please upload a CSV or TXT file.`,
        severity: 'error'
      });
    }

    if (errors.length > 0) {
      return { isValid: false, errors, warnings };
    }

    try {
      const content = await file.text();
      return this.validateCSVContent(content, file.name);
    } catch (error) {
      errors.push({
        message: 'Failed to read file content',
        severity: 'error'
      });
      return { isValid: false, errors, warnings };
    }
  }

  static validateCSVContent(content: string, filename?: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const lines = content.split('\n').filter(line => line.trim());
    const preview: any[] = [];

    // Check minimum content
    if (lines.length < 2) {
      errors.push({
        message: 'CSV file must have at least a header row and one data row',
        severity: 'error'
      });
      return { isValid: false, errors, warnings };
    }

    // Check maximum rows
    if (lines.length > this.MAX_ROWS) {
      warnings.push({
        message: `File contains ${lines.length} rows. Only the first ${this.MAX_ROWS} rows will be processed.`,
        severity: 'warning'
      });
    }

    // Parse header
    const headerLine = lines[0];
    const headers = this.parseCSVRow(headerLine);
    
    if (headers.length === 0) {
      errors.push({
        message: 'Invalid header row',
        severity: 'error'
      });
      return { isValid: false, errors, warnings };
    }

    // Validate headers
    const requiredHeaders = ['symbol', 'type', 'entry_price', 'size', 'entry_date'];
    const missingHeaders = requiredHeaders.filter(h => 
      !headers.some(header => header.toLowerCase().includes(h))
    );

    if (missingHeaders.length > 0) {
      errors.push({
        message: `Missing required columns: ${missingHeaders.join(', ')}`,
        severity: 'error'
      });
    }

    // Parse and validate data rows
    const dataRows = lines.slice(1, Math.min(lines.length, this.MAX_ROWS + 1));
    const validData: any[] = [];

    dataRows.forEach((line, index) => {
      const rowNumber = index + 2; // +2 because we start from line 2 (after header)
      const values = this.parseCSVRow(line);

      if (values.length !== headers.length) {
        errors.push({
          row: rowNumber,
          message: `Column count mismatch. Expected ${headers.length}, got ${values.length}`,
          severity: 'error'
        });
        return;
      }

      const rowData: any = {};
      let rowValid = true;

      headers.forEach((header, colIndex) => {
        const value = values[colIndex];
        const headerKey = header.toLowerCase().trim();
        
        // Map common header variations
        const mappedHeader = this.mapHeader(headerKey);
        rowData[mappedHeader] = value;

        // Validate specific columns
        const columnValidation = this.validateColumn(mappedHeader, value, rowNumber);
        errors.push(...columnValidation.errors);
        warnings.push(...columnValidation.warnings);
        
        if (columnValidation.errors.length > 0) {
          rowValid = false;
        }
      });

      if (rowValid) {
        validData.push(rowData);
        if (preview.length < 10) {
          preview.push(rowData);
        }
      }
    });

    // Check if we have any valid data
    if (validData.length === 0) {
      errors.push({
        message: 'No valid data rows found',
        severity: 'error'
      });
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      data: validData,
      preview
    };
  }

  private static parseCSVRow(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private static mapHeader(header: string): string {
    const headerMappings: Record<string, string> = {
      'symbol': 'symbol',
      'pair': 'symbol',
      'currency': 'symbol',
      'type': 'type',
      'side': 'type',
      'direction': 'type',
      'entry_price': 'entryPrice',
      'entry price': 'entryPrice',
      'price': 'entryPrice',
      'open_price': 'entryPrice',
      'exit_price': 'exitPrice',
      'exit price': 'exitPrice',
      'close_price': 'exitPrice',
      'size': 'size',
      'amount': 'size',
      'quantity': 'size',
      'volume': 'size',
      'entry_date': 'entryDate',
      'entry date': 'entryDate',
      'date': 'entryDate',
      'time': 'entryDate',
      'exit_date': 'exitDate',
      'exit date': 'exitDate',
      'close_date': 'exitDate',
      'profit': 'profit',
      'pnl': 'profit',
      'profit_loss': 'profit',
      'fee': 'fee',
      'commission': 'fee',
      'notes': 'notes',
      'comment': 'notes',
      'description': 'notes',
      'stop_loss': 'stopLoss',
      'stop loss': 'stopLoss',
      'sl': 'stopLoss',
      'take_profit': 'takeProfit',
      'take profit': 'takeProfit',
      'tp': 'takeProfit',
      'order_id': 'orderId',
      'order id': 'orderId',
      'id': 'orderId'
    };

    return headerMappings[header] || header;
  }

  private static validateColumn(column: string, value: string, rowNumber: number): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    switch (column) {
      case 'symbol':
        if (!value || value.trim().length === 0) {
          errors.push({
            row: rowNumber,
            column,
            message: 'Symbol is required',
            severity: 'error',
            value
          });
        } else if (value.length > 20) {
          warnings.push({
            row: rowNumber,
            column,
            message: 'Symbol seems unusually long',
            severity: 'warning',
            value
          });
        }
        break;

      case 'type':
        const validTypes = ['buy', 'sell', 'long', 'short'];
        const normalizedType = value.toLowerCase().trim();
        if (!validTypes.includes(normalizedType)) {
          errors.push({
            row: rowNumber,
            column,
            message: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
            severity: 'error',
            value
          });
        }
        break;

      case 'entryPrice':
      case 'exitPrice':
      case 'stopLoss':
      case 'takeProfit':
        if (value && value.trim().length > 0) {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            errors.push({
              row: rowNumber,
              column,
              message: 'Must be a valid number',
              severity: 'error',
              value
            });
          } else if (numValue <= 0) {
            errors.push({
              row: rowNumber,
              column,
              message: 'Must be greater than 0',
              severity: 'error',
              value
            });
          }
        }
        break;

      case 'size':
        if (!value || value.trim().length === 0) {
          errors.push({
            row: rowNumber,
            column,
            message: 'Size is required',
            severity: 'error',
            value
          });
        } else {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            errors.push({
              row: rowNumber,
              column,
              message: 'Size must be a valid number',
              severity: 'error',
              value
            });
          } else if (numValue <= 0) {
            errors.push({
              row: rowNumber,
              column,
              message: 'Size must be greater than 0',
              severity: 'error',
              value
            });
          }
        }
        break;

      case 'entryDate':
        if (!value || value.trim().length === 0) {
          errors.push({
            row: rowNumber,
            column,
            message: 'Entry date is required',
            severity: 'error',
            value
          });
        } else {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors.push({
              row: rowNumber,
              column,
              message: 'Invalid date format',
              severity: 'error',
              value
            });
          } else if (date > new Date()) {
            warnings.push({
              row: rowNumber,
              column,
              message: 'Entry date is in the future',
              severity: 'warning',
              value
            });
          }
        }
        break;

      case 'exitDate':
        if (value && value.trim().length > 0) {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors.push({
              row: rowNumber,
              column,
              message: 'Invalid date format',
              severity: 'error',
              value
            });
          }
        }
        break;

      case 'profit':
        if (value && value.trim().length > 0) {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            errors.push({
              row: rowNumber,
              column,
              message: 'Profit must be a valid number',
              severity: 'error',
              value
            });
          }
        }
        break;

      case 'fee':
        if (value && value.trim().length > 0) {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            errors.push({
              row: rowNumber,
              column,
              message: 'Fee must be a valid number',
              severity: 'error',
              value
            });
          } else if (numValue < 0) {
            warnings.push({
              row: rowNumber,
              column,
              message: 'Fee is negative',
              severity: 'warning',
              value
            });
          }
        }
        break;
    }

    return { isValid: errors.length === 0, errors, warnings };
  }
}

// Data structure validation
export class DataStructureValidator {
  static validateStructure(data: any, structure: DataStructure): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check required fields
    for (const field of structure.required) {
      if (!(field in data) || data[field] === null || data[field] === undefined) {
        errors.push({
          column: field,
          message: `Required field '${field}' is missing`,
          severity: 'error'
        });
      }
    }

    // Check field types
    for (const [field, expectedType] of Object.entries(structure.types)) {
      if (data[field] !== null && data[field] !== undefined) {
        const actualType = this.getType(data[field]);
        if (actualType !== expectedType) {
          errors.push({
            column: field,
            message: `Field '${field}' should be ${expectedType}, got ${actualType}`,
            severity: 'error',
            value: data[field]
          });
        }
      }
    }

    // Run custom validators
    if (structure.validators) {
      for (const [field, validator] of Object.entries(structure.validators)) {
        if (data[field] !== null && data[field] !== undefined) {
          if (!validator(data[field])) {
            errors.push({
              column: field,
              message: `Field '${field}' failed validation`,
              severity: 'error',
              value: data[field]
            });
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private static getType(value: any): string {
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'unknown';
  }
}

// Empty state management
export class EmptyStateManager {
  private static readonly EMPTY_STATE_MESSAGES = {
    trades: {
      title: 'No trades yet',
      message: 'Add your first trade to get started!',
      action: 'Add Trade',
      icon: '📊'
    },
    portfolio: {
      title: 'No portfolio data',
      message: 'Set up your portfolio to track your performance.',
      action: 'Setup Portfolio',
      icon: '💼'
    },
    analytics: {
      title: 'No analytics data',
      message: 'Analytics will appear once you add trades and set your balance.',
      action: 'Add Trades',
      icon: '📈'
    },
    history: {
      title: 'No trading history',
      message: 'Your trading history will show here as you add trades.',
      action: 'Start Trading',
      icon: '📅'
    },
    dashboard: {
      title: 'Dashboard empty',
      message: 'Your dashboard will populate with data as you start trading.',
      action: 'Get Started',
      icon: '🏠'
    },
    watchlist: {
      title: 'No watchlist items',
      message: 'Add currency pairs to your watchlist to track their performance.',
      action: 'Add Symbols',
      icon: '👀'
    },
    goals: {
      title: 'No trading goals',
      message: 'Set trading goals to track your progress and stay motivated.',
      action: 'Set Goals',
      icon: '🎯'
    },
    news: {
      title: 'No news available',
      message: 'Market news and analysis will help inform your trading decisions.',
      action: 'Refresh',
      icon: '📰'
    },
    alerts: {
      title: 'No alerts set',
      message: 'Set up price alerts to stay informed about market movements.',
      action: 'Create Alert',
      icon: '🔔'
    },
    journal: {
      title: 'No journal entries',
      message: 'Start journaling your trades to improve your trading psychology.',
      action: 'Add Entry',
      icon: '📝'
    }
  };

  static getEmptyState(type: string, customMessage?: string) {
    const defaultState = this.EMPTY_STATE_MESSAGES[type as keyof typeof this.EMPTY_STATE_MESSAGES] || {
      title: 'No data available',
      message: 'No data is currently available for this section.',
      action: 'Refresh',
      icon: '📋'
    };

    return {
      ...defaultState,
      message: customMessage || defaultState.message
    };
  }

  static shouldShowEmptyState(data: any[] | null | undefined, minItems: number = 1): boolean {
    return !data || data.length < minItems;
  }

  static getEmptyStateForData(data: any[], type: string, minItems: number = 1): any | null {
    if (this.shouldShowEmptyState(data, minItems)) {
      return this.getEmptyState(type);
    }
    return null;
  }
}

// Data sanitization
export class DataSanitizer {
  static sanitizeTradeData(data: any): any {
    const sanitized = { ...data };

    // Clean symbol
    if (sanitized.symbol) {
      sanitized.symbol = sanitized.symbol.toString().toUpperCase().trim();
    }

    // Clean type
    if (sanitized.type) {
      const type = sanitized.type.toString().toLowerCase().trim();
      sanitized.type = ['buy', 'sell', 'long', 'short'].includes(type) ? type : 'buy';
    }

    // Clean numeric values
    ['entryPrice', 'exitPrice', 'size', 'profit', 'fee', 'stopLoss', 'takeProfit'].forEach(field => {
      if (sanitized[field] !== null && sanitized[field] !== undefined) {
        const num = parseFloat(sanitized[field]);
        sanitized[field] = isNaN(num) ? null : num;
      }
    });

    // Clean dates
    ['entryDate', 'exitDate'].forEach(field => {
      if (sanitized[field]) {
        const date = new Date(sanitized[field]);
        sanitized[field] = isNaN(date.getTime()) ? null : date.toISOString();
      }
    });

    // Clean notes
    if (sanitized.notes) {
      sanitized.notes = sanitized.notes.toString().trim();
    }

    return sanitized;
  }

  static generateFallbackName(originalName: string, index: number): string {
    if (originalName && originalName.trim()) {
      return originalName.trim();
    }
    return `Unnamed File #${index + 1}`;
  }
}

// Export utility functions
export const validateData = {
  csv: CSVValidator.validateCSVFile,
  structure: DataStructureValidator.validateStructure,
  emptyState: EmptyStateManager.getEmptyStateForData,
  sanitize: DataSanitizer.sanitizeTradeData
}; 