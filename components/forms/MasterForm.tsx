import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { UOM_OPTIONS } from '@/lib/constants';
import { Package, Hash, Ruler, ShieldCheck, Activity, DollarSign, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useAppContext } from '@/lib/context/AppContext';

interface MasterFormProps {
  type: 'RM' | 'FG' | 'BP' | 'Party' | 'GL';
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
  submitLabel?: string;
}

/**
 * Extracts a human-friendly form state from raw GAS sheet data
 */
function extractFormState(type: string, raw: any): any {
  if (!raw) return null;
  
  const base: any = {
    date: raw.Date || new Date().toISOString().split('T')[0],
    uom: raw.UOM || 'KG',
    isTaxable: raw['Is it Taxable?'] || 'Yes',
    isDirectlySaleable: raw['Is it Directly Saleable?'] || 'No',
    partyType: raw.Type || 'Vendor',
    contactPerson: raw.ContactPerson || '',
    phone: raw.Phone || '',
    email: raw.Email || '',
    address: raw.Address || '',
    openingQty: String(raw['Opening Balance (Qty)'] || '0'),
    openingAmount: String(raw['Opening Balance (Rs.)'] || '0'),
  };

  switch (type) {
    case 'RM':
      base.productName = raw['RM Product Name'] || '';
      base.productCode = raw['RM Product Code'] || '';
      break;
    case 'FG':
      base.productName = raw['FG Product Name'] || '';
      base.productCode = raw['FG Product Code'] || '';
      break;
    case 'BP':
      base.productName = raw['ByProduct Name'] || '';
      base.productCode = raw['ByProduct Code'] || '';
      break;
    case 'Party':
      base.productName = raw.BPName || '';
      base.productCode = raw.BPCode || '';
      break;
  }

  return base;
}

