'use client';

import React from 'react';
import { MasterPageTemplate } from '@/components/masters/MasterPageTemplate';
import { MasterForm } from '@/components/forms/MasterForm';
import { useApp } from '@/lib/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { formatAmount } from '@/lib/calculations';

export default function FGMasterPage() {
  const { masters } = useApp();

  const columns = [
    { header: 'Product Name', accessor: 'productName' },
    { header: 'Code', accessor: 'productCode' },
    { 
      header: 'Taxable', 
      accessor: 'isTaxable',
      render: (item: any) => (
        <Badge variant={item.isTaxable === 'Yes' ? 'brand' : 'neutral'}>
          {item.isTaxable}
        </Badge>
      )
    },
    { header: 'UOM', accessor: 'uom' },
    { 
      header: 'Opening Qty', 
      accessor: 'openingQty',
      align: 'right' as const,
      render: (item: any) => item.openingQty.toLocaleString()
    },
    { 
      header: 'Opening Amt', 
      accessor: 'openingAmount',
      align: 'right' as const,
      render: (item: any) => `Rs. ${formatAmount(item.openingAmount)}`
    },
  ];

  return (
    <MasterPageTemplate 
      title="Finished Goods Master"
      description="Manage your processed oil products and their variations."
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
