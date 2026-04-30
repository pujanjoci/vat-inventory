'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { RMMaster, FGMaster, BPMaster, PartyMaster, GLMaster, AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { fetchFromGAS, ACTIONS } from '../api';

interface AppContextType {
  masters: {
    rm: RMMaster[];
    fg: FGMaster[];
    bp: BPMaster[];
    party: PartyMaster[];
    gl: GLMaster[];
  };
  settings: AppSettings;
  isLoading: boolean;
  refreshMasters: () => Promise<void>;
  updateSettings: (newSettings: AppSettings) => void;
  showToast: (message: string, type: 'success' | 'error' | 'warning') => void;
  toasts: { id: string; message: string; type: 'success' | 'error' | 'warning' }[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [masters, setMasters] = useState({
    rm: [],
    fg: [],
    bp: [],
    party: [],
    gl: [],
  });
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ganesh_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    }
    return DEFAULT_SETTINGS;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'warning' }[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const refreshMasters = useCallback(async () => {
    if (!settings.appsScriptUrl) return;
    setIsLoading(true);
    try {
      const [rm, fg, bp, party, gl] = await Promise.all([
        fetchFromGAS(settings.appsScriptUrl, ACTIONS.GET_RM_MASTER),
        fetchFromGAS(settings.appsScriptUrl, ACTIONS.GET_FG_MASTER),
        fetchFromGAS(settings.appsScriptUrl, ACTIONS.GET_BP_MASTER),
        fetchFromGAS(settings.appsScriptUrl, ACTIONS.GET_PARTY_MASTER),
        fetchFromGAS(settings.appsScriptUrl, ACTIONS.GET_GL_MASTER),
      ]);
      setMasters({ rm, fg, bp, party, gl });
    } catch (error) {
      console.error('Failed to fetch masters:', error);
      showToast('Failed to sync master data from Google Sheets', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [settings.appsScriptUrl, showToast]);

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('ganesh_settings', JSON.stringify(newSettings));
    showToast('Settings saved successfully', 'success');
  };

  useEffect(() => {
    if (settings.appsScriptUrl) {
      refreshMasters();
    }
  }, [settings.appsScriptUrl, refreshMasters]);

  return (
    <AppContext.Provider value={{
      masters,
      settings,
      isLoading,
      refreshMasters,
      updateSettings,
      showToast,
      toasts
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
