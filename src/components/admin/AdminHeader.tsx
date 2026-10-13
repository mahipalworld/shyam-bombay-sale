'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  Search, 
  Bell, 
  Store, 
  ChevronDown, 
  Sparkles,
  Check,
  Menu
} from 'lucide-react';
import { AdminRole } from '@/types';

interface AdminHeaderProps {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenHomepagePreview: () => void;
  onOpenMenu?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onOpenSearch,
  onOpenNotifications,
  onOpenHomepagePreview,
  onOpenMenu,
}) => {
  const { 
    adminRole, 
    setAdminRole, 
    adminNotifications, 
    setActiveTab, 
    showToast,
    storeSettings 
  } = useStore();

  const { authUser, supabaseUser } = useAuth();
  const currentEmail = authUser?.email || supabaseUser?.email || 'admin@sbs.store';

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const unreadCount = adminNotifications.filter(n => !n.read).length;

  const roles: { role: AdminRole; label: string; desc: string; color: string }[] = [
    { role: 'OWNER', label: 'Owner', desc: 'Full store access & all features', color: 'bg-[#F95721] text-white' },
    { role: 'MANAGER', label: 'Store Manager', desc: 'Catalog, Orders, Customers', color: 'bg-blue-600 text-white' },
    { role: 'MARKETING', label: 'Marketing Head', desc: 'Homepage, Offers, Analytics', color: 'bg-purple-600 text-white' },
    { role: 'STAFF', label: 'Operations Staff', desc: 'Orders & Inventory only', color: 'bg-emerald-600 text-white' },
  ];

  const currentRoleConfig = roles.find(r => r.role === adminRole) || roles[0];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 sm:px-6 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left: SBS Brand & Role Pill */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/sbs-wordmark.svg"
            alt="SBS"
            className="h-5.5 w-auto object-contain flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-slate-900 leading-none">
                {storeSettings.storeName ? storeSettings.storeName.split(' ')[0] : 'SBS'}
              </span>
              <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-orange-100 text-[#F95721] leading-none">
                Admin
              </span>
              <span className="hidden xs:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>

            {/* Role Switcher Pill */}
            <div className="relative mt-0.5">
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 transition-colors bg-slate-100 hover:bg-slate-200/80 px-2 py-0.5 rounded-full border border-slate-200/60"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="truncate max-w-[90px] xs:max-w-none">{currentRoleConfig.label}</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </button>

              {/* Role Dropdown */}
              {isRoleDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setIsRoleDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 animate-fadeIn">
                    <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Admin Role Simulator
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{currentEmail}</p>
                    </div>
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
                            adminRole === r.role ? 'bg-orange-50 text-[#F95721] font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <p className="font-bold leading-tight">{r.label}</p>
                            <p className="text-[10px] text-slate-400">{r.desc}</p>
                          </div>
                          {adminRole === r.role && <Check className="w-4 h-4 text-[#F95721]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions: Search, Preview, Notifications, Customer Store, Menu Drawer */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Global Search */}
          <button
            onClick={onOpenSearch}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-slate-700 transition-colors border border-slate-200/60"
            title="Global Search (Products, Orders, Customers)"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Live Storefront Preview */}
          <button
            onClick={onOpenHomepagePreview}
            className="hidden xs:flex px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#F95721] rounded-xl items-center gap-1 text-[11px] font-bold transition-all border border-orange-200/60 shadow-3xs"
            title="Live Storefront Preview"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Preview</span>
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-slate-700 transition-colors border border-slate-200/60"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F95721] text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Customer Storefront Toggle */}
          <button
            onClick={() => {
              setActiveTab('home');
              showToast('Switched to Customer Store view');
            }}
            className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-black text-white flex items-center justify-center transition-transform hover:scale-105 shadow-sm"
            title="Open Customer Store"
            aria-label="Customer Store"
          >
            <Store className="w-4 h-4 text-orange-400" />
          </button>

          {/* Mobile Full Menu Drawer Trigger */}
          {onOpenMenu && (
            <button
              onClick={onOpenMenu}
              className="lg:hidden w-8 h-8 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#F95721] flex items-center justify-center transition-colors border border-orange-200/60"
              title="Open Navigation Menu"
              aria-label="Open Menu"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
