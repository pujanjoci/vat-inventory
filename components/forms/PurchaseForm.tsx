'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Plus, Trash2, Receipt, FileText, Calendar as CalendarIcon, Info, Loader2 } from 'lucide-react';
import { useAppContext } from '@/lib/context/AppContext';
import { postToGAS, ACTIONS } from '@/lib/api';
import { calculatePurchase, getNepaliMonth } from '@/lib/calculations';
import { formatCurrency, formatQty, formatRate } from '@/lib/format';

const BLANK_ITEM = { productCode: '', qty: 0, rate: 0, isTaxable: 'Yes', isCapital: 'No' };

export const PurchaseForm = () => {
  const { masters, settings, showToast } = useAppContext();
  const [items, setItems] = useState([{ ...BLANK_ITEM }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    billNo: '',
    vendorName: '',
    isReturn: 'No'
  });

  const resetForm = () => {
    setItems([{ ...BLANK_ITEM }]);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      billNo: '',
      vendorName: '',
      isReturn: 'No',
    });
  };

  const addItem = () => setItems([...items, { productCode: '', qty: 0, rate: 0, isTaxable: 'Yes', isCapital: 'No' }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  
  const updateItem = (idx: number, key: string, value: any) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [key]: value };
    setItems(newItems);
  };

  const selectedVendor = masters.bp.find(p => p.bpName === formData.vendorName);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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
      await postToGAS(settings.appsScriptUrl, ACTIONS.SAVE_PURCHASE, payload);
      showToast('Purchase entry posted to ledger successfully.', 'success');
      resetForm();
    } catch (err: any) {
      showToast(err.message || 'Failed to save purchase entry. Check your connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Left: Form Section (8 Cols) */}
      <div className="xl:col-span-8 space-y-6">
        <Card title="Voucher Details">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Input 
              label="Invoice Date" 
              type="date" 
              value={formData.date} 
              onChange={e => setFormData({ ...formData, date: e.target.value })} 
              required 
              icon={<CalendarIcon className="h-4 w-4" />}
            />
            <Input label="Fiscal Month" value={getNepaliMonth(formData.date)} disabled icon={<Info className="h-4 w-4" />} />
            <Input 
              label="Bill / Invoice No" 
              placeholder="e.g. INV-2081-001"
              value={formData.billNo} 
              onChange={e => setFormData({ ...formData, billNo: e.target.value })} 
              required 
              icon={<FileText className="h-4 w-4" />}
            />
            <div className="md:col-span-2 lg:col-span-2">
              <Select 
                label="Vendor / Supplier" 
                options={masters.bp.filter(p => p.type === 'Vendor').map(v => ({ label: v.bpName, value: v.bpName }))}
                value={formData.vendorName}
                onChange={e => setFormData({ ...formData, vendorName: e.target.value })}
                required
                placeholder="Select a registered vendor..."
              />
            </div>
            <div className="flex items-end">
               <Badge variant={formData.isReturn === 'Yes' ? 'Return' : 'Purchase'} className="mb-2">
                 {formData.isReturn === 'Yes' ? 'PURCHASE RETURN' : 'STANDARD PURCHASE'}
               </Badge>
            </div>
          </div>
        </Card>

        <Card 
          title="Line Items" 
          headerAction={
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" /> Add Row
            </Button>
          }
        >
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-surface-raised)] border-b border-[var(--color-border)]">
                  <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Product / Service</th>
                  <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] w-24">Qty</th>
                  <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] w-32">Rate</th>
                  <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] w-20">Tax</th>
                  <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] w-20">Cap</th>
                  <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] w-36">Total</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-accent-light/20 transition-colors">
                    <td className="px-6 py-3 min-w-[240px]">
                      <Select 
                        options={[...masters.rm, ...masters.fg].map(p => ({ label: `${p.productName} (${p.productCode})`, value: p.productCode }))}
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
                        className="h-4 w-4 rounded border-slate-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                      />
                    </td>
                    <td className="px-3 py-3 text-center">
                       <input 
                        type="checkbox"
                        checked={item.isCapital === 'Yes'}
                        onChange={e => updateItem(idx, 'isCapital', e.target.checked ? 'Yes' : 'No')}
                        className="h-4 w-4 rounded border-slate-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
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

      {/* Right: Bill Preview Section (4 Cols) */}
      <div className="xl:col-span-4 space-y-6 sticky top-24">
        <Card title="Voucher Summary">
          <div className="bg-[var(--color-bg)] rounded-xl p-6 border border-[var(--color-border)] relative overflow-hidden">
            <Receipt className="absolute -top-4 -right-4 w-24 h-24 text-white opacity-50" />
            
            <div className="relative z-10">
              <div className="mb-6 border-b border-[var(--color-border-strong)] pb-4">
                <h4 className="font-display text-xl text-[var(--color-text-primary)] font-bold">{settings.companyName}</h4>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold tracking-[0.2em] mt-1">PAN: {settings.panNo}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-start group">
                  <span className="text-[var(--color-text-secondary)] text-xs font-medium uppercase tracking-wider">Vendor</span>
                  <div className="text-right">
                    <p className="font-bold text-[var(--color-text-primary)] text-sm">{formData.vendorName || '---'}</p>
                    {selectedVendor && <p className="text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5">PAN: {selectedVendor.pan}</p>}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-secondary)] text-xs font-medium uppercase tracking-wider">Voucher No</span>
                  <span className="font-mono font-bold text-sm text-[var(--color-text-primary)]">{formData.billNo || '---'}</span>
                </div>
              </div>

              <div className="space-y-3 border-t border-[var(--color-border-strong)] pt-5">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">Taxable Value</span>
                  <span className="font-mono font-semibold">Rs. {formatCurrency(totals.taxable)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">VAT (13%)</span>
                  <span className="font-mono font-semibold">Rs. {formatCurrency(totals.vat)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">Non-Taxable</span>
                  <span className="font-mono font-semibold">Rs. {formatCurrency(totals.nonTaxable)}</span>
                </div>
                {(totals.capTaxable > 0 || totals.capVat > 0) && (
                  <div className="pt-2 mt-2 border-t border-dashed border-[var(--color-border)]">
                    <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] italic">
                      <span>Capital Goods Taxable</span>
                      <span className="font-mono">Rs. {formatCurrency(totals.capTaxable)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] italic">
                      <span>Capital Goods VAT</span>
                      <span className="font-mono">Rs. {formatCurrency(totals.capVat)}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between text-xl font-bold text-[var(--color-text-primary)] border-t border-[var(--color-border-strong)] pt-4 mt-4">
                  <span className="font-display tracking-tight">Total Due</span>
                  <span className="font-mono">Rs. {formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <Button
              type="submit"
              className="w-full h-12 shadow-lg"
              size="lg"
              disabled={!formData.billNo || !formData.vendorName || isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...</>
              ) : 'Post Purchase Journal'}
            </Button>
            <Button variant="outline" type="button" className="w-full" size="md" onClick={resetForm} disabled={isSubmitting}>
              Clear Form
            </Button>
          </div>
          
          <p className="text-[10px] text-[var(--color-text-muted)] text-center mt-4 uppercase tracking-widest font-medium">
            Authorized for {settings.companyName}
          </p>
        </Card>
      </div>
    </form>
  );
};
