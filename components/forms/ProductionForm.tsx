'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Plus, Trash2, Factory, Zap, Info } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';
import { calculateProduction, formatAmount, getNepaliMonth } from '@/lib/calculations';

export const ProductionForm = () => {
  const { masters, showToast } = useApp();
  
  const [rmItems, setRmItems] = useState([{ code: '', qty: 0, rate: 0 }]);
  const [fgItems, setFgItems] = useState([{ code: '', qty: 0, nrv: 0 }]);
  const [bpItems, setBpItems] = useState([{ code: '', qty: 0, nrv: 0 }]);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    orderNo: '1001'
  });

  const addRM = () => setRmItems([...rmItems, { code: '', qty: 0, rate: 0 }]);
  const addFG = () => setFgItems([...fgItems, { code: '', qty: 0, nrv: 0 }]);
  const addBP = () => setBpItems([...bpItems, { code: '', qty: 0, nrv: 0 }]);

  const results = useMemo(() => {
    const fgTotalQty = fgItems.reduce((sum, item) => sum + item.qty, 0);
    return calculateProduction(
      rmItems.map(i => ({ qty: i.qty, rate: i.rate })),
      bpItems.map(i => ({ qty: i.qty, nrv: i.nrv })),
      fgTotalQty,
      15000, // mock prelim OH
      0      // mock final OH
    );
  }, [rmItems, fgItems, bpItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Production entry saved successfully (Mock)', 'success');
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      <div className="xl:col-span-3 space-y-6">
        <Card title="Production Header">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Order Date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            <Input label="Nepali Month" value={getNepaliMonth(formData.date)} disabled />
            <Input label="Order No" value={formData.orderNo} onChange={e => setFormData({...formData, orderNo: e.target.value})} required />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card 
            title="Raw Material Consumption" 
            headerAction={<Button type="button" size="sm" onClick={addRM}><Plus className="w-4 h-4 mr-1" /> Add RM</Button>}
          >
            <div className="space-y-4">
              {rmItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-end border-b border-slate-50 pb-4">
                  <div className="flex-1">
                    <Select 
                      label={idx === 0 ? "RM Product" : ""}
                      options={masters.rm.map(p => ({ label: p.productName, value: p.productCode }))}
                      value={item.code}
                      onChange={e => {
                        const newRm = [...rmItems];
                        newRm[idx].code = e.target.value;
                        // Mock rate
                        newRm[idx].rate = 120;
                        setRmItems(newRm);
                      }}
                    />
                  </div>
                  <div className="w-24">
                    <Input 
                      label={idx === 0 ? "Qty" : ""} 
                      type="number" 
                      value={item.qty} 
                      onChange={e => {
                        const newRm = [...rmItems];
                        newRm[idx].qty = parseFloat(e.target.value);
                        setRmItems(newRm);
                      }} 
                    />
                  </div>
                  <div className="w-32">
                    <Input 
                      label={idx === 0 ? "Avg Rate" : ""} 
                      value={item.rate} 
                      disabled 
                      className="text-right font-mono"
                    />
                  </div>
                  <Button type="button" variant="ghost" className="p-2 mb-0.5" onClick={() => setRmItems(rmItems.filter((_, i) => i !== idx))}>
                    <Trash2 className="w-4 h-4 text-slate-400" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card 
              title="Finished Goods Output" 
              headerAction={<Button type="button" size="sm" onClick={addFG}><Plus className="w-4 h-4 mr-1" /> Add FG</Button>}
            >
              <div className="space-y-4">
                {fgItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select 
                        label={idx === 0 ? "FG Product" : ""}
                        options={masters.fg.map(p => ({ label: p.productName, value: p.productCode }))}
                        value={item.code}
                        onChange={e => {
                          const newFg = [...fgItems];
                          newFg[idx].code = e.target.value;
                          setFgItems(newFg);
                        }}
                      />
                    </div>
                    <div className="w-24">
                      <Input 
                        label={idx === 0 ? "Qty" : ""} 
                        type="number" 
                        value={item.qty} 
                        onChange={e => {
                          const newFg = [...fgItems];
                          newFg[idx].qty = parseFloat(e.target.value);
                          setFgItems(newFg);
                        }} 
                      />
                    </div>
                    <Button type="button" variant="ghost" className="p-2 mb-0.5" onClick={() => setFgItems(fgItems.filter((_, i) => i !== idx))}>
                      <Trash2 className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card 
              title="Byproducts Produced" 
              headerAction={<Button type="button" size="sm" onClick={addBP}><Plus className="w-4 h-4 mr-1" /> Add BP</Button>}
            >
              <div className="space-y-4">
                {bpItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select 
                        label={idx === 0 ? "BP Product" : ""}
                        options={masters.bp.map(p => ({ label: p.productName, value: p.productCode }))}
                        value={item.code}
                        onChange={e => {
                          const newBp = [...bpItems];
                          newBp[idx].code = e.target.value;
                          setBpItems(newBp);
                        }}
                      />
                    </div>
                    <div className="w-24">
                      <Input 
                        label={idx === 0 ? "Qty" : ""} 
                        type="number" 
                        value={item.qty} 
                        onChange={e => {
                          const newBp = [...bpItems];
                          newBp[idx].qty = parseFloat(e.target.value);
                          setBpItems(newBp);
                        }} 
                      />
                    </div>
                    <div className="w-24">
                      <Input 
                        label={idx === 0 ? "NRV" : ""} 
                        type="number" 
                        value={item.nrv} 
                        onChange={e => {
                          const newBp = [...bpItems];
                          newBp[idx].nrv = parseFloat(e.target.value);
                          setBpItems(newBp);
                        }} 
                      />
                    </div>
                    <Button type="button" variant="ghost" className="p-2 mb-0.5" onClick={() => setBpItems(bpItems.filter((_, i) => i !== idx))}>
                      <Trash2 className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card title="Costing Summary">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <Factory className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 rotate-12" />
            
            <div className="space-y-4 relative z-10">
              <div className="pb-4 border-b border-white/10">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total RM Cost</p>
                <h4 className="text-xl font-mono">Rs. {formatAmount(results.totalRmCost)}</h4>
              </div>

              <div className="pb-4 border-b border-white/10">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Less: Byproduct NRV</p>
                <h4 className="text-xl font-mono text-emerald-400">-(Rs. {formatAmount(results.totalBpNrv)})</h4>
              </div>

              <div className="pb-4 border-b border-white/10">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Net RM Cost</p>
                <h4 className="text-xl font-mono">Rs. {formatAmount(results.netRmCost)}</h4>
              </div>

              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Prelim. Cost / Ltr</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-3xl font-bold font-mono text-indigo-400">Rs. {results.prelimRatePerLtr.toFixed(2)}</h4>
                  <span className="text-xs text-slate-500">per Ltr</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
            <Zap className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="text-xs text-amber-800 leading-relaxed">
              <p className="font-bold mb-1 uppercase tracking-wider">Preliminary Costing</p>
              Final OH rates will be applied once the monthly costing budget is set to <strong>FINAL</strong>.
            </div>
          </div>

          <Button type="submit" className="w-full py-4 text-lg" size="lg">
            Finalize Order
          </Button>
        </Card>

        <Card title="Yield Analysis">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Input RM:</span>
              <span className="font-bold">{rmItems.reduce((s, i) => s + i.qty, 0).toLocaleString()} KG</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Output FG:</span>
              <span className="font-bold">{fgItems.reduce((s, i) => s + i.qty, 0).toLocaleString()} LTR</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-4">
              <div 
                className="h-full bg-indigo-500" 
                style={{ width: `${Math.min(100, (fgItems.reduce((s, i) => s + i.qty, 0) / (rmItems.reduce((s, i) => s + i.qty, 0) || 1)) * 100)}%` }} 
              />
            </div>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Yield Percentage</p>
          </div>
        </Card>
      </div>
    </form>
  );
};
