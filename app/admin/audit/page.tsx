'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { useAppContext } from '@/lib/context/AppContext';
import { fetchFromGAS, ACTIONS } from '@/lib/api';
import { ShieldCheck, History, Clock, FileText, Database, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AuditLogPage() {
  const { settings, user, showToast } = useAppContext();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAuditLogs = async () => {
    if (!settings.appsScriptUrl) return;
    setIsLoading(true);
    try {
      const data = await fetchFromGAS(settings.appsScriptUrl, ACTIONS.GET_AUDIT_LOG, {
        role: user?.Role || 'Company',
        companyName: user?.CompanyName || settings.companyName,
      });
      // Sort by timestamp descending
      const sorted = (data || []).sort((a: any, b: any) => 
        new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
      );
      setLogs(sorted);
    } catch (err: any) {
      showToast('Failed to load audit logs: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.Role === 'Admin') {
      loadAuditLogs();
    } else {
      setIsLoading(false);
    }
  }, [user, settings.appsScriptUrl]);

  if (user?.Role !== 'Admin') {
    return <div className="p-10 text-center font-bold text-slate-500">Unauthorized. System Administrators only.</div>;
  }

  const columns = [
    { 
      header: 'Timestamp', 
      accessor: 'Timestamp',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <div>
            <p className="text-sm font-medium text-slate-700">{new Date(item.Timestamp).toLocaleDateString()}</p>
            <p className="text-[10px] text-slate-400 font-mono">{new Date(item.Timestamp).toLocaleTimeString()}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Action', 
      accessor: 'Action',
      render: (item: any) => (
        <Badge variant={
          item.Action === 'CREATE' ? 'success' : 
          item.Action === 'DELETE' ? 'danger' : 'warning'
        }>
          {item.Action}
        </Badge>
      )
    },
    { 
      header: 'Module / Sheet', 
      accessor: 'Module',
      render: (item: any) => (
        <span className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">
          {item.Module}
        </span>
      )
    },
    { 
      header: 'User & Company', 
      accessor: 'Company',
      render: (item: any) => (
        <div>
          <p className="text-sm font-bold text-slate-800">{item.Company || 'System Admin'}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{item.Role}</p>
        </div>
      )
    },
    { 
      header: 'Details', 
      accessor: 'Details',
      render: (item: any) => (
        <div className="max-w-md truncate text-xs text-slate-500 font-mono bg-slate-50 p-1.5 rounded">
          {item.Details}
        </div>
      )
    },
  ];

  return (
    <AppLayout>
      <PageHeader 
        title="System Audit Log" 
        subtitle="Track modifications, deletions, and additions across all master registries."
        breadcrumbs={[{ label: 'Management' }, { label: 'Audit Log' }]}
        actions={
          <Button variant="outline" size="sm" onClick={loadAuditLogs} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> 
            Refresh Logs
          </Button>
        }
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <History className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Events</p>
                <p className="text-xl font-bold font-mono text-slate-800">{logs.length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white border-l-4 border-l-rose-500 shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deletions</p>
                <p className="text-xl font-bold font-mono text-slate-800">
                  {logs.filter(l => l.Action === 'DELETE').length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="bg-white border-l-4 border-l-amber-500 shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Updates</p>
                <p className="text-xl font-bold font-mono text-slate-800">
                  {logs.filter(l => l.Action === 'UPDATE').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {isLoading ? (
          <Card className="p-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-slate-300 animate-spin mb-4" />
            <p className="text-sm font-medium text-slate-500">Loading audit history...</p>
          </Card>
        ) : (
          <DataTable 
            columns={columns}
            data={logs}
            searchPlaceholder="Search events by company, module, or details..."
          />
        )}
      </div>
    </AppLayout>
  );
}
