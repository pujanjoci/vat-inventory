'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { RMMaster, FGMaster, BPMaster, PartyMaster, GLMaster, AppSettings, User } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { fetchFromGAS, ACTIONS } from '../api';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info, User as UserIcon } from 'lucide-react';
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
  user: User | null;
  mounted: boolean;
  login: (userData: User) => void;
  logout: () => void;
  masters: {
    rm: RMMaster[];
    fg: FGMaster[];
    parties: BPMaster[];
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
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ganesh_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    setMounted(true);
  }, []);

  const [masters, setMasters] = useState({
    rm: [],
    fg: [],
    parties: [],
    gl: [],
  });
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ganesh_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Fallback to DEFAULT_SETTINGS (env var) if saved URL is empty
        if (!parsed.appsScriptUrl) parsed.appsScriptUrl = DEFAULT_SETTINGS.appsScriptUrl;
        return parsed;
      }
      return DEFAULT_SETTINGS;
    }
    return DEFAULT_SETTINGS;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('ganesh_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ganesh_user');
    window.location.href = '/login';
  };

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
      const [rm, fg, parties, gl] = await Promise.all([
        fetchFromGAS(settings.appsScriptUrl, ACTIONS.GET_RM_MASTER),
        fetchFromGAS(settings.appsScriptUrl, ACTIONS.GET_FG_MASTER),
        fetchFromGAS(settings.appsScriptUrl, ACTIONS.GET_BP_MASTER),
        fetchFromGAS(settings.appsScriptUrl, ACTIONS.GET_GL_MASTER),
      ]);
      setMasters({ rm, fg, parties, gl });
    } catch (error) {
      console.error('Failed to fetch masters:', error);
      // Don't show toast on initial load error if not logged in
      if (user) showToast('Connection failed. Please check your Apps Script URL.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [settings.appsScriptUrl, showToast, user]);

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('ganesh_settings', JSON.stringify(newSettings));
    showToast('Settings saved successfully', 'success');
  };

  useEffect(() => {
    if (settings.appsScriptUrl && user) {
      refreshMasters();
    }
  }, [settings.appsScriptUrl, refreshMasters, user]);

  return (
    <AppContext.Provider value={{
      user,
      mounted,
      login,
      logout,
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
