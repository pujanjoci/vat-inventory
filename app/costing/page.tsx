'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Edit2, Save, X, Lock, CheckCircle } from 'lucide-react';
import { NEPALI_MONTHS } from '@/lib/constants';
import { formatAmount } from '@/lib/calculations';

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
        title="Costing & Overhead Budget" 
        description="Manage monthly overheads and finalize production costs."
      />

      <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm">
        <table className="w-full text-left border-collapse bg-white text-sm">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider">Month</th>
              <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
              <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-right">Output (L)</th>
              <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-right">Wages</th>
              <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-right">Power</th>
              <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-right">Fuel</th>
              <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-right">Maint</th>
              <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-right">Total OH</th>
              <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-right">Rate/Ltr</th>
              <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockData.map((row) => {
              const isEditing = editingId === row.id;
              const totalOh = (row.workers * row.wage) + row.ohPower + row.ohFuel + row.ohMaint + row.ohOther;
              const ratePerLtr = totalOh / row.output;

              return (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 font-bold text-slate-900">{row.month}</td>
                  <td className="px-4 py-4 text-center">
                    <Badge variant={row.status === 'FINAL' ? 'success' : 'warning'}>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-right font-mono">
                    {isEditing ? <Input type="number" defaultValue={row.output} className="w-24 h-8 px-2" /> : row.output.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right font-mono">
                    {isEditing ? <Input type="number" defaultValue={row.workers * row.wage} className="w-24 h-8 px-2" /> : formatAmount(row.workers * row.wage)}
                  </td>
                  <td className="px-4 py-4 text-right font-mono">
                    {isEditing ? <Input type="number" defaultValue={row.ohPower} className="w-24 h-8 px-2" /> : formatAmount(row.ohPower)}
                  </td>
                  <td className="px-4 py-4 text-right font-mono">
                    {isEditing ? <Input type="number" defaultValue={row.ohFuel} className="w-24 h-8 px-2" /> : formatAmount(row.ohFuel)}
                  </td>
                  <td className="px-4 py-4 text-right font-mono">
                    {isEditing ? <Input type="number" defaultValue={row.ohMaint} className="w-24 h-8 px-2" /> : formatAmount(row.ohMaint)}
                  </td>
                  <td className="px-4 py-4 text-right font-bold font-mono text-slate-900">
                    {formatAmount(totalOh)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-indigo-600 font-mono">Rs. {ratePerLtr.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">per Ltr</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {row.status === 'FINAL' ? (
                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                          <CheckCircle className="w-3 h-3" /> Locked
                        </div>
                      ) : (
                        <>
                          {isEditing ? (
                            <>
                              <button onClick={() => setEditingId(null)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md">
                                <Save className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => setEditingId(row.id)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md" title="Set to Final">
                                <Lock className="w-4 h-4" />
                              </button>
                            </>
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

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Direct Labour Breakdown">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Workers</div>
              <div className="text-2xl font-bold font-mono text-slate-900">5</div>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Average Wage / Worker</div>
              <div className="text-2xl font-bold font-mono text-slate-900">Rs. 15,000</div>
            </div>
          </div>
        </Card>

        <Card title="What happens on 'FINAL'?">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-sm text-slate-600 leading-relaxed">
              When a month is marked as <strong>FINAL</strong>, the system locks the overhead data and automatically updates the unit cost of all production batches for that month. It replaces the <em>Preliminary OH Rate</em> with the <em>Actual OH Rate</em> and recalculates the closing stock value and Cost of Goods Sold.
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
