'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  ShieldCheck, 
  Search, 
  Bell, 
  Store, 
  ChevronDown, 
  Sparkles,
  Check
} from 'lucide-react';
import { AdminRole } from '@/types';

interface AdminHeaderProps {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenHomepagePreview: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onOpenSearch,
  onOpenNotifications,
  onOpenHomepagePreview,
}) => {
  const { 
    adminRole, 
    setAdminRole, 
    adminNotifications, 
    setActiveTab, 
    showToast,
    storeSettings 
  } = useStore();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const unreadCount = adminNotifications.filter(n => !n.read).length;

  const roles: { role: AdminRole; label: string; desc: string; color: string }[] = [
    { role: 'OWNER', label: 'Owner', desc: 'Full store access & settings', color: 'bg-[#F35C16] text-white' },
    { role: 'MANAGER', label: 'Store Manager', desc: 'Products, Orders, Customers', color: 'bg-blue-600 text-white' },
    { role: 'MARKETING', label: 'Marketing Head', desc: 'Homepage, Offers, Analytics', color: 'bg-purple-600 text-white' },
    { role: 'STAFF', label: 'Operations Staff', desc: 'Orders & Inventory only', color: 'bg-emerald-600 text-white' },
  ];

  const currentRoleConfig = roles.find(r => r.role === adminRole) || roles[0];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: SBS Store Brand & Role Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#F35C16] to-[#FF7E47] flex items-center justify-center text-white font-black text-sm shadow-sm shadow-orange-500/20 flex-shrink-0">
            SBS
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-gray-900 leading-none">
                {storeSettings.storeName || 'SBS Store'}
              </span>
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-orange-100 text-[#F35C16] leading-none">
                Admin
              </span>
            </div>
            {/* Role Switcher Button */}
            <div className="relative mt-1">
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-1 text-[11px] font-bold text-gray-600 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200/80 px-2 py-0.5 rounded-full"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A859]" />
                <span>Role: {currentRoleConfig.label}</span>
                <ChevronDown className="w-3 h-3 text-gray-500" />
              </button>

              {/* Role Switcher Menu */}
              {isRoleDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setIsRoleDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-fadeIn">
                    <p className="text-[10px] font-bold uppercase text-gray-400 px-2 py-1">
                      Switch Role (RBAC Simulator)
                    </p>
                    <div className="space-y-1">
                      {roles.map(r => (
                        <button
                          key={r.role}
                          onClick={() => {
                            setAdminRole(r.role);
                            setIsRoleDropdownOpen(false);
                            showToast(`Switched role to ${r.label}`);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            adminRole === r.role ? 'bg-orange-50 text-[#F35C16] font-bold' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div>
                            <p className="font-bold leading-tight">{r.label}</p>
                            <p className="text-[10px] text-gray-500">{r.desc}</p>
                          </div>
                          {adminRole === r.role && <Check className="w-4 h-4 text-[#F35C16]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions: Search, Preview, Notifications, Customer Store Toggle */}
        <div className="flex items-center gap-1.5">
          {/* Global Search */}
          <button
            onClick={onOpenSearch}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
            title="Global Admin Search"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Homepage Customer Preview */}
          <button
            onClick={onOpenHomepagePreview}
            className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#F35C16] rounded-xl flex items-center gap-1 text-xs font-bold transition-all border border-orange-200/60"
            title="Live Storefront Preview"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Preview</span>
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
            title="Admin Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#F35C16] text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Switch to Customer Store */}
          <button
            onClick={() => {
              setActiveTab('home');
              showToast('Switched to Customer Store view');
            }}
            className="w-8 h-8 rounded-full bg-gray-900 hover:bg-black text-white flex items-center justify-center transition-transform hover:scale-105"
            title="Go to Customer Store"
            aria-label="Customer Store"
          >
            <Store className="w-4 h-4 text-orange-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
