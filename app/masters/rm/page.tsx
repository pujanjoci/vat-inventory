'use client';

import React from 'react';
import { MasterPageTemplate } from '@/components/masters/MasterPageTemplate';
import { MasterForm } from '@/components/forms/MasterForm';
import { useAppContext } from '@/lib/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatQty } from '@/lib/format';
import { Package } from 'lucide-react';
import { postToGAS, ACTIONS } from '@/lib/api';

export default function RMMasterPage() {
  const { masters, settings, user, refreshMasters, showToast } = useAppContext();

  const handleAddMaster = async (data: any) => {
    if (!settings.appsScriptUrl) {
      showToast('Apps Script URL not configured', 'error');
      return;
    }
    
    try {
      const payload = {
        ...data,
        CompanyName: user?.CompanyName || settings.companyName,
      };
      await postToGAS(settings.appsScriptUrl, ACTIONS.SAVE_MASTER, payload, { sheetName: 'RM_Master', role: user?.Role || 'Company' });
      showToast('Raw material registered successfully', 'success');
      refreshMasters();
    } catch (error: any) {
      showToast(error.message || 'Failed to register raw material', 'error');
    }
  };

  const handleEditMaster = async (data: any, originalItem: any) => {
    if (!settings.appsScriptUrl) {
      showToast('Apps Script URL not configured', 'error');
      return;
    }
    
    try {
      const payload = {
        ...data,
        CompanyName: user?.CompanyName || settings.companyName,
        _matchKey: 'RM Product Name',
        _matchValue: originalItem['RM Product Name'],
        _companyName: user?.CompanyName || settings.companyName,
      };
      await postToGAS(settings.appsScriptUrl, ACTIONS.UPDATE_MASTER, payload, { sheetName: 'RM_Master', role: user?.Role || 'Company' });
      showToast('Raw material updated successfully', 'success');
      refreshMasters();
    } catch (error: any) {
      showToast(error.message || 'Failed to update raw material', 'error');
    }
  };

  const handleDelete = async (item: any) => {
    if (!settings.appsScriptUrl) {
      showToast('Apps Script URL not configured', 'error');
      return;
    }
    
    try {
      await postToGAS(settings.appsScriptUrl, ACTIONS.DELETE_MASTER, {
        _matchKey: 'RM Product Name',
        _matchValue: item['RM Product Name'],
        _companyName: user?.CompanyName || settings.companyName,
      }, { sheetName: 'RM_Master', role: user?.Role || 'Company' });
      showToast('Raw material deleted successfully', 'success');
      refreshMasters();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete raw material', 'error');
    }
  };

  const columns = [
    { 
      header: 'Material Name', 
      accessor: 'RM Product Name',
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center border border-blue-100">
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-[var(--color-text-primary)]">{item['RM Product Name']}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase tracking-tighter">{item['RM Product Code']}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Tax Status', 
      accessor: 'Is it Taxable?',
      render: (item: any) => (
        <Badge variant={item['Is it Taxable?'] === 'Yes' ? 'Taxable' : 'No'}>
          {item['Is it Taxable?'] === 'Yes' ? 'TAXABLE' : 'EXEMPT'}
        </Badge>
      )
    },
    { 
      header: 'Stock Details', 
      accessor: 'Opening Balance (Qty)',
      align: 'right' as const,
      render: (item: any) => (
        <div className="text-right">
          <p className="font-mono font-bold text-[var(--color-text-primary)]">{formatQty(item['Opening Balance (Qty)'])} {item.UOM}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Opening Qty</p>
        </div>
      )
    },
    { 
      header: 'Opening Value', 
      accessor: 'Opening Balance (Rs.)',
      align: 'right' as const,
      render: (item: any) => (
        <div className="text-right">
          <p className="font-mono font-bold text-[var(--color-text-primary)]">Rs. {formatCurrency(item['Opening Balance (Rs.)'])}</p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Valuation</p>
        </div>
      )
    },
  ];

  return (
    <MasterPageTemplate 
      title="Raw Material Registry"
      subtitle="Directory of raw inputs and initial stock positions."
      description="Define the base materials used in your production lines."
      columns={columns}
      data={masters.rm}
      formComponent={(onClose) => (
        <MasterForm 
          type="RM" 
          onSubmit={async (data) => {
            await handleAddMaster(data);
            onClose();
          }} 
          onCancel={onClose} 
        />
      )}
      editFormComponent={(item, onClose) => (
        <MasterForm 
          type="RM" 
          initialData={item}
          onSubmit={async (data) => {
            await handleEditMaster(data, item);
            onClose();
          }} 
          onCancel={onClose} 
        />
      )}
      onDelete={handleDelete}
    />
  );
}
