'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldAlert, 
  LogIn, 
  ArrowLeft,
  LayoutDashboard,
  Package,
  Layers,
  LayoutTemplate,
  Tag,
  Boxes,
  ShoppingBag,
  RotateCcw,
  Users,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  Store,
  Sparkles,
  Search,
  Plus,
  ChevronDown,
  Check,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AdminHeader } from '../admin/AdminHeader';
import { AdminMobileNav, AdminActiveTab } from '../admin/AdminMobileNav';
import { AdminGlobalSearchModal } from '../admin/AdminGlobalSearchModal';
import { HomepagePreviewModal } from '../admin/HomepagePreviewModal';
import { AddEditProductModal } from '../admin/AddEditProductModal';
import { OrderDetailsModal } from '../admin/OrderDetailsModal';

// Admin Views
import { DashboardView } from '../admin/views/DashboardView';
import { ProductsView } from '../admin/views/ProductsView';
import { CategoriesView } from '../admin/views/CategoriesView';
import { HomepageManagerView } from '../admin/views/HomepageManagerView';
import { OffersView } from '../admin/views/OffersView';
import { InventoryView } from '../admin/views/InventoryView';
import { OrdersView } from '../admin/views/OrdersView';
import { ReturnsView } from '../admin/views/ReturnsView';
import { CustomersView } from '../admin/views/CustomersView';
import { PaymentsView } from '../admin/views/PaymentsView';
import { AnalyticsView } from '../admin/views/AnalyticsView';
import { NotificationsView } from '../admin/views/NotificationsView';
import { SettingsView } from '../admin/views/SettingsView';

import { Product, Order, AdminRole } from '@/types';

