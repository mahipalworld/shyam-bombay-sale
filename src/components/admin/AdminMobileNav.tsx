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
  ChevronRight
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
}

export const AdminMobileNav: React.FC<AdminMobileNavProps> = ({
  currentTab,
  onSelectTab
}) => {
  const { adminRole, adminNotifications, returnRequests, products, storeSettings } = useStore();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const unreadNotifs = adminNotifications.filter(n => !n.read).length;
  const pendingReturns = returnRequests.filter(r => r.status === 'Pending').length;
  const lowStockCount = products.filter(p => p.stockCount <= storeSettings.lowStockThreshold).length;

  // RBAC permission checker
  const isAllowed = (tab: AdminActiveTab): boolean => {
    switch (adminRole) {
      case 'OWNER':
        return true;
      case 'MANAGER':
        return ['dashboard', 'products', 'categories', 'inventory', 'orders', 'returns', 'customers', 'payments', 'notifications'].includes(tab);
      case 'MARKETING':
        return ['dashboard', 'products', 'categories', 'homepage', 'offers', 'analytics', 'notifications'].includes(tab);
      case 'STAFF':
        return ['dashboard', 'orders', 'inventory', 'notifications'].includes(tab);
      default:
        return true;
    }
  };

  const primaryTabs: { tab: AdminActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { tab: 'products', label: 'Products', icon: Package },
    { tab: 'orders', label: 'Orders', icon: ShoppingBag },
    { tab: 'homepage', label: 'Homepage', icon: LayoutTemplate },
  ];

  const secondaryMenu: { 
    tab: AdminActiveTab; 
    label: string; 
    category: string; 
    icon: React.ComponentType<{ className?: string }>; 
    badge?: number; 
    badgeColor?: string;
  }[] = [
    { tab: 'categories', label: 'Categories & Taxonomy', category: 'Catalog', icon: Layers },
    { tab: 'storage', label: 'Media & AWS Storage', category: 'Catalog', icon: Cloud },
    { tab: 'offers', label: 'Offers & Coupons', category: 'Marketing', icon: Tag },
    { tab: 'inventory', label: 'Stock & Inventory', category: 'Operations', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-amber-500' },
    { tab: 'returns', label: 'Returns & Refunds', category: 'Operations', icon: RotateCcw, badge: pendingReturns > 0 ? pendingReturns : undefined, badgeColor: 'bg-red-500' },
    { tab: 'customers', label: 'Customer Directory', category: 'CRM', icon: Users },
    { tab: 'payments', label: 'Payments Ledger', category: 'Finance', icon: CreditCard },
    { tab: 'analytics', label: 'Analytics & Insights', category: 'Intelligence', icon: BarChart3 },
    { tab: 'notifications', label: 'Notifications Center', category: 'System', icon: Bell, badge: unreadNotifs > 0 ? unreadNotifs : undefined, badgeColor: 'bg-[#F95721]' },
    { tab: 'roles', label: 'Roles & Access Control', category: 'Security', icon: ShieldCheck },
    { tab: 'settings', label: 'Store & Business Settings', category: 'System', icon: Settings },
  ];

  const handleSelect = (tab: AdminActiveTab) => {
    onSelectTab(tab);
    setIsMoreOpen(false);
  };

  const isCurrentTabInMore = secondaryMenu.some(item => item.tab === currentTab);

  return (
    <>
      {/* Sticky Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200/90 px-2 py-1 pb-safe shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {primaryTabs.map((item) => {
            const allowed = isAllowed(item.tab);
            const active = currentTab === item.tab;
            const Icon = item.icon;

            if (!allowed) {
              return (
                <button
                  key={item.tab}
                  disabled
                  className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-gray-300 cursor-not-allowed opacity-40"
                  title="Restricted by your admin role"
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
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                  active 
                    ? 'text-[#F95721] font-bold scale-105' 
                    : 'text-gray-500 hover:text-gray-900 font-medium'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${active ? 'bg-orange-50 text-[#F95721]' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </button>
            );
          })}

          {/* More Drawer Trigger */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
              isCurrentTabInMore 
                ? 'text-[#F95721] font-bold scale-105' 
                : 'text-gray-500 hover:text-gray-900 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${isCurrentTabInMore ? 'bg-orange-50 text-[#F95721]' : ''}`}>
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">More</span>
            {(unreadNotifs > 0 || pendingReturns > 0 || lowStockCount > 0) && (
              <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-[#F95721] rounded-full ring-2 ring-white" />
            )}
          </button>
        </div>
      </nav>

      {/* Slide-Up "More" Options Sheet */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div 
            className="flex-1 w-full"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="bg-white rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border-t border-gray-100 max-w-lg mx-auto w-full">
            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F95721] flex items-center justify-center">
                  <Menu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">SBS Admin Navigation</h3>
                  <p className="text-[11px] text-gray-500">All business operational modules</p>
                </div>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Role indicator alert */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F95721]" />
                <span className="font-bold text-gray-800">Active Role: {adminRole}</span>
              </div>
              <span className="text-[10px] text-gray-500">RBAC Active</span>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 gap-2 pt-1">
              {secondaryMenu.map((item) => {
                const allowed = isAllowed(item.tab);
                const active = currentTab === item.tab;
                const Icon = item.icon;

                return (
                  <button
                    key={item.tab}
                    disabled={!allowed}
                    onClick={() => handleSelect(item.tab)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                      !allowed
                        ? 'opacity-40 bg-gray-50 border-gray-100 cursor-not-allowed text-gray-400'
                        : active
                        ? 'bg-orange-50/80 border-orange-200 text-[#F95721] shadow-xs'
                        : 'bg-white border-gray-100 hover:border-gray-200 text-gray-800 hover:bg-gray-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        active ? 'bg-[#F95721] text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold leading-tight">{item.label}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{item.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge !== undefined && (
                        <span className={`px-2 py-0.5 text-[10px] font-black text-white rounded-full ${item.badgeColor || 'bg-orange-500'}`}>
                          {item.badge}
                        </span>
                      )}
                      {!allowed ? (
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Locked</span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
