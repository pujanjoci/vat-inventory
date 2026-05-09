'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  ShoppingCart, 
  TrendingUp, 
  CreditCard, 
  Package, 
  Layers,
  ArrowUpRight,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { useAppContext } from '@/lib/context/AppContext';
import { fetchFromGAS, ACTIONS } from '@/lib/api';
import { getFiscalYear } from '@/lib/calculations';

const performanceData = [
  { month: 'Shrawan', sales: 450000, purchases: 380000, margin: 15 },
  { month: 'Bhadra', sales: 520000, purchases: 410000, margin: 21 },
  { month: 'Ashwin', sales: 610000, purchases: 480000, margin: 27 },
  { month: 'Kartik', sales: 580000, purchases: 420000, margin: 28 },
  { month: 'Mangsir', sales: 630000, purchases: 510000, margin: 19 },
  { month: 'Poush', sales: 710000, purchases: 550000, margin: 22 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[var(--color-border)] rounded-xl p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">{entry.name}:</span>
            <span className="text-sm font-mono font-bold text-[var(--color-text-primary)]">
              {entry.name === 'Margin' ? `${entry.value}%` : `Rs. ${entry.value.toLocaleString()}`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { settings, user } = useAppContext();
  const [stats, setStats] = React.useState<any>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const loadStats = async () => {
      if (!settings.appsScriptUrl) return;
      try {
        const params = {
          role: user?.Role || 'Company',
          companyName: user?.Role === 'Admin' ? '' : (user?.CompanyName || settings.companyName || '')
        };
        const data = await fetchFromGAS(settings.appsScriptUrl, ACTIONS.GET_DASHBOARD_STATS, params);
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      }
    };
    loadStats();
  }, [settings.appsScriptUrl, user, settings.companyName]);

  const displayStats = stats || {
    totalPurchases: 0,
    totalSales: 0,
    inputVat: 0,
    outputVat: 0,
    vatPayable: 0,
    inventoryValue: 0
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Business Overview" 
        subtitle="Real-time performance metrics and inventory status"
        breadcrumbs={[{ label: 'Overview' }, { label: 'Dashboard' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-3.5 h-3.5 mr-2" />
              FY {getFiscalYear()}
            </Button>
            <Button variant="primary" size="sm">
              <Download className="w-3.5 h-3.5 mr-2" />
              Export Report
            </Button>
          </div>
        }
      />

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Main Performance Chart - spans 8 cols */}
        <div className="lg:col-span-8">
          <Card title="Revenue & Expenditure Trends" className="h-full">
            <div className="h-[350px] w-full mt-4">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }} 
                    tickFormatter={(val) => `Rs.${val/1000}k`} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    name="Gross Sales" 
                    stroke="var(--color-accent)" 
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                    strokeWidth={3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="purchases" 
                    name="Purchases" 
                    stroke="#94a3b8" 
                    fillOpacity={0} 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* VAT Status Sidebar - spans 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card title="VAT Status" className="h-full flex flex-col">
            <div className="flex-1 flex flex-col justify-center py-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Current Liability</p>
                  <p className="text-3xl font-display font-bold text-[var(--color-danger)] leading-none">Rs. {formatCurrency(displayStats.vatPayable)}</p>
                </div>
                <Badge variant="PRELIMINARY">FY {getFiscalYear()}</Badge>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" /> Output VAT
                  </span>
                  <span className="font-mono font-semibold">Rs. {formatCurrency(displayStats.outputVat)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-400" /> Input VAT
                  </span>
                  <span className="font-mono font-semibold">Rs. {formatCurrency(displayStats.inputVat)}</span>
                </div>
                <div className="h-px bg-[var(--color-border)] my-2" />
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-[var(--color-text-primary)]">Net Payable</span>
                  <span className="font-mono text-[var(--color-danger)]">Rs. {formatCurrency(displayStats.vatPayable)}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">View VAT Summary</Button>
          </Card>
        </div>

        {/* 4 KPI Cards - each spans 3 cols in desktop */}
        <div className="lg:col-span-3">
          <MetricCard 
            title="Inventory Value" 
            value={formatCurrency(displayStats.inventoryValue)}
            icon={Package}
            trend={0}
          />
        </div>
        <div className="lg:col-span-3">
          <MetricCard 
            title="Total Sales" 
            value={formatCurrency(displayStats.totalSales)}
            icon={ArrowUpRight}
            trend={0}
          />
        </div>
        <div className="lg:col-span-3">
          <MetricCard 
            title="Total Purchases" 
            value={formatCurrency(displayStats.totalPurchases)}
            icon={ShoppingCart}
            trend={0}
          />
        </div>
        <div className="lg:col-span-3">
          <MetricCard 
            title="VAT Position" 
            value={formatCurrency(displayStats.vatPayable)}
            icon={CreditCard}
            trend={0}
          />
        </div>

        {/* Row 3 - Recent Transactions & Activity */}
        <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Recent Sales Transactions" headerAction={<Button variant="ghost" size="sm">View All</Button>}>
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
                    <th className="text-left px-6 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Bill No</th>
                    <th className="text-left px-6 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Customer</th>
                    <th className="text-right px-6 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Amount</th>
                    <th className="text-center px-6 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {[
                    { id: 'SL-001', name: 'Global Traders', amount: 45600, status: 'Yes' },
                    { id: 'SL-002', name: 'Everest Oil', amount: 128400, status: 'Yes' },
                    { id: 'SL-003', name: 'Annapurna Store', amount: 32100, status: 'No' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-[var(--color-surface-raised)] transition-colors">
                      <td className="px-6 py-4 font-medium text-[var(--color-text-primary)]">{row.id}</td>
                      <td className="px-6 py-4 text-[var(--color-text-secondary)]">{row.name}</td>
                      <td className="px-6 py-4 text-right font-mono tabular-nums">Rs. {formatCurrency(row.amount)}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={row.status === 'Yes' ? 'Taxable' : 'No'}>{row.status === 'Yes' ? 'Taxable' : 'Exempt'}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Production Output summary">
             <div className="space-y-6">
               <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">Mustard Oil</span>
                    <span className="text-sm font-bold">12,450 Ltrs</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-[var(--color-accent)] h-full rounded-full" style={{ width: '75%' }} />
                  </div>
               </div>
               <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">Refined Oil</span>
                    <span className="text-sm font-bold">8,200 Ltrs</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '60%' }} />
                  </div>
               </div>
               <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">By-products (Cake)</span>
                    <span className="text-sm font-bold">4,120 KG</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }} />
                  </div>
               </div>
             </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
