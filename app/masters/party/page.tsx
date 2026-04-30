'use client';

import React from 'react';
import { MasterPageTemplate } from '@/components/masters/MasterPageTemplate';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/lib/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { formatAmount } from '@/lib/calculations';

const PartyForm = ({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) => {
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      onSubmit(Object.fromEntries(formData));
    }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Date" name="date" type="date" required />
        <Select 
          label="Type" 
          name="type" 
          options={[
            { label: 'Customer', value: 'Customer' },
            { label: 'Vendor', value: 'Vendor' }
          ]} 
          required 
        />
        <Input label="Name" name="name" placeholder="e.g. ABC Trading" required />
        <Input label="PAN No" name="pan" placeholder="9-digit PAN" required />
        <Input label="Phone" name="phone" placeholder="Contact number" />
        <Input label="Email" name="email" type="email" placeholder="Email address" />
        <Input label="Opening Balance" name="openingBalance" type="number" step="0.01" defaultValue="0" />
      </div>
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit">Save Party</Button>
      </div>
    </form>
  );
};

export default function PartyMasterPage() {
  const { masters } = useApp();

  const columns = [
    { header: 'Name', accessor: 'name' },
    { 
      header: 'Type', 
      accessor: 'type',
      render: (item: any) => (
        <Badge variant={item.type === 'Vendor' ? 'warning' : 'success'}>
          {item.type}
        </Badge>
      )
    },
    { header: 'PAN', accessor: 'pan' },
    { header: 'Phone', accessor: 'phone' },
    { 
      header: 'Opening Balance', 
      accessor: 'openingBalance',
      align: 'right' as const,
      render: (item: any) => `Rs. ${formatAmount(item.openingBalance)}`
    },
  ];

  return (
    <MasterPageTemplate 
      title="Party Master"
      description="Manage your customers and vendors directory."
      columns={columns}
      data={masters.party}
      formComponent={<PartyForm onSubmit={() => {}} onCancel={() => {}} />}
    />
  );
}
