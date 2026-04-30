'use client';

import React from 'react';
import { MasterPageTemplate } from '@/components/masters/MasterPageTemplate';
import { MasterForm } from '@/components/forms/MasterForm';
import { useApp } from '@/lib/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { formatAmount } from '@/lib/calculations';

export default function BPMasterPage() {
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
      title="Byproduct Master"
      description="Manage byproducts like oil cake (Pina) and their stock levels."
      columns={columns}
      data={masters.bp}
      formComponent={
        <MasterForm 
          type="BP" 
          onSubmit={(data) => console.log(data)} 
          onCancel={() => {}} 
        />
      }
    />
  );
}
