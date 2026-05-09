'use client';

import React, { useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Download, Factory, TrendingUp, BarChart3, Printer, ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatQty } from '@/lib/format';
import { exportToCSV } from '@/lib/export';
import { useAppContext } from '@/lib/context/AppContext';

export default function FGStockReportPage() {
  const { masters, isLoading, user, settings } = useAppContext();

  const columns: any[] = [
    { 
      header: 'Finished Product', 
      accessor: 'name',
      render: (i: any) => (
        <div>
          <p className="font-bold text-[var(--color-text-primary)]">{i['FG Product Name']}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-tighter">SKU: {i['FG Product Code']}</p>
        </div>
      )
    },
    { 
      header: 'Tax Status', 
      accessor: 'isTaxable',
      render: (i: any) => (
        <Badge variant={i['Is it Taxable?'] === 'Yes' ? 'Taxable' : 'No'}>
          {i['Is it Taxable?'] === 'Yes' ? 'Taxable' : 'Exempt'}
        </Badge>
      )
    },
    { 
      header: 'Current Stock', 
      accessor: 'openingQty', 
      align: 'right' as const,
      render: (i: any) => (
        <span className="font-mono font-bold text-[var(--color-text-primary)]">
          {formatQty(i['Opening Balance (Qty)'])} {i.UOM}
        </span>
      )
    },
    { 
      header: 'Avg Rate', 
      accessor: 'rate', 
      align: 'right' as const, 
      render: (i: any) => {
        const qty = parseFloat(i['Opening Balance (Qty)']) || 0;
        const amt = parseFloat(i['Opening Balance (Rs.)']) || 0;
        const rate = qty > 0 ? amt / qty : 0;
        return <span className="font-mono text-xs">Rs. {rate.toFixed(2)}</span>;
      }
    },
    { 
      header: 'Stock Value', 
      accessor: 'openingAmount', 
      align: 'right' as const, 
      render: (i: any) => <span className="font-mono font-bold text-[var(--color-accent)]">Rs. {formatCurrency(i['Opening Balance (Rs.)'])}</span> 
    },
  ];

  const stats = useMemo(() => {
    const totalValuation = (masters.fg as any[]).reduce((sum: number, i: any) => sum + (parseFloat(i['Opening Balance (Rs.)']) || 0), 0);
    const taxableCount = (masters.fg as any[]).filter((i: any) => i['Is it Taxable?'] === 'Yes').length;
    return { totalValuation, taxableCount };
  }, [masters.fg]);

  return (
    <AppLayout>
      <PageHeader 
        title="FG & By-product Ledger" 
        subtitle="Current inventory status and financial position of processed goods."
        breadcrumbs={[{ label: 'Reports' }, { label: 'Inventory' }, { label: 'FG Stock' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="w-3.5 h-3.5 mr-2" /> Print
            </Button>
            <Button variant="primary" size="sm" onClick={() => exportToCSV(masters.fg as any[], 'FG_Stock_Report', {
              username: user?.Username,
              companyName: user?.Role === 'Admin' ? 'All Companies' : (user?.CompanyName || settings.companyName),
              contact: user?.ContactNo || settings.contactNo,
              date: new Date().toLocaleDateString()
            })}>
              <Download className="w-3.5 h-3.5 mr-2" /> Export
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           <Card className="bg-white border-l-4 border-l-emerald-500 shadow-sm">
             <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Taxable SKUs</p>
             <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold font-mono">{stats.taxableCount}</h4>
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
             </div>
           </Card>
           <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm">
             <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Total SKUs</p>
             <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold font-mono">{masters.fg.length}</h4>
                <TrendingUp className="h-4 w-4 text-blue-500" />
             </div>
           </Card>
           <Card className="bg-white border-l-4 border-l-[var(--color-accent)] shadow-sm">
             <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Inventory Value</p>
             <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold font-mono">Rs. {formatCurrency(stats.totalValuation)}</h4>
                <BarChart3 className="h-4 w-4 text-[var(--color-accent)]" />
             </div>
           </Card>
           <Card className="bg-[var(--color-success)] text-white border-0 shadow-lg shadow-green-100">
             <p className="text-[10px] font-bold text-green-100 uppercase tracking-wider mb-1">Overall Status</p>
             <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold font-mono">ACTIVE</h4>
                <Badge variant="No" className="bg-white/20 text-white border-0 text-[10px]">SYNCED</Badge>
             </div>
           </Card>
        </div>

        <DataTable 
          columns={columns} 
          data={masters.fg as any[]} 
          isLoading={isLoading}
          searchPlaceholder="Search finished products..."
        />
        
        <div className="p-4 bg-accent-light border border-accent/20 rounded-xl flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Factory className="h-4 w-4 text-[var(--color-accent)]" />
              <p className="text-[10px] text-[var(--color-accent)] font-bold uppercase tracking-wider">
                System tracks real-time stock after every production or sales entry.
              </p>
           </div>
        </div>
      </div>
    </AppLayout>
  );
}
