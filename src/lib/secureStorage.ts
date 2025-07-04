import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

// Platform detection
const isMobile = (): boolean => {
  return Capacitor.isNativePlatform();
};

// AES-256 Encryption utilities
class CryptoUtils {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;
  private static readonly SALT_LENGTH = 16;

  // Generate a secure key from password
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt data with AES-256-GCM
  static async encrypt(data: string, password: string): Promise<string> {
    try {
      const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      const key = await this.deriveKey(password, salt);
      
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(data);
      
      const encryptedData = await crypto.subtle.encrypt(
        { name: this.ALGORITHM, iv },
        key,
        encodedData
      );
      
      // Combine salt + iv + encrypted data
      const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encryptedData), salt.length + iv.length);
      
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt data with AES-256-GCM
  static async decrypt(encryptedData: string, password: string): Promise<string> {
    try {
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );
      
      const salt = combined.slice(0, this.SALT_LENGTH);
      const iv = combined.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
      const data = combined.slice(this.SALT_LENGTH + this.IV_LENGTH);
      
      const key = await this.deriveKey(password, salt);
      
      const decryptedData = await crypto.subtle.decrypt(
        { name: this.ALGORITHM, iv },
        key,
        data
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }
}

// Platform-specific secure storage with fallback
class PlatformSecureStorage {
  private static instance: PlatformSecureStorage;
  private deviceKey: string | null = null;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000;

  private constructor() {
    this.initializeDeviceKey();
  }

  static getInstance(): PlatformSecureStorage {
    if (!PlatformSecureStorage.instance) {
      PlatformSecureStorage.instance = new PlatformSecureStorage();
    }
    return PlatformSecureStorage.instance;
  }

  private async initializeDeviceKey(): Promise<void> {
    try {
      if (isMobile()) {
        // Use device-specific identifier for mobile
        this.deviceKey = await this.getDeviceIdentifier();
      } else {
        // Use browser fingerprint for web
        this.deviceKey = await this.getBrowserFingerprint();
      }
    } catch (error) {
      console.error('Failed to initialize device key:', error);
      // Fallback to a basic key
      this.deviceKey = 'fallback-device-key-2024';
    }
  }

  private async getDeviceIdentifier(): Promise<string> {
    try {
      if (isMobile()) {
        // Use Capacitor Device plugin for mobile
        const { Device } = await import('@capacitor/device');
        const info = await Device.getInfo();
        return `device-${info.model || 'unknown'}-${Date.now()}`;
      }
      return 'web-device';
    } catch (error) {
      console.error('Failed to get device identifier:', error);
      return 'fallback-device';
    }
  }

