'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  UserPlus, 
  KeyRound, 
  Lock, 
  Check, 
  X, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  History, 
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  Filter
} from 'lucide-react';
import { AdminRole, AdminTeamMember } from '@/types';

export const RolesManagementView: React.FC = () => {
  const { 
    adminTeamMembers, 
    roleAuditLogs, 
    addTeamMember, 
    updateTeamMemberRole, 
    toggleTeamMemberStatus, 
    removeTeamMember, 
    showToast 
  } = useStore();
  const { authUser, supabaseUser, isGoogleAuth, isSuperAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'members' | 'matrix' | 'audit'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | AdminRole>('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<AdminTeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<AdminTeamMember | null>(null);

  // New Member Form
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('STAFF');
  const [newDepartment, setNewDepartment] = useState('');

  const currentEmail = authUser?.email || supabaseUser?.email || 'mahipalstudent71@gmail.com';

  const roleConfigs: {
    role: AdminRole;
    label: string;
    badgeColor: string;
    bgBadge: string;
    desc: string;
    level: string;
  }[] = [
    {
      role: 'OWNER',
      label: 'Store Owner / Super Admin',
      badgeColor: 'text-[#F95721] border-[#F95721]/30',
      bgBadge: 'bg-[#F95721] text-white',
      desc: 'Unrestricted store authority, financial ledger, team roles & settings',
      level: 'Tier 1 (Highest)'
    },
    {
      role: 'MANAGER',
      label: 'Store Manager',
      badgeColor: 'text-blue-600 border-blue-200',
      bgBadge: 'bg-blue-600 text-white',
      desc: 'Catalog, orders, customers, refunds & operations ledger',
      level: 'Tier 2 (High)'
    },
    {
      role: 'MARKETING',
      label: 'Marketing Head',
      badgeColor: 'text-purple-600 border-purple-200',
      bgBadge: 'bg-purple-600 text-white',
      desc: 'Homepage layout, banner campaigns, discount coupons & deals',
      level: 'Tier 3 (Campaigns)'
    },
    {
      role: 'STAFF',
      label: 'Operations & Fulfillment',
      badgeColor: 'text-emerald-600 border-emerald-200',
      bgBadge: 'bg-emerald-600 text-white',
      desc: 'Order packing, dispatch status, stock replenishment & low stock',
      level: 'Tier 4 (Operations)'
    }
  ];

  const permissionMatrix: {
    module: string;
    category: string;
    owner: boolean;
    manager: boolean;
    marketing: boolean;
    staff: boolean;
    notes: string;
  }[] = [
    { module: 'Products & Catalog', category: 'Catalog', owner: true, manager: true, marketing: true, staff: false, notes: 'Add/edit products, pricing, categories' },
    { module: 'Stock & Inventory', category: 'Catalog', owner: true, manager: true, marketing: false, staff: true, notes: 'Update quantities, view stock alerts' },
    { module: 'Customer Orders', category: 'Orders', owner: true, manager: true, marketing: false, staff: true, notes: 'View customer orders, change status' },
    { module: 'Returns & Refunds', category: 'Orders', owner: true, manager: true, marketing: false, staff: false, notes: 'Approve returns, initiate refunds' },
    { module: 'Customer Directory', category: 'CRM', owner: true, manager: true, marketing: false, staff: false, notes: 'Customer profiles, order histories' },
    { module: 'Payments & Revenue', category: 'Finance', owner: true, manager: true, marketing: false, staff: false, notes: 'UPI ledgers, revenue charts' },
    { module: 'Homepage & Banners', category: 'Marketing', owner: true, manager: false, marketing: true, staff: false, notes: 'Hero banners, promo sections, deals' },
    { module: 'Offers & Coupons', category: 'Marketing', owner: true, manager: false, marketing: true, staff: false, notes: 'Create discount codes & promo deals' },
    { module: 'Role & Access Control', category: 'Security', owner: true, manager: false, marketing: false, staff: false, notes: 'Manage Google admin team members' },
    { module: 'Store Core Settings', category: 'Settings', owner: true, manager: false, marketing: false, staff: false, notes: 'Store name, UPI ID, shipping rates' },
  ];

  const filteredMembers = adminTeamMembers.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.department && m.department.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      showToast('Please enter a valid Google email address', 'error');
      return;
    }
    const res = addTeamMember({
      name: newName.trim() || newEmail.split('@')[0],
      email: newEmail.trim(),
      role: newRole,
      status: 'ACTIVE',
      department: newDepartment.trim() || 'Store Operations',
    }, currentEmail);

    if (res.success) {
      setNewEmail('');
      setNewName('');
      setNewDepartment('');
      setNewRole('STAFF');
      setIsAddModalOpen(false);
    } else {
      showToast(res.error || 'Failed to add team member', 'error');
    }
  };

  const handleUpdateRole = (newRoleValue: AdminRole) => {
    if (!editingMember) return;
    updateTeamMemberRole(editingMember.id, newRoleValue, currentEmail);
    setEditingMember(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingMember) return;
    const res = removeTeamMember(deletingMember.id, currentEmail);
    if (res.success) {
      setDeletingMember(null);
    } else {
      showToast(res.error || 'Failed to remove member', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-28 animate-fadeIn">
      {/* Top Banner: Security Policy Notice */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white p-5 rounded-3xl shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
          <ShieldCheck className="w-48 h-48" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-wider border border-orange-500/30">
                Security Policy Enforced
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Google OAuth 2.0 Only
              </span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Admin Role & Access Management
            </h1>
            <p className="text-xs text-gray-300 leading-relaxed">
              Store admin controls are restricted strictly to Google-authenticated accounts. Super Admin 
              <span className="font-mono text-orange-400 font-bold ml-1">mahipalstudent71@gmail.com</span> has full permanent ownership.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F95721] hover:bg-[#E44813] text-white font-bold text-xs rounded-2xl shadow-md shadow-orange-500/25 active:scale-95 transition-all self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Grant Admin Access</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold">Total Admin Team</span>
            <Users className="w-4 h-4 text-[#F95721]" />
          </div>
          <p className="text-2xl font-black text-gray-900">{adminTeamMembers.length}</p>
          <p className="text-[10px] text-gray-400">Authorized Google Accounts</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold">Active Roles</span>
            <KeyRound className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-xs font-black text-orange-600">
              {adminTeamMembers.filter(m => m.role === 'OWNER').length} Owner
            </span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs font-black text-blue-600">
              {adminTeamMembers.filter(m => m.role === 'MANAGER').length} Mgr
            </span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs font-black text-purple-600">
              {adminTeamMembers.filter(m => m.role === 'MARKETING').length} Mkt
            </span>
            <span className="text-xs text-gray-300">•</span>
            <span className="text-xs font-black text-emerald-600">
              {adminTeamMembers.filter(m => m.role === 'STAFF').length} Staff
            </span>
          </div>
          <p className="text-[10px] text-gray-400">RBAC Tier Distribution</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold">Super Admin</span>
            <ShieldCheck className="w-4 h-4 text-[#00A859]" />
          </div>
          <p className="text-xs font-black text-gray-900 truncate">mahipalstudent71</p>
          <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-green-50 text-[#00A859] border border-green-200">
            Permanent Root
          </span>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-bold">Audit Events</span>
            <History className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{roleAuditLogs.length}</p>
          <p className="text-[10px] text-gray-400">Security event history</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-2">
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'members'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Admin Team ({adminTeamMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'matrix'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Permissions Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Logs ({roleAuditLogs.length})</span>
          </button>
        </div>

        {activeTab === 'members' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#F95721] hover:bg-[#E44813] text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: TEAM MEMBERS DIRECTORY */}
      {/* ========================================================= */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, Google email or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#F95721]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-gray-400 flex items-center gap-1 flex-shrink-0">
                <Filter className="w-3.5 h-3.5" />
                Role:
              </span>
              {(['ALL', 'OWNER', 'MANAGER', 'MARKETING', 'STAFF'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    roleFilter === r
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Members List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredMembers.map((member) => {
              const roleInfo = roleConfigs.find(rc => rc.role === member.role) || roleConfigs[3];
              const isPermanentSuper = member.email.toLowerCase() === 'mahipalstudent71@gmail.com' || member.isSuperAdmin;
              const isCurrentLoggedIn = member.email.toLowerCase() === currentEmail.toLowerCase();

              return (
                <div
                  key={member.id}
                  className={`bg-white rounded-3xl p-4 border transition-all ${
                    isPermanentSuper 
                      ? 'border-orange-200 bg-gradient-to-tr from-orange-50/20 to-white shadow-xs'
                      : member.status === 'SUSPENDED'
                      ? 'border-gray-200 opacity-60 bg-gray-50/50'
                      : 'border-gray-100 hover:border-gray-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F95721] to-[#FF7E47] text-white flex items-center justify-center font-black text-sm shadow-xs flex-shrink-0">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          member.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
                            {member.name}
                          </h4>
                          {isCurrentLoggedIn && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-600">
                              (You)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-mono flex items-center gap-1">
                          <span>{member.email}</span>
                          <span title="Google OAuth Verified">
                            <ShieldCheck className="w-3 h-3 text-blue-500" />
                          </span>
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {member.department || 'General Administration'}
                        </p>
                      </div>
                    </div>

                    {/* Role & Status Badges */}
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${roleInfo.bgBadge}`}>
                        {member.role}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.2 rounded-md ${
                        member.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                          : 'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  </div>

                  {/* Role capabilities short summary */}
                  <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="truncate max-w-[200px] sm:max-w-xs">{roleInfo.desc}</span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!isPermanentSuper ? (
                        <>
                          {/* Edit Role */}
                          <button
                            onClick={() => setEditingMember(member)}
                            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                            title="Change Role"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Suspend/Active */}
                          <button
                            onClick={() => toggleTeamMemberStatus(member.id, currentEmail)}
                            className={`p-1.5 rounded-xl transition-colors ${
                              member.status === 'ACTIVE'
                                ? 'hover:bg-amber-50 text-amber-600'
                                : 'hover:bg-emerald-50 text-emerald-600'
                            }`}
                            title={member.status === 'ACTIVE' ? 'Suspend Access' : 'Activate Access'}
                          >
                            {member.status === 'ACTIVE' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>

                          {/* Remove */}
                          <button
                            onClick={() => setDeletingMember(member)}
                            className="p-1.5 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
                            title="Remove Admin Access"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          Super Admin Root
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 space-y-2">
              <Users className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-700">No team members match your filter</p>
              <p className="text-xs text-gray-400">Try adjusting your search or role filter.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ROLE PERMISSIONS MATRIX */}
      {/* ========================================================= */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-2xs">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-black text-gray-900">Interactive RBAC Permissions Matrix</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Granular access capabilities enforced across each operational business module.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                  <th className="py-3 px-4">Store Operational Module</th>
                  <th className="py-3 px-3 text-center bg-orange-50/50 text-[#F95721]">
                    OWNER
                  </th>
                  <th className="py-3 px-3 text-center bg-blue-50/50 text-blue-700">
                    MANAGER
                  </th>
                  <th className="py-3 px-3 text-center bg-purple-50/50 text-purple-700">
                    MARKETING
                  </th>
                  <th className="py-3 px-3 text-center bg-emerald-50/50 text-emerald-700">
                    STAFF
                  </th>
                  <th className="py-3 px-4 text-gray-400">Notes & Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {permissionMatrix.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      <div className="flex items-center gap-2">
                        <span>{item.module}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-gray-100 text-gray-500 font-semibold">
                          {item.category}
                        </span>
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="py-3.5 px-3 text-center bg-orange-50/20">
                      {item.owner ? (
                        <Check className="w-4 h-4 text-green-600 mx-auto font-black" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>

                    {/* Manager */}
                    <td className="py-3.5 px-3 text-center bg-blue-50/20">
                      {item.manager ? (
                        <Check className="w-4 h-4 text-green-600 mx-auto font-black" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>

                    {/* Marketing */}
                    <td className="py-3.5 px-3 text-center bg-purple-50/20">
                      {item.marketing ? (
                        <Check className="w-4 h-4 text-green-600 mx-auto font-black" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>

                    {/* Staff */}
                    <td className="py-3.5 px-3 text-center bg-emerald-50/20">
                      {item.staff ? (
                        <Check className="w-4 h-4 text-green-600 mx-auto font-black" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                      {item.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: AUDIT LOGS */}
      {/* ========================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-900">Role & Security Audit History</h3>
              <p className="text-xs text-gray-500">Chronological ledger of admin privileges and account changes</p>
            </div>
            <span className="text-xs font-bold text-gray-400">{roleAuditLogs.length} events logged</span>
          </div>

          <div className="space-y-3">
            {roleAuditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F95721] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{log.action.replace('_', ' ')}</span>
                      <span className="text-[10px] text-gray-400">•</span>
                      <span className="text-gray-600 font-mono text-[11px]">{log.targetEmail}</span>
                    </div>
                    <p className="text-gray-500">{log.details}</p>
                    <p className="text-[10px] text-gray-400">By: {log.actorEmail}</p>
                  </div>
                </div>

                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD TEAM MEMBER */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-orange-100 text-[#F95721] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">Grant Admin Access</h3>
                  <p className="text-[11px] text-gray-500">Authorize a new Google account</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Google Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. colleague@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] font-mono text-xs"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  The user must sign in using this exact Google account to access admin features.
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Chandra"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Department / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Inventory Supervisor, Marketing Lead"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1.5">Assigned Role & Level</label>
                <div className="space-y-2">
                  {roleConfigs.map((rc) => (
                    <label
                      key={rc.role}
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                        newRole === rc.role 
                          ? 'bg-orange-50/60 border-[#F95721] shadow-2xs' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="newRoleOption"
                        checked={newRole === rc.role}
                        onChange={() => setNewRole(rc.role)}
                        className="mt-0.5 text-[#F95721] accent-[#F95721]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-gray-900 text-xs">{rc.label}</p>
                          <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${rc.bgBadge}`}>
                            {rc.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">{rc.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-[#F95721] hover:bg-[#E44813] text-white font-bold rounded-2xl shadow-sm shadow-orange-500/20 active:scale-95 transition-all"
                >
                  Confirm & Grant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT ROLE */}
      {/* ========================================================= */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">Change Admin Role</h3>
                  <p className="text-[11px] text-gray-500">{editingMember.name} ({editingMember.email})</p>
                </div>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {roleConfigs.map((rc) => (
                <button
                  key={rc.role}
                  onClick={() => handleUpdateRole(rc.role)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    editingMember.role === rc.role
                      ? 'bg-orange-50 border-[#F95721]'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <p className="font-bold text-gray-900">{rc.label}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{rc.desc}</p>
                  </div>
                  {editingMember.role === rc.role && (
                    <Check className="w-4 h-4 text-[#F95721] flex-shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setEditingMember(null)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================= */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xs w-full p-5 space-y-4 shadow-2xl text-center border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-500 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900">Revoke Admin Access?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to remove <b>{deletingMember.name}</b> ({deletingMember.email}) from the store administration team?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingMember(null)}
                className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-2xl shadow-sm shadow-red-500/20 active:scale-95 transition-all"
              >
                Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
