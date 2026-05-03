'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { SalesForm } from '@/components/forms/SalesForm';

export default function SalesEntryPage() {
  return (
    <AppLayout>
      <PageHeader 
        title="Sales Entry" 
        subtitle="Issue tax invoices and record sales of finished goods and byproducts."
      />
      <SalesForm />
    </AppLayout>
  );
}
