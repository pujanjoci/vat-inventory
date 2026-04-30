'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Download, Filter, Factory, TrendingUp, BarChart3, Printer, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatQty, formatPercent } from '@/lib/format';

export default function FGStockReportPage() {
  const [dateRange, setDateRange] = useState({ from: '2024-04-01', to: '2024-04-30' });

  const columns = [
    { 
      header: 'Finished Product', 
      accessor: 'name',
      render: (i: any) => (
        <div>
          <p className="font-bold text-[var(--color-text-primary)]">{i.name}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-tighter">SKU: {i.sku || 'N/A'}</p>
        </div>
      )
    },
    { 
      header: 'Opening', 
      accessor: 'opQty', 
      align: 'right' as const,
      render: (i: any) => <span className="font-mono text-[var(--color-text-secondary)]">{formatQty(i.opQty)}</span>
    },
    { 
      header: 'Production', 
      accessor: 'prodQty', 
      align: 'right' as const,
      render: (i: any) => <span className="font-mono text-emerald-600 font-bold">+{formatQty(i.prodQty)}</span>
    },
    { 
      header: 'Sales', 
      accessor: 'salesQty', 
      align: 'right' as const,
      render: (i: any) => <span className="font-mono text-blue-600 font-bold">-{formatQty(i.salesQty)}</span>
    },
    { 
      header: 'Closing Qty', 
      accessor: 'clQty', 
      align: 'right' as const,
      render: (i: any) => (
        <span className="font-mono font-bold text-[var(--color-text-primary)]">
          {formatQty(i.clQty)}
        </span>
      )
    },
    { 
      header: 'Avg Rate', 
      accessor: 'clRate', 
      align: 'right' as const, 
      render: (i: any) => <span className="font-mono text-xs">Rs. {i.clRate.toFixed(2)}</span> 
    },
    { 
      header: 'Stock Value', 
      accessor: 'clAmt', 
      align: 'right' as const, 
      render: (i: any) => <span className="font-mono font-bold text-[var(--color-accent)]">Rs. {formatCurrency(i.clAmt)}</span> 
    },
    { 
      header: 'Margin', 
      accessor: 'gpPercent', 
      align: 'right' as const,
      render: (item: any) => (
        <Badge variant={item.gpPercent > 20 ? 'success' : item.gpPercent > 10 ? 'warning' : 'danger'}>
          {formatPercent(item.gpPercent)}
        </Badge>
      )
    },
  ];

  const mockData = [
    { name: 'Pure Mustard Oil (1L)', sku: 'MO-001', opQty: 500, prodQty: 4500, salesQty: 3800, clQty: 1200, clRate: 185.50, clAmt: 222600, gpPercent: 24.5 },
    { name: 'Mustard Oil (500ml)', sku: 'MO-500', opQty: 250, prodQty: 2200, salesQty: 1900, clQty: 550, clRate: 98.25, clAmt: 54037.5, gpPercent: 21.8 },
    { name: 'Oil Cake (Pina)', sku: 'BP-001', opQty: 200, prodQty: 1500, salesQty: 1400, clQty: 300, clRate: 45.00, clAmt: 13500, gpPercent: 12.0 },
  ];

  return (
    <AppLayout>
      <PageHeader 
        title="FG & By-product Ledger" 
        subtitle="End-to-end production tracking and sales throughput analysis."
        breadcrumbs={[{ label: 'Reports' }, { label: 'Inventory' }, { label: 'FG Stock' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="w-3.5 h-3.5 mr-2" /> Print
            </Button>
            <Button variant="primary" size="sm">
              <Download className="w-3.5 h-3.5 mr-2" /> Export
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           <Card className="bg-white border-l-4 border-l-emerald-500 shadow-sm">
             <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Production Yield</p>
             <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold font-mono">8,200 <span className="text-xs font-normal">LTR</span></h4>
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
             </div>
           </Card>
           <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm">
             <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Total Sales</p>
             <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold font-mono">7,100 <span className="text-xs font-normal">LTR</span></h4>
                <TrendingUp className="h-4 w-4 text-blue-500" />
             </div>
           </Card>
           <Card className="bg-white border-l-4 border-l-[var(--color-accent)] shadow-sm">
             <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">FG Value</p>
             <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold font-mono">Rs. {formatCurrency(290137)}</h4>
                <BarChart3 className="h-4 w-4 text-[var(--color-accent)]" />
             </div>
           </Card>
           <Card className="bg-[var(--color-success)] text-white border-0 shadow-lg shadow-green-100">
             <p className="text-[10px] font-bold text-green-100 uppercase tracking-wider mb-1">Gross Profit</p>
             <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold font-mono">Rs. {formatCurrency(842500)}</h4>
                <Badge variant="No" className="bg-white/20 text-white border-0 text-[10px]">FY24</Badge>
             </div>
           </Card>
        </div>

        <Card title="Ledger Period Filter">
          <div className="flex flex-col md:flex-row items-end gap-5">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <Input 
                label="Start Date" 
                type="date" 
                value={dateRange.from} 
                onChange={e => setDateRange({ ...dateRange, from: e.target.value })} 
              />
              <Input 
                label="End Date" 
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

        <DataTable 
          columns={columns} 
          data={mockData} 
          searchPlaceholder="Search finished products..."
        />
        
        <div className="p-4 bg-accent-light border border-accent/20 rounded-xl flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Factory className="h-4 w-4 text-[var(--color-accent)]" />
              <p className="text-[10px] text-[var(--color-accent)] font-bold uppercase tracking-wider">
                Overall Operational Efficiency: 94.2%
              </p>
           </div>
           <p className="text-[10px] font-bold text-[var(--color-text-muted)] italic uppercase">
             * Valuation updated based on latest production costing
           </p>
        </div>
      </div>
    </AppLayout>
  );
}
