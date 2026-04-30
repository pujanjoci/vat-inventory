'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/lib/context/AppContext';
import { Save, ExternalLink, ShieldCheck, Database } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings } = useApp();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(localSettings);
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Settings" 
        description="Configure your mill details and connect to your Google Sheets database."
      />

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card title="Company Information">
            <div className="space-y-4">
              <Input 
                label="Company Name" 
                value={localSettings.companyName} 
                onChange={e => setLocalSettings({...localSettings, companyName: e.target.value})}
                required 
              />
              <Input 
                label="PAN No" 
                value={localSettings.panNo} 
                onChange={e => setLocalSettings({...localSettings, panNo: e.target.value})}
                required 
              />
              <Input 
                label="User Name" 
                value={localSettings.userName} 
                onChange={e => setLocalSettings({...localSettings, userName: e.target.value})}
                required 
              />
              <Input 
                label="Contact No" 
                value={localSettings.contactNo} 
                onChange={e => setLocalSettings({...localSettings, contactNo: e.target.value})}
              />
            </div>
          </Card>

          <Card title="Financial Configuration">
            <div className="space-y-4">
              <Input 
                label="VAT Rate (%)" 
                type="number" 
                value={localSettings.vatRate} 
                onChange={e => setLocalSettings({...localSettings, vatRate: parseFloat(e.target.value)})}
                required 
              />
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                <div className="text-xs text-indigo-800 leading-relaxed">
                  VAT rates are applied to all transactions where <strong>Is Taxable?</strong> is set to <em>Yes</em>.
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card title="Backend Integration">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Database className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 mb-1">Google Apps Script Web App URL</h4>
                <p className="text-xs text-slate-500 mb-4">Paste your deployed Apps Script Web App URL here to connect the portal to your Google Sheets database.</p>
                <Input 
                  placeholder="https://script.google.com/macros/s/.../exec" 
                  value={localSettings.appsScriptUrl} 
                  onChange={e => setLocalSettings({...localSettings, appsScriptUrl: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <ExternalLink className="w-3 h-3" />
                Need help? Check the <strong>README.md</strong> for setup instructions.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="gap-2 px-8">
            <Save className="w-4 h-4" /> Save All Settings
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
