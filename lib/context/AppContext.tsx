'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { RMMaster, FGMaster, BPMaster, PartyMaster, GLMaster, AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { fetchFromGAS, ACTIONS } from '../api';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

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
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  refreshMasters: () => Promise<void>;
  updateSettings: (newSettings: AppSettings) => void;
  showToast: (message: string, type: Toast['type']) => void;
  toasts: Toast[];
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type']) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
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
      showToast('Connection failed. Please check your Apps Script URL.', 'error');
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
      sidebarCollapsed,
      setSidebarCollapsed,
      refreshMasters,
      updateSettings,
      showToast,
      toasts
    }}>
      {children}
      
      {/* Toast Portal */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
        ))}
      </div>
    </AppContext.Provider>
  );
}

const ToastItem = ({ toast, onClose }: { toast: Toast, onClose: () => void }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-[var(--color-success)]" />,
    error: <AlertCircle className="h-5 w-5 text-[var(--color-danger)]" />,
    warning: <AlertTriangle className="h-5 w-5 text-[var(--color-warning)]" />,
    info: <Info className="h-5 w-5 text-[var(--color-accent)]" />,
  };

  const variants = {
    success: 'border-l-4 border-l-[var(--color-success)]',
    error: 'border-l-4 border-l-[var(--color-danger)]',
    warning: 'border-l-4 border-l-[var(--color-warning)]',
    info: 'border-l-4 border-l-[var(--color-accent)]',
  };

  return (
    <div className={cn(
      "bg-white rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] flex items-start gap-3 min-w-[320px] max-w-sm p-4 pointer-events-auto animate-in slide-in-from-right transition-all",
      variants[toast.type]
    )}>
      <div className="shrink-0">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
          {toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
          {toast.message}
        </p>
      </div>
      <button onClick={onClose} className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
