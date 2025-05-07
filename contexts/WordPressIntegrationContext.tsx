"use client"

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface WordPressIntegrationContextType {
  integrationStatus: "inactive" | "active";
  SetIntegrationActive: () => void;
  SetIntegrationInactive: () => void;
}

const WordPressIntegrationContext = createContext<WordPressIntegrationContextType | undefined>(undefined);

interface WordPressIntegrationProviderProps {
  children: ReactNode;
}

export function WordPressIntegrationProvider({ children }: WordPressIntegrationProviderProps) {
  // App-level state that persists regardless of user changes
  const [integrationStatus, setIntegrationStatus] = useState<"inactive" | "active">("inactive");

  // Check URL for integration_status when the provider mounts
  useEffect(() => {
    // Only runs on client-side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const status = urlParams.get('integration_status');
      
      if (status === 'success') {
        setIntegrationStatus('active');
      }
    }
  }, []);

  const SetIntegrationActive = () => {
    console.log("[WP-Integration] Setting integration status to ACTIVE");
    setIntegrationStatus("active");
  };

  const SetIntegrationInactive = () => {
    console.log("[WP-Integration] Setting integration status to INACTIVE");
    setIntegrationStatus("inactive");
  };

  const value = {
    integrationStatus,
    SetIntegrationActive,
    SetIntegrationInactive
  };

  return (
    <WordPressIntegrationContext.Provider value={value}>
      {children}
    </WordPressIntegrationContext.Provider>
  );
}

export function UseWordPressIntegration(): WordPressIntegrationContextType {
  const context = useContext(WordPressIntegrationContext);
  
  if (context === undefined) {
    throw new Error("UseWordPressIntegration must be used within a WordPressIntegrationProvider");
  }
  
  return context;
}

// Also provide a camelCase version for consistency with other hooks
export const useWordPressIntegration = UseWordPressIntegration; 