'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Download, Filter, Calculator } from 'lucide-react';
import { formatAmount } from '@/lib/calculations';

export default function VATSummaryPage() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const columns = [
    { header: 'Party Name', accessor: 'name' },
    { header: 'Taxable Value', accessor: 'taxable', align: 'right' as const, render: (i: any) => formatAmount(i.taxable) },
    { header: 'VAT (13%)', accessor: 'vat', align: 'right' as const, render: (i: any) => formatAmount(i.vat) },
    { header: 'Non-Taxable', accessor: 'nonTaxable', align: 'right' as const, render: (i: any) => formatAmount(i.nonTaxable) },
  ];

  const inputData = [
    { name: 'ABC Suppliers', taxable: 450000, vat: 58500, nonTaxable: 20000 },
    { name: 'XYZ Trading', taxable: 320000, vat: 41600, nonTaxable: 15000 },
  ];

  const outputData = [
    { name: 'Global Mart', taxable: 850000, vat: 110500, nonTaxable: 50000 },
    { name: 'City Store', taxable: 420000, vat: 54600, nonTaxable: 25000 },
  ];

  return (
    <AppLayout>
      <PageHeader 
        title="VAT Summary Report" 
        description="Calculate your Input and Output VAT to determine government dues."
        action={
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        }
      />

      <Card className="mb-8">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-48">
            <Input 
              label="From Date" 
              type="date" 
              value={dateRange.from} 
              onChange={e => setDateRange({ ...dateRange, from: e.target.value })} 
            />
          </div>
          <div className="w-48">
            <Input 
              label="To Date" 
              type="date" 
              value={dateRange.to} 
              onChange={e => setDateRange({ ...dateRange, to: e.target.value })} 
            />
          </div>
          <Button variant="secondary" className="gap-2">
            <Filter className="w-4 h-4" /> Generate Report
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <h3 className="text-xl font-display text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">IN</span>
            INPUT VAT (Purchases)
          </h3>
          <Table columns={columns} data={inputData} />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-display text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">OUT</span>
            OUTPUT VAT (Sales)
          </h3>
          <Table columns={columns} data={outputData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title="Adjustments" className="lg:col-span-1">
          <div className="space-y-4">
            <Input label="Opening VAT Receivable" type="number" defaultValue="0" />
            <Input label="VAT Paid Till Date" type="number" defaultValue="0" />
            <Input label="Manual Adjustments" type="number" defaultValue="0" />
            <Button className="w-full">Apply Adjustments</Button>
          </div>
        </Card>

        <Card title="Final Calculation" className="lg:col-span-2 bg-slate-50">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Input VAT:</span>
                  <span className="font-bold font-mono">Rs. {formatAmount(100100)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Output VAT:</span>
                  <span className="font-bold font-mono">Rs. {formatAmount(165100)}</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Net Payable for Period:</span>
                  <span className="font-mono">Rs. {formatAmount(65000)}</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-rose-50 border border-rose-100 rounded-2xl text-center">
                <Calculator className="w-8 h-8 text-rose-500 mb-2" />
                <p className="text-xs text-rose-600 font-bold uppercase tracking-widest mb-1">VAT Dues (Payable)</p>
                <h3 className="text-3xl font-bold font-mono text-rose-700">Rs. {formatAmount(65000)}</h3>
                <p className="text-[10px] text-rose-400 mt-2 italic font-medium">Final amount to be paid to the Tax Office</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
