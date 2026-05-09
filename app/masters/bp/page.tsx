'use client';

import React from 'react';
import { MasterPageTemplate } from '@/components/masters/MasterPageTemplate';
import { MasterForm } from '@/components/forms/MasterForm';
import { useAppContext } from '@/lib/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatQty } from '@/lib/format';
import { Zap } from 'lucide-react';
import { postToGAS, ACTIONS } from '@/lib/api';

export default function BPMasterPage() {
  const { masters, settings, user, refreshMasters, showToast } = useAppContext();

  const handleAddMaster = async (data: any) => {
    if (!settings.appsScriptUrl) { showToast('Apps Script URL not configured', 'error'); return; }
    try {
      const payload = { ...data, CompanyName: user?.CompanyName || settings.companyName };
      await postToGAS(settings.appsScriptUrl, ACTIONS.SAVE_MASTER, payload, { sheetName: 'ByProduct_Master', role: user?.Role || 'Company' });
      showToast('By-product registered successfully', 'success');
      refreshMasters();
    } catch (error: any) {
      showToast(error.message || 'Failed to register by-product', 'error');
    }
  };

  const handleEditMaster = async (data: any, originalItem: any) => {
    if (!settings.appsScriptUrl) return;
    try {
      const payload = {
        ...data,
        CompanyName: user?.CompanyName || settings.companyName,
        _matchKey: 'ByProduct Name',
        _matchValue: originalItem['ByProduct Name'],
        _companyName: user?.CompanyName || settings.companyName,
      };
      await postToGAS(settings.appsScriptUrl, ACTIONS.UPDATE_MASTER, payload, { sheetName: 'ByProduct_Master', role: user?.Role || 'Company' });
      showToast('By-product updated successfully', 'success');
      refreshMasters();
    } catch (error: any) {
      showToast(error.message || 'Failed to update by-product', 'error');
    }
  };

  const handleDelete = async (item: any) => {
    if (!settings.appsScriptUrl) return;
    try {
      await postToGAS(settings.appsScriptUrl, ACTIONS.DELETE_MASTER, {
        _matchKey: 'ByProduct Name',
        _matchValue: item['ByProduct Name'],
        _companyName: user?.CompanyName || settings.companyName,
      }, { sheetName: 'ByProduct_Master', role: user?.Role || 'Company' });
      showToast('By-product deleted successfully', 'success');
      refreshMasters();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete by-product', 'error');
    }
  };

  const columns = [
    { 
      header: 'By-Product Name', 
      accessor: 'ByProduct Name',
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center border border-amber-100">
            <Zap className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-[var(--color-text-primary)]">{item['ByProduct Name']}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase tracking-tighter">{item['ByProduct Code']}</p>
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
          <p className="font-mono font-bold text-[var(--color-text-primary)]">{formatQty(item['Opening Balance (Qty)'])} {item['UOM']}</p>
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
      title="By-Products Registry"
      subtitle="Recovered outputs and residual stock positions."
      description="Manage secondary products like oil cake and husks."
      columns={columns}
      data={masters.bp}
      formComponent={(onClose) => <MasterForm type="BP" onSubmit={async (data) => { await handleAddMaster(data); onClose(); }} onCancel={onClose} />}
      editFormComponent={(item, onClose) => (
        <MasterForm 
          type="BP" 
          initialData={item}
          onSubmit={async (data) => { await handleEditMaster(data, item); onClose(); }} 
          onCancel={onClose} 
        />
      )}
      onDelete={handleDelete}
    />
  );
}
