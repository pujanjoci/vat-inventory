'use client';

import React from 'react';
import { MasterPageTemplate } from '@/components/masters/MasterPageTemplate';
import { MasterForm } from '@/components/forms/MasterForm';
import { useAppContext } from '@/lib/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { User, Phone, Mail } from 'lucide-react';
import { postToGAS, ACTIONS } from '@/lib/api';

export default function PartyMasterPage() {
  const { masters, settings, user, refreshMasters, showToast } = useAppContext();

  const handleAddMaster = async (data: any) => {
    if (!settings.appsScriptUrl) { showToast('Apps Script URL not configured', 'error'); return; }
    try {
      const payload = { ...data, CompanyName: user?.CompanyName || settings.companyName };
      await postToGAS(settings.appsScriptUrl, ACTIONS.SAVE_MASTER, payload, { sheetName: 'BP_Master', role: user?.Role || 'Company' });
      showToast('Party registered successfully', 'success');
      refreshMasters();
    } catch (error: any) {
      showToast(error.message || 'Failed to register party', 'error');
    }
  };

  const handleEditMaster = async (data: any, originalItem: any) => {
    if (!settings.appsScriptUrl) return;
    try {
      const payload = {
        ...data,
        CompanyName: user?.CompanyName || settings.companyName,
        _matchKey: 'BPName',
        _matchValue: originalItem.BPName,
        _companyName: user?.CompanyName || settings.companyName,
      };
      await postToGAS(settings.appsScriptUrl, ACTIONS.UPDATE_MASTER, payload, { sheetName: 'BP_Master', role: user?.Role || 'Company' });
      showToast('Party updated successfully', 'success');
      refreshMasters();
    } catch (error: any) {
      showToast(error.message || 'Failed to update party', 'error');
    }
  };

  const handleDelete = async (item: any) => {
    if (!settings.appsScriptUrl) return;
    try {
      await postToGAS(settings.appsScriptUrl, ACTIONS.DELETE_MASTER, {
        _matchKey: 'BPName',
        _matchValue: item.BPName,
        _companyName: user?.CompanyName || settings.companyName,
      }, { sheetName: 'BP_Master', role: user?.Role || 'Company' });
      showToast('Party deleted successfully', 'success');
      refreshMasters();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete party', 'error');
    }
  };

  const columns = [
    { 
      header: 'Entity Name', 
      accessor: 'BPName',
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-surface-raised)] flex items-center justify-center border border-[var(--color-border)]">
            <User className="h-4 w-4 text-[var(--color-text-secondary)]" />
          </div>
          <div>
            <p className="font-bold text-[var(--color-text-primary)]">{item.BPName}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase">ID: {item.BPCode}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Relationship', 
      accessor: 'Type',
      render: (item: any) => (
        <Badge variant={item.Type === 'Vendor' ? 'Vendor' : 'Taxable'}>
          {item.Type?.toUpperCase() || 'UNKNOWN'}
        </Badge>
      )
    },
    { 
      header: 'Contact Information', 
      accessor: 'Phone',
      render: (item: any) => (
        <div className="space-y-0.5">
          <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-[var(--color-text-muted)]" /> {item.Phone || 'N/A'}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1.5">
            <Mail className="h-3 w-3" /> {item.Email || 'N/A'}
          </p>
        </div>
      )
    },
    { 
      header: 'Address', 
      accessor: 'Address',
      render: (item: any) => (
        <span className="text-xs text-[var(--color-text-secondary)]">
          {item.Address || '—'}
        </span>
      )
    },
  ];

  return (
    <MasterPageTemplate 
      title="Party Master"
      subtitle="Comprehensive directory of registered customers and vendors."
      description="Manage all your business entities and their tax registration details in one place."
      columns={columns}
      data={masters.parties}
      formComponent={(onClose) => <MasterForm type="Party" onSubmit={async (data) => { await handleAddMaster(data); onClose(); }} onCancel={onClose} />}
      editFormComponent={(item, onClose) => (
        <MasterForm 
          type="Party" 
          initialData={item}
          onSubmit={async (data) => { await handleEditMaster(data, item); onClose(); }} 
          onCancel={onClose} 
        />
      )}
      onDelete={handleDelete}
    />
  );
}
