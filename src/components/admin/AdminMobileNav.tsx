'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  LayoutTemplate, 
  Menu, 
  Layers, 
  Tag, 
  Boxes, 
  RotateCcw, 
  Users, 
  CreditCard, 
  BarChart3, 
  Bell, 
  Settings, 
  X,
  ShieldCheck,
  Cloud,
  ChevronRight,
  Search,
  Sparkles,
  Store,
  Check
} from 'lucide-react';
import { AdminRole } from '@/types';

export type AdminActiveTab = 
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'homepage'
  | 'offers'
  | 'inventory'
  | 'orders'
  | 'returns'
  | 'customers'
  | 'payments'
  | 'analytics'
  | 'notifications'
  | 'roles'
  | 'storage'
  | 'settings';

interface AdminMobileNavProps {
  currentTab: AdminActiveTab;
  onSelectTab: (tab: AdminActiveTab) => void;
  isDrawerOpen?: boolean;
  onOpenDrawerChange?: (open: boolean) => void;
}

export const AdminMobileNav: React.FC<AdminMobileNavProps> = ({
  currentTab,
  onSelectTab,
  isDrawerOpen: controlledDrawerOpen,
  onOpenDrawerChange,
}) => {
  const { 
    adminRole, 
    setAdminRole, 
    adminNotifications, 
    returnRequests, 
    products, 
    orders, 
    adminOrders, 
    storeSettings, 
    setActiveTab, 
    showToast 
  } = useStore();

  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const [drawerSearch, setDrawerSearch] = useState('');
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const isMoreOpen = controlledDrawerOpen !== undefined ? controlledDrawerOpen : internalDrawerOpen;
  const setMoreOpen = (open: boolean) => {
    if (onOpenDrawerChange) {
      onOpenDrawerChange(open);
    } else {
      setInternalDrawerOpen(open);
    }
  };

  const allOrdersList = adminOrders && adminOrders.length > 0 ? adminOrders : orders;
  const pendingOrders = allOrdersList.filter(o => 
    o.status !== 'Cancelled' && 
    o.status !== 'Delivered' && 
    (o.status === 'Processing' || o.paymentStatus === 'CUSTOMER_CONFIRMED' || (o.status === 'To Pay' && o.paymentStatus !== 'PAYMENT_FAILED' && o.paymentStatus !== 'CANCELLED'))
  ).length;
  const unreadNotifs = adminNotifications.filter(n => !n.read).length;
  const pendingReturns = returnRequests.filter(r => r.status === 'Pending').length;
  const lowStockCount = products.filter(p => p.stockCount <= storeSettings.lowStockThreshold).length;

  // RBAC permission checker
  const isAllowed = (tab: AdminActiveTab): boolean => {
    switch (adminRole) {
      case 'OWNER':
        return true;
      case 'MANAGER':
        return ['dashboard', 'products', 'categories', 'storage', 'inventory', 'orders', 'returns', 'customers', 'payments', 'notifications'].includes(tab);
      case 'MARKETING':
        return ['dashboard', 'products', 'categories', 'storage', 'homepage', 'offers', 'analytics', 'notifications'].includes(tab);
      case 'STAFF':
        return ['dashboard', 'orders', 'inventory', 'notifications'].includes(tab);
      default:
        return true;
    }
  };

  // Primary 5 Bottom Tabs
  const primaryTabs: { 
    tab: AdminActiveTab; 
    label: string; 
    icon: React.ComponentType<{ className?: string }>; 
    badge?: number; 
    badgeColor?: string;
  }[] = [
    { tab: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { tab: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrders > 0 ? pendingOrders : undefined, badgeColor: 'bg-blue-600' },
    { tab: 'products', label: 'Products', icon: Package },
    { tab: 'inventory', label: 'Inventory', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-amber-500' },
  ];

  // Full module registry grouped logically
  const moduleGroups: {
    group: string;
    items: {
      tab: AdminActiveTab;
      label: string;
      desc: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: number;
      badgeColor?: string;
    }[];
  }[] = [
    {
      group: 'Core Storefront',
      items: [
        { tab: 'dashboard', label: 'Overview & Velocity', desc: 'KPIs, revenues, live feed', icon: LayoutDashboard },
        { tab: 'products', label: 'Products Catalog', desc: 'SKUs, pricing, inventory', icon: Package },
        { tab: 'categories', label: 'Categories & Taxonomy', desc: 'Collections & filters', icon: Layers },
        { tab: 'storage', label: 'Media & AWS Storage', desc: 'S3 product assets & CDN', icon: Cloud },
        { tab: 'homepage', label: 'Homepage Manager', desc: 'Banners, flash sales & rows', icon: LayoutTemplate },
      ]
    },
    {
      group: 'Orders & Sales',
      items: [
        { tab: 'orders', label: 'Customer Orders', desc: 'Fulfillment & dispatches', icon: ShoppingBag, badge: pendingOrders > 0 ? pendingOrders : undefined, badgeColor: 'bg-blue-600' },
        { tab: 'returns', label: 'Returns & Refunds', desc: 'Reverse logistics queue', icon: RotateCcw, badge: pendingReturns > 0 ? pendingReturns : undefined, badgeColor: 'bg-red-500' },
        { tab: 'payments', label: 'Payments Ledger', desc: 'COD, UPI & transaction records', icon: CreditCard },
      ]
    },
    {
      group: 'Operations & CRM',
      items: [
        { tab: 'inventory', label: 'Stock & Inventory', desc: 'Stock replenishment alerts', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-amber-500' },
        { tab: 'offers', label: 'Offers & Coupons', desc: 'Discount vouchers & rules', icon: Tag },
        { tab: 'customers', label: 'Customer Directory', desc: 'Buyer profiles & CRM', icon: Users },
      ]
    },
    {
      group: 'Intelligence & Config',
      items: [
        { tab: 'analytics', label: 'Analytics & Insights', desc: 'Sales trajectories & trends', icon: BarChart3 },
        { tab: 'notifications', label: 'Notifications Center', desc: 'Store activity stream', icon: Bell, badge: unreadNotifs > 0 ? unreadNotifs : undefined, badgeColor: 'bg-[#F95721]' },
        { tab: 'roles', label: 'Role & Access Control', desc: 'Team permissions & RBAC', icon: ShieldCheck },
        { tab: 'settings', label: 'Store Settings', desc: 'Business policies & thresholds', icon: Settings },
      ]
    }
  ];

  const roles: { role: AdminRole; label: string; desc: string }[] = [
    { role: 'OWNER', label: 'Owner', desc: 'Full store access & all features' },
    { role: 'MANAGER', label: 'Store Manager', desc: 'Catalog, Orders, Customers' },
    { role: 'MARKETING', label: 'Marketing Head', desc: 'Homepage, Offers, Analytics' },
    { role: 'STAFF', label: 'Operations Staff', desc: 'Orders & Inventory' },
  ];

  const handleSelect = (tab: AdminActiveTab) => {
    onSelectTab(tab);
    setMoreOpen(false);
  };

  const isCurrentTabInPrimary = primaryTabs.some(item => item.tab === currentTab);
  const totalAlertBadges = (unreadNotifs > 0 ? 1 : 0) + (pendingReturns > 0 ? 1 : 0) + (lowStockCount > 0 ? 1 : 0);

  // Filter modules in drawer based on search
  const filteredGroups = moduleGroups.map(grp => {
    if (!drawerSearch.trim()) return grp;
    const q = drawerSearch.toLowerCase().trim();
    const matchedItems = grp.items.filter(
      item => item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || grp.group.toLowerCase().includes(q)
    );
    return { ...grp, items: matchedItems };
  }).filter(grp => grp.items.length > 0);

  return (
    <>
      {/* ========================================================= */}
      {/* 5-TAB MOBILE STICKY BOTTOM BAR */}
      {/* ========================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-2 py-1 safe-bottom shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {primaryTabs.map((item) => {
            const allowed = isAllowed(item.tab);
            const active = currentTab === item.tab && !isMoreOpen;
            const Icon = item.icon;

            if (!allowed) {
              return (
                <button
                  key={item.tab}
                  disabled
                  className="flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl text-slate-300 cursor-not-allowed opacity-40"
                  title="Restricted by your role"
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-bold">{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.tab}
                onClick={() => handleSelect(item.tab)}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all tap-active ${
                  active 
                    ? 'text-[#F95721] font-bold scale-105' 
                    : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all relative ${active ? 'bg-orange-50 text-[#F95721]' : ''}`}>
                  <Icon className="w-5 h-5" />
                  {item.badge && item.badge > 0 && (
                    <span className={`absolute -top-1 -right-1 text-[8px] font-black text-white px-1 py-0.2 rounded-full ring-2 ring-white ${item.badgeColor || 'bg-[#F95721]'}`}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}

          {/* More Drawer Button */}
          <button
            onClick={() => setMoreOpen(!isMoreOpen)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all tap-active ${
              (!isCurrentTabInPrimary || isMoreOpen) 
                ? 'text-[#F95721] font-bold scale-105' 
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all relative ${(!isCurrentTabInPrimary || isMoreOpen) ? 'bg-orange-50 text-[#F95721]' : ''}`}>
              <Menu className="w-5 h-5" />
              {totalAlertBadges > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#F95721] rounded-full ring-2 ring-white animate-pulse" />
              )}
            </div>
            <span className="text-[10px] tracking-tight">Modules</span>
          </button>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* FULL SLIDE-UP / SLIDE-OUT MOBILE ADMINISTRATION DRAWER */}
      {/* ========================================================= */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          {/* Backdrop click dismiss */}
          <div 
            className="flex-1 w-full" 
            onClick={() => setMoreOpen(false)} 
          />

          {/* Bottom Drawer Card */}
          <div className="bg-white rounded-t-3xl max-h-[88vh] flex flex-col shadow-2xl border-t border-slate-200 max-w-lg mx-auto w-full overflow-hidden animate-slideUp">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F95721] flex items-center justify-center font-black">
                  <Menu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">SBS Admin Suite</h3>
                  <p className="text-[10px] text-slate-400">All 15 store management modules</p>
                </div>
              </div>

              <button
                onClick={() => setMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors"
                aria-label="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Search & RBAC Role Switcher Strip */}
            <div className="p-3.5 space-y-2.5 border-b border-slate-100 bg-white">
              {/* Module Filter Input */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={drawerSearch}
                  onChange={(e) => setDrawerSearch(e.target.value)}
                  placeholder="Filter admin modules (e.g., categories, orders)..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-hidden focus:border-[#F95721] focus:bg-white transition-all text-slate-900 placeholder-slate-400"
                />
                {drawerSearch && (
                  <button
                    onClick={() => setDrawerSearch('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Role Indicator & Simulator */}
              <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-2.5 relative">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#F95721]" />
                    <span className="font-bold text-slate-800 text-[11px]">Role: {adminRole}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                    className="text-[#F95721] font-bold text-[10px] hover:underline flex items-center gap-0.5"
                  >
                    <span>Change</span>
                    <ChevronRight className={`w-3 h-3 transition-transform ${isRoleMenuOpen ? 'rotate-90' : ''}`} />
                  </button>
                </div>

                {isRoleMenuOpen && (
                  <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
                    {roles.map(r => (
                      <button
                        key={r.role}
                        onClick={() => {
                          setAdminRole(r.role);
                          setIsRoleMenuOpen(false);
                          showToast(`Switched role to ${r.label}`);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          adminRole === r.role ? 'bg-orange-50 text-[#F95721] font-bold' : 'hover:bg-white text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-bold leading-none text-[11px]">{r.label}</p>
                          <p className="text-[9px] text-slate-400">{r.desc}</p>
                        </div>
                        {adminRole === r.role && <Check className="w-3.5 h-3.5 text-[#F95721]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Module List */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4 no-scrollbar">
              {filteredGroups.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <p className="text-xs font-bold">No modules match "{drawerSearch}"</p>
                  <p className="text-[10px] mt-1">Try searching for catalog, orders, or config</p>
                </div>
              ) : (
                filteredGroups.map(grp => (
                  <div key={grp.group} className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
                      {grp.group}
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {grp.items.map(item => {
                        const allowed = isAllowed(item.tab);
                        const active = currentTab === item.tab;
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.tab}
                            disabled={!allowed}
                            onClick={() => handleSelect(item.tab)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all text-left tap-active ${
                              !allowed
                                ? 'opacity-40 bg-slate-50 border-slate-100 cursor-not-allowed text-slate-400'
                                : active
                                ? 'bg-orange-50/90 border-orange-200 text-[#F95721] shadow-3xs'
                                : 'bg-white border-slate-100 hover:border-slate-200 text-slate-800 hover:bg-slate-50/70'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                active ? 'bg-[#F95721] text-white shadow-3xs' : 'bg-slate-100 text-slate-600'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold leading-tight truncate">{item.label}</p>
                                <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {item.badge !== undefined && item.badge > 0 && (
                                <span className={`px-2 py-0.5 text-[9px] font-black text-white rounded-full ${item.badgeColor || 'bg-[#F95721]'}`}>
                                  {item.badge}
                                </span>
                              )}
                              {!allowed ? (
                                <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">Locked</span>
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-300" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Actions Drawer Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/70 flex gap-2">
              <button
                onClick={() => {
                  setMoreOpen(false);
                  setActiveTab('home');
                  showToast('Switched to Customer Store view');
                }}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Store className="w-4 h-4 text-orange-400" />
                <span>Customer Store</span>
              </button>

              <button
                onClick={() => {
                  setMoreOpen(false);
                  onSelectTab('notifications');
                }}
                className="px-3 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                {unreadNotifs > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#F95721]" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
