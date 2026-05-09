'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppContext } from '@/lib/context/AppContext';
import { postToGAS, ACTIONS } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import { exportToCSV } from '@/lib/export';
import { 
  Plus, Download, ArrowUpRight, ArrowDownRight, 
  Wallet, AlertTriangle, CheckCircle, Clock, Edit2, Trash2,
  User, Loader2, DollarSign, CalendarClock 
} from 'lucide-react';

export default function ARAPPage() {
  const { masters, settings, user, refreshMasters, showToast } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    BPCode: '',
    Name: '',
    Type: 'Receivable',
    Balance: '0',
    'Due Date': new Date().toISOString().split('T')[0],
    'Last Payment': '',
    Status: 'Outstanding',
  });

  const resetForm = () => {
    setFormData({
      BPCode: '',
      Name: '',
      Type: 'Receivable',
      Balance: '0',
      'Due Date': new Date().toISOString().split('T')[0],
      'Last Payment': '',
      Status: 'Outstanding',
    });
  };

  const openEditModal = (item: any) => {
    setFormData({
      BPCode: item.BPCode || '',
      Name: item.Name || '',
      Type: item.Type || 'Receivable',
      Balance: String(item.Balance || '0'),
      'Due Date': item['Due Date'] || new Date().toISOString().split('T')[0],
      'Last Payment': item['Last Payment'] || '',
      Status: item.Status || 'Outstanding',
    });
    setEditItem(item);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.appsScriptUrl) {
      showToast('Apps Script URL not configured', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        ...formData,
        CompanyName: user?.CompanyName || settings.companyName,
        Balance: parseFloat(formData.Balance),
      };

      if (editItem) {
        // Update mode
        payload._matchKey = 'Name';
        payload._matchValue = editItem.Name;
        payload._companyName = user?.CompanyName || settings.companyName;
        await postToGAS(settings.appsScriptUrl, ACTIONS.UPDATE_MASTER, payload, { 
          sheetName: 'AR_AP', 
          role: user?.Role || 'Company' 
        });
        showToast('AR/AP entry updated successfully', 'success');
        setEditItem(null);
      } else {
        // Create mode
        await postToGAS(settings.appsScriptUrl, ACTIONS.SAVE_MASTER, payload, { 
          sheetName: 'AR_AP', 
          role: user?.Role || 'Company' 
        });
        showToast('AR/AP entry created successfully', 'success');
        setIsModalOpen(false);
      }
      resetForm();
      refreshMasters();
    } catch (error: any) {
      showToast(error.message || 'Failed to save entry', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkSettled = async (item: any) => {
    if (!settings.appsScriptUrl) return;
    setIsSubmitting(true);
    try {
      const payload: any = {
        ...item,
        Status: 'Settled',
        'Last Payment': new Date().toISOString().split('T')[0],
        _matchKey: 'Name',
        _matchValue: item.Name,
        _companyName: user?.CompanyName || settings.companyName,
      };
      await postToGAS(settings.appsScriptUrl, ACTIONS.UPDATE_MASTER, payload, { 
        sheetName: 'AR_AP', 
        role: user?.Role || 'Company' 
      });
      showToast(`"${item.Name}" marked as settled`, 'success');
      refreshMasters();
    } catch (error: any) {
      showToast(error.message || 'Failed to update status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem || !settings.appsScriptUrl) return;
    setIsDeleting(true);
    try {
      await postToGAS(settings.appsScriptUrl, ACTIONS.DELETE_MASTER, {
        _matchKey: 'Name',
        _matchValue: deleteItem.Name,
        _companyName: user?.CompanyName || settings.companyName,
      }, { sheetName: 'AR_AP', role: user?.Role || 'Company' });
      showToast('AR/AP entry deleted successfully', 'success');
      refreshMasters();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete entry', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteItem(null);
    }
  };

  // Pre-populate from party master
  const partyOptions = (masters.parties as any[]).map((p: any) => ({
    label: `${p.BPName || p.bpName} (${p.BPCode || p.bpCode})`,
    value: p.BPName || p.bpName || '',
  }));

  const stats = useMemo(() => {
    const data = masters.arap || [];
    const totalReceivable = data
      .filter((d: any) => d.Type === 'Receivable')
      .reduce((sum: number, d: any) => sum + (parseFloat(d.Balance) || 0), 0);
    const totalPayable = data
      .filter((d: any) => d.Type === 'Payable')
      .reduce((sum: number, d: any) => sum + (parseFloat(d.Balance) || 0), 0);
    const overdueCount = data.filter((d: any) => d.Status === 'Overdue').length;
    return { totalReceivable, totalPayable, netPosition: totalReceivable - totalPayable, overdueCount };
  }, [masters.arap]);

  const columns = [
    { 
      header: 'Party Name', 
      accessor: 'Name',
      render: (item: any) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
            item.Type === 'Receivable' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
              : 'bg-rose-50 border-rose-100 text-rose-600'
          }`}>
            {item.Type === 'Receivable' 
              ? <ArrowDownRight className="h-4 w-4" /> 
              : <ArrowUpRight className="h-4 w-4" />}
          </div>
          <div>
            <p className="font-bold text-[var(--color-text-primary)]">{item.Name}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] font-mono uppercase tracking-tighter">
              {item.BPCode}
            </p>
          </div>
        </div>
      )
    },
    { 
      header: 'Type', 
      accessor: 'Type',
      render: (item: any) => (
        <Badge variant={item.Type === 'Receivable' ? 'success' : 'warning'}>
          {item.Type === 'Receivable' ? 'AR — RECEIVABLE' : 'AP — PAYABLE'}
        </Badge>
      )
    },
    { 
      header: 'Balance', 
      accessor: 'Balance',
      align: 'right' as const,
      render: (item: any) => (
        <span className={`font-mono font-bold ${
          item.Type === 'Receivable' ? 'text-emerald-600' : 'text-rose-600'
        }`}>
          Rs. {formatCurrency(parseFloat(item.Balance) || 0)}
        </span>
      )
    },
    { 
      header: 'Due Date', 
      accessor: 'Due Date',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <CalendarClock className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          <span className="text-xs text-[var(--color-text-secondary)] font-mono">
            {item['Due Date'] || '—'}
          </span>
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: 'Status',
      render: (item: any) => {
        const variant = item.Status === 'Settled' ? 'FINAL' 
          : item.Status === 'Overdue' ? 'Return' 
          : 'PRELIMINARY';
        return <Badge variant={variant}>{(item.Status || 'Outstanding').toUpperCase()}</Badge>;
      }
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right' as const,
      render: (item: any) => (
        <div className="flex items-center justify-end gap-1">
          {item.Status !== 'Settled' && (
            <button 
              onClick={() => handleMarkSettled(item)}
              className="p-2 text-[var(--color-text-muted)] hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" 
              title="Mark Settled"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
          )}
          <button 
            onClick={() => openEditModal(item)}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)] rounded-lg transition-all" 
            title="Edit entry"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setDeleteItem(item)}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-rose-50 rounded-lg transition-all" 
            title="Delete entry"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
  ];

  const formFields = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="md:col-span-2">
        <Select 
          label="Party / Business Partner" 
          name="Name"
          value={formData.Name}
          onChange={(e) => {
            const selected = (masters.parties as any[]).find(
              (p: any) => (p.BPName || p.bpName) === e.target.value
            );
            setFormData(prev => ({
              ...prev,
              Name: e.target.value,
              BPCode: selected?.BPCode || selected?.bpCode || '',
            }));
          }}
          options={partyOptions}
          placeholder="Select from Party Master..."
          required
        />
      </div>
      <Input 
        label="Party Code" 
        name="BPCode" 
        value={formData.BPCode} 
        onChange={handleChange} 
        placeholder="Auto-filled from party" 
        disabled 
      />
      <Select 
        label="Entry Type" 
        name="Type"
        value={formData.Type}
        onChange={handleChange}
        options={[
          { label: 'Receivable (Customer Owes Us)', value: 'Receivable' },
          { label: 'Payable (We Owe Supplier)', value: 'Payable' },
        ]}
        required
      />
      <Input 
        label="Outstanding Balance (Rs.)" 
        name="Balance" 
        type="number" 
        step="0.01"
        value={formData.Balance} 
        onChange={handleChange} 
        required 
        icon={<DollarSign className="h-4 w-4" />}
      />
      <Input 
        label="Due Date" 
        name="Due Date" 
        type="date" 
        value={formData['Due Date']} 
        onChange={handleChange} 
        required 
      />
      <Input 
        label="Last Payment Date" 
        name="Last Payment" 
        type="date" 
        value={formData['Last Payment']} 
        onChange={handleChange} 
      />
      <Select 
        label="Status" 
        name="Status"
        value={formData.Status}
        onChange={handleChange}
        options={[
          { label: 'Outstanding', value: 'Outstanding' },
          { label: 'Overdue', value: 'Overdue' },
          { label: 'Settled', value: 'Settled' },
        ]}
        required
      />
    </div>
  );

  return (
    <AppLayout>
      <PageHeader 
        title="Receivables & Payables" 
        subtitle="Track outstanding balances owed by customers and to suppliers."
        breadcrumbs={[{ label: 'Financials' }, { label: 'AR/AP Ledger' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => exportToCSV(masters.arap || [], 'ARAP_Export', {
              username: user?.Username,
              companyName: user?.Role === 'Admin' ? 'All Companies' : (user?.CompanyName || settings.companyName),
              contact: user?.ContactNo || settings.contactNo,
              date: new Date().toLocaleDateString()
            })}>
              <Download className="w-3.5 h-3.5 mr-2" /> Export
            </Button>
            <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="shadow-lg" size="sm">
              <Plus className="w-4 h-4 mr-2" /> New Entry
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-l-4 border-l-emerald-500 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <ArrowDownRight className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Total Receivable</p>
                <p className="text-lg font-bold font-mono text-emerald-600">Rs. {formatCurrency(stats.totalReceivable)}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white border-l-4 border-l-rose-500 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Total Payable</p>
                <p className="text-lg font-bold font-mono text-rose-600">Rs. {formatCurrency(stats.totalPayable)}</p>
              </div>
            </div>
          </Card>
          <Card className={`bg-white border-l-4 shadow-sm ${stats.netPosition >= 0 ? 'border-l-blue-500' : 'border-l-amber-500'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                stats.netPosition >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
              }`}>
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Net Position</p>
                <p className={`text-lg font-bold font-mono ${stats.netPosition >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                  Rs. {formatCurrency(Math.abs(stats.netPosition))}
                </p>
              </div>
            </div>
          </Card>
          <Card className="bg-white border-l-4 border-l-[var(--color-warning)] shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Overdue</p>
                <p className="text-lg font-bold font-mono text-amber-600">{stats.overdueCount} entries</p>
              </div>
            </div>
          </Card>
        </div>

        <DataTable 
          columns={columns}
          data={masters.arap || []} 
          searchPlaceholder="Search receivables & payables..."
        />
      </div>

      {/* Add Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="New AR/AP Entry"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {formFields}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--color-border)]">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button variant="primary" type="submit" className="shadow-lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...</>
              ) : 'Create Entry'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={!!editItem} 
        onClose={() => { setEditItem(null); resetForm(); }} 
        title="Edit AR/AP Entry"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {formFields}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--color-border)]">
            <Button variant="ghost" type="button" onClick={() => { setEditItem(null); resetForm(); }} disabled={isSubmitting}>Cancel</Button>
            <Button variant="primary" type="submit" className="shadow-lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
              ) : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

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
                Delete &ldquo;{deleteItem?.Name}&rdquo;?
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                This will permanently remove this AR/AP entry from the ledger. This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <Button variant="ghost" onClick={() => setDeleteItem(null)} disabled={isDeleting}>Cancel</Button>
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
}
