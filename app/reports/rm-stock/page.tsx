'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Download, Filter } from 'lucide-react';
import { formatAmount } from '@/lib/calculations';

export default function RMStockReportPage() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const columns = [
    { header: 'Product Name', accessor: 'name' },
    { header: 'Op. Qty', accessor: 'opQty', align: 'right' as const },
    { header: 'Op. Amount', accessor: 'opAmt', align: 'right' as const, render: (i: any) => formatAmount(i.opAmt) },
    { header: 'Purchase Qty', accessor: 'purQty', align: 'right' as const },
    { header: 'Purchase Amt', accessor: 'purAmt', align: 'right' as const, render: (i: any) => formatAmount(i.purAmt) },
    { header: 'Consumption', accessor: 'consQty', align: 'right' as const },
    { header: 'Closing Qty', accessor: 'clQty', align: 'right' as const },
    { header: 'Cl. Rate', accessor: 'clRate', align: 'right' as const, render: (i: any) => i.clRate.toFixed(2) },
    { header: 'Closing Amt', accessor: 'clAmt', align: 'right' as const, render: (i: any) => formatAmount(i.clAmt) },
  ];

  const mockData = [
    { name: 'Rapeseed (Tori)', opQty: 1200, opAmt: 144000, purQty: 5000, purAmt: 600000, consQty: 4500, clQty: 1700, clRate: 120, clAmt: 204000 },
    { name: 'Mustard Seeds', opQty: 800, opAmt: 96000, purQty: 2000, purAmt: 240000, consQty: 1500, clQty: 1300, clRate: 120, clAmt: 156000 },
  ];

  return (
    <AppLayout>
      <PageHeader 
        title="Raw Material Stock Report" 
        description="View inventory movements and closing balances for raw materials."
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

      <Table columns={columns} data={mockData} />

      <div className="mt-6 flex justify-end">
        <div className="bg-slate-900 text-white px-8 py-4 rounded-xl shadow-lg">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1 text-right">Total RM Stock Value</p>
          <h3 className="text-2xl font-bold font-mono">Rs. {formatAmount(360000)}</h3>
        </div>
      </div>
    </AppLayout>
  );
}