  private async getBrowserFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Browser fingerprint', 2, 2);
        const fingerprint = canvas.toDataURL();
        return `web-${fingerprint.slice(-20)}-${navigator.userAgent.slice(-10)}`;
      }
      return 'web-fallback';
    } catch (error) {
      console.error('Failed to get browser fingerprint:', error);
      return 'web-fallback';
    }
  }

  async setSecureItem(key: string, value: string): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        if (!this.deviceKey) {
          await this.initializeDeviceKey();
        }

        const encryptedValue = await CryptoUtils.encrypt(value, this.deviceKey);
        
        if (isMobile()) {
          try {
            const { Preferences } = await import('@capacitor/preferences');
            await Preferences.set({ key: `secure_${key}`, value: encryptedValue });
            return;
          } catch (error) {
            console.warn(`Mobile storage failed, attempt ${attempt}:`, error);
            lastError = error as Error;
            
            // Try fallback to localStorage
            if (attempt === this.MAX_RETRY_ATTEMPTS) {
              localStorage.setItem(`secure_${key}`, encryptedValue);
              return;
            }
          }
        } else {
          localStorage.setItem(`secure_${key}`, encryptedValue);
          return;
        }
      } catch (error) {
        console.error(`Storage attempt ${attempt} failed:`, error);
        lastError = error as Error;
        
        if (attempt < this.MAX_RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
        }
      }
    }
    
    throw new Error(`Failed to store data after ${this.MAX_RETRY_ATTEMPTS} attempts: ${lastError?.message}`);
  }

  async getSecureItem(key: string): Promise<string | null> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        if (!this.deviceKey) {
          await this.initializeDeviceKey();
        }

        let encryptedValue: string | null = null;
        
        if (isMobile()) {
          try {
            const { Preferences } = await import('@capacitor/preferences');
            const result = await Preferences.get({ key: `secure_${key}` });
            encryptedValue = result.value;
          } catch (error) {
            console.warn(`Mobile retrieval failed, attempt ${attempt}:`, error);
            lastError = error as Error;
            
            // Try fallback to localStorage
            if (attempt === this.MAX_RETRY_ATTEMPTS) {
              encryptedValue = localStorage.getItem(`secure_${key}`);
            }
          }
        } else {
          encryptedValue = localStorage.getItem(`secure_${key}`);
        }

        if (!encryptedValue) {
          return null;
        }

        return await CryptoUtils.decrypt(encryptedValue, this.deviceKey!);
      } catch (error) {
        console.error(`Retrieval attempt ${attempt} failed:`, error);
        lastError = error as Error;
        
        if (attempt < this.MAX_RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
        }
      }
    }
    
    console.error(`Failed to retrieve data after ${this.MAX_RETRY_ATTEMPTS} attempts:`, lastError);
    return null;
  }

  async removeSecureItem(key: string): Promise<void> {
    try {
      if (isMobile()) {
        try {
          const { Preferences } = await import('@capacitor/preferences');
          await Preferences.remove({ key: `secure_${key}` });
        } catch (error) {
          console.warn('Mobile removal failed, trying localStorage:', error);
          localStorage.removeItem(`secure_${key}`);
        }
      } else {
        localStorage.removeItem(`secure_${key}`);
      }
    } catch (error) {
      console.error('Failed to remove secure item:', error);
      throw new Error('Failed to remove data');
    }
  }

  async clearAllSecureData(): Promise<void> {
    try {
      if (isMobile()) {
        try {
          const { Preferences } = await import('@capacitor/preferences');
          await Preferences.clear();
        } catch (error) {
          console.warn('Mobile clear failed, trying localStorage:', error);
          this.clearLocalStorageSecureItems();
        }
      } else {
        this.clearLocalStorageSecureItems();
      }
    } catch (error) {
      console.error('Failed to clear secure data:', error);
      throw new Error('Failed to clear data');
    }
  }

  private clearLocalStorageSecureItems(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

// API Key Management with enhanced features
export interface ApiKeyConfig {
  openaiApiKey?: string;
  groqApiKey?: string;
  geminiApiKey?: string;
  newsApiKey?: string;
  yfinanceApiKey?: string;
  coingeckoApiKey?: string;
  alphavantageApiKey?: string;
  polygonApiKey?: string;
  exchangeRateApiKey?: string;
  fixerApiKey?: string;
  fmpApiKey?: string;
  etherscanApiKey?: string;
  finnhubApiKey?: string;
}

export interface ApiConnectionStatus {
  [key: string]: boolean | null; // null = loading, true = connected, false = failed
}

export interface ApiKeyMetadata {
  provider: string;
  lastTested: string;
  lastUsed: string;
  usageCount: number;
  isActive: boolean;
}

class ApiKeyManager {
  private static instance: ApiKeyManager;
  private storage: PlatformSecureStorage;
  private connectionStatus: ApiConnectionStatus = {};
  private retryAttempts: Map<string, number> = new Map();
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly CONNECTION_TIMEOUT = 10000;
  private readonly METADATA_KEY = 'api_key_metadata';

  private constructor() {
    this.storage = PlatformSecureStorage.getInstance();
  }

  static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  async saveApiKey(provider: string, key: string): Promise<void> {
    try {
      // Validate API key format
      if (!this.validateApiKeyFormat(provider, key)) {
        throw new Error(`Invalid ${provider} API key format`);
      }

      await this.storage.setSecureItem(`api_key_${provider}`, key);
      
      // Update metadata
      await this.updateApiKeyMetadata(provider, true);
      
      toast.success(`${provider} API key saved securely`);
      
      // Test connection after saving
      await this.testConnection(provider);
    } catch (error) {
      console.error(`Failed to save ${provider} API key:`, error);
      toast.error(`Failed to save ${provider} API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async getApiKey(provider: string): Promise<string | null> {
    try {
      const key = await this.storage.getSecureItem(`api_key_${provider}`);
      if (key) {
        await this.updateApiKeyMetadata(provider, false);
      }
      return key;
    } catch (error) {
      console.error(`Failed to get ${provider} API key:`, error);
      return null;
    }
  }

  async getAllApiKeys(): Promise<ApiKeyConfig> {
    const providers = [
      'openai', 'groq', 'gemini', 'news', 'yfinance', 'coingecko',
      'alphavantage', 'polygon', 'exchangeRate', 'fixer', 'fmp',
      'etherscan', 'finnhub'
    ];

    const keys: ApiKeyConfig = {};
    
    for (const provider of providers) {
      const key = await this.getApiKey(provider);
      if (key) {
        const configKey = `${provider}ApiKey` as keyof ApiKeyConfig;
        keys[configKey] = key;
      }
    }

    return keys;
  }

  async removeApiKey(provider: string): Promise<void> {
    try {
      await this.storage.removeSecureItem(`api_key_${provider}`);
      this.connectionStatus[provider] = false;
      await this.updateApiKeyMetadata(provider, false, true);
      toast.success(`${provider} API key removed`);
    } catch (error) {
      console.error(`Failed to remove ${provider} API key:`, error);
      toast.error(`Failed to remove ${provider} API key`);
    }
  }

  async testConnection(provider: string): Promise<boolean> {
    const key = await this.getApiKey(provider);
    if (!key) {
      this.connectionStatus[provider] = false;
      return false;
    }

    this.connectionStatus[provider] = null; // Loading

    try {
      const isConnected = await this.performConnectionTest(provider, key);
      this.connectionStatus[provider] = isConnected;
      
      if (isConnected) {
        this.retryAttempts.set(provider, 0); // Reset retry attempts on success
        await this.updateApiKeyMetadata(provider, true);
      } else {
        await this.handleConnectionFailure(provider);
      }
      
      return isConnected;
    } catch (error) {
      console.error(`Connection test failed for ${provider}:`, error);
      this.connectionStatus[provider] = false;
      await this.handleConnectionFailure(provider);
      return false;
    }
  }

  private async performConnectionTest(provider: string, key: string): Promise<boolean> {
    const testEndpoints = {
      openai: 'https://api.openai.com/v1/models',
      groq: 'https://api.groq.com/openai/v1/models',
      gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
      news: 'https://newsapi.org/v2/top-headlines?country=us&apiKey=',
      yfinance: 'https://query1.finance.yahoo.com/v8/finance/chart/AAPL',
      coingecko: 'https://api.coingecko.com/api/v3/ping',
      alphavantage: 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=',
      polygon: 'https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2023-01-09/2023-01-09?apiKey=',
      exchangeRate: 'https://api.exchangerate-api.com/v4/latest/USD',
      fixer: 'http://data.fixer.io/api/latest?access_key=',
      fmp: 'https://financialmodelingprep.com/api/v3/quote/AAPL?apikey=',
      etherscan: 'https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=',
      finnhub: 'https://finnhub.io/api/v1/quote?symbol=AAPL&token='
    };

    const endpoint = testEndpoints[provider as keyof typeof testEndpoints];
    if (!endpoint) return false;

    try {
      const url = endpoint.includes('apikey=') || endpoint.includes('token=') || endpoint.includes('apiKey=') 
        ? `${endpoint}${key}` 
        : endpoint;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.CONNECTION_TIMEOUT);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': provider === 'openai' || provider === 'groq' ? `Bearer ${key}` : '',
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error(`API test failed for ${provider}:`, error);
      return false;
    }
  }

  private async handleConnectionFailure(provider: string): Promise<void> {
    const attempts = this.retryAttempts.get(provider) || 0;
    const newAttempts = attempts + 1;
    this.retryAttempts.set(provider, newAttempts);

    if (newAttempts >= this.MAX_RETRY_ATTEMPTS) {
      toast.error(`${provider} API connection failed after ${this.MAX_RETRY_ATTEMPTS} attempts`);
    } else {
      toast.warning(`${provider} API connection failed. Retrying... (${newAttempts}/${this.MAX_RETRY_ATTEMPTS})`);
      
      // Retry after delay
      setTimeout(() => {
        this.testConnection(provider);
      }, 2000 * newAttempts); // Exponential backoff
    }
  }

  private async updateApiKeyMetadata(provider: string, isTested: boolean = false, isRemoved: boolean = false): Promise<void> {
    try {
      const metadataStr = await this.storage.getSecureItem(this.METADATA_KEY);
      const metadata: Record<string, ApiKeyMetadata> = metadataStr ? JSON.parse(metadataStr) : {};

      if (isRemoved) {
        delete metadata[provider];
      } else {
        metadata[provider] = {
          provider,
          lastTested: isTested ? new Date().toISOString() : (metadata[provider]?.lastTested || ''),
          lastUsed: new Date().toISOString(),
          usageCount: (metadata[provider]?.usageCount || 0) + 1,
          isActive: true
        };
      }

      await this.storage.setSecureItem(this.METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to update API key metadata:', error);
    }
  }

  private validateApiKeyFormat(provider: string, key: string): boolean {
    const patterns = {
      openai: /^sk-[a-zA-Z0-9]{32,}$/,
      groq: /^gsk_[a-zA-Z0-9]{32,}$/,
      gemini: /^AIza[a-zA-Z0-9_-]{35}$/,
      news: /^[a-zA-Z0-9]{32}$/,
      yfinance: /^[a-zA-Z0-9]{32,}$/,
      coingecko: /^CG-[a-zA-Z0-9]{32,}$/,
      alphavantage: /^[a-zA-Z0-9]{16}$/,
      polygon: /^[a-zA-Z0-9]{32,}$/,
      exchangeRate: /^[a-zA-Z0-9]{32,}$/,
      fixer: /^[a-zA-Z0-9]{32}$/,
      fmp: /^[a-zA-Z0-9]{32,}$/,
      etherscan: /^[a-zA-Z0-9]{34}$/,
      finnhub: /^[a-zA-Z0-9]{32,}$/
    };

    const pattern = patterns[provider as keyof typeof patterns];
    return pattern ? pattern.test(key) : true;
  }

  getConnectionStatus(): ApiConnectionStatus {
    return { ...this.connectionStatus };
  }

  async testAllConnections(): Promise<ApiConnectionStatus> {
    const providers = [
      'openai', 'groq', 'gemini', 'news', 'yfinance', 'coingecko',
      'alphavantage', 'polygon', 'exchangeRate', 'fixer', 'fmp',
      'etherscan', 'finnhub'
    ];

    const promises = providers.map(provider => this.testConnection(provider));
    await Promise.allSettled(promises);

    return this.getConnectionStatus();
  }

  async clearAllApiKeys(): Promise<void> {
    const providers = [
      'openai', 'groq', 'gemini', 'news', 'yfinance', 'coingecko',
      'alphavantage', 'polygon', 'exchangeRate', 'fixer', 'fmp',
      'etherscan', 'finnhub'
    ];

    for (const provider of providers) {
      await this.removeApiKey(provider);
    }

    this.connectionStatus = {};
    this.retryAttempts.clear();
  }

  async getApiKeyMetadata(): Promise<Record<string, ApiKeyMetadata>> {
    try {
      const metadataStr = await this.storage.getSecureItem(this.METADATA_KEY);
      return metadataStr ? JSON.parse(metadataStr) : {};
    } catch (error) {
      console.error('Failed to get API key metadata:', error);
      return {};
    }
  }

  async exportApiKeys(): Promise<string> {
    try {
      const keys = await this.getAllApiKeys();
      const metadata = await this.getApiKeyMetadata();
      
      const exportData = {
        keys,
        metadata,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      return btoa(JSON.stringify(exportData));
    } catch (error) {
      console.error('Failed to export API keys:', error);
      throw new Error('Failed to export API keys');
    }
  }

  async importApiKeys(exportData: string): Promise<void> {
    try {
      const data = JSON.parse(atob(exportData));
      
      if (!data.keys || !data.metadata) {
        throw new Error('Invalid export data format');
      }
      
      // Import keys
      for (const [provider, key] of Object.entries(data.keys)) {
        if (key && typeof key === 'string') {
          await this.saveApiKey(provider, key);
        }
      }
      
      // Import metadata
      await this.storage.setSecureItem(this.METADATA_KEY, JSON.stringify(data.metadata));
      
      toast.success('API keys imported successfully');
    } catch (error) {
      console.error('Failed to import API keys:', error);
      toast.error('Failed to import API keys: Invalid format');
      throw error;
    }
  }
}

export const apiKeyManager = ApiKeyManager.getInstance();
export const secureStorage = PlatformSecureStorage.getInstance();

// Utility functions
export const validateApiKey = (key: string, provider: string): boolean => {
  const patterns = {
    openai: /^sk-[a-zA-Z0-9]{32,}$/,
    groq: /^gsk_[a-zA-Z0-9]{32,}$/,
    gemini: /^AIza[a-zA-Z0-9_-]{35}$/,
    news: /^[a-zA-Z0-9]{32}$/,
    yfinance: /^[a-zA-Z0-9]{32,}$/,
    coingecko: /^CG-[a-zA-Z0-9]{32,}$/,
    alphavantage: /^[a-zA-Z0-9]{16}$/,
    polygon: /^[a-zA-Z0-9]{32,}$/,
    exchangeRate: /^[a-zA-Z0-9]{32,}$/,
    fixer: /^[a-zA-Z0-9]{32}$/,
    fmp: /^[a-zA-Z0-9]{32,}$/,
    etherscan: /^[a-zA-Z0-9]{34}$/,
    finnhub: /^[a-zA-Z0-9]{32,}$/
  };

  const pattern = patterns[provider as keyof typeof patterns];
  return pattern ? pattern.test(key) : true;
};

// Clear sensitive data on logout
export const clearSensitiveData = async (): Promise<void> => {
  try {
    await secureStorage.clearAllSecureData();
    toast.success('All sensitive data cleared');
  } catch (error) {
    console.error('Failed to clear sensitive data:', error);
    toast.error('Failed to clear sensitive data');
  }
}; 