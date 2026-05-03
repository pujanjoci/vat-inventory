'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Plus, Trash2, Factory, Zap, Info, Calendar as CalendarIcon, Hash, Package, Activity, Loader2 } from 'lucide-react';
import { useAppContext } from '@/lib/context/AppContext';
import { postToGAS, ACTIONS } from '@/lib/api';
import { calculateProduction, getNepaliMonth } from '@/lib/calculations';
import { formatCurrency, formatQty, formatRate, formatPercent } from '@/lib/format';

const BLANK_RM = { code: '', qty: 0, rate: 120 };
const BLANK_FG = { code: '', qty: 0 };
const BLANK_BP = { code: '', qty: 0, nrv: 0 };

export const ProductionForm = () => {
  const { masters, settings, showToast } = useAppContext();
  
  const [rmItems, setRmItems] = useState([{ ...BLANK_RM }]);
  const [fgItems, setFgItems] = useState([{ ...BLANK_FG }]);
  const [bpItems, setBpItems] = useState([{ ...BLANK_BP }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    orderNo: '1001'
  });

  const resetForm = () => {
    setRmItems([{ ...BLANK_RM }]);
    setFgItems([{ ...BLANK_FG }]);
    setBpItems([{ ...BLANK_BP }]);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      orderNo: '',
    });
  };

  const addRM = () => setRmItems([...rmItems, { code: '', qty: 0, rate: 120 }]);
  const addFG = () => setFgItems([...fgItems, { code: '', qty: 0 }]);
  const addBP = () => setBpItems([...bpItems, { code: '', qty: 0, nrv: 0 }]);

  const results = useMemo(() => {
    const fgTotalQty = fgItems.reduce((sum, item) => sum + item.qty, 0);
    return calculateProduction(
      rmItems.map(i => ({ qty: i.qty, rate: i.rate })),
      bpItems.map(i => ({ qty: i.qty, nrv: i.nrv })),
      fgTotalQty,
      15000, // mock prelim OH from current month costing
      0      // final OH only if month is FINAL
    );
  }, [rmItems, fgItems, bpItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validRm = rmItems.filter(i => i.code && i.qty > 0);
    const validFg = fgItems.filter(i => i.code && i.qty > 0);

    if (validRm.length === 0 || validFg.length === 0) {
      showToast('A production journal requires at least one RM consumed and one FG produced.', 'warning');
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
        rmItems: validRm,
        fgItems: validFg,
        bpItems: bpItems.filter(i => i.code && i.qty > 0),
        results,
      };
      await postToGAS(settings.appsScriptUrl, ACTIONS.SAVE_PRODUCTION, payload);
      showToast('Production journal generated and posted successfully.', 'success');
      resetForm();
    } catch (err: any) {
      showToast(err.message || 'Failed to save production entry.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Left: Input Areas (8 Cols) */}
      <div className="xl:col-span-8 space-y-6">
        <Card title="Production Batch Header">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Input 
              label="Production Date" 
              type="date" 
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})} 
              required 
              icon={<CalendarIcon className="h-4 w-4" />}
            />
            <Input label="Fiscal Month" value={getNepaliMonth(formData.date)} disabled icon={<Activity className="h-4 w-4" />} />
            <Input 
              label="Batch / Order No" 
              value={formData.orderNo} 
              onChange={e => setFormData({...formData, orderNo: e.target.value})} 
              required 
              icon={<Hash className="h-4 w-4" />}
            />
          </div>
        </Card>

        {/* Multi-section cards for RM, FG, BP */}
        <div className="space-y-6">
          {/* RM Section - Blue border */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden border-l-4 border-l-blue-500">
            <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Raw Material Consumption</h3>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addRM}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
              </Button>
            </div>
            <div className="p-6 space-y-4">
              {rmItems.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 items-end border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex-1 w-full">
                    <Select 
                      label={idx === 0 ? "RM Material" : ""}
                      options={masters.rm.map(p => ({ label: `${p.productName} (${p.productCode})`, value: p.productCode }))}
                      value={item.code}
                      onChange={e => {
                        const newRm = [...rmItems];
                        newRm[idx].code = e.target.value;
                        setRmItems(newRm);
                      }}
                      placeholder="Select RM..."
                    />
                  </div>
                  <div className="w-full md:w-32">
                    <Input 
                      label={idx === 0 ? "Qty" : ""} 
                      type="number" 
                      value={item.qty || ''} 
                      onChange={e => {
                        const newRm = [...rmItems];
                        newRm[idx].qty = parseFloat(e.target.value);
                        setRmItems(newRm);
                      }} 
                      placeholder="0.00"
                    />
                  </div>
                  <div className="w-full md:w-40">
                    <Input 
                      label={idx === 0 ? "Avg Rate" : ""} 
                      value={item.rate ? formatCurrency(item.rate) : '—'} 
                      disabled 
                      className="text-right font-mono bg-slate-50"
                    />
                  </div>
                  <button type="button" onClick={() => setRmItems(rmItems.filter((_, i) => i !== idx))} className="p-2.5 text-slate-400 hover:text-[var(--color-danger)] transition-colors mb-0.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FG Section - Emerald border */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden border-l-4 border-l-emerald-500">
            <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Factory className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">Finished Goods Produced</h3>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addFG}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
              </Button>
            </div>
            <div className="p-6 space-y-4">
              {fgItems.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 items-end border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex-1 w-full">
                    <Select 
                      label={idx === 0 ? "FG Product" : ""}
                      options={masters.fg.map(p => ({ label: p.productName, value: p.productCode }))}
                      value={item.code}
                      onChange={e => {
                        const newFg = [...fgItems];
                        newFg[idx].code = e.target.value;
                        setFgItems(newFg);
                      }}
                      placeholder="Select FG..."
                    />
                  </div>
                  <div className="w-full md:w-40">
                    <Input 
                      label={idx === 0 ? "Produced Qty" : ""} 
                      type="number" 
                      value={item.qty || ''} 
                      onChange={e => {
                        const newFg = [...fgItems];
                        newFg[idx].qty = parseFloat(e.target.value);
                        setFgItems(newFg);
                      }} 
                      placeholder="0.00"
                    />
                  </div>
                  <button type="button" onClick={() => setFgItems(fgItems.filter((_, i) => i !== idx))} className="p-2.5 text-slate-400 hover:text-[var(--color-danger)] transition-colors mb-0.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* BP Section - Amber border */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden border-l-4 border-l-amber-500">
            <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">By-Products Recovery</h3>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addBP}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
              </Button>
            </div>
            <div className="p-6 space-y-4">
              {bpItems.map((item, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 items-end border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex-1 w-full">
                    <Select 
                      label={idx === 0 ? "By-Product" : ""}
                      options={[].map((p: any) => ({ label: p.productName, value: p.productCode }))}
                      value={item.code}
                      onChange={e => {
                        const newBp = [...bpItems];
                        newBp[idx].code = e.target.value;
                        setBpItems(newBp);
                      }}
                      placeholder="Select BP..."
                    />
                  </div>
                  <div className="w-full md:w-32">
                    <Input 
                      label={idx === 0 ? "Qty" : ""} 
                      type="number" 
                      value={item.qty || ''} 
                      onChange={e => {
                        const newBp = [...bpItems];
                        newBp[idx].qty = parseFloat(e.target.value);
                        setBpItems(newBp);
                      }} 
                      placeholder="0.00"
                    />
                  </div>
                  <div className="w-full md:w-32">
                    <Input 
                      label={idx === 0 ? "NRV Rate" : ""} 
                      type="number" 
                      value={item.nrv || ''} 
                      onChange={e => {
                        const newBp = [...bpItems];
                        newBp[idx].nrv = parseFloat(e.target.value);
                        setBpItems(newBp);
                      }} 
                      placeholder="0.00"
                    />
                  </div>
                  <button type="button" onClick={() => setBpItems(bpItems.filter((_, i) => i !== idx))} className="p-2.5 text-slate-400 hover:text-[var(--color-danger)] transition-colors mb-0.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Summary & Analysis (4 Cols) */}
      <div className="xl:col-span-4 space-y-6 sticky top-24">
        <Card title="Live Costing Dashboard">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-[0.03] rounded-full translate-x-10 -translate-y-10" />
            <Factory className="absolute -bottom-4 -right-4 w-28 h-28 text-white opacity-[0.04] rotate-12" />
            
            <div className="space-y-6 relative z-10">
              <div className="pb-4 border-b border-white/10">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Total Raw Consumption</p>
                <h4 className="text-2xl font-mono font-bold tracking-tight">Rs. {formatCurrency(results.totalRmCost)}</h4>
              </div>

              <div className="pb-4 border-b border-white/10">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">By-Product Credit (NRV)</p>
                <div className="flex items-center gap-2">
                   <h4 className="text-2xl font-mono font-bold text-emerald-400">-{formatCurrency(results.totalBpNrv)}</h4>
                   <Badge variant="No" className="bg-emerald-950 text-emerald-400 border-0 text-[9px]">DEDUCTION</Badge>
                </div>
              </div>

              <div className="pb-4 border-b border-white/10">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Net Material Cost</p>
                <h4 className="text-2xl font-mono font-bold">Rs. {formatCurrency(results.netRmCost)}</h4>
              </div>

              <div className="pt-2">
                <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Cost of Production</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold font-display text-indigo-400 tracking-tighter">Rs. {results.prelimRatePerLtr.toFixed(2)}</span>
                  <span className="text-xs text-slate-500 font-medium lowercase">/ per ltr</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-800 leading-relaxed">
              <p className="font-bold mb-1 uppercase tracking-wider">Note on OH Rates</p>
              This calculation includes <strong>preliminary overheads</strong>. Final unit costs will update once the month status is marked as <strong>FINAL</strong> in the Costing module.
            </div>
          </div>
        </Card>

        <Card title="Production Yield Efficiency">
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Input Mass</p>
                <p className="text-lg font-bold font-mono">{formatQty(rmItems.reduce((s, i) => s + i.qty, 0))} KG</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Output Mass</p>
                <p className="text-lg font-bold font-mono text-[var(--color-accent)]">{formatQty(fgItems.reduce((s, i) => s + i.qty, 0))} LTR</p>
              </div>
            </div>
            
            <div className="relative pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Yield %</span>
                <span className="text-xs font-bold font-mono text-[var(--color-accent)]">
                  {((fgItems.reduce((s, i) => s + i.qty, 0) / (rmItems.reduce((s, i) => s + i.qty, 0) || 1)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.4)] transition-all duration-500" 
                  style={{ width: `${Math.min(100, (fgItems.reduce((s, i) => s + i.qty, 0) / (rmItems.reduce((s, i) => s + i.qty, 0) || 1)) * 100)}%` }} 
                />
              </div>
            </div>
            
            <div className="pt-2 border-t border-slate-100">
               <Button
              type="submit"
              variant="brand"
              className="w-full h-12 shadow-xl shadow-indigo-100"
              size="lg"
              disabled={!formData.orderNo || isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : 'Post to General Ledger'}
            </Button>
            <Button variant="outline" type="button" className="w-full" size="md" onClick={resetForm} disabled={isSubmitting}>
              Clear Form
            </Button>
            </div>
          </div>
        </Card>
      </div>
    </form>
  );
};