export const MasterForm = ({ type, onSubmit, onCancel, initialData, submitLabel }: MasterFormProps) => {
  const isEditMode = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { masters } = useAppContext();
  
  const defaultState = {
    date: new Date().toISOString().split('T')[0],
    productName: '',
    productCode: '',
    uom: 'KG',
    isTaxable: 'Yes',
    isDirectlySaleable: 'No',
    partyType: 'Vendor',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    openingQty: '0',
    openingAmount: '0'
  };

  const [formData, setFormData] = useState<any>(() => {
    if (initialData) {
      return extractFormState(type, initialData) || defaultState;
    }
    return defaultState;
  });

  // Re-initialize when initialData changes (edit different item)
  useEffect(() => {
    if (initialData) {
      const extracted = extractFormState(type, initialData);
      if (extracted) setFormData(extracted);
    }
  }, [initialData, type]);

  // Auto-generate code for new entries
  useEffect(() => {
    if (!initialData) {
      let count = 0;
      let prefix = '';
      if (type === 'RM') {
        count = masters.rm.length;
        prefix = 'RM-';
      } else if (type === 'FG') {
        count = masters.fg.length;
        prefix = 'FG-';
      } else if (type === 'BP') {
        count = masters.bp.length;
        prefix = 'BP-';
      } else if (type === 'Party') {
        count = masters.parties.length;
        prefix = formData.partyType === 'Customer' ? 'CUST-' : (formData.partyType === 'Vendor' ? 'VEND-' : 'PTY-');
      }

      const newCode = `${prefix}${String(count + 1).padStart(3, '0')}`;
      
      if (formData.productCode !== newCode) {
        setFormData((prev: any) => ({ ...prev, productCode: newCode }));
      }
    }
  }, [type, masters, initialData, formData.partyType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Map raw form names to Google Sheet headers exactly
      let mappedData: any = {
        "Date": formData.date
      };

      if (type === 'RM') {
        mappedData = {
          ...mappedData,
          "RM Product Name": formData.productName,
          "RM Product Code": formData.productCode,
          "Is it Taxable?": formData.isTaxable,
          "Is it Directly Saleable?": formData.isDirectlySaleable,
          "UOM": formData.uom,
          "Opening Balance (Qty)": parseFloat(formData.openingQty),
          "Opening Balance (Rs.)": parseFloat(formData.openingAmount)
        };
      } else if (type === 'FG') {
        mappedData = {
          ...mappedData,
          "FG Product Name": formData.productName,
          "FG Product Code": formData.productCode,
          "Is it Taxable?": formData.isTaxable,
          "UOM": formData.uom,
          "Opening Balance (Qty)": parseFloat(formData.openingQty),
          "Opening Balance (Rs.)": parseFloat(formData.openingAmount)
        };
      } else if (type === 'BP') {
        mappedData = {
          ...mappedData,
          "ByProduct Name": formData.productName,
          "ByProduct Code": formData.productCode,
          "Is it Taxable?": formData.isTaxable,
          "UOM": formData.uom,
          "Opening Balance (Qty)": parseFloat(formData.openingQty),
          "Opening Balance (Rs.)": parseFloat(formData.openingAmount)
        };
      } else if (type === 'Party') {
        mappedData = {
          ...mappedData,
          "BPName": formData.productName,
          "BPCode": formData.productCode,
          "Type": formData.partyType,
          "ContactPerson": formData.contactPerson || '',
          "Phone": formData.phone || '',
          "Email": formData.email || '',
          "Address": formData.address || ''
        };
      }

      await onSubmit(mappedData);
      
      // Clear form on success (only for add mode)
      if (!isEditMode) {
        setFormData(defaultState);
      }
    } finally {
      setIsSubmitting(false);
    }
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
            <Input label="Registry Date" name="date" type="date" value={formData.date} onChange={handleChange} required />
        </div>
        <div className="md:col-span-2">
           <Input 
             label={type === 'Party' ? 'Party / Business Name' : 'Product / Item Name'} 
             name="productName" 
             value={formData.productName}
             onChange={handleChange}
             placeholder={type === 'Party' ? 'e.g. ABC Suppliers' : 'e.g. Yellow Mustard Seed'} 
             required 
             icon={getIcon()} 
           />
        </div>
        <Input label="System ID / SKU" name="productCode" value={formData.productCode} onChange={handleChange} placeholder="Auto-assigned" icon={<Hash className="h-4 w-4" />} disabled />
        
        {type === 'Party' ? (
          <Select 
            label="Party Type" 
            name="partyType" 
            value={formData.partyType}
            onChange={handleChange}
            options={[
              { label: 'Vendor (Supplier)', value: 'Vendor' },
              { label: 'Customer (Buyer)', value: 'Customer' },
              { label: 'Both', value: 'Both' }
            ]} 
            required 
          />
        ) : (
          <Select 
            label="Unit of Measure" 
            name="uom" 
            value={formData.uom}
            onChange={handleChange}
            options={UOM_OPTIONS.map(u => ({ label: `${u} (Standard)`, value: u }))} 
            required 
          />
        )}

        {(type === 'RM' || type === 'FG' || type === 'BP') && (
          <Select 
            label="Taxability Status" 
            name="isTaxable" 
            value={formData.isTaxable}
            onChange={handleChange}
            options={[
              { label: 'Taxable (13% VAT)', value: 'Yes' },
              { label: 'Non-Taxable (VAT Exempt)', value: 'No' }
            ]} 
            required 
          />
        )}

        {type === 'RM' && (
          <Select 
            label="Direct Sale Allowed?" 
            name="isDirectlySaleable" 
            value={formData.isDirectlySaleable}
            onChange={handleChange}
            options={[
              { label: 'Allow Direct Sale', value: 'Yes' },
              { label: 'Internal Consumption Only', value: 'No' }
            ]} 
            required 
          />
        )}

        {type === 'Party' && (
          <>
            <Input label="Contact Person" name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="Full name" />
            <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="98XXXXXXXX" />
            <Input label="Email Address" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="email@example.com" />
            <div className="md:col-span-2">
              <Input label="Office Address" name="address" value={formData.address} onChange={handleChange} placeholder="City, District, Ward No" />
            </div>
          </>
        )}

        {(type === 'RM' || type === 'FG' || type === 'BP') && (
          <div className="p-4 bg-[var(--color-surface-raised)] rounded-xl border border-[var(--color-border)] md:col-span-2">
            <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">Initial Inventory Balance</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Opening Quantity" name="openingQty" type="number" step="0.01" value={formData.openingQty} onChange={handleChange} />
                <Input label="Opening Value (Rs.)" name="openingAmount" type="number" step="0.01" value={formData.openingAmount} onChange={handleChange} />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--color-border)]">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isSubmitting}>Discard</Button>
        <Button variant="primary" type="submit" className="shadow-lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {isEditMode ? 'Updating...' : 'Posting...'}</>
          ) : (submitLabel || (isEditMode ? 'Save Changes' : 'Add to Directory'))}
        </Button>
      </div>
    </form>
  );
};
