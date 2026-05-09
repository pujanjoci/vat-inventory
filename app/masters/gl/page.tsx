'use client';

import React, { useState, useEffect } from 'react';
import { MasterPageTemplate } from '@/components/masters/MasterPageTemplate';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useAppContext } from '@/lib/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/format';
import { SUB_GROUPS } from '@/lib/constants';
import { Wallet, Landmark, Building2, Calculator, ReceiptText, Hash, Loader2 } from 'lucide-react';
import { postToGAS, ACTIONS } from '@/lib/api';

interface GLFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
}

const GLForm = ({ onSubmit, onCancel, initialData }: GLFormProps) => {
  const isEditMode = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultState = {
    'GL Asset Name': '',
    'Sub Group': '',
    'Main Group': '',
    'Header': '',
    'Type': 'BS',
    'FA Code': '',
    'Opening Debit': '0',
    'Opening Credit': '0'
  };

  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        'GL Asset Name': initialData['GL Asset Name'] || '',
        'Sub Group': initialData['Sub Group'] || '',
        'Main Group': initialData['Main Group'] || '',
        'Header': initialData['Header'] || '',
        'Type': initialData['Type'] || 'BS',
        'FA Code': initialData['FA Code'] || '',
        'Opening Debit': String(initialData['Opening Debit'] || '0'),
        'Opening Credit': String(initialData['Opening Credit'] || '0'),
      };
    }
    return defaultState;
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        'GL Asset Name': initialData['GL Asset Name'] || '',
        'Sub Group': initialData['Sub Group'] || '',
        'Main Group': initialData['Main Group'] || '',
        'Header': initialData['Header'] || '',
        'Type': initialData['Type'] || 'BS',
        'FA Code': initialData['FA Code'] || '',
        'Opening Debit': String(initialData['Opening Debit'] || '0'),
        'Opening Credit': String(initialData['Opening Credit'] || '0'),
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      if (!isEditMode) {
        setFormData(defaultState);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="md:col-span-2">
           <Input 
             label="Account / Asset Name" 
             name="GL Asset Name" 
             value={formData['GL Asset Name']}
             onChange={handleChange}
             placeholder="e.g. Mustard Seed Expeller Machine" 
             required 
             icon={<Landmark className="h-4 w-4 text-[var(--color-text-muted)]" />}
           />
        </div>
        
        <Select 
          label="Sub Group" 
          name="Sub Group" 
          value={formData['Sub Group']}
          onChange={handleChange}
          options={SUB_GROUPS.map(s => ({ label: s, value: s }))} 
          required 
        />
        
        <Input 
          label="Main Group" 
          name="Main Group" 
          value={formData['Main Group']}
          onChange={handleChange}
          placeholder="e.g. Fixed Assets" 
          required 
        />
        
        <Input 
          label="Reporting Header" 
          name="Header" 
          value={formData['Header']}
          onChange={handleChange}
          placeholder="e.g. Plant & Machinery" 
          required 
        />
        
        <Select 
          label="Account Type" 
          name="Type" 
          value={formData['Type']}
          onChange={handleChange}
          options={[
            { label: 'Balance Sheet (BS)', value: 'BS' },
            { label: 'Profit & Loss (PL)', value: 'PL' }
          ]} 
          required 
        />

        <Input 
          label="FA Code (Asset Code)" 
          name="FA Code" 
          value={formData['FA Code']}
          onChange={handleChange}
          placeholder="e.g. FA-001" 
          icon={<Hash className="h-4 w-4" />}
        />

        <div className="md:col-span-2 grid grid-cols-2 gap-6 p-4 bg-[var(--color-surface-raised)] rounded-xl border border-[var(--color-border)]">
          <Input 
            label="Opening Debit" 
            name="Opening Debit" 
            type="number" 
            step="0.01" 
            value={formData['Opening Debit']}
            onChange={handleChange}
          />
          <Input 
            label="Opening Credit" 
            name="Opening Credit" 
            type="number" 
            step="0.01" 
            value={formData['Opening Credit']}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--color-border)]">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button variant="primary" type="submit" className="shadow-lg shadow-accent/20" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {isEditMode ? 'Updating...' : 'Initializing...'}</>
          ) : (isEditMode ? 'Save Changes' : 'Initialize Account')}
        </Button>
      </div>
    </form>
  );
};

