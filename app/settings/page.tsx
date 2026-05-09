'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppContext } from '@/lib/context/AppContext';
import { Save, ExternalLink, ShieldCheck, Database, Building, User, CreditCard, Mail, Globe, Cloud } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings } = useAppContext();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(localSettings);
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Portal Configuration" 
        subtitle="Manage business credentials, financial rules, and database integration."
        breadcrumbs={[{ label: 'System' }, { label: 'Settings' }]}
      />

      <form onSubmit={handleSubmit} className="max-w-5xl space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Core Info */}
          <div className="lg:col-span-7 space-y-8">
            <Card title="Mill Profile & Identity">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input 
                    label="Company Name" 
                    value={localSettings.companyName} 
                    onChange={e => setLocalSettings({...localSettings, companyName: e.target.value})}
                    required 
                    icon={<Building className="h-4 w-4" />}
                  />
                </div>
                <Input 
                  label="PAN Number" 
                  value={localSettings.panNo} 
                  onChange={e => setLocalSettings({...localSettings, panNo: e.target.value})}
                  required 
                  icon={<CreditCard className="h-4 w-4" />}
                />
                <Input 
                  label="Administrator Name" 
                  value={localSettings.userName} 
                  onChange={e => setLocalSettings({...localSettings, userName: e.target.value})}
                  required 
                  icon={<User className="h-4 w-4" />}
                />
                <Input 
                  label="Contact Email" 
                  type="email"
                  placeholder="admin@ganeshtelmill.com"
                  icon={<Mail className="h-4 w-4" />}
                />
                <Input 
                  label="Contact Number" 
                  value={localSettings.contactNo} 
                  onChange={e => setLocalSettings({...localSettings, contactNo: e.target.value})}
                  icon={<Globe className="h-4 w-4" />}
                />
              </div>
            </Card>

            <Card title="Infrastructure & Database Integration">
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                    <Cloud className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">Google Apps Script Connector</h4>
                    <p className="text-[11px] text-[var(--color-text-muted)] mb-4 leading-relaxed font-medium">
                      All data is persisted in a Google Sheet. Deploy your GAS script as a "Web App" and paste the endpoint URL below.
                    </p>
                    <Input 
                      placeholder="https://script.google.com/macros/s/.../exec" 
                      value={localSettings.appsScriptUrl} 
                      onChange={e => setLocalSettings({...localSettings, appsScriptUrl: e.target.value})}
                      className="bg-white"
                    />
                    
                    <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-[var(--color-text-primary)]">Spreadsheet Health</p>
                          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Ensure your Google Sheet headers match the system configuration.</p>
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="text-[var(--color-accent)] border-[var(--color-accent)] hover:bg-[var(--color-accent-light)]"
                          onClick={async () => {
                            if (!localSettings.appsScriptUrl) return alert('Please enter Apps Script URL first');
                            try {
                              const { postToGAS, ACTIONS } = await import('@/lib/api');
                              await postToGAS(localSettings.appsScriptUrl, 'syncHeaders', {});
                              alert('Spreadsheet headers synchronized successfully!');
                            } catch (err: any) {
                              alert('Failed to sync: ' + err.message);
                            }
                          }}
                        >
                          <Database className="w-3.5 h-3.5 mr-2" /> Sync Structure
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <a href="https://github.com/pujanjoci/vat-inventory#setup" target="_blank" rel="noopener noreferrer" className="text-[11px] text-[var(--color-accent)] font-bold uppercase tracking-wider flex items-center gap-2 hover:underline">
                    <ExternalLink className="w-3 h-3" /> Setup Documentation
                  </a>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">System Ready</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Rules & Status */}
          <div className="lg:col-span-5 space-y-8">
            <Card title="Taxation Rules">
              <div className="space-y-6">
                <Input 
                  label="Standard VAT Rate (%)" 
                  type="number" 
                  value={localSettings.vatRate} 
                  onChange={e => setLocalSettings({...localSettings, vatRate: parseFloat(e.target.value)})}
                  required 
                  icon={<span className="text-[10px] font-bold">%</span>}
                />
                
                <div className="p-4 bg-accent-light border border-accent/20 rounded-2xl flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-[var(--color-accent)] shrink-0" />
                  <div className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed font-medium">
                    This rate is used to calculate <strong>Taxable Amount</strong> and <strong>VAT Liability</strong> globally across Sales, Purchase, and Inventory modules.
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)]">
                   <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Compliance Status</p>
                   <div className="space-y-3">
                      <div className="flex items-center justify-between">
                         <span className="text-xs text-[var(--color-text-secondary)]">IRM Nepal Registered</span>
                         <Badge variant="FINAL">ACTIVE</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-xs text-[var(--color-text-secondary)]">PAN Verification</span>
                         <Badge variant="FINAL">VERIFIED</Badge>
                      </div>
                   </div>
                </div>
              </div>
            </Card>

            <Card title="System Integrity" className="bg-slate-900 text-white border-0 shadow-2xl h-full shadow-accent/10">
               <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                     <Database className="h-6 w-6 text-white" />
                  </div>
                  <div>
                     <h4 className="text-sm font-bold text-white mb-1">Local Data Store</h4>
                     <p className="text-[11px] text-white/70 font-medium">Your session state is cached locally for performance.</p>
                  </div>
               </div>
               <Button variant="outline" className="w-full mt-6 bg-white/10 border-white/20 hover:bg-white text-white hover:text-[var(--color-accent)]">
                  Purge Cache
               </Button>
            </Card>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="gap-2 px-10 h-14 rounded-2xl shadow-2xl shadow-accent/30">
            <Save className="w-5 h-5" /> Commit All Changes
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
