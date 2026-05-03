'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Plus, Trash2, Receipt, TrendingUp, Calendar as CalendarIcon, User, Search, Info, Loader2 } from 'lucide-react';
import { useAppContext } from '@/lib/context/AppContext';
import { postToGAS, ACTIONS } from '@/lib/api';
import { calculateSales, getNepaliMonth } from '@/lib/calculations';
import { formatCurrency, formatQty, formatRate, formatPercent } from '@/lib/format';

const BLANK_ITEM = { productCode: '', qty: 0, rate: 0, isTaxable: 'Yes' };

export const SalesForm = () => {
  const { masters, settings, showToast } = useAppContext();
  const [items, setItems] = useState([{ ...BLANK_ITEM }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    billNo: '',
    customerName: '',
  });

  const resetForm = () => {
    setItems([{ ...BLANK_ITEM }]);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      billNo: '',
      customerName: '',
    });
  };

  const addItem = () => setItems([...items, { productCode: '', qty: 0, rate: 0, isTaxable: 'Yes' }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  
  const updateItem = (idx: number, key: string, value: any) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [key]: value };
    setItems(newItems);
  };

  const selectedCustomer = masters.parties.find(p => p.bpName === formData.customerName);
  
  const totals = useMemo(() => {
    const t = { taxable: 0, vat: 0, nonTaxable: 0, grandTotal: 0, grossProfit: 0, gpPercent: 0 };
    items.forEach(item => {
      // Mock COGS calculation (in production this would come from the Stock Journal/Weighted Avg)
      const cogsRate = item.rate * 0.75; 
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter(it => it.productCode && it.qty > 0 && it.rate > 0);
    if (validItems.length === 0) {
      showToast('Add at least one line item with a valid product, quantity, and rate.', 'warning');
      return;
    }
    if (!settings.appsScriptUrl) {
      showToast('Apps Script URL is not configured. Please update it in Preferences.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        fiscalMonth: getNepaliMonth(formData.date),
        items: validItems,
        totals,
        vatRate: settings.vatRate,
      };
      await postToGAS(settings.appsScriptUrl, ACTIONS.SAVE_SALE, payload);
      showToast('Sales invoice generated and posted successfully.', 'success');
      resetForm();
    } catch (err: any) {
      showToast(err.message || 'Failed to save sales entry. Check your connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Left: Invoice Configuration (8 Cols) */}
      <div className="xl:col-span-8 space-y-6">
        <Card title="Invoice Header">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Input 
              label="Invoice Date" 
              type="date" 
              value={formData.date} 
              onChange={e => setFormData({ ...formData, date: e.target.value })} 
              required 
              icon={<CalendarIcon className="h-4 w-4" />}
            />
            <Input label="Nepali Month" value={getNepaliMonth(formData.date)} disabled icon={<TrendingUp className="h-4 w-4" />} />
            <Input 
              label="Invoice Number" 
              placeholder="e.g. TAX-001"
              value={formData.billNo} 
              onChange={e => setFormData({ ...formData, billNo: e.target.value })} 
              required 
              icon={<Receipt className="h-4 w-4" />}
            />
            <div className="md:col-span-2 lg:col-span-3">
              <Select 
                label="Customer / Client" 
                options={masters.parties.filter(p => p.type === 'Customer').map(v => ({ label: v.bpName, value: v.bpName }))}
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                required
                placeholder="Search registered customers..."
              />
            </div>
          </div>
        </Card>

        <Card 
          title="Line Items" 
          headerAction={
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button>
          }
        >
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-surface-raised)] border-b border-[var(--color-border)]">
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Product Selection</th>
                  <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] w-24">Qty</th>
                  <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] w-32">Rate</th>
                  <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] w-20">VAT</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] w-36">Subtotal</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-success-light/20 transition-colors">
                    <td className="px-6 py-3 min-w-[240px]">
                      <Select 
                        options={[...masters.fg, ...[]].map(p => ({ label: `${p.productName} (${p.productCode})`, value: p.productCode }))}
                        value={item.productCode}
                        onChange={e => updateItem(idx, 'productCode', e.target.value)}
                        className="border-0 shadow-none bg-transparent hover:bg-white focus:bg-white h-9 px-2"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input 
                        type="number" 
                        value={item.qty || ''} 
                        onChange={e => updateItem(idx, 'qty', parseFloat(e.target.value))} 
                        className="w-full bg-transparent border-0 text-right font-mono focus:ring-0 focus:bg-white rounded h-9 px-2"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input 
                        type="number" 
                        value={item.rate || ''} 
                        onChange={e => updateItem(idx, 'rate', parseFloat(e.target.value))} 
                        className="w-full bg-transparent border-0 text-right font-mono focus:ring-0 focus:bg-white rounded h-9 px-2"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <input 
                        type="checkbox"
                        checked={item.isTaxable === 'Yes'}
                        onChange={e => updateItem(idx, 'isTaxable', e.target.checked ? 'Yes' : 'No')}
                        className="h-4 w-4 rounded border-slate-300 text-[var(--color-success)] focus:ring-[var(--color-success)]"
                      />
                    </td>
                    <td className="px-6 py-3 text-right font-mono font-semibold text-[var(--color-text-primary)]">
                      {formatCurrency(item.qty * item.rate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => removeItem(idx)} className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors">
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

      {/* Right: Profitability & Invoice Preview (4 Cols) */}
      <div className="xl:col-span-4 space-y-6 sticky top-24">
        <Card title="Profitability Analytics">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-[var(--color-success-light)] rounded-xl border border-green-200 shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-[var(--color-success)] uppercase tracking-widest mb-1">Projected GP</p>
                <h4 className="text-2xl font-bold text-green-900 font-mono">Rs. {formatCurrency(totals.grossProfit)}</h4>
              </div>
              <div className="text-right">
                <Badge variant="success" className="text-sm px-3 py-1 font-bold">
                  {formatPercent(totals.gpPercent)}
                </Badge>
                <p className="text-[10px] text-green-700 mt-2 font-medium">Margin</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 flex gap-3 items-start">
               <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
               <p className="text-[11px] text-amber-700 leading-relaxed">
                 COGS is estimated at 75% of sale price for this preview. Actual profitability will sync with weighted average costing on journal posting.
               </p>
            </div>
          </div>
        </Card>

        <Card title="Tax Invoice Preview">
          <div className="bg-white rounded-xl p-6 border-2 border-[var(--color-border)] shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-success)] opacity-5 rotate-45 translate-x-16 -translate-y-16" />
            
            <div className="relative z-10">
              <div className="text-center mb-8 border-b border-[var(--color-border)] pb-6">
                <h3 className="font-display text-2xl font-bold text-[var(--color-text-primary)] uppercase tracking-tight">{settings.companyName}</h3>
                <p className="text-[10px] text-[var(--color-text-muted)] font-bold tracking-[0.3em] mt-2">VAT INVOICE</p>
                <div className="mt-3 inline-block px-3 py-1 bg-slate-900 text-white rounded text-[9px] font-bold tracking-widest uppercase">
                  PAN: {settings.panNo}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 text-xs">
                <div className="space-y-2">
                  <p className="text-[var(--color-text-muted)] uppercase tracking-wider font-bold">Bill To</p>
                  <p className="font-bold text-sm text-[var(--color-text-primary)]">{formData.customerName || '---'}</p>
                  <p className="font-mono text-[var(--color-text-secondary)]">PAN: {selectedCustomer?.pan || '---'}</p>
                </div>
                <div className="space-y-2 text-right">
                  <p className="text-[var(--color-text-muted)] uppercase tracking-wider font-bold">Invoice Details</p>
                  <p className="font-bold text-sm"># {formData.billNo || '---'}</p>
                  <p className="text-[var(--color-text-secondary)]">{formData.date}</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-[var(--color-border)] pt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)] font-medium">Taxable Value</span>
                  <span className="font-mono font-semibold">Rs. {formatCurrency(totals.taxable)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)] font-medium">VAT (13%)</span>
                  <span className="font-mono font-semibold">Rs. {formatCurrency(totals.vat)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)] font-medium">Non-Taxable</span>
                  <span className="font-mono font-semibold">Rs. {formatCurrency(totals.nonTaxable)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-[var(--color-text-primary)] border-t-2 border-slate-900 pt-5 mt-5">
                  <span className="font-display tracking-tight uppercase">Grand Total</span>
                  <span className="font-mono">Rs. {formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 space-y-3">
            <Button 
              type="submit" 
              variant="success" 
              className="w-full h-12 shadow-xl shadow-green-100" 
              size="lg" 
              disabled={!formData.billNo || !formData.customerName || isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...</>
              ) : 'Post Sales Journal'}
            </Button>
            <Button variant="outline" type="button" className="w-full" size="md" onClick={resetForm} disabled={isSubmitting}>
              Clear Form
            </Button>
          </div>
        </Card>
      </div>
    </form>
  );
};
