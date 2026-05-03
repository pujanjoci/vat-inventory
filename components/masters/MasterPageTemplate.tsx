'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, Search, Filter, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';

import { MetricCard } from '@/components/ui/MetricCard';

interface MasterPageTemplateProps {
  title: string;
  subtitle?: string;
  description?: string;
  columns: any[];
  data: any[];
  formComponent: React.ReactNode;
  stats?: {
    label: string;
    value: string;
    icon: any;
    trend?: number;
  }[];
}

export const MasterPageTemplate = ({
  title,
  subtitle,
  description,
  columns,
  data,
  formComponent,
  stats
}: MasterPageTemplateProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Enhancement: Inject Actions column automatically with premium styling
  const tableColumns = [
    ...columns,
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right' as const,
      render: (item: any) => (
        <div className="flex items-center justify-end gap-1">
          <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] rounded-lg transition-all" title="Edit entry">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-rose-50 rounded-lg transition-all" title="Delete entry">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  const mainTitle = title.split(' ')[0];

  return (
    <AppLayout>
      <PageHeader 
        title={title} 
        subtitle={subtitle || description}
        breadcrumbs={[{ label: 'Masters' }, { label: title }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-3.5 h-3.5 mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="shadow-lg" size="sm">
              <Plus className="w-4 h-4 mr-2" /> 
              Add {mainTitle}
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <MetricCard 
                key={i}
                title={s.label}
                value={s.value}
                icon={s.icon}
                trend={s.trend}
              />
            ))}
          </div>
        )}
        <DataTable 
          columns={tableColumns} 
          data={data} 
          searchPlaceholder={`Search ${title.toLowerCase()}...`}
        />
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Register New ${mainTitle}`}
        size="lg"
      >
        <div className="py-2">
          {formComponent}
        </div>
      </Modal>
    </AppLayout>
  );
};
