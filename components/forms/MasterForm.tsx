'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { UOM_OPTIONS } from '@/lib/constants';

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Date" name="date" type="date" required />
        <Input label="Product Name" name="productName" placeholder="e.g. Mustard Seed" required />
        <Input label="Product Code" name="productCode" placeholder="Auto-generated" />
        <Select 
          label="UOM" 
          name="uom" 
          options={UOM_OPTIONS.map(u => ({ label: u, value: u }))} 
          required 
        />
        <Select 
          label="Is Taxable?" 
          name="isTaxable" 
          options={[
            { label: 'Yes', value: 'Yes' },
            { label: 'No', value: 'No' }
          ]} 
          required 
        />
        {type === 'RM' && (
          <Select 
            label="Is Directly Saleable?" 
            name="isDirectlySaleable" 
            options={[
              { label: 'Yes', value: 'Yes' },
              { label: 'No', value: 'No' }
            ]} 
            required 
          />
        )}
        <Input label="Opening Qty" name="openingQty" type="number" step="0.01" defaultValue="0" />
        <Input label="Opening Amount (Rs.)" name="openingAmount" type="number" step="0.01" defaultValue="0" />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit">Save Record</Button>
      </div>
    </form>
  );
};
