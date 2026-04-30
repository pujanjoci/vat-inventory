'use client';

import React from 'react';
import { MasterPageTemplate } from '@/components/masters/MasterPageTemplate';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useAppContext } from '@/lib/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/format';
import { SUB_GROUPS } from '@/lib/constants';
import { Wallet, Landmark, Building2, Calculator, ReceiptText } from 'lucide-react';

const GLForm = ({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) => {
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      onSubmit(Object.fromEntries(formData));
    }} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="md:col-span-2">
           <Input 
             label="Account / Asset Name" 
             name="glAssetName" 
             placeholder="e.g. Mustard Seed Expeller Machine" 
             required 
             icon={<Landmark className="h-4 w-4 text-[var(--color-text-muted)]" />}
           />
        </div>
        
        <Select 
          label="Sub Group" 
          name="subGroup" 
          options={SUB_GROUPS.map(s => ({ label: s, value: s }))} 
          required 
        />
        
        <Input 
          label="Main Group" 
          name="mainGroup" 
          placeholder="e.g. Fixed Assets" 
          required 
        />
        
        <Input 
          label="Reporting Header" 
          name="header" 
          placeholder="e.g. Plant & Machinery" 
          required 
        />
        
        <Select 
          label="Account Type" 
          name="type" 
          options={[
            { label: 'Balance Sheet (BS)', value: 'BS' },
            { label: 'Profit & Loss (PL)', value: 'PL' }
          ]} 
          required 
        />

        <div className="md:col-span-2 grid grid-cols-2 gap-6 p-4 bg-[var(--color-surface-raised)] rounded-xl border border-[var(--color-border)]">
          <Input 
            label="Opening Debit" 
            name="openingDebit" 
            type="number" 
            step="0.01" 
            defaultValue="0" 
            icon={<span className="text-[10px] font-bold">DR</span>}
          />
          <Input 
            label="Opening Credit" 
            name="openingCredit" 
            type="number" 
            step="0.01" 
            defaultValue="0" 
            icon={<span className="text-[10px] font-bold text-rose-500">CR</span>}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--color-border)]">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit" className="shadow-lg shadow-accent/20">
          Initialize Account
        </Button>
      </div>
    </form>
  );
};

export default function GLMasterPage() {
  const { masters } = useAppContext();

  const columns = [
    { 
      header: 'Account Name', 
      accessor: 'glAssetName',
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[var(--color-accent-light)] group-hover:text-[var(--color-accent)] transition-colors">
            {item.type === 'BS' ? <Building2 className="h-4 w-4" /> : <ReceiptText className="h-4 w-4" />}
          </div>
          <div>
            <p className="font-bold text-[var(--color-text-primary)]">{item.glAssetName}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{item.header}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Group', 
      accessor: 'subGroup',
      render: (item: any) => (
        <span className="text-xs font-medium text-[var(--color-text-secondary)] px-2 py-1 bg-slate-50 rounded border border-slate-100">
          {item.subGroup}
        </span>
      )
    },
    { 
      header: 'Type', 
      accessor: 'type',
      render: (item: any) => (
        <Badge variant={item.type === 'BS' ? 'brand' : 'warning'}>
          {item.type === 'BS' ? 'Balance Sheet' : 'Profit & Loss'}
        </Badge>
      )
    },
    { 
      header: 'Debit', 
      accessor: 'openingDebit',
      align: 'right' as const,
      render: (item: any) => (
        <span className="font-mono text-[var(--color-text-primary)] font-medium">
          {item.openingDebit > 0 ? `Rs. ${formatCurrency(item.openingDebit)}` : '—'}
        </span>
      )
    },
    { 
      header: 'Credit', 
      accessor: 'openingCredit',
      align: 'right' as const,
      render: (item: any) => (
        <span className="font-mono text-rose-600 font-medium">
          {item.openingCredit > 0 ? `Rs. ${formatCurrency(item.openingCredit)}` : '—'}
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
      formComponent={<GLForm onSubmit={() => {}} onCancel={() => {}} />}
      stats={[
        { label: 'Total Accounts', value: (masters.gl?.length || 0).toString(), icon: Calculator },
        { label: 'Fixed Assets', value: (masters.gl?.filter((a: any) => a.mainGroup?.includes('Fixed'))?.length || 0).toString(), icon: Building2 },
        { label: 'System Ledger', value: 'Active', icon: Wallet }
      ]}
    />
  );
}
