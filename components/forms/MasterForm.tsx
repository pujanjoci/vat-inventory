'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { UOM_OPTIONS } from '@/lib/constants';
import { Package, Hash, Ruler, ShieldCheck, Activity, DollarSign, Calendar as CalendarIcon } from 'lucide-react';

interface MasterFormProps {
  type: 'RM' | 'FG' | 'BP' | 'Party' | 'GL';
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const MasterForm = ({ type, onSubmit, onCancel }: MasterFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  const getIcon = () => {
    switch (type) {
      case 'RM': return <Package className="h-4 w-4" />;
      case 'FG': return <Activity className="h-4 w-4" />;
      case 'BP': return <Activity className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
           <Input label="Registry Date" name="date" type="date" required icon={<CalendarIcon className="h-4 w-4" />} />
        </div>
        <div className="md:col-span-2">
           <Input label="Product / Item Name" name="productName" placeholder="e.g. Yellow Mustard Seed" required icon={getIcon()} />
        </div>
        <Input label="System ID / SKU" name="productCode" placeholder="Auto-assigned" icon={<Hash className="h-4 w-4" />} />
        <Select 
          label="Unit of Measure" 
          name="uom" 
          options={UOM_OPTIONS.map(u => ({ label: `${u} (Standard)`, value: u }))} 
          required 
        />
        <Select 
          label="Taxability Status" 
          name="isTaxable" 
          options={[
            { label: 'Taxable (13% VAT)', value: 'Yes' },
            { label: 'Non-Taxable (VAT Exempt)', value: 'No' }
          ]} 
          required 
        />
        {type === 'RM' && (
          <Select 
            label="Direct Sale Allowed?" 
            name="isDirectlySaleable" 
            options={[
              { label: 'Allow Direct Sale', value: 'Yes' },
              { label: 'Internal Consumption Only', value: 'No' }
            ]} 
            required 
          />
        )}
        <div className="p-4 bg-[var(--color-surface-raised)] rounded-xl border border-[var(--color-border)] md:col-span-2">
           <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">Initial Inventory Balance</p>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Opening Quantity" name="openingQty" type="number" step="0.01" defaultValue="0" icon={<Ruler className="h-4 w-4" />} />
              <Input label="Opening Value (Rs.)" name="openingAmount" type="number" step="0.01" defaultValue="0" icon={<DollarSign className="h-4 w-4" />} />
           </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--color-border)]">
        <Button variant="ghost" type="button" onClick={onCancel}>Discard</Button>
        <Button variant="primary" type="submit" className="shadow-lg">Add to Directory</Button>
      </div>
    </form>
  );
};
