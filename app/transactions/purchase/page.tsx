'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { PurchaseForm } from '@/components/forms/PurchaseForm';

export default function PurchaseEntryPage() {
  return (
    <AppLayout>
      <PageHeader 
        title="Purchase Entry" 
        description="Record raw material and asset purchases into your books."
      />
      <PurchaseForm />
    </AppLayout>
  );
}
