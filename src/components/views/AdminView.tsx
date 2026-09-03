'use client';

import React, { useState } from 'react';
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
    storeSettings,
    showToast,
    isEmailAuthorizedAdmin,
    getEffectiveAdminRole
  } = useStore();
  
  const { authUser, supabaseUser, isGoogleAuth, signInWithGoogle, signOut } = useAuth();
  const [currentTab, setCurrentTab] = useState<AdminActiveTab>('dashboard');

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHomepagePreviewOpen, setIsHomepagePreviewOpen] = useState(false);
  const [isAddEditProductOpen, setIsAddEditProductOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const unreadNotifs = adminNotifications.filter(n => !n.read).length;
  const pendingReturns = returnRequests.filter(r => r.status === 'Pending').length;
  const lowStockCount = products.filter(p => p.stockCount <= storeSettings.lowStockThreshold).length;

  const currentEmail = authUser?.email || supabaseUser?.email;
  const isAuthorizedAdmin = isGoogleAuth && isEmailAuthorizedAdmin(currentEmail);

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
  if (!isGoogleAuth) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 space-y-6 animate-fadeIn max-w-md mx-auto">
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
            Google Authentication Required
          </span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            SBS Store Admin Portal
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed max-w-sm">
            Access to executive dashboards, order processing, and catalog controls is restricted strictly to verified Google accounts.
          </p>
          <p className="text-[11px] text-gray-400 font-medium">
            Primary Executive Admin: <span className="font-mono text-gray-700 font-bold">mahipalstudent71@gmail.com</span>
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs rounded-2xl flex items-center justify-center gap-3 border border-gray-300 shadow-sm active:scale-98 transition-all hover:shadow-md"
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
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all"
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
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 space-y-6 animate-fadeIn max-w-md mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-red-100 text-red-500 flex items-center justify-center shadow-xl shadow-red-100">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider">
            Access Denied
          </span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Unauthorized Google Account
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your Google account <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{currentEmail}</span> is not registered in the SBS Store administration team.
          </p>
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-[11px] text-amber-900 text-left space-y-1 mt-2">
            <p className="font-bold">Need admin privileges?</p>
            <p className="text-[10px] text-amber-800">
              Please sign in using the Primary Admin account (<span className="font-mono font-semibold">mahipalstudent71@gmail.com</span>) or request an Owner to grant role access to your email.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={handleSwitchGoogleAccount}
            className="w-full py-3.5 bg-[#F95721] hover:bg-[#E44813] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 active:scale-98 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Switch to Admin Google Account</span>
          </button>
          <button
            onClick={() => setActiveTab('home')}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all"
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
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 flex selection:bg-[#F95721] selection:text-white">
      {/* ========================================================= */}
      {/* DESKTOP SIDEBAR (Visible on lg and larger displays) */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-gray-200/80 sticky top-0 h-screen overflow-y-auto no-scrollbar shadow-xs z-30 flex-shrink-0">
        {/* Brand & Store Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F95721] to-[#FF7E47] flex items-center justify-center text-white font-black text-base shadow-sm shadow-orange-500/20">
              SBS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-gray-900 leading-tight">
                  {storeSettings.storeName || 'SBS Store'}
                </span>
                <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-orange-100 text-[#F95721]">
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
              className="text-[#F95721] hover:underline flex items-center gap-0.5 text-[10px]"
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
                        adminRole === r.role ? 'bg-orange-50 text-[#F95721] font-bold' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs leading-tight">{r.label}</p>
                        <p className="text-[9px] text-gray-400">{r.desc}</p>
                      </div>
                      {adminRole === r.role && <Check className="w-4 h-4 text-[#F95721]" />}
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
            className="w-full py-2.5 bg-[#F95721] hover:bg-[#E44813] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 active:scale-95 transition-all"
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
                          ? 'bg-[#F95721] text-white shadow-sm shadow-orange-500/20'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-500'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && item.badge > 0 && (
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full text-white ${
                          active ? 'bg-white/20' : item.badgeColor || 'bg-[#F95721]'
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
              className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#F95721] rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all border border-orange-200/70 shadow-2xs"
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