export const AdminView: React.FC = () => {
  const { 
    setActiveTab, 
    adminRole, 
    setAdminRole, 
    adminNotifications, 
    returnRequests, 
    products, 
    storeSettings,
    showToast
  } = useStore();
  
  const { authUser, openAuthModal } = useAuth();
  const [isDemoAdmin, setIsDemoAdmin] = useState(false);
  const [currentTab, setCurrentTab] = useState<AdminActiveTab>('dashboard');

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHomepagePreviewOpen, setIsHomepagePreviewOpen] = useState(false);
  const [isAddEditProductOpen, setIsAddEditProductOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const unreadNotifs = adminNotifications.filter(n => !n.read).length;
  const pendingReturns = returnRequests.filter(r => r.status === 'Pending').length;
  const lowStockCount = products.filter(p => p.stockCount <= storeSettings.lowStockThreshold).length;

  if (!authUser && !isDemoAdmin) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center p-6 space-y-5 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-orange-100 text-[#F35C16] flex items-center justify-center shadow-lg shadow-orange-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="max-w-sm space-y-2">
          <h2 className="text-xl font-black text-gray-900">Admin Access Required</h2>
          <p className="text-xs text-gray-600">
            Please sign in to your authorized SBS Store account to access the store executive dashboard.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
          <button
            onClick={() => setIsDemoAdmin(true)}
            className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-gray-900/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Open Demo Admin</span>
          </button>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 bg-[#F35C16] hover:bg-[#e04a08] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-orange-200 active:scale-95 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </div>
    );
  }

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

  const navGroups: {
    group: string;
    items: {
      tab: AdminActiveTab;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: number;
      badgeColor?: string;
    }[];
  }[] = [
    {
      group: 'Core Store',
      items: [
        { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { tab: 'products', label: 'Products Catalog', icon: Package },
        { tab: 'categories', label: 'Categories & Taxonomy', icon: Layers },
        { tab: 'homepage', label: 'Homepage Manager', icon: LayoutTemplate },
      ]
    },
    {
      group: 'Orders & Sales',
      items: [
        { tab: 'orders', label: 'Customer Orders', icon: ShoppingBag },
        { tab: 'returns', label: 'Returns & Refunds', icon: RotateCcw, badge: pendingReturns > 0 ? pendingReturns : undefined, badgeColor: 'bg-red-500' },
        { tab: 'payments', label: 'Payments Ledger', icon: CreditCard },
      ]
    },
    {
      group: 'Operations & CRM',
      items: [
        { tab: 'inventory', label: 'Stock & Inventory', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-amber-500' },
        { tab: 'offers', label: 'Offers & Coupons', icon: Tag },
        { tab: 'customers', label: 'Customer Directory', icon: Users },
      ]
    },
    {
      group: 'Intelligence & Config',
      items: [
        { tab: 'analytics', label: 'Analytics & Insights', icon: BarChart3 },
        { tab: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifs > 0 ? unreadNotifs : undefined, badgeColor: 'bg-[#F35C16]' },
        { tab: 'settings', label: 'Store Settings', icon: Settings },
      ]
    }
  ];

  const roles: { role: AdminRole; label: string; desc: string }[] = [
    { role: 'OWNER', label: 'Owner', desc: 'Full store access & all features' },
    { role: 'MANAGER', label: 'Store Manager', desc: 'Catalog, Orders, Customers' },
    { role: 'MARKETING', label: 'Marketing Head', desc: 'Homepage, Offers, Analytics' },
    { role: 'STAFF', label: 'Operations Staff', desc: 'Orders & Inventory' },
  ];

  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setIsAddEditProductOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setProductToEdit(p);
    setIsAddEditProductOpen(true);
  };

  const handleOpenOrderDetails = (o: Order) => {
    setSelectedOrder(o);
  };

  const renderCurrentView = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigateToTab={(t) => setCurrentTab(t)}
            onOpenAddProduct={handleOpenAddProduct}
            onOpenOrderDetails={handleOpenOrderDetails}
          />
        );
      case 'products':
        return (
          <ProductsView
            onOpenAddModal={handleOpenAddProduct}
            onOpenEditModal={handleOpenEditProduct}
          />
        );
      case 'categories':
        return <CategoriesView />;
      case 'homepage':
        return (
          <HomepageManagerView
            onOpenPreview={() => setIsHomepagePreviewOpen(true)}
          />
        );
      case 'offers':
        return <OffersView />;
      case 'inventory':
        return <InventoryView />;
      case 'orders':
        return (
          <OrdersView
            onOpenOrderDetails={handleOpenOrderDetails}
          />
        );
      case 'returns':
        return <ReturnsView />;
      case 'customers':
        return <CustomersView />;
      case 'payments':
        return <PaymentsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView
            onNavigateToTab={(t) => setCurrentTab(t)}
            onOpenAddProduct={handleOpenAddProduct}
            onOpenOrderDetails={handleOpenOrderDetails}
          />
        );
    }
  };

  const getSectionTitle = () => {
    for (const grp of navGroups) {
      const match = grp.items.find(i => i.tab === currentTab);
      if (match) return match.label;
    }
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 flex selection:bg-[#F35C16] selection:text-white">
      {/* ========================================================= */}
      {/* DESKTOP SIDEBAR (Visible on lg and larger displays) */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-gray-200/80 sticky top-0 h-screen overflow-y-auto no-scrollbar shadow-xs z-30 flex-shrink-0">
        {/* Brand & Store Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F35C16] to-[#FF7E47] flex items-center justify-center text-white font-black text-base shadow-sm shadow-orange-500/20">
              SBS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-gray-900 leading-tight">
                  {storeSettings.storeName || 'SBS Store'}
                </span>
                <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-orange-100 text-[#F35C16]">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Management Suite</p>
            </div>
          </div>
        </div>

        {/* Role Selector Card in Sidebar */}
        <div className="p-3 mx-3 my-3 bg-gray-50/80 border border-gray-200/60 rounded-2xl relative">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00A859] animate-pulse" />
              Role: {adminRole}
            </span>
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="text-[#F35C16] hover:underline flex items-center gap-0.5 text-[10px]"
            >
              <span>Switch</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[10px] text-gray-400">
            {roles.find(r => r.role === adminRole)?.desc}
          </p>

          {isRoleDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-transparent" 
                onClick={() => setIsRoleDropdownOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-fadeIn">
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
                        <p className="font-bold text-xs leading-tight">{r.label}</p>
                        <p className="text-[9px] text-gray-400">{r.desc}</p>
                      </div>
                      {adminRole === r.role && <Check className="w-4 h-4 text-[#F35C16]" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Action Button in Sidebar */}
        <div className="px-3 pb-2">
          <button
            onClick={handleOpenAddProduct}
            className="w-full py-2.5 bg-[#F35C16] hover:bg-[#E04F0E] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Navigation Groups List */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto no-scrollbar">
          {navGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-3">
                {grp.group}
              </span>
              <div className="space-y-0.5 mt-1">
                {grp.items.map((item) => {
                  const allowed = isAllowed(item.tab);
                  const active = currentTab === item.tab;
                  const Icon = item.icon;

                  if (!allowed) {
                    return (
                      <div
                        key={item.tab}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-gray-300 cursor-not-allowed opacity-40 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.2 rounded">Locked</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.tab}
                      onClick={() => setCurrentTab(item.tab)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-bold transition-all ${
                        active
                          ? 'bg-[#F35C16] text-white shadow-sm shadow-orange-500/20'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-500'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && item.badge > 0 && (
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full text-white ${
                          active ? 'bg-white/20' : item.badgeColor || 'bg-[#F35C16]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer: Customer Store Switcher */}
        <div className="p-3 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => {
              setActiveTab('home');
              showToast('Switched to Customer Storefront');
            }}
            className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Store className="w-4 h-4 text-orange-400" />
            <span>Open Customer Store</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN ADMIN WORKSPACE (Full width & responsive) */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden">
          <AdminHeader
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenNotifications={() => setCurrentTab('notifications')}
            onOpenHomepagePreview={() => setIsHomepagePreviewOpen(true)}
          />
        </div>

        {/* Desktop Top Action Toolbar (Hidden on Mobile) */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white/90 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <h2 className="text-base font-black text-gray-900">{getSectionTitle()}</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200/80 text-gray-600 rounded-xl text-xs font-semibold transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <span>Search products, orders, customers...</span>
              <kbd className="hidden xl:inline-block px-1.5 py-0.5 bg-white border border-gray-300 rounded text-[9px] text-gray-500 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Live Storefront Preview */}
            <button
              onClick={() => setIsHomepagePreviewOpen(true)}
              className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#F35C16] rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all border border-orange-200/70 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => setCurrentTab('notifications')}
              className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F35C16] text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {/* Customer Store Link */}
            <button
              onClick={() => {
                setActiveTab('home');
                showToast('Switched to Customer Store');
              }}
              className="p-2 rounded-xl bg-gray-900 hover:bg-black text-white transition-transform hover:scale-105"
              title="Go to Customer Store"
            >
              <Store className="w-4 h-4 text-orange-400" />
            </button>
          </div>
        </header>

        {/* View Canvas Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {renderCurrentView()}
        </main>
      </div>

      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAVIGATION (Hidden on Desktop) */}
      {/* ========================================================= */}
      <div className="lg:hidden">
        <AdminMobileNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />
      </div>

      {/* ========================================================= */}
      {/* GLOBAL MODALS */}
      {/* ========================================================= */}
      <AdminGlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateToTab={(tab) => setCurrentTab(tab)}
        onOpenProductEdit={handleOpenEditProduct}
        onOpenOrderDetails={handleOpenOrderDetails}
      />

      <HomepagePreviewModal
        isOpen={isHomepagePreviewOpen}
        onClose={() => setIsHomepagePreviewOpen(false)}
      />

      <AddEditProductModal
        isOpen={isAddEditProductOpen}
        onClose={() => setIsAddEditProductOpen(false)}
        productToEdit={productToEdit}
      />

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};
