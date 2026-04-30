'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface MasterPageTemplateProps {
  title: string;
  description: string;
  columns: any[];
  data: any[];
  formComponent: React.ReactNode;
}

export const MasterPageTemplate = ({
  title,
  description,
  columns,
  data,
  formComponent
}: MasterPageTemplateProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tableColumns = [
    ...columns,
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right' as const,
      render: (item: any) => (
        <div className="flex items-center justify-end gap-2">
          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
            <Edit2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <AppLayout>
      <PageHeader 
        title={title} 
        description={description}
        action={
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add New
          </Button>
        }
      />

      <Table columns={tableColumns} data={data} />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Add New ${title.split(' ')[0]}`}
        size="lg"
      >
        {formComponent}
      </Modal>
    </AppLayout>
  );
};