export default function GLMasterPage() {
  const { masters, settings, user, refreshMasters, showToast } = useAppContext();

  const handleAddGL = async (data: any) => {
    if (!settings.appsScriptUrl) { showToast('Apps Script URL not configured', 'error'); return; }
    try {
      const payload = { ...data, CompanyName: user?.CompanyName || settings.companyName };
      await postToGAS(settings.appsScriptUrl, ACTIONS.SAVE_MASTER, payload, { sheetName: 'GL_Master', role: user?.Role || 'Company' });
      showToast('Account initialized successfully', 'success');
      refreshMasters();
    } catch (error: any) {
      showToast(error.message || 'Failed to initialize account', 'error');
    }
  };

  const handleEditGL = async (data: any, originalItem: any) => {
    if (!settings.appsScriptUrl) return;
    try {
      const payload = {
        ...data,
        CompanyName: user?.CompanyName || settings.companyName,
        _matchKey: 'GL Asset Name',
        _matchValue: originalItem['GL Asset Name'],
        _companyName: user?.CompanyName || settings.companyName,
      };
      await postToGAS(settings.appsScriptUrl, ACTIONS.UPDATE_MASTER, payload, { sheetName: 'GL_Master', role: user?.Role || 'Company' });
      showToast('Account updated successfully', 'success');
      refreshMasters();
    } catch (error: any) {
      showToast(error.message || 'Failed to update account', 'error');
    }
  };

  const handleDeleteGL = async (item: any) => {
    if (!settings.appsScriptUrl) return;
    try {
      await postToGAS(settings.appsScriptUrl, ACTIONS.DELETE_MASTER, {
        _matchKey: 'GL Asset Name',
        _matchValue: item['GL Asset Name'],
        _companyName: user?.CompanyName || settings.companyName,
      }, { sheetName: 'GL_Master', role: user?.Role || 'Company' });
      showToast('Account deleted successfully', 'success');
      refreshMasters();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete account', 'error');
    }
  };

  const columns = [
    { 
      header: 'Account Name', 
      accessor: 'GL Asset Name',
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[var(--color-accent-light)] group-hover:text-[var(--color-accent)] transition-colors">
            {item.Type === 'BS' ? <Building2 className="h-4 w-4" /> : <ReceiptText className="h-4 w-4" />}
          </div>
          <div>
            <p className="font-bold text-[var(--color-text-primary)]">{item['GL Asset Name']}</p>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{item.Header}</p>
              {item['FA Code'] && <Badge variant="PRELIMINARY" className="text-[8px] py-0">{item['FA Code']}</Badge>}
            </div>
          </div>
        </div>
      )
    },
    { 
      header: 'Group', 
      accessor: 'Sub Group',
      render: (item: any) => (
        <span className="text-xs font-medium text-[var(--color-text-secondary)] px-2 py-1 bg-slate-50 rounded border border-slate-100">
          {item['Sub Group']}
        </span>
      )
    },
    { 
      header: 'Type', 
      accessor: 'Type',
      render: (item: any) => (
        <Badge variant={item.Type === 'BS' ? 'brand' : 'warning'}>
          {item.Type === 'BS' ? 'Balance Sheet' : 'Profit & Loss'}
        </Badge>
      )
    },
    { 
      header: 'Debit', 
      accessor: 'Opening Debit',
      align: 'right' as const,
      render: (item: any) => (
        <span className="font-mono text-[var(--color-text-primary)] font-medium">
          {item['Opening Debit'] > 0 ? `Rs. ${formatCurrency(item['Opening Debit'])}` : '—'}
        </span>
      )
    },
    { 
      header: 'Credit', 
      accessor: 'Opening Credit',
      align: 'right' as const,
      render: (item: any) => (
        <span className="font-mono text-rose-600 font-medium">
          {item['Opening Credit'] > 0 ? `Rs. ${formatCurrency(item['Opening Credit'])}` : '—'}
        </span>
      )
    },
  ];

  return (
    <MasterPageTemplate 
      title="General Ledger"
      subtitle="Financial account registry and fixed asset management."
      columns={columns}
      data={masters.gl || []}
      formComponent={(onClose) => <GLForm onSubmit={async (data) => { await handleAddGL(data); onClose(); }} onCancel={onClose} />}
      editFormComponent={(item, onClose) => (
        <GLForm 
          initialData={item}
          onSubmit={async (data) => { await handleEditGL(data, item); onClose(); }} 
          onCancel={onClose} 
        />
      )}
      onDelete={handleDeleteGL}
      stats={[
        { label: 'Total Accounts', value: (masters.gl?.length || 0).toString(), icon: Calculator },
        { label: 'Total Debit (Rs.)', value: formatCurrency(masters.gl?.reduce((sum: number, a: any) => sum + (parseFloat(a['Opening Debit']) || 0), 0) || 0), icon: Building2 },
        { label: 'Total Credit (Rs.)', value: formatCurrency(masters.gl?.reduce((sum: number, a: any) => sum + (parseFloat(a['Opening Credit']) || 0), 0) || 0), icon: Wallet }
      ]}
    />
  );
}
