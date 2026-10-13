'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  Bell, 
  Send, 
  Save, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Tag, 
  Truck, 
  AlertTriangle, 
  ShoppingBag, 
  RotateCcw, 
  CreditCard, 
  Smartphone, 
  Layers, 
  Plus, 
  RefreshCw, 
  Clock, 
  Check, 
  X,
  Volume2,
  ExternalLink,
  ChevronRight,
  Filter,
  Users
} from 'lucide-react';
import { UserBroadcastNotification, AdminNotification } from '@/types';
import { 
  triggerBrowserPushNotification, 
  getNotificationPermissionState, 
  requestNotificationPermission 
} from '@/utils/pushNotifications';

export const NotificationsView: React.FC = () => {
  const { 
    userNotifications, 
    userNotificationDrafts,
    adminNotifications,
    sendBroadcastNotification,
    saveNotificationDraft,
    deleteNotificationDraft,
    deleteBroadcastNotification,
    markNotificationRead,
    clearAllNotifications,
    showToast,
    setActiveTab
  } = useStore();

  const [hubMode, setHubMode] = useState<'OPERATIONAL' | 'BROADCAST'>('OPERATIONAL');
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'order' | 'stock' | 'return' | 'payment'>('ALL');
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');

  // Broadcast Form State
  const [formData, setFormData] = useState<{
    id?: string;
    title: string;
    message: string;
    type: UserBroadcastNotification['type'];
    targetAudience: UserBroadcastNotification['targetAudience'];
    actionUrl: string;
    imageUrl: string;
  }>({
    title: '🔥 Midnight Flash Sale: Up to 50% OFF!',
    message: 'Exclusive 4-hour flash sale on Mini Washing Machines & Packet Sealers. Limited stock available!',
    type: 'deal',
    targetAudience: 'ALL',
    actionUrl: 'offers',
    imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80',
  });

  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    getNotificationPermissionState().then(setPermissionState);
  }, []);

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermissionState(res);
    if (res === 'granted') {
      showToast('Browser push notifications enabled! 🎉', 'success');
    } else if (res === 'denied') {
      showToast('Notifications are blocked in your browser settings.', 'error');
    }
  };

  const handleTestOnDevice = async () => {
    const title = formData.title.trim() || '🔥 SBS Flash Deal Alert!';
    const body = formData.message.trim() || 'Grab top kitchen gadgets at special prices today!';
    
    const result = await triggerBrowserPushNotification({
      title,
      body,
      image: formData.imageUrl.trim() || undefined,
      data: { url: '/' }
    });

    if (result.success) {
      showToast(`🔔 Test notification sent to your screen!`, 'success');
    } else {
      showToast(`⚠️ Could not show notification: ${result.error || 'Check browser permissions'}`, 'error');
    }
  };

  const handleSendBroadcast = () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      showToast('Please enter both title and message for broadcast', 'error');
      return;
    }
    setIsSending(true);
    sendBroadcastNotification({
      title: formData.title,
      message: formData.message,
      type: formData.type,
      targetAudience: formData.targetAudience,
      actionUrl: formData.actionUrl,
      imageUrl: formData.imageUrl || undefined,
    });
    setIsSending(false);
    showToast('Push broadcast sent to customer devices! 🚀');
  };

  // Marketing Preset Templates
  const templates = [
    {
      name: '⚡ Flash Sale Drop',
      title: '🔥 Midnight Flash Sale: Up to 50% OFF!',
      message: 'Exclusive 4-hour flash sale on Mini Washing Machines & Packet Sealers. Limited stock available!',
      type: 'deal' as const,
      actionUrl: 'offers',
      imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: '📦 New Arrival Drop',
      title: '✨ New Smart Gadgets Just Landed!',
      message: 'Explore our latest collection of cordless trimmers, vacuum containers, and smart home tools.',
      type: 'promo' as const,
      actionUrl: 'categories',
      imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: '🚚 Free Express Delivery',
      title: '🚚 Free Express Delivery Weekend!',
      message: 'Enjoy zero delivery fees across all orders with no minimum cart value today only.',
      type: 'system' as const,
      actionUrl: 'categories',
      imageUrl: '',
    },
  ];

  // Filter operational alerts
  const unreadAlertsCount = adminNotifications.filter(n => !n.read).length;
  const filteredAlerts = adminNotifications.filter(n => {
    if (alertFilter !== 'ALL' && n.type !== alertFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6 pb-28 animate-fadeIn">
      {/* 1. Header & Dual-Hub Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-[#F95721] uppercase tracking-wider">
              Communication & Activity Center
            </span>
            {unreadAlertsCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-[#F95721] text-white">
                {unreadAlertsCount} Unread
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-0.5">
            Notification Center
          </h1>
          <p className="text-xs text-slate-500">
            Monitor store activity stream or broadcast marketing push campaigns to customer devices.
          </p>
        </div>

        {/* Dual-Hub Segmented Switcher */}
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setHubMode('OPERATIONAL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              hubMode === 'OPERATIONAL'
                ? 'bg-white text-[#F95721] shadow-3xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Store Alerts ({adminNotifications.length})</span>
          </button>

          <button
            onClick={() => setHubMode('BROADCAST')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              hubMode === 'BROADCAST'
                ? 'bg-white text-[#F95721] shadow-3xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Customer Broadcasts</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* HUB 1: STORE OPERATIONAL ALERTS (Internal Stream) */}
      {/* ========================================================= */}
      {hubMode === 'OPERATIONAL' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Controls Bar: Filters & Actions */}
          <div className="bg-white border border-slate-200/80 p-3 sm:p-4 rounded-3xl shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar text-xs font-bold">
              {[
                { key: 'ALL', label: `All Alerts (${adminNotifications.length})` },
                { key: 'order', label: `Orders (${adminNotifications.filter(n => n.type === 'order').length})` },
                { key: 'stock', label: `Stock Alerts (${adminNotifications.filter(n => n.type === 'stock').length})` },
                { key: 'return', label: `Returns (${adminNotifications.filter(n => n.type === 'return').length})` },
                { key: 'payment', label: `Payments (${adminNotifications.filter(n => n.type === 'payment').length})` },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setAlertFilter(t.key as any)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                    alertFilter === t.key
                      ? 'bg-white text-[#F95721] shadow-3xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => {
                  adminNotifications.forEach(n => !n.read && markNotificationRead(n.id));
                  showToast('All notifications marked as read');
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>

              <button
                onClick={() => clearAllNotifications()}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Alert Stream Canvas */}
          <div className="space-y-2.5">
            {filteredAlerts.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center space-y-3 shadow-3xs">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">Inbox Zero! No unread alerts</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-0.5">
                    All store dispatches, stock levels, and customer returns are running smoothly.
                  </p>
                </div>
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const isOrder = alert.type === 'order';
                const isStock = alert.type === 'stock';
                const isReturn = alert.type === 'return';

                return (
                  <div
                    key={alert.id}
                    className={`bg-white border rounded-3xl p-4 sm:p-5 shadow-3xs transition-all flex items-start justify-between gap-3 ${
                      !alert.read ? 'border-orange-200/80 bg-orange-50/20' : 'border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-3xs ${
                        isOrder ? 'bg-blue-100 text-blue-600' : isStock ? 'bg-amber-100 text-amber-700' : isReturn ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {isOrder ? <ShoppingBag className="w-5 h-5" /> : isStock ? <AlertTriangle className="w-5 h-5" /> : isReturn ? <RotateCcw className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-black text-slate-900">{alert.title}</h3>
                          {!alert.read && (
                            <span className="w-2 h-2 rounded-full bg-[#F95721]" />
                          )}
                          <span className="text-[10px] text-slate-400">
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{alert.message}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!alert.read && (
                        <button
                          onClick={() => markNotificationRead(alert.id)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                          title="Mark as Read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* HUB 2: CUSTOMER MARKETING BROADCAST STUDIO */}
      {/* ========================================================= */}
      {hubMode === 'BROADCAST' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fadeIn">
          {/* Left Column: Broadcast Composer & Templates (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Quick Templates Strip */}
            <div className="bg-white border border-slate-200/80 p-3.5 sm:p-4 rounded-3xl shadow-3xs space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                1-Click Marketing Presets
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {templates.map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        title: tpl.title,
                        message: tpl.message,
                        type: tpl.type,
                        actionUrl: tpl.actionUrl,
                        imageUrl: tpl.imageUrl,
                      });
                      showToast(`Loaded "${tpl.name}" preset`);
                    }}
                    className="p-2.5 rounded-2xl bg-slate-50 hover:bg-orange-50 border border-slate-200/70 hover:border-orange-200 text-left transition-all group"
                  >
                    <p className="text-xs font-bold text-slate-900 group-hover:text-[#F95721] transition-colors">{tpl.name}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{tpl.title}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign Form */}
            <div className="bg-white border border-slate-200/80 p-4 sm:p-5 rounded-3xl shadow-3xs space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Notification Title <span className="text-[#F95721]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., 🔥 Weekend Flash Sale: 40% OFF!"
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-hidden focus:border-[#F95721] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Message Body <span className="text-[#F95721]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Engaging notification message for customers..."
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-xs text-slate-900 outline-hidden focus:border-[#F95721] focus:bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Target Audience
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 outline-hidden focus:border-[#F95721] focus:bg-white"
                  >
                    <option value="ALL">All Customers & Guests</option>
                    <option value="CUSTOMERS">Registered Buyers Only</option>
                    <option value="GUESTS">Guest Shoppers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Action Destination
                  </label>
                  <select
                    value={formData.actionUrl}
                    onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 outline-hidden focus:border-[#F95721] focus:bg-white"
                  >
                    <option value="offers">Deals & Coupons Page</option>
                    <option value="categories">Product Catalog</option>
                    <option value="cart">Customer Cart</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Banner Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2 text-xs text-slate-900 outline-hidden focus:border-[#F95721] focus:bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleTestOnDevice}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Test on My Screen</span>
                </button>

                <button
                  type="button"
                  disabled={isSending}
                  onClick={handleSendBroadcast}
                  className="px-5 py-2.5 bg-[#F95721] hover:bg-[#E44813] text-white font-black rounded-xl text-xs shadow-xs shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Push Broadcast Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Realistic Phone Lock-Screen Mockup (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-3xs space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Live Customer Lock-Screen Mockup
              </span>

              {/* Mobile Phone Mockup Frame */}
              <div className="bg-slate-900 rounded-[36px] p-4 text-white shadow-xl max-w-sm mx-auto relative overflow-hidden border-4 border-slate-800 aspect-[9/16] flex flex-col justify-between">
                {/* Phone Speaker Notch */}
                <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto" />

                {/* Clock */}
                <div className="text-center my-6 space-y-0.5">
                  <p className="text-4xl font-extralight tracking-tight">09:41</p>
                  <p className="text-[10px] text-slate-400 font-medium">Monday, 12 October</p>
                </div>

                {/* Lock Screen Notification Card */}
                <div className="bg-white/90 backdrop-blur-md text-slate-900 p-3.5 rounded-2xl shadow-lg border border-white/40 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-[#F95721] text-white flex items-center justify-center font-black text-[8px]">
                        SBS
                      </div>
                      <span>SBS STORE</span>
                    </div>
                    <span>now</span>
                  </div>

                  <p className="text-xs font-black text-slate-900 leading-tight">
                    {formData.title || 'Notification Headline'}
                  </p>
                  <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                    {formData.message || 'Notification content goes here...'}
                  </p>

                  {formData.imageUrl && (
                    <div className="rounded-xl overflow-hidden aspect-video mt-1.5 border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.imageUrl} alt="Push banner" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Bottom Lock Icon */}
                <div className="text-center text-[10px] text-slate-500 mt-auto pt-4">
                  Swipe up to open SBS Store
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
