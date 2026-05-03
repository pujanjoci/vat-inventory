'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductionForm } from '@/components/forms/ProductionForm';

export default function ProductionEntryPage() {
  return (
    <AppLayout>
      <PageHeader 
        title="Production Journal" 
        subtitle="Record oil milling batches, consumption of raw materials, and output of finished goods."
      />
      <ProductionForm />
    </AppLayout>
  );
}
