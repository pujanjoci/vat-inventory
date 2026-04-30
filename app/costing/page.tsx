'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Edit2, Save, X, Lock, CheckCircle, PieChart, Users, Zap, Fuel, Settings2, Info } from 'lucide-react';
import { NEPALI_MONTHS } from '@/lib/constants';
import { formatCurrency, formatQty } from '@/lib/format';

export default function CostingPage() {
  const [editingId, setEditingId] = useState<string | null>(null);

  const mockData = NEPALI_MONTHS.slice(0, 6).map((month, idx) => ({
    id: idx.toString(),
    month,
    year: '2080/81',
    status: idx === 5 ? 'PRELIMINARY' : 'FINAL',
    output: 12000 + (idx * 2000),
    workers: 5,
    wage: 15000,
    ohPower: 8000,
    ohFuel: 5000,
    ohMaint: 3000,
    ohOther: 2000,
  }));

  return (
    <AppLayout>
      <PageHeader 
        title="Manufacturing Costing & OH" 
        subtitle="Finalize monthly overheads and adjust unit production costs."
        breadcrumbs={[{ label: 'Operations' }, { label: 'Costing' }]}
        actions={
          <Button variant="outline" size="sm">
            <Settings2 className="w-3.5 h-3.5 mr-2" /> Budget Configuration
          </Button>
        }
      />

      <div className="space-y-8">
        {/* Main Budget Grid */}
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] shadow-sm bg-white overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-raised)] border-b border-[var(--color-border)]">
                <th className="px-6 py-4 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Production Month</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-center">Audit Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Yield (Ltr)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Labour (Rs)</th>
                <th className="px-4 py-4 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Power</th>
                <th className="px-4 py-4 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Fuel</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Total OH</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Actual Unit Cost</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {mockData.map((row) => {
                const isEditing = editingId === row.id;
                const totalOh = (row.workers * row.wage) + row.ohPower + row.ohFuel + row.ohMaint + row.ohOther;
                const ratePerLtr = totalOh / row.output;

                return (
                  <tr key={row.id} className="hover:bg-[var(--color-surface-raised)] transition-colors group">
                    <td className="px-6 py-4 font-bold text-[var(--color-text-primary)]">{row.month} <span className="font-normal text-[var(--color-text-muted)] text-[10px] block font-mono">{row.year}</span></td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={row.status === 'FINAL' ? 'FINAL' : 'PRELIMINARY'}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-[var(--color-text-secondary)]">
                      {isEditing ? <input type="number" defaultValue={row.output} className="w-20 h-8 px-2 border rounded-md focus:ring-1 focus:ring-[var(--color-accent)] outline-none text-right" /> : formatQty(row.output)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-[var(--color-text-secondary)]">
                      {isEditing ? <input type="number" defaultValue={row.workers * row.wage} className="w-24 h-8 px-2 border rounded-md focus:ring-1 focus:ring-[var(--color-accent)] outline-none text-right" /> : formatCurrency(row.workers * row.wage)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-[var(--color-text-muted)] text-xs">
                      {isEditing ? <input type="number" defaultValue={row.ohPower} className="w-16 h-8 px-2 border rounded-md focus:ring-1 focus:ring-[var(--color-accent)] outline-none text-right" /> : formatCurrency(row.ohPower)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-[var(--color-text-muted)] text-xs">
                      {isEditing ? <input type="number" defaultValue={row.ohFuel} className="w-16 h-8 px-2 border rounded-md focus:ring-1 focus:ring-[var(--color-accent)] outline-none text-right" /> : formatCurrency(row.ohFuel)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold font-mono text-[var(--color-text-primary)]">
                      {formatCurrency(totalOh)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-[var(--color-accent)] font-mono text-base">Rs. {ratePerLtr.toFixed(2)}</span>
                        <span className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-tight">per unit</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {row.status === 'FINAL' ? (
                          <div className="bg-emerald-50 p-2 rounded-full text-emerald-600" title="Audited and Locked">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        ) : (
                          <>
                            {isEditing ? (
                              <div className="flex gap-1">
                                <button onClick={() => setEditingId(null)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                  <Save className="w-4 h-4" />
                                </button>
                                <button onClick={() => setEditingId(null)} className="p-1.5 text-[var(--color-text-muted)] hover:bg-slate-100 rounded-lg">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                <button onClick={() => setEditingId(row.id)} className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] rounded-lg">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 text-[var(--color-text-muted)] hover:text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Set to FINAL">
                                  <Lock className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Lower Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Fixed Cost Allocation">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="p-5 rounded-2xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-center group hover:border-[var(--color-accent)] transition-all">
                    <Users className="h-6 w-6 mx-auto mb-3 text-blue-500 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Active Labour</p>
                    <h4 className="text-xl font-bold font-mono">05 Units</h4>
                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-2 font-medium">Rs. 15,000 / avg</p>
                 </div>
                 <div className="p-5 rounded-2xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-center group hover:border-[var(--color-accent)] transition-all">
                    <Zap className="h-6 w-6 mx-auto mb-3 text-amber-500 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Energy Budget</p>
                    <h4 className="text-xl font-bold font-mono">Rs. 12,500</h4>
                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-2 font-medium">Allocated Monthly</p>
                 </div>
                 <div className="p-5 rounded-2xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-center group hover:border-[var(--color-accent)] transition-all">
                    <Fuel className="h-6 w-6 mx-auto mb-3 text-rose-500 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Fuel / Maint</p>
                    <h4 className="text-xl font-bold font-mono">Rs. 8,200</h4>
                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-2 font-medium">Variable Cap</p>
                 </div>
              </div>
            </Card>
            
            <div className="p-6 rounded-2xl bg-white border border-[var(--color-border)] flex gap-5 items-start">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-light)] flex items-center justify-center shrink-0">
                <PieChart className="h-6 w-6 text-[var(--color-accent)]" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-[var(--color-text-primary)]">Cost-Efficiency Analysis</h4>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  Based on current data, your <strong>Actual Unit Cost</strong> has stabilized at Rs. 6.45/ltr. This represents a 4.2% reduction in overhead consumption compared to the previous fiscal quarter, primarily due to optimized power scheduling.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card title="System Integrity" className="bg-slate-900 text-white border-0 shadow-2xl h-full">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-white">Month Finalization</h5>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      Marking a month as <strong>FINAL</strong> locks all overhead journals. The system will then automatically:
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pl-14">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                    <span className="text-[11px] text-slate-300">Recalculate Batch Unit Costs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                    <span className="text-[11px] text-slate-300">Update Stock Ledger Values</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                    <span className="text-[11px] text-slate-300">Sync with G-Sheets Master</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 mt-6 flex items-center gap-3">
                   <Info className="h-4 w-4 text-amber-400" />
                   <p className="text-[10px] text-slate-500 italic">
                     Finalized records cannot be modified without Supervisor override.
                   </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
