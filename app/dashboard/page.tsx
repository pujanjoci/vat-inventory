'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { 
  ShoppingCart, 
  TrendingUp, 
  CreditCard, 
  Package, 
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { formatAmount } from '@/lib/calculations';

const salesData = [
  { month: 'Shrawan', sales: 450000, purchases: 380000 },
  { month: 'Bhadra', sales: 520000, purchases: 410000 },
  { month: 'Ashwin', sales: 610000, purchases: 480000 },
  { month: 'Kartik', sales: 580000, purchases: 420000 },
  { month: 'Mangsir', sales: 630000, purchases: 510000 },
  { month: 'Poush', sales: 710000, purchases: 550000 },
];

const productionData = [
  { month: 'Shrawan', ltrs: 12000 },
  { month: 'Bhadra', ltrs: 15000 },
  { month: 'Ashwin', ltrs: 18500 },
  { month: 'Kartik', ltrs: 16000 },
  { month: 'Mangsir', ltrs: 21000 },
  { month: 'Poush', ltrs: 24000 },
];

export default function DashboardPage() {
  return (
    <AppLayout>
      <PageHeader 
        title="Welcome Back, Admin" 
        description="Here is what is happening at Ganesh Tel Mill today."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Total Purchases" 
          value={`Rs. ${formatAmount(2456780)}`}
          icon={<ShoppingCart className="w-6 h-6" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        <MetricCard 
          title="Total Sales" 
          value={`Rs. ${formatAmount(3120450)}`}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={{ value: 8.2, isPositive: true }}
          color="emerald"
        />
        <MetricCard 
          title="VAT Dues" 
          value={`Rs. ${formatAmount(86250)}`}
          icon={<CreditCard className="w-6 h-6" />}
          color="rose"
        />
        <MetricCard 
          title="RM Stock Value" 
          value={`Rs. ${formatAmount(1240500)}`}
          icon={<Package className="w-6 h-6" />}
          color="amber"
        />
        <MetricCard 
          title="FG Stock Value" 
          value={`Rs. ${formatAmount(850600)}`}
          icon={<Layers className="w-6 h-6" />}
          color="indigo"
        />
        <MetricCard 
          title="Gross Profit" 
          value={`Rs. ${formatAmount(663670)}`}
          icon={<ArrowUpRight className="w-6 h-6" />}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Monthly Sales vs Purchases">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `Rs.${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="sales" name="Sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchases" name="Purchases" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Production Output (Ltrs)">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="ltrs" name="Output (Ltrs)" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
