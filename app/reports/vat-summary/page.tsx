'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Download, Filter, Calculator, Printer, Info, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { useAppContext } from '@/lib/context/AppContext';
import { fetchFromGAS, ACTIONS } from '@/lib/api';
import { exportToCSV } from '@/lib/export';

export default function VATSummaryPage() {
  const { settings, user } = useAppContext();
  const [dateRange, setDateRange] = useState({ 
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
    to: new Date().toISOString().split('T')[0] 
  });
  const [loading, setLoading] = useState(false);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);

  const loadData = async () => {
    if (!settings.appsScriptUrl) return;
    setLoading(true);
    try {
      const params = {
        role: user?.Role || 'Company',
        companyName: user?.Role === 'Admin' ? '' : (user?.CompanyName || settings.companyName || '')
      };
      const [pData, sData] = await Promise.all([
        fetchFromGAS(settings.appsScriptUrl, ACTIONS.GET_PURCHASE_BOOK, params),
        fetchFromGAS(settings.appsScriptUrl, ACTIONS.GET_SALES_BOOK, params)
      ]);
      setPurchases(pData || []);
      setSales(sData || []);
    } catch (err) {
      console.error('Failed to load VAT data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [settings.appsScriptUrl, user]);

  const columns: any[] = [
    { 
      header: 'Taxable Party', 
      accessor: 'name',
      render: (i: any) => <span className="font-medium text-[var(--color-text-primary)]">{i['Vendor Name'] || i['Customer Name']}</span>
    },
    { 
      header: 'Taxable Value', 
      accessor: 'Taxable Amt', 
      align: 'right' as const, 
      render: (i: any) => <span className="font-mono">Rs. {formatCurrency(i['Taxable Amt'])}</span> 
    },
    { 
      header: 'VAT (13%)', 
      accessor: 'VAT Amt', 
      align: 'right' as const, 
      render: (i: any) => <span className="font-mono font-bold text-[var(--color-text-primary)]">Rs. {formatCurrency(i['VAT Amt'])}</span> 
    },
    { 
      header: 'Total Value', 
      accessor: 'Total Amt', 
      align: 'right' as const, 
      render: (i: any) => <span className="font-mono text-[var(--color-text-muted)]">Rs. {formatCurrency(i['Total Amt'])}</span> 
    },
  ];

  const totals = useMemo(() => {
    const inputVat = purchases.reduce((sum, p) => sum + (parseFloat(p['VAT Amt'] as any) || 0), 0);
    const outputVat = sales.reduce((sum, s) => sum + (parseFloat(s['VAT Amt'] as any) || 0), 0);
    return {
      inputVat,
      outputVat,
      netPayable: outputVat - inputVat
    };
  }, [purchases, sales]);

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
            <Button variant="primary" size="sm" onClick={() => exportToCSV([...purchases, ...sales], 'VAT_Transactions_Summary', {
              username: user?.Username,
              companyName: user?.Role === 'Admin' ? 'All Companies' : (user?.CompanyName || settings.companyName),
              contact: user?.ContactNo || settings.contactNo,
              date: new Date().toLocaleDateString()
            })}>
              <Download className="w-3.5 h-3.5 mr-2" /> Export CSV
            </Button>
          </div>
        }
      />

      <div className="space-y-8">
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
            <Button variant="primary" className="h-11 px-8 shadow-md" onClick={loadData} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Filter className="w-4 h-4 mr-2" />} 
              Refresh Data
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-text-secondary)] flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">IN</div>
                Purchase VAT (Input Credit)
              </h3>
              <Badge variant="Vendor">PERIOD TOTAL</Badge>
            </div>
            <DataTable columns={columns} data={purchases} isLoading={loading} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-text-secondary)] flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">OUT</div>
                Sales VAT (Output Liability)
              </h3>
              <Badge variant="Taxable">PERIOD TOTAL</Badge>
            </div>
            <DataTable columns={columns} data={sales} isLoading={loading} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-12">
             <Card title="Tax Liability Statement" className="bg-[var(--color-surface-raised)] border-2 border-[var(--color-border-strong)]">
                <div className="p-4 md:p-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                      <div className="space-y-5">
                        <div className="flex justify-between items-center group">
                          <span className="text-[var(--color-text-secondary)] text-sm">Total Input Tax Credit</span>
                          <span className="font-mono font-bold text-blue-600 text-lg">Rs. {formatCurrency(totals.inputVat)}</span>
                        </div>
                        <div className="flex justify-between items-center group">
                          <span className="text-[var(--color-text-secondary)] text-sm">Total Output Tax Payable</span>
                          <span className="font-mono font-bold text-emerald-600 text-lg">Rs. {formatCurrency(totals.outputVat)}</span>
                        </div>
                        <div className="h-px bg-[var(--color-border-strong)] my-2" />
                        <div className="flex justify-between items-center group">
                          <span className="text-[var(--color-text-primary)] font-bold">Net Difference</span>
                          <span className={`font-mono font-bold text-xl ${totals.netPayable >= 0 ? 'text-[var(--color-danger)]' : 'text-emerald-600'}`}>
                            Rs. {formatCurrency(Math.abs(totals.netPayable))} {totals.netPayable >= 0 ? '(Payable)' : '(Credit)'}
                          </span>
                        </div>
                      </div>

                      <div className="relative p-8 bg-white rounded-2xl border border-[var(--color-border)] shadow-xl text-center overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${totals.netPayable >= 0 ? 'bg-[var(--color-danger)]' : 'bg-emerald-500'}`} />
                        <Calculator className={`w-10 h-10 ${totals.netPayable >= 0 ? 'text-[var(--color-danger)]' : 'text-emerald-500'} opacity-20 absolute -top-2 -right-2`} />
                        
                        <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-[0.2em] mb-2">Government Dues</p>
                        <h3 className="text-4xl font-display font-bold text-[var(--color-text-primary)] tracking-tight">Rs. {formatCurrency(Math.max(0, totals.netPayable))}</h3>
                        
                        <div className="mt-6 flex items-center justify-center gap-2">
                           <Badge variant={totals.netPayable >= 0 ? 'No' : 'success'}>
                             {totals.netPayable >= 0 ? 'PAYABLE' : 'CREDIT C/F'}
                           </Badge>
                           <p className="text-[11px] text-[var(--color-text-secondary)] font-medium">As of {dateRange.to}</p>
                        </div>
                      </div>
                   </div>
                </div>
                
                <div className="p-4 bg-white/50 border-t border-[var(--color-border)] flex items-center gap-3">
                   <Info className="h-4 w-4 text-blue-500" />
                   <p className="text-[10px] text-[var(--color-text-secondary)] font-medium">
                     This report is generated based on posted journals in the system. Ensure all transactions are finalized before filing.
                   </p>
                </div>
             </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
