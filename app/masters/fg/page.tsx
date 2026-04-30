'use client';

import React from 'react';
import { MasterPageTemplate } from '@/components/masters/MasterPageTemplate';
import { MasterForm } from '@/components/forms/MasterForm';
import { useAppContext } from '@/lib/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatQty } from '@/lib/format';
import { Activity } from 'lucide-react';

export default function FGMasterPage() {
  const { masters } = useAppContext();

  const columns = [
    { 
      header: 'Product Name', 
      accessor: 'productName',
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-[var(--color-text-primary)]">{item.productName}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase tracking-tighter">{item.productCode}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Tax Status', 
      accessor: 'isTaxable',
      render: (item: any) => (
        <Badge variant={item.isTaxable === 'Yes' ? 'Taxable' : 'No'}>
          {item.isTaxable === 'Yes' ? 'TAXABLE' : 'EXEMPT'}
        </Badge>
      )
    },
    { 
      header: 'Stock Details', 
      accessor: 'openingQty',
      align: 'right' as const,
      render: (item: any) => (
        <div className="text-right">
          <p className="font-mono font-bold text-[var(--color-text-primary)]">{formatQty(item.openingQty)} {item.uom}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Opening Qty</p>
        </div>
      )
    },
    { 
      header: 'Opening Value', 
      accessor: 'openingAmount',
      align: 'right' as const,
      render: (item: any) => (
        <div className="text-right">
          <p className="font-mono font-bold text-[var(--color-text-primary)]">Rs. {formatCurrency(item.openingAmount)}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Valuation</p>
        </div>
      )
    },
  ];

  return (
    <MasterPageTemplate 
      title="Finished Goods Registry"
      subtitle="Processed output products and final stock positions."
      description="Manage the catalogue of oils and other processed goods."
      columns={columns}
      data={masters.fg}
      formComponent={
        <MasterForm 
          type="FG" 
          onSubmit={(data) => console.log(data)} 
          onCancel={() => {}} 
        />
      }
    />
  );
}
