'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Plus, Edit2, Trash2, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { exportToCSV } from '@/lib/export';
import { MetricCard } from '@/components/ui/MetricCard';
import { useAppContext } from '@/lib/context/AppContext';

interface MasterPageTemplateProps {
  title: string;
  subtitle?: string;
  description?: string;
  columns: any[];
  data: any[];
  formComponent: React.ReactNode | ((onClose: () => void) => React.ReactNode);
  editFormComponent?: (item: any, onClose: () => void) => React.ReactNode;
  onDelete?: (item: any) => Promise<void>;
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
  editFormComponent,
  onDelete,
  stats
}: MasterPageTemplateProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user, settings } = useAppContext();

  const handleDelete = async () => {
    if (!deleteItem || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteItem);
    } finally {
      setIsDeleting(false);
      setDeleteItem(null);
    }
  };

  // Get a display name for the item being deleted
  const getItemDisplayName = (item: any) => {
    return item?.['RM Product Name'] 
      || item?.['FG Product Name'] 
      || item?.['ByProduct Name']
      || item?.['BPName']
      || item?.['GL Asset Name']
      || item?.['Name']
      || 'this entry';
  };

  // Enhancement: Inject Actions column automatically with premium styling
  const tableColumns = [
    ...columns,
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right' as const,
      render: (item: any) => (
        <div className="flex items-center justify-end gap-1">
          {editFormComponent && (
            <button 
              onClick={() => setEditItem(item)}
              className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] rounded-lg transition-all" 
              title="Edit entry"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => setDeleteItem(item)}
              className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-rose-50 rounded-lg transition-all" 
              title="Delete entry"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
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
            <Button variant="outline" size="sm" onClick={() => {
              exportToCSV(data, `${title}_Export`, {
                username: user?.Username,
                companyName: user?.Role === 'Admin' ? 'All Companies' : (user?.CompanyName || settings?.companyName),
                contact: user?.ContactNo || settings?.contactNo,
                date: new Date().toLocaleDateString()
              });
            }}>
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

      {/* Add Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Register New ${mainTitle}`}
        size="lg"
      >
        <div className="py-2">
          {typeof formComponent === 'function' ? formComponent(() => setIsModalOpen(false)) : formComponent}
        </div>
      </Modal>

      {/* Edit Modal */}
      {editFormComponent && (
        <Modal 
          isOpen={!!editItem} 
          onClose={() => setEditItem(null)} 
          title={`Edit ${mainTitle}`}
          size="lg"
        >
          <div className="py-2">
            {editItem && editFormComponent(editItem, () => setEditItem(null))}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={!!deleteItem} 
        onClose={() => setDeleteItem(null)} 
        title="Confirm Deletion"
        size="sm"
      >
        <div className="py-4 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-[var(--color-danger)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                Delete &ldquo;{getItemDisplayName(deleteItem)}&rdquo;?
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                This action cannot be undone. The entry will be permanently removed from the registry and the connected Google Sheet.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <Button variant="ghost" onClick={() => setDeleteItem(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="!bg-[var(--color-danger)] hover:!bg-rose-700 shadow-lg"
            >
              {isDeleting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>
              ) : 'Delete Permanently'}
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};
