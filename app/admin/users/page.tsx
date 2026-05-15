'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/lib/context/AppContext';
import { fetchFromGAS, postToGAS } from '@/lib/api';
import { User as UserType } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  UserPlus, 
  Search, 
  Shield, 
  Building2, 
  Phone, 
  Key, 
  RefreshCw, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  User, 
  Eye, 
  EyeOff, 
  Edit3,
  Edit2,
  Trash2
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

export default function UserManagementPage() {
  const { settings, showToast, user } = useAppContext();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingUsernames, setUpdatingUsernames] = useState<Set<string>>(new Set());
  const [deletingUsernames, setDeletingUsernames] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    Username: '',
    Password: '',
    CompanyName: '',
    PAN_No: '',
    ContactNo: '',
    Status: 'Active' as UserType['Status'],
    Role: 'Company' as 'Admin' | 'Company'
  });

  const loadUsers = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await fetchFromGAS(settings.appsScriptUrl, 'getUsers');
      setUsers(data);
    } catch (err: any) {
      showToast('Failed to load users: ' + err.message, 'error');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.Role === 'Admin') {
      loadUsers();
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      Username: '',
      Password: '',
      CompanyName: '',
      PAN_No: '',
      ContactNo: '',
      Status: 'Active',
      Role: 'Company'
    });
    setIsEditing(false);
    setShowPassword(false);
  };

  const handleEdit = (u: UserType) => {
    setFormData({
      Username: u.Username,
      Password: '', // Don't show existing hash
      CompanyName: u.CompanyName || '',
      PAN_No: u.PAN_No || '',
      ContactNo: u.ContactNo || '',
      Status: u.Status === 'Deactivated' ? 'Inactive' : u.Status,
      Role: u.Role
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const action = isEditing ? 'updateUser' : 'createUser';
      
      // Prepare data (only include password if it's been typed)
      const submitData = { ...formData };
      if (isEditing && !submitData.Password) {
        delete (submitData as any).Password;
      }

      await postToGAS(settings.appsScriptUrl, action, submitData);
      
      showToast(isEditing ? 'User updated successfully' : 'User created successfully', 'success');
      setShowModal(false);
      resetForm();
      loadUsers();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (username: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setUpdatingUsernames(prev => new Set(prev).add(username));
    try {
      await postToGAS(settings.appsScriptUrl, 'updateUser', {
        Username: username,
        Status: newStatus
      });
      
      // Optimistic Update: Update the local state immediately
      setUsers(prev => prev.map(u => u.Username === username ? { ...u, Status: newStatus } : u));
      
      showToast(`User ${newStatus === 'Active' ? 'activated' : 'unsubscribed (inactive)'}`, 'success');
      loadUsers(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingUsernames(prev => {
        const next = new Set(prev);
        next.delete(username);
        return next;
      });
    }
  };

  const handleDelete = async (username: string) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete user "${username}"? This action cannot be undone.`)) return;
    
    setDeletingUsernames(prev => new Set(prev).add(username));
    try {
      await postToGAS(settings.appsScriptUrl, 'deleteUser', { Username: username });
      
      // Optimistic Update: Remove the user from the local state immediately
      setUsers(prev => prev.filter(u => u.Username !== username));
      
      showToast(`User "${username}" has been deleted`, 'success');
      loadUsers(true);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setDeletingUsernames(prev => {
        const next = new Set(prev);
        next.delete(username);
        return next;
      });
    }
  };

  const filteredUsers = users.filter(u => 
    u.Username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.CompanyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (user?.Role !== 'Admin') {
    return <div className="p-10 text-center">Unauthorized. Admins only.</div>;
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
            <p className="text-slate-500 mt-1">Manage company access and portal users</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => loadUsers()} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
              <UserPlus className="w-4 h-4 mr-2" /> Add Company User
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden border-slate-200/60 shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center gap-4 bg-white">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by username or company..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500/50 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-auto">
              Total Users: {users.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4 text-left">User Details</th>
                  <th className="px-6 py-4 text-left">Company Information</th>
                  <th className="px-6 py-4 text-left">Contact</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-300" />
                      <p className="text-slate-400 mt-4 text-xs font-medium">Fetching secure records...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-400">No users found.</td>
                  </tr>
                ) : filteredUsers.map((u, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${u.Role === 'Admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-yellow-50 text-yellow-600'}`}>
                          {u.Role === 'Admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.Username}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{u.Role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.Role === 'Company' ? (
                        <div>
                          <p className="font-semibold text-slate-700">{u.CompanyName}</p>
                          <p className="text-xs text-slate-400 font-mono">PAN: {u.PAN_No}</p>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-xs">System Admin</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {u.ContactNo ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3" /> {u.ContactNo}
                        </div>
                      ) : '---'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={u.Status === 'Active' ? 'success' : 'danger'}>
                        {u.Status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 border-blue-100"
                          title="Edit User Info"
                          onClick={() => handleEdit(u)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        {u.Username !== 'admin' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className={`text-xs h-8 ${u.Status === 'Active' ? 'text-orange-600 hover:bg-orange-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                              onClick={() => toggleStatus(u.Username, u.Status)}
                              disabled={updatingUsernames.has(u.Username)}
                            >
                              {updatingUsernames.has(u.Username) ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              ) : (
                                u.Status === 'Active' ? <XCircle className="w-3 h-3 mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />
                              )}
                              {u.Status === 'Active' ? 'Unsubscribe' : 'Activate'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                              title="Delete User"
                              onClick={() => handleDelete(u.Username)}
                              disabled={deletingUsernames.has(u.Username)}
                            >
                              {deletingUsernames.has(u.Username) ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Unified Add/Edit User Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden border border-slate-200">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-2xl font-bold text-slate-900">{isEditing ? 'Edit User Details' : 'Add New Company'}</h2>
                <p className="text-slate-500 text-sm mt-1">
                  {isEditing ? `Updating information for ${formData.Username}` : 'Create a new portal user for a company client'}
                </p>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Company Name" 
                    placeholder="Legal Name"
                    value={formData.CompanyName}
                    onChange={e => setFormData({...formData, CompanyName: e.target.value})}
                    required
                  />
                  <Input 
                    label="PAN Number" 
                    placeholder="Tax ID"
                    value={formData.PAN_No}
                    onChange={e => setFormData({...formData, PAN_No: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Username" 
                    placeholder="Login username"
                    value={formData.Username}
                    onChange={e => setFormData({...formData, Username: e.target.value})}
                    required
                    disabled={isEditing} // Username shouldn't change as it's the ID
                  />
                  <div className="relative">
                    <Input 
                      label={isEditing ? "New Password (Optional)" : "Password"} 
                      type={showPassword ? "text" : "password"}
                      placeholder={isEditing ? "Leave blank to keep current" : "Initial password"}
                      value={formData.Password}
                      onChange={e => setFormData({...formData, Password: e.target.value})}
                      required={!isEditing}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Contact Number" 
                    placeholder="Phone"
                    value={formData.ContactNo}
                    onChange={e => setFormData({...formData, ContactNo: e.target.value})}
                  />
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Account Status</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all"
                      value={formData.Status}
                      onChange={e => setFormData({...formData, Status: e.target.value as any})}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditing ? 'Save Changes' : 'Create Account')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
