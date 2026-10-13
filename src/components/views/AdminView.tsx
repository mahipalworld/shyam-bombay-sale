'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldAlert, 
  ShieldCheck,
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
  ChevronRight,
  ChevronLeft,
  Cloud,
  PanelLeftClose,
  PanelLeftOpen
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
import { MediaStorageView } from '../admin/views/MediaStorageView';
import { OffersView } from '../admin/views/OffersView';
import { InventoryView } from '../admin/views/InventoryView';
import { OrdersView } from '../admin/views/OrdersView';
import { ReturnsView } from '../admin/views/ReturnsView';
import { CustomersView } from '../admin/views/CustomersView';
import { PaymentsView } from '../admin/views/PaymentsView';
import { AnalyticsView } from '../admin/views/AnalyticsView';
import { NotificationsView } from '../admin/views/NotificationsView';
import { SettingsView } from '../admin/views/SettingsView';
import { RolesManagementView } from '../admin/views/RolesManagementView';

import { Product, Order, AdminRole } from '@/types';

export const AdminView: React.FC = () => {
  const { 
    setActiveTab, 
    adminRole, 
    setAdminRole, 
    adminNotifications, 
    returnRequests, 
    products, 
    orders,
    adminOrders,
    storeSettings,
    showToast,
    isEmailAuthorizedAdmin
  } = useStore();
  
  const { authUser, supabaseUser, isGoogleAuth, signInWithGoogle, signOut } = useAuth();
  const [currentTab, setCurrentTab] = useState<AdminActiveTab>('dashboard');

  // Sidebar collapsible state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHomepagePreviewOpen, setIsHomepagePreviewOpen] = useState(false);
  const [isAddEditProductOpen, setIsAddEditProductOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const allOrdersList = adminOrders && adminOrders.length > 0 ? adminOrders : orders;
  const pendingOrders = allOrdersList.filter(o => 
    o.status !== 'Cancelled' && 
    o.status !== 'Delivered' && 
    (o.status === 'Processing' || o.paymentStatus === 'CUSTOMER_CONFIRMED' || (o.status === 'To Pay' && o.paymentStatus !== 'PAYMENT_FAILED' && o.paymentStatus !== 'CANCELLED'))
  ).length;
  const unreadNotifs = adminNotifications.filter(n => !n.read).length;
  const pendingReturns = returnRequests.filter(r => r.status === 'Pending').length;
  const lowStockCount = products.filter(p => p.stockCount <= storeSettings.lowStockThreshold).length;

  const currentEmail = authUser?.email || supabaseUser?.email;
  const isDevOrLocal = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hash.includes('admin')
  );
  const isAuthorizedAdmin = isDevOrLocal || (isGoogleAuth && isEmailAuthorizedAdmin(currentEmail));

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    const res = await signInWithGoogle();
    if (res?.error) {
      showToast(res.error, 'error');
      setIsSigningIn(false);
    }
  };

  const handleSwitchGoogleAccount = async () => {
    await signOut();
    await handleGoogleSignIn();
  };

  // 1. Not signed in with Google
  if (!isGoogleAuth && !isDevOrLocal) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center text-center p-6 space-y-6 animate-fadeIn max-w-md mx-auto">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#F95721] to-[#FF7E47] text-white flex items-center justify-center shadow-xl shadow-orange-500/20">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-orange-100 text-[#F95721] text-[10px] font-black uppercase tracking-wider">
            Executive Portal Protection
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            SBS Store Admin Portal
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
            Access to live executive analytics, order processing, and catalog operations is restricted strictly to verified team accounts.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl flex items-center justify-center gap-3 border border-slate-300 shadow-xs active:scale-98 transition-all hover:shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isSigningIn ? 'Connecting to Google...' : 'Sign In with Google'}</span>
          </button>

          <button
            onClick={() => setActiveTab('home')}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Customer Store</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Signed in with Google, but email is NOT authorized in admin list
  if (isGoogleAuth && !isAuthorizedAdmin) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center text-center p-6 space-y-6 animate-fadeIn max-w-md mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-red-100 text-red-500 flex items-center justify-center shadow-xl shadow-red-100">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider">
            Access Restricted
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Unauthorized Google Account
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your Google account <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{currentEmail}</span> is not registered in the SBS store management team.
          </p>
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-[11px] text-amber-900 text-left space-y-1 mt-2">
            <p className="font-bold">Need admin privileges?</p>
            <p className="text-[10px] text-amber-800">
              Please sign in using your designated Admin account or request a store Owner to grant role access.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={handleSwitchGoogleAccount}
            className="w-full py-3.5 bg-[#F95721] hover:bg-[#E44813] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 active:scale-98 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Switch Google Account</span>
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
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
        return ['dashboard', 'products', 'categories', 'storage', 'inventory', 'orders', 'returns', 'customers', 'payments', 'notifications'].includes(tab);
      case 'MARKETING':
        return ['dashboard', 'products', 'categories', 'storage', 'homepage', 'offers', 'analytics', 'notifications'].includes(tab);
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
      group: 'Core Storefront',
      items: [
        { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { tab: 'products', label: 'Products Catalog', icon: Package },
        { tab: 'categories', label: 'Categories & Taxonomy', icon: Layers },
        { tab: 'storage', label: 'Media & AWS Storage', icon: Cloud },
        { tab: 'homepage', label: 'Homepage Manager', icon: LayoutTemplate },
      ]
    },
    {
      group: 'Orders & Sales',
      items: [
        { tab: 'orders', label: 'Customer Orders', icon: ShoppingBag, badge: pendingOrders > 0 ? pendingOrders : undefined, badgeColor: 'bg-blue-600' },
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
        { tab: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifs > 0 ? unreadNotifs : undefined, badgeColor: 'bg-[#F95721]' },
        { tab: 'roles', label: 'Role & Access Control', icon: ShieldCheck },
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
      case 'storage':
        return <MediaStorageView />;
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
      case 'roles':
        return <RolesManagementView />;
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
    <div className="min-h-screen bg-[#F6F8FA] text-slate-900 flex selection:bg-[#F95721] selection:text-white antialiased">
      {/* ========================================================= */}
      {/* DESKTOP SIDEBAR (Collapsible 280px <-> 72px) */}
      {/* ========================================================= */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200/80 sticky top-0 h-screen overflow-y-auto no-scrollbar shadow-xs z-30 transition-all duration-300 flex-shrink-0 ${
          isSidebarCollapsed ? 'w-20' : 'w-64 xl:w-72'
        }`}
      >
        {/* Brand & Store Header */}
        <div className={`border-b border-slate-100 flex items-center transition-all ${
          isSidebarCollapsed ? 'p-3.5 justify-center' : 'p-4 justify-between'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F95721] to-[#FF7E47] flex items-center justify-center text-white font-black text-sm shadow-sm shadow-orange-500/20 flex-shrink-0">
              SBS
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm text-slate-900 leading-tight truncate">
                    {storeSettings.storeName || 'SBS Store'}
                  </span>
                  <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-orange-100 text-[#F95721] flex-shrink-0">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Management Suite
                </p>
              </div>
            )}
          </div>

          {/* Collapse/Expand Toggle on header */}
          {!isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              title="Collapse sidebar to icon rail"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Role Selector Card in Sidebar (Expanded View) */}
        {!isSidebarCollapsed ? (
          <div className="p-3 mx-3 my-2.5 bg-slate-50 border border-slate-200/70 rounded-2xl relative">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-0.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00A859]" />
                Role: {adminRole}
              </span>
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="text-[#F95721] hover:underline flex items-center gap-0.5 text-[10px] font-black"
              >
                <span>Switch</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {roles.find(r => r.role === adminRole)?.desc}
            </p>

            {isRoleDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setIsRoleDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn">
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
                          <p className="font-bold text-xs leading-tight">{r.label}</p>
                          <p className="text-[9px] text-slate-400">{r.desc}</p>
                        </div>
                        {adminRole === r.role && <Check className="w-4 h-4 text-[#F95721]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-2 flex justify-center my-1">
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="w-10 h-10 rounded-2xl hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="w-4.5 h-4.5" />
            </button>
          </div>
        )}

        {/* Quick Action Button: Add New Product */}
        <div className={`px-3 pb-2 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={handleOpenAddProduct}
            className={`bg-[#F95721] hover:bg-[#E44813] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xs shadow-orange-500/20 active:scale-95 transition-all ${
              isSidebarCollapsed ? 'w-10 h-10 p-0' : 'w-full py-2.5 text-xs'
            }`}
            title="Add New Catalog Product"
          >
            <Plus className="w-4 h-4" />
            {!isSidebarCollapsed && <span>Add New Product</span>}
          </button>
        </div>

        {/* Navigation Groups List */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto no-scrollbar">
          {navGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              {!isSidebarCollapsed && (
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-3">
                  {grp.group}
                </span>
              )}
              <div className="space-y-0.5 mt-0.5">
                {grp.items.map((item) => {
                  const allowed = isAllowed(item.tab);
                  const active = currentTab === item.tab;
                  const Icon = item.icon;

                  if (!allowed) {
                    return (
                      <div
                        key={item.tab}
                        className={`flex items-center rounded-xl text-slate-300 cursor-not-allowed opacity-40 text-xs ${
                          isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                        }`}
                        title="Restricted by role"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          {!isSidebarCollapsed && <span>{item.label}</span>}
                        </div>
                        {!isSidebarCollapsed && (
                          <span className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.2 rounded font-bold">Locked</span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.tab}
                      onClick={() => setCurrentTab(item.tab)}
                      className={`w-full flex items-center rounded-2xl text-xs font-bold transition-all group relative ${
                        isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                      } ${
                        active
                          ? 'bg-[#F95721] text-white shadow-sm shadow-orange-500/20'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'}`} />
                        {!isSidebarCollapsed && <span>{item.label}</span>}
                      </div>

                      {item.badge && item.badge > 0 && (
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full text-white ${
                          active ? 'bg-white/20' : item.badgeColor || 'bg-[#F95721]'
                        } ${isSidebarCollapsed ? 'absolute top-1 right-1 w-2 h-2 p-0 text-[0px]' : ''}`}>
                          {!isSidebarCollapsed ? item.badge : ''}
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
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <button
            onClick={() => {
              setActiveTab('home');
              showToast('Switched to Customer Storefront');
            }}
            className={`bg-slate-900 hover:bg-black text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs ${
              isSidebarCollapsed ? 'w-10 h-10 mx-auto p-0' : 'w-full py-2.5 text-xs'
            }`}
            title="Open Customer Storefront"
          >
            <Store className="w-4 h-4 text-orange-400" />
            {!isSidebarCollapsed && <span>Open Store</span>}
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN ADMIN WORKSPACE (Full width & fluid responsive) */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header (Visible on screens < lg) */}
        <div className="lg:hidden">
          <AdminHeader
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenNotifications={() => setCurrentTab('notifications')}
            onOpenHomepagePreview={() => setIsHomepagePreviewOpen(true)}
            onOpenMenu={() => setIsMobileDrawerOpen(true)}
          />
        </div>

        {/* Desktop Top Action Toolbar (Visible on lg and larger) */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <h2 className="text-sm xl:text-base font-black text-slate-900">{getSectionTitle()}</h2>
            <span className="ml-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Global Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-600 rounded-xl text-xs font-semibold transition-colors border border-slate-200/60"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search products, orders, customers...</span>
              <kbd className="hidden xl:inline-block px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[9px] text-slate-500 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Live Storefront Preview */}
            <button
              onClick={() => setIsHomepagePreviewOpen(true)}
              className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#F95721] rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all border border-orange-200/70 shadow-3xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => setCurrentTab('notifications')}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors border border-slate-200/60"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F95721] text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
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
              className="p-2 rounded-xl bg-slate-900 hover:bg-black text-white transition-transform hover:scale-105 shadow-sm"
              title="Open Customer Store"
            >
              <Store className="w-4 h-4 text-orange-400" />
            </button>
          </div>
        </header>

        {/* View Canvas Container */}
        <main className="flex-1 w-full max-w-[1536px] mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-8">
          {renderCurrentView()}
        </main>
      </div>

      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAVIGATION & SLIDE-OUT DRAWER */}
      {/* ========================================================= */}
      <div className="lg:hidden">
        <AdminMobileNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isDrawerOpen={isMobileDrawerOpen}
          onOpenDrawerChange={(open) => setIsMobileDrawerOpen(open)}
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
