'use client';

import React from 'react';
import { MasterPageTemplate } from '@/components/masters/MasterPageTemplate';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useAppContext } from '@/lib/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/format';
import { User, ShieldCheck, Phone, Mail, Fingerprint, Building, Landmark } from 'lucide-react';

const PartyForm = ({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) => {
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      onSubmit(Object.fromEntries(formData));
    }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
           <Input label="Legal Name of Entity" name="bpName" placeholder="e.g. ABC Trading Pvt. Ltd." required icon={<Building className="h-4 w-4" />} />
        </div>
        <Select 
          label="Party Relationship Type" 
          name="type" 
          options={[
            { label: 'Customer (Buyer)', value: 'Customer' },
            { label: 'Vendor (Supplier)', value: 'Vendor' }
          ]} 
          required 
        />
        <Input label="VAT / PAN Registration No" name="bpCode" placeholder="9-digit numeric ID" required icon={<Fingerprint className="h-4 w-4" />} />
        <Input label="Primary Phone" name="phone" placeholder="+977-XXXXXXXXXX" icon={<Phone className="h-4 w-4" />} />
        <Input label="Email Address" name="email" type="email" placeholder="contact@entity.com" icon={<Mail className="h-4 w-4" />} />
        <div className="md:col-span-2">
          <Input label="Address" name="address" placeholder="Location details" icon={<Landmark className="h-4 w-4" />} />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--color-border)]">
        <Button variant="ghost" type="button" onClick={onCancel}>Discard Changes</Button>
        <Button variant="primary" type="submit" className="shadow-lg">Create Registered Party</Button>
      </div>
    </form>
  );
};

export default function PartyMasterPage() {
  const { masters } = useAppContext();

  const columns = [
    { 
      header: 'Entity Name', 
      accessor: 'bpName',
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-surface-raised)] flex items-center justify-center border border-[var(--color-border)]">
            <User className="h-4 w-4 text-[var(--color-text-secondary)]" />
          </div>
          <div>
            <p className="font-bold text-[var(--color-text-primary)]">{item.bpName}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase">ID: {item.bpCode}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Relationship', 
      accessor: 'type',
      render: (item: any) => (
        <Badge variant={item.type === 'Vendor' ? 'Vendor' : 'Taxable'}>
          {item.type.toUpperCase()}
        </Badge>
      )
    },
    { 
      header: 'Contact Information', 
      accessor: 'phone',
      render: (item: any) => (
        <div className="space-y-0.5">
          <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-[var(--color-text-muted)]" /> {item.phone || 'N/A'}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1.5">
            <Mail className="h-3 w-3" /> {item.email || 'N/A'}
          </p>
        </div>
      )
    },
    { 
      header: 'Address', 
      accessor: 'address',
      render: (item: any) => (
        <span className="text-xs text-[var(--color-text-secondary)]">
          {item.address || '—'}
        </span>
      )
    },
  ];

  return (
    <MasterPageTemplate 
      title="Party Master"
      subtitle="Comprehensive directory of registered customers and vendors."
      description="Manage all your business entities and their tax registration details in one place."
      columns={columns}
      data={masters.bp}
      formComponent={<PartyForm onSubmit={() => {}} onCancel={() => {}} />}
    />
  );
}
