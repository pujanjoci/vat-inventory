'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Download, Filter } from 'lucide-react';
import { formatAmount } from '@/lib/calculations';

export default function FGStockReportPage() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const columns = [
    { header: 'Product Name', accessor: 'name' },
    { header: 'Opening', accessor: 'opQty', align: 'right' as const },
    { header: 'Production', accessor: 'prodQty', align: 'right' as const },
    { header: 'Sales', accessor: 'salesQty', align: 'right' as const },
    { header: 'Closing Qty', accessor: 'clQty', align: 'right' as const },
    { header: 'Cl. Rate', accessor: 'clRate', align: 'right' as const, render: (i: any) => i.clRate.toFixed(2) },
    { header: 'Closing Amt', accessor: 'clAmt', align: 'right' as const, render: (i: any) => formatAmount(i.clAmt) },
    { 
      header: 'GP %', 
      accessor: 'gpPercent', 
      align: 'right' as const,
      render: (item: any) => (
        <Badge variant={item.gpPercent > 20 ? 'success' : item.gpPercent > 10 ? 'warning' : 'danger'}>
          {item.gpPercent.toFixed(1)}%
        </Badge>
      )
    },
  ];

  const mockData = [
    { name: 'Tori Ko Tel (Mustard Oil)', opQty: 500, prodQty: 4500, salesQty: 3800, clQty: 1200, clRate: 185.50, clAmt: 222600, gpPercent: 24.5 },
    { name: 'Pina-Tori (Oil Cake)', opQty: 200, prodQty: 1500, salesQty: 1400, clQty: 300, clRate: 45.00, clAmt: 13500, gpPercent: 12.0 },
  ];

  return (
    <AppLayout>
      <PageHeader 
        title="FG & Byproduct Stock Report" 
        description="Monitor finished goods production, sales performance, and profitability."
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="bg-slate-900 border-none">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Total FG Stock Value</p>
          <h3 className="text-3xl font-bold font-mono text-white">Rs. {formatAmount(236100)}</h3>
        </Card>
        <Card className="bg-indigo-600 border-none">
          <p className="text-xs text-indigo-200 uppercase font-bold tracking-widest mb-1">Overall Gross Profit</p>
          <h3 className="text-3xl font-bold font-mono text-white">Rs. {formatAmount(842500)}</h3>
        </Card>
      </div>
    </AppLayout>
  );
}
