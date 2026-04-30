'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Plus, Trash2, Receipt } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { calculatePurchase, formatAmount, getNepaliMonth } from '@/lib/calculations';

export const PurchaseForm = () => {
  const { masters, showToast } = useApp();
  const [items, setItems] = useState([{ productCode: '', qty: 0, rate: 0, isTaxable: 'Yes', isCapital: 'No' }]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    billNo: '',
    vendorName: '',
    isReturn: 'No'
  });

  const addItem = () => setItems([...items, { productCode: '', qty: 0, rate: 0, isTaxable: 'Yes', isCapital: 'No' }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  
  const updateItem = (idx: number, key: string, value: any) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [key]: value };
    setItems(newItems);
  };

  const selectedVendor = masters.party.find(p => p.name === formData.vendorName);
  
  const totals = useMemo(() => {
    const t = { taxable: 0, vat: 0, nonTaxable: 0, capTaxable: 0, capVat: 0, grandTotal: 0 };
    items.forEach(item => {
      const calc = calculatePurchase({
        qty: item.qty,
        rate: item.rate,
        isTaxable: item.isTaxable as 'Yes' | 'No',
        isCapitalItem: item.isCapital as 'Yes' | 'No'
      });
      t.taxable += calc.taxableValue;
      t.vat += calc.vat;
      t.nonTaxable += calc.nonTaxableValue;
      t.capTaxable += calc.capTaxableValue;
      t.capVat += calc.capVat;
      t.grandTotal += calc.grandTotal;
    });
    return t;
  }, [items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Purchase entry saved successfully (Mock)', 'success');
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2 space-y-6">
        <Card title="Bill Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Date" 
              type="date" 
              value={formData.date} 
              onChange={e => setFormData({ ...formData, date: e.target.value })} 
              required 
            />
            <Input label="Nepali Month" value={getNepaliMonth(formData.date)} disabled />
            <Input 
              label="Bill No" 
              value={formData.billNo} 
              onChange={e => setFormData({ ...formData, billNo: e.target.value })} 
              required 
            />
            <Select 
              label="Vendor" 
              options={masters.party.filter(p => p.type === 'Vendor').map(v => ({ label: v.name, value: v.name }))}
              value={formData.vendorName}
              onChange={e => setFormData({ ...formData, vendorName: e.target.value })}
              required
            />
          </div>
        </Card>

        <Card 
          title="Line Items" 
          headerAction={<Button type="button" size="sm" onClick={addItem}><Plus className="w-4 h-4 mr-1" /> Add Row</Button>}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 font-bold border-b border-slate-100">
                  <th className="px-2 py-3 text-left">Product</th>
                  <th className="px-2 py-3 text-right">Qty</th>
                  <th className="px-2 py-3 text-right">Rate</th>
                  <th className="px-2 py-3 text-center">Tax?</th>
                  <th className="px-2 py-3 text-center">Cap?</th>
                  <th className="px-2 py-3 text-right">Total</th>
                  <th className="px-2 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-3 min-w-[200px]">
                      <Select 
                        options={[...masters.rm, ...masters.fg].map(p => ({ label: p.productName, value: p.productCode }))}
                        value={item.productCode}
                        onChange={e => updateItem(idx, 'productCode', e.target.value)}
                        className="h-9 py-1"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <Input 
                        type="number" 
                        value={item.qty} 
                        onChange={e => updateItem(idx, 'qty', parseFloat(e.target.value))} 
                        className="h-9 py-1 text-right"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <Input 
                        type="number" 
                        value={item.rate} 
                        onChange={e => updateItem(idx, 'rate', parseFloat(e.target.value))} 
                        className="h-9 py-1 text-right"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <select 
                        value={item.isTaxable}
                        onChange={e => updateItem(idx, 'isTaxable', e.target.value)}
                        className="premium-input h-9 py-1 text-xs"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </td>
                    <td className="px-2 py-3">
                      <select 
                        value={item.isCapital}
                        onChange={e => updateItem(idx, 'isCapital', e.target.value)}
                        className="premium-input h-9 py-1 text-xs"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </td>
                    <td className="px-2 py-3 text-right font-mono font-semibold">
                      {formatAmount(item.qty * item.rate)}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <button type="button" onClick={() => removeItem(idx)} className="p-1.5 text-slate-400 hover:text-rose-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Bill Preview">
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 relative">
            <Receipt className="absolute top-4 right-4 w-12 h-12 text-slate-200" />
            
            <div className="mb-6 border-b border-slate-200 pb-4">
              <h4 className="font-display text-xl text-slate-900 mb-1">Ganesh Tel Mill</h4>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">PAN: 604141622</p>
            </div>

            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Vendor:</span>
                <span className="font-bold text-slate-800">{formData.vendorName || '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PAN:</span>
                <span className="font-mono text-slate-800">{selectedVendor?.pan || '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bill No:</span>
                <span className="font-bold text-slate-800">{formData.billNo || '---'}</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between">
                <span>Taxable Value:</span>
                <span className="font-mono">Rs. {formatAmount(totals.taxable)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (13%):</span>
                <span className="font-mono">Rs. {formatAmount(totals.vat)}</span>
              </div>
              <div className="flex justify-between">
                <span>Non-Taxable:</span>
                <span className="font-mono">Rs. {formatAmount(totals.nonTaxable)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Capital Taxable:</span>
                <span className="font-mono">Rs. {formatAmount(totals.capTaxable)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Capital VAT:</span>
                <span className="font-mono">Rs. {formatAmount(totals.capVat)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-slate-900 border-t border-slate-300 pt-4 mt-2">
                <span>Grand Total:</span>
                <span className="font-mono">Rs. {formatAmount(totals.grandTotal)}</span>
              </div>
            </div>
          </div>
          
          <Button type="submit" className="w-full mt-6 py-4 text-lg" size="lg">
            Complete Purchase
          </Button>
        </Card>
      </div>
    </form>
  );
};
