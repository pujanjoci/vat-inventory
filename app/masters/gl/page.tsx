'use client';

import React from 'react';
import { MasterPageTemplate } from '@/components/masters/MasterPageTemplate';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/lib/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { formatAmount } from '@/lib/calculations';
import { SUB_GROUPS } from '@/lib/constants';

const GLForm = ({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) => {
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      onSubmit(Object.fromEntries(formData));
    }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Asset Name" name="glAssetName" placeholder="e.g. Mustard Expeller" required />
        <Select 
          label="Sub Group" 
          name="subGroup" 
          options={SUB_GROUPS.map(s => ({ label: s, value: s }))} 
          required 
        />
        <Input label="Main Group" name="mainGroup" placeholder="e.g. Fixed Assets" required />
        <Input label="Header" name="header" placeholder="e.g. Machinery" required />
        <Select 
          label="Type" 
          name="type" 
          options={[
            { label: 'Balance Sheet (BS)', value: 'BS' },
            { label: 'Profit & Loss (PL)', value: 'PL' }
          ]} 
          required 
        />
        <Input label="Opening Debit" name="openingDebit" type="number" step="0.01" defaultValue="0" />
        <Input label="Opening Credit" name="openingCredit" type="number" step="0.01" defaultValue="0" />
      </div>
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit">Save GL Account</Button>
      </div>
    </form>
  );
};

export default function GLMasterPage() {
  const { masters } = useApp();

  const columns = [
    { header: 'Asset Name', accessor: 'glAssetName' },
    { header: 'Sub Group', accessor: 'subGroup' },
    { header: 'Header', accessor: 'header' },
    { 
      header: 'Type', 
      accessor: 'type',
      render: (item: any) => (
        <Badge variant={item.type === 'BS' ? 'brand' : 'warning'}>
          {item.type}
        </Badge>
      )
    },
    { 
      header: 'Debit', 
      accessor: 'openingDebit',
      align: 'right' as const,
      render: (item: any) => `Rs. ${formatAmount(item.openingDebit)}`
    },
    { 
      header: 'Credit', 
      accessor: 'openingCredit',
      align: 'right' as const,
      render: (item: any) => `Rs. ${formatAmount(item.openingCredit)}`
    },
  ];

  return (
    <MasterPageTemplate 
      title="GL Account Master"
      description="Manage General Ledger accounts and fixed asset registers."
      columns={columns}
      data={masters.gl}
      formComponent={<GLForm onSubmit={() => {}} onCancel={() => {}} />}
    />
  );
}
