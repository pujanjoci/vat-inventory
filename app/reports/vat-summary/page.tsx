'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Download, Filter, Calculator, Printer, ArrowRight, TrendingDown, TrendingUp, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

export default function VATSummaryPage() {
  const [dateRange, setDateRange] = useState({ from: '2024-04-01', to: '2024-04-30' });

  const columns = [
    { 
      header: 'Taxable Party', 
      accessor: 'name',
      render: (i: any) => <span className="font-medium text-[var(--color-text-primary)]">{i.name}</span>
    },
    { 
      header: 'Taxable Value', 
      accessor: 'taxable', 
      align: 'right' as const, 
      render: (i: any) => <span className="font-mono">Rs. {formatCurrency(i.taxable)}</span> 
    },
    { 
      header: 'VAT (13%)', 
      accessor: 'vat', 
      align: 'right' as const, 
      render: (i: any) => <span className="font-mono font-bold text-[var(--color-text-primary)]">Rs. {formatCurrency(i.vat)}</span> 
    },
    { 
      header: 'Exempt Value', 
      accessor: 'nonTaxable', 
      align: 'right' as const, 
      render: (i: any) => <span className="font-mono text-[var(--color-text-muted)]">Rs. {formatCurrency(i.nonTaxable)}</span> 
    },
  ];

  const inputData = [
    { name: 'ABC Suppliers Pvt. Ltd.', taxable: 450000, vat: 58500, nonTaxable: 20000 },
    { name: 'XYZ Oil Trading', taxable: 320000, vat: 41600, nonTaxable: 15000 },
    { name: 'Nepal Electricity Authority', taxable: 12000, vat: 1560, nonTaxable: 0 },
  ];

  const outputData = [
    { name: 'Global Retail Chain', taxable: 850000, vat: 110500, nonTaxable: 50000 },
    { name: 'City Grocery Hub', taxable: 420000, vat: 54600, nonTaxable: 25000 },
  ];

  return (
    <AppLayout>
      <PageHeader 
        title="VAT Compliance Summary" 
        subtitle="Calculation of Input Credit and Output Liability for current period."
        breadcrumbs={[{ label: 'Reports' }, { label: 'VAT Summary' }]}
        actions={
          <div className="flex gap-2 no-print">
            <Button variant="outline" size="sm">
              <Printer className="w-3.5 h-3.5 mr-2" /> Print Report
            </Button>
            <Button variant="primary" size="sm">
              <Download className="w-3.5 h-3.5 mr-2" /> Export PDF
            </Button>
          </div>
        }
      />

      <div className="space-y-8">
        {/* Filter Controls */}
        <Card className="no-print">
          <div className="flex flex-col md:flex-row items-end gap-5">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <Input 
                label="Statement Start" 
                type="date" 
                value={dateRange.from} 
                onChange={e => setDateRange({ ...dateRange, from: e.target.value })} 
              />
              <Input 
                label="Statement End" 
                type="date" 
                value={dateRange.to} 
                onChange={e => setDateRange({ ...dateRange, to: e.target.value })} 
              />
            </div>
            <Button variant="primary" className="h-11 px-8 shadow-md">
              <Filter className="w-4 h-4 mr-2" /> Refresh Data
            </Button>
          </div>
        </Card>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-text-secondary)] flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">IN</div>
                Purchase VAT (Input Credit)
              </h3>
              <Badge variant="Vendor">PERIOD TOTAL</Badge>
            </div>
            <DataTable columns={columns} data={inputData} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-text-secondary)] flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">OUT</div>
                Sales VAT (Output Liability)
              </h3>
              <Badge variant="Taxable">PERIOD TOTAL</Badge>
            </div>
            <DataTable columns={columns} data={outputData} />
          </div>
        </div>

        {/* Calculation Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4">
            <Card title="Adjustments & Brought Forward">
              <div className="space-y-5">
                <Input label="B/F Credit (Last Month)" type="number" defaultValue="0" icon={<span className="text-[10px] font-bold">Rs.</span>} />
                <Input label="TDS VAT Adjustments" type="number" defaultValue="0" icon={<span className="text-[10px] font-bold">Rs.</span>} />
                <Input label="Misc. Tax Credits" type="number" defaultValue="0" icon={<span className="text-[10px] font-bold">Rs.</span>} />
                <Button variant="outline" className="w-full">Re-calculate Ledger</Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8">
             <Card title="Tax Liability Statement" className="bg-[var(--color-surface-raised)] border-2 border-[var(--color-border-strong)]">
                <div className="p-4 md:p-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                      <div className="space-y-5">
                        <div className="flex justify-between items-center group">
                          <span className="text-[var(--color-text-secondary)] text-sm">Total Input Tax Credit</span>
                          <span className="font-mono font-bold text-blue-600 text-lg">Rs. {formatCurrency(101660)}</span>
                        </div>
                        <div className="flex justify-between items-center group">
                          <span className="text-[var(--color-text-secondary)] text-sm">Total Output Tax Payable</span>
                          <span className="font-mono font-bold text-emerald-600 text-lg">Rs. {formatCurrency(165100)}</span>
                        </div>
                        <div className="h-px bg-[var(--color-border-strong)] my-2" />
                        <div className="flex justify-between items-center group">
                          <span className="text-[var(--color-text-primary)] font-bold">Net Difference</span>
                          <span className="font-mono font-bold text-[var(--color-danger)] text-xl">Rs. {formatCurrency(63440)}</span>
                        </div>
                      </div>

                      <div className="relative p-8 bg-white rounded-2xl border border-[var(--color-border)] shadow-xl text-center overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--color-danger)]" />
                        <Calculator className="w-10 h-10 text-[var(--color-danger)] opacity-20 absolute -top-2 -right-2" />
                        
                        <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-[0.2em] mb-2">Government Dues</p>
                        <h3 className="text-4xl font-display font-bold text-[var(--color-text-primary)] tracking-tight">Rs. {formatCurrency(63440)}</h3>
                        
                        <div className="mt-6 flex items-center justify-center gap-2">
                           <Badge variant="No">PAYABLE</Badge>
                           <p className="text-[11px] text-[var(--color-text-secondary)] font-medium">As of {dateRange.to}</p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex gap-4">
                           <div className="flex-1 text-center">
                              <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Status</p>
                              <p className="text-[11px] font-bold text-amber-600">Pending Filing</p>
                           </div>
                           <div className="w-px bg-slate-100" />
                           <div className="flex-1 text-center">
                              <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Due Date</p>
                              <p className="text-[11px] font-bold text-slate-900">25th Jestha</p>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
                
                <div className="p-4 bg-white/50 border-t border-[var(--color-border)] flex items-center gap-3">
                   <Info className="h-4 w-4 text-blue-500" />
                   <p className="text-[10px] text-[var(--color-text-secondary)] font-medium">
                     This report is generated for preliminary tax audit. Please ensure all Sales and Purchase journals for the month are marked as <strong>FINAL</strong> before government submission.
                   </p>
                </div>
             </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
