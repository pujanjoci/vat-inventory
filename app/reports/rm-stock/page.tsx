'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Download, Filter, Package, TrendingUp, Archive, Printer } from 'lucide-react';
import { formatCurrency, formatQty } from '@/lib/format';

export default function RMStockReportPage() {
  const [dateRange, setDateRange] = useState({ from: '2024-04-01', to: '2024-04-30' });

  const columns = [
    { 
      header: 'Raw Material', 
      accessor: 'name',
      render: (i: any) => <span className="font-bold text-[var(--color-text-primary)]">{i.name}</span>
    },
    { 
      header: 'Op. Qty', 
      accessor: 'opQty', 
      align: 'right' as const,
      render: (i: any) => <span className="font-mono">{formatQty(i.opQty)}</span>
    },
    { 
      header: 'Op. Value', 
      accessor: 'opAmt', 
      align: 'right' as const, 
      render: (i: any) => <span className="font-mono text-[var(--color-text-muted)]">Rs. {formatCurrency(i.opAmt)}</span> 
    },
    { 
      header: 'Purchased', 
      accessor: 'purQty', 
      align: 'right' as const,
      render: (i: any) => <span className="font-mono text-blue-600 font-medium">+{formatQty(i.purQty)}</span>
    },
    { 
      header: 'Consumed', 
      accessor: 'consQty', 
      align: 'right' as const,
      render: (i: any) => <span className="font-mono text-rose-600 font-medium">-{formatQty(i.consQty)}</span>
    },
    { 
      header: 'Closing Qty', 
      accessor: 'clQty', 
      align: 'right' as const,
      render: (i: any) => <span className="font-mono font-bold text-[var(--color-text-primary)]">{formatQty(i.clQty)}</span>
    },
    { 
      header: 'Unit Rate', 
      accessor: 'clRate', 
      align: 'right' as const, 
      render: (i: any) => <span className="font-mono text-xs">Rs. {i.clRate.toFixed(2)}</span> 
    },
    { 
      header: 'Closing Value', 
      accessor: 'clAmt', 
      align: 'right' as const, 
      render: (i: any) => <span className="font-mono font-bold text-[var(--color-accent)]">Rs. {formatCurrency(i.clAmt)}</span> 
    },
  ];

  const mockData = [
    { name: 'Yellow Mustard Seed', opQty: 1200, opAmt: 144000, purQty: 5000, purAmt: 600000, consQty: 4500, clQty: 1700, clRate: 120, clAmt: 204000 },
    { name: 'Black Rapeseed (Tori)', opQty: 800, opAmt: 96000, purQty: 2000, purAmt: 240000, consQty: 1500, clQty: 1300, clRate: 120, clAmt: 156000 },
    { name: 'Brown Mustard (Rayo)', opQty: 450, opAmt: 58500, purQty: 1000, purAmt: 130000, consQty: 800, clQty: 650, clRate: 130, clAmt: 84500 },
  ];

  return (
    <AppLayout>
      <PageHeader 
        title="Raw Material Inventory" 
        subtitle="Stock Register & Movement Ledger for raw materials."
        breadcrumbs={[{ label: 'Reports' }, { label: 'Inventory' }, { label: 'RM Stock' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="w-3.5 h-3.5 mr-2" /> Print
            </Button>
            <Button variant="primary" size="sm">
              <Download className="w-3.5 h-3.5 mr-2" /> Export Excel
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Archive className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Total Units</p>
                <p className="text-xl font-bold font-mono">3,650.00 <span className="text-xs font-normal">KG</span></p>
              </div>
            </div>
          </Card>
          <Card className="bg-white">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Net Movement</p>
                <p className="text-xl font-bold font-mono text-emerald-600">+1,200.00 <span className="text-xs font-normal">KG</span></p>
              </div>
            </div>
          </Card>
          <Card className="bg-accent text-white shadow-lg shadow-accent/20 border-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Stock Valuation</p>
                <p className="text-xl font-bold font-mono">Rs. {formatCurrency(444500)}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card title="Inventory Filters">
          <div className="flex flex-col md:flex-row items-end gap-5">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <Input 
                label="From Date" 
                type="date" 
                value={dateRange.from} 
                onChange={e => setDateRange({ ...dateRange, from: e.target.value })} 
              />
              <Input 
                label="To Date" 
                type="date" 
                value={dateRange.to} 
                onChange={e => setDateRange({ ...dateRange, to: e.target.value })} 
              />
            </div>
            <Button variant="primary" className="h-11 px-8 shadow-md">
              <Filter className="w-4 h-4 mr-2" /> Generate Report
            </Button>
          </div>
        </Card>

        <DataTable 
          columns={columns} 
          data={mockData} 
          searchPlaceholder="Search materials..."
        />
        
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <p className="text-[10px] text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">
                Valuation method: Weighted Average Costing (WAC)
              </p>
           </div>
           <p className="text-xs font-bold text-[var(--color-text-primary)]">
             LAST SYNC: 2 mins ago
           </p>
        </div>
      </div>
    </AppLayout>
  );
}
