// API provider types and utilities

export type ApiProvider = {
  id: string;
  name: string;
  description: string;
  apiKeyName: string;
  apiKeyPlaceholder: string;
  baseUrl?: string;
  isActive: boolean;
}

// System-wide API settings
export type ApiSettings = {
  currentProvider: string;
  providers: Record<string, ApiProviderSettings>;
}

export type ApiProviderSettings = {
  apiKey: string;
  baseUrl?: string;
  modelName?: string;
  additionalParams?: Record<string, any>;
}

// Mock API providers data
export const apiProviders: ApiProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "Integration with OpenAI's API (GPT models)",
    apiKeyName: "API Key",
    apiKeyPlaceholder: "sk-xxxxxxxxxxxxxxxxxxxxxxxx",
    isActive: true,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Integration with Anthropic's Claude models",
    apiKeyName: "API Key",
    apiKeyPlaceholder: "sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    baseUrl: "https://api.anthropic.com/v1",
    isActive: false,
  },
  {
    id: "google",
    name: "Google AI",
    description: "Integration with Google's Gemini models",
    apiKeyName: "API Key",
    apiKeyPlaceholder: "AIzaSyXXXXXXXXXXXXXXXXXX",
    baseUrl: "https://generativelanguage.googleapis.com/v1",
    isActive: false,
  },
  {
    id: "azure",
    name: "Azure OpenAI",
    description: "Integration with Microsoft Azure OpenAI Service",
    apiKeyName: "API Key",
    apiKeyPlaceholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    baseUrl: "https://your-resource-name.openai.azure.com",
    isActive: false,
  }
];

// Mock default API settings
export const defaultApiSettings: ApiSettings = {
  currentProvider: "openai",
  providers: {
    openai: {
      apiKey: "",
      modelName: "gpt-3.5-turbo",
    },
    anthropic: {
      apiKey: "",
      baseUrl: "https://api.anthropic.com/v1",
      modelName: "claude-2.1",
    },
    google: {
      apiKey: "",
      baseUrl: "https://generativelanguage.googleapis.com/v1",
      modelName: "gemini-pro",
    },
    azure: {
      apiKey: "",
      baseUrl: "",
      modelName: "gpt-4",
      additionalParams: {
        apiVersion: "2023-05-15",
        deploymentName: "your-deployment-name"
      }
    }
  }
};

// Get API settings (mock implementation)
export function getApiSettings(): Promise<ApiSettings> {
  return new Promise((resolve) => {
    // In a real implementation, this would fetch from database or WordPress options
    setTimeout(() => {
      resolve(defaultApiSettings);
    }, 300);
  });
}

// Update API settings (mock implementation)
export function updateApiSettings(settings: ApiSettings): Promise<ApiSettings> {
  return new Promise((resolve) => {
    // In a real implementation, this would update the database or WordPress options
    setTimeout(() => {
      resolve(settings);
    }, 500);
  });
}

// Test API connection (mock implementation)
export function testApiConnection(providerId: string, settings: ApiProviderSettings): Promise<{success: boolean, message: string}> {
  return new Promise((resolve) => {
    // In a real implementation, this would make a test call to the API
    setTimeout(() => {
      if (!settings.apiKey) {
        resolve({
          success: false,
          message: "API key is required"
        });
      } else if (settings.apiKey.startsWith("invalid")) {
        resolve({
          success: false,
          message: "Invalid API key"
        });
      } else {
        resolve({
          success: true,
          message: "Connection successful!"
        });
      }
    }, 1000);
  });
} 