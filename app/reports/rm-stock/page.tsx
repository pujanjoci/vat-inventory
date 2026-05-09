'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Download, Filter, Package, TrendingUp, Archive, Printer, Info } from 'lucide-react';
import { formatCurrency, formatQty } from '@/lib/format';
import { exportToCSV } from '@/lib/export';
import { useAppContext } from '@/lib/context/AppContext';

export default function RMStockReportPage() {
  const { masters, isLoading, user, settings } = useAppContext();
  const [dateRange, setDateRange] = useState({ 
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
    to: new Date().toISOString().split('T')[0] 
  });

  const columns: any[] = [
    { 
      header: 'Raw Material', 
      accessor: 'productName',
      render: (i: any) => (
        <div>
          <p className="font-bold text-[var(--color-text-primary)]">{i['RM Product Name']}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase">{i['RM Product Code']}</p>
        </div>
      )
    },
    { 
      header: 'Current Stock', 
      accessor: 'openingQty', 
      align: 'right' as const,
      render: (i: any) => <span className="font-mono font-bold text-[var(--color-text-primary)]">{formatQty(i['Opening Balance (Qty)'])} {i.UOM}</span>
    },
    { 
      header: 'Unit Rate (Avg)', 
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
      header: 'Valuation', 
      accessor: 'openingAmount', 
      align: 'right' as const, 
      render: (i: any) => <span className="font-mono font-bold text-[var(--color-accent)]">Rs. {formatCurrency(i['Opening Balance (Rs.)'])}</span> 
    },
  ];

  const stats = useMemo(() => {
    const totalUnits = (masters.rm as any[]).reduce((sum: number, i: any) => sum + (parseFloat(i['Opening Balance (Qty)']) || 0), 0);
    const totalValuation = (masters.rm as any[]).reduce((sum: number, i: any) => sum + (parseFloat(i['Opening Balance (Rs.)']) || 0), 0);
    return { totalUnits, totalValuation };
  }, [masters.rm]);

  return (
    <AppLayout>
      <PageHeader 
        title="Raw Material Inventory" 
        subtitle="Current stock levels and valuation based on latest transactions."
        breadcrumbs={[{ label: 'Reports' }, { label: 'Inventory' }, { label: 'RM Stock' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="w-3.5 h-3.5 mr-2" /> Print
            </Button>
            <Button variant="primary" size="sm" onClick={() => exportToCSV(masters.rm as any[], 'RM_Stock_Report', {
              username: user?.Username,
              companyName: user?.Role === 'Admin' ? 'All Companies' : (user?.CompanyName || settings.companyName),
              contact: user?.ContactNo || settings.contactNo,
              date: new Date().toLocaleDateString()
            })}>
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
                <p className="text-xl font-bold font-mono">{formatQty(stats.totalUnits)} <span className="text-xs font-normal">UNIT</span></p>
              </div>
            </div>
          </Card>
          <Card className="bg-white">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Unique Items</p>
                <p className="text-xl font-bold font-mono text-emerald-600">{masters.rm.length}</p>
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
                <p className="text-xl font-bold font-mono">Rs. {formatCurrency(stats.totalValuation)}</p>
              </div>
            </div>
          </Card>
        </div>

        <DataTable 
          columns={columns} 
          data={masters.rm as any[]} 
          isLoading={isLoading}
          searchPlaceholder="Search materials..."
        />
        
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <p className="text-[10px] text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">
                Note: Valuation is calculated based on Weighted Average Costing (WAC) recorded in master balance.
              </p>
           </div>
        </div>
      </div>
    </AppLayout>
  );
}
