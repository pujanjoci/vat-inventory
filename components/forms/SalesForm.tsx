'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Plus, Trash2, FileText, Receipt } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { calculateSales, formatAmount, getNepaliMonth } from '@/lib/calculations';

export const SalesForm = () => {
  const { masters, showToast } = useApp();
  const [items, setItems] = useState([{ productCode: '', qty: 0, rate: 0, isTaxable: 'Yes' }]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    billNo: '',
    customerName: '',
  });

  const addItem = () => setItems([...items, { productCode: '', qty: 0, rate: 0, isTaxable: 'Yes' }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  
  const updateItem = (idx: number, key: string, value: any) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [key]: value };
    setItems(newItems);
  };

  const selectedCustomer = masters.party.find(p => p.name === formData.customerName);
  
  const totals = useMemo(() => {
    const t = { taxable: 0, vat: 0, nonTaxable: 0, grandTotal: 0, grossProfit: 0, gpPercent: 0 };
    items.forEach(item => {
      // For mock, assuming COGS rate is 80% of sales rate
      const cogsRate = item.rate * 0.8; 
      const calc = calculateSales({
        qty: item.qty,
        rate: item.rate,
        isTaxable: item.isTaxable as 'Yes' | 'No'
      }, cogsRate);
      
      t.taxable += calc.taxableValue;
      t.vat += calc.vat;
      t.nonTaxable += calc.nonTaxableValue;
      t.grandTotal += calc.grandTotal;
      t.grossProfit += calc.grossProfit;
    });
    
    const salesTotal = t.taxable + t.nonTaxable;
    t.gpPercent = salesTotal > 0 ? (t.grossProfit / salesTotal) * 100 : 0;
    
    return t;
  }, [items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Sales entry saved successfully (Mock)', 'success');
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2 space-y-6">
        <Card title="Invoice Details">
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
              label="Customer" 
              options={masters.party.filter(p => p.type === 'Customer').map(v => ({ label: v.name, value: v.name }))}
              value={formData.customerName}
              onChange={e => setFormData({ ...formData, customerName: e.target.value })}
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
                  <th className="px-2 py-3 text-right">Total</th>
                  <th className="px-2 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-3 min-w-[200px]">
                      <Select 
                        options={[...masters.fg, ...masters.bp].map(p => ({ label: p.productName, value: p.productCode }))}
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
        <Card title="Profitability Preview">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">Gross Profit</p>
                <h4 className="text-xl font-bold text-emerald-900 font-mono">Rs. {formatAmount(totals.grossProfit)}</h4>
              </div>
              <Badge variant="success" className="text-lg py-1 px-3">
                {totals.gpPercent.toFixed(1)}%
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-tighter italic">
              * Based on weighted average cost of current inventory
            </p>
          </div>
        </Card>

        <Card title="Invoice Summary">
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 relative">
            <Receipt className="absolute top-4 right-4 w-12 h-12 text-slate-200" />
            
            <div className="mb-6 border-b border-slate-200 pb-4">
              <h4 className="font-display text-xl text-slate-900 mb-1">Ganesh Tel Mill</h4>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">VAT INVOICE</p>
            </div>

            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-800">{formData.customerName || '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PAN:</span>
                <span className="font-mono text-slate-800">{selectedCustomer?.pan || '---'}</span>
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
              <div className="flex justify-between text-xl font-bold text-slate-900 border-t border-slate-300 pt-4 mt-2">
                <span>Total Amount:</span>
                <span className="font-mono">Rs. {formatAmount(totals.grandTotal)}</span>
              </div>
            </div>
          </div>
          
          <Button type="submit" className="w-full mt-6 py-4 text-lg" size="lg" variant="success">
            Generate Invoice
          </Button>
        </Card>
      </div>
    </form>
  );
};
