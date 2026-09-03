'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  Bell, 
  Send, 
  Save, 
  FileText, 
  History, 
  ShieldAlert, 
  Sparkles, 
  Tag, 
  Truck, 
  AlertTriangle, 
  ShoppingBag, 
  RotateCcw, 
  CreditCard,
  Trash2,
  CheckCircle2,
  Users,
  Smartphone,
  ExternalLink,
  Layers,
  ArrowRight,
  Eye,
  Plus,
  RefreshCw,
  Clock,
  Volume2,
  Check
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
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'BROADCAST' | 'DRAFTS' | 'HISTORY' | 'ALERTS'>('BROADCAST');
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    getNotificationPermissionState().then(setPermissionState);
  }, []);

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermissionState(res);
    if (res === 'granted') {
      showToast('Browser notifications enabled! 🎉', 'success');
    } else if (res === 'denied') {
      showToast('Notifications are blocked in your browser settings. Please click the padlock icon in URL bar to enable.', 'error');
    }
  };

  const handleTestOnDevice = async () => {
    const title = formData.title.trim() || '🔥 Weekend Flash Sale: 40% OFF!';
    const body = formData.message.trim() || 'Grab mini washing machines and smart kitchen sealers at half price today!';
    
    const result = await triggerBrowserPushNotification({
      title,
      body,
      image: formData.imageUrl.trim() || undefined,
      data: { url: '/' }
    });

    if (result.success) {
      showToast(`🔔 Test notification sent to your screen via ${result.method === 'service_worker' ? 'Service Worker' : 'Browser Notification'}!`, 'success');
    } else {
      if (result.permission === 'denied') {
        showToast('❌ Permission denied: Please allow notifications in your browser', 'error');
      } else if (result.permission === 'unsupported') {
        showToast('⚠️ Notifications not supported in this browser window', 'error');
      } else {
        showToast(`⚠️ Could not show notification: ${result.error || 'Unknown error'}`, 'error');
      }
    }
  };

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
    title: '',
    message: '',
    type: 'deal',
    targetAudience: 'ALL',
    actionUrl: 'offers',
    imageUrl: '',
  });

  const [isSending, setIsSending] = useState(false);

  // Quick Preset Templates
  const templates: Array<{
    name: string;
    icon: string;
    title: string;
    message: string;
    type: UserBroadcastNotification['type'];
    actionUrl: string;
    imageUrl: string;
  }> = [
    {
      name: '⚡ Midnight Flash Sale',
      icon: '⚡',
      title: '🔥 Midnight Flash Sale: Up to 50% OFF!',
      message: 'Exclusive 4-hour flash sale on Mini Washing Machines & Packet Sealers. Limited stock available!',
      type: 'deal',
      actionUrl: 'offers',
      imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: '📦 New Arrival Drop',
      icon: '📦',
      title: '✨ New Smart Gadgets Just Landed!',
      message: 'Explore our latest collection of cordless trimmers, vacuum containers, and smart home tools.',
      type: 'promo',
      actionUrl: 'categories',
      imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: '🚚 Free Express Delivery',
      icon: '🚚',
      title: '🚚 Free Express Delivery Weekend!',
      message: 'Enjoy zero delivery fees across all products with no minimum order requirement today only.',
      type: 'system',
      actionUrl: 'categories',
      imageUrl: '',
    },
    {
      name: '🎁 20% Extra Coupon',
      icon: '🎁',
      title: '🎉 Flat 20% OFF: Use Code SMART20',
      message: 'Special holiday savings for you. Apply code SMART20 at checkout for instant discounts.',
      type: 'promo',
      actionUrl: 'offers',
      imageUrl: '',
    },
  ];

  const applyTemplate = (tpl: typeof templates[0]) => {
    setFormData({
      ...formData,
      title: tpl.title,
      message: tpl.message,
      type: tpl.type,
      actionUrl: tpl.actionUrl,
      imageUrl: tpl.imageUrl,
    });
    showToast(`Loaded template: "${tpl.name}" ✨`);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      showToast('Please enter both title and message', 'error');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      sendBroadcastNotification({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        targetAudience: formData.targetAudience,
        actionUrl: formData.actionUrl,
        imageUrl: formData.imageUrl.trim() || undefined,
      });

      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'deal',
        targetAudience: 'ALL',
        actionUrl: 'offers',
        imageUrl: '',
      });
      setIsSending(false);
      setActiveTab('HISTORY');
    }, 400);
  };

  const handleSaveDraft = () => {
    if (!formData.title.trim()) {
      showToast('Please enter a title to save draft', 'error');
      return;
    }

    saveNotificationDraft({
      id: formData.id,
      title: formData.title,
      message: formData.message,
      type: formData.type,
      targetAudience: formData.targetAudience,
      actionUrl: formData.actionUrl,
      imageUrl: formData.imageUrl.trim() || undefined,
    });

    setFormData({
      title: '',
      message: '',
      type: 'deal',
      targetAudience: 'ALL',
      actionUrl: 'offers',
      imageUrl: '',
    });
    setActiveTab('DRAFTS');
  };

  const loadDraftToComposer = (draft: UserBroadcastNotification) => {
    setFormData({
      id: draft.id,
      title: draft.title,
      message: draft.message,
      type: draft.type,
      targetAudience: draft.targetAudience,
      actionUrl: draft.actionUrl || 'offers',
      imageUrl: draft.imageUrl || '',
    });
    setActiveTab('BROADCAST');
    showToast('Draft loaded in Broadcast Studio 📝');
  };

  const getAdminIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'order': return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      case 'stock': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'return': return <RotateCcw className="w-4 h-4 text-red-500" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-[#F95721]" />;
    }
  };

  return (
    <div className="space-y-6 pb-28 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Notification & Push Studio</span>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-[#F95721] text-xs font-black">
              LIVE
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Broadcast web push alerts, flash sale announcements and manage drafts
          </p>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-2xl bg-white border border-gray-100 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Sent</span>
            <span className="text-xs font-black text-gray-900">{userNotifications.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-2xl bg-white border border-gray-100 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Drafts</span>
            <span className="text-xs font-black text-[#F95721]">{userNotificationDrafts.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-2xl bg-white border border-gray-100 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Audience</span>
            <span className="text-xs font-black text-[#00A859]">1,450+</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex bg-gray-100/90 p-1.5 rounded-2xl gap-1.5 overflow-x-auto no-scrollbar text-xs font-bold">
        <button
          onClick={() => setActiveTab('BROADCAST')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'BROADCAST'
              ? 'bg-white text-[#F95721] shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Send Push Alert</span>
        </button>

        <button
          onClick={() => setActiveTab('DRAFTS')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'DRAFTS'
              ? 'bg-white text-[#F95721] shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Drafts ({userNotificationDrafts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'HISTORY'
              ? 'bg-white text-[#F95721] shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Sent History</span>
        </button>

        <button
          onClick={() => setActiveTab('ALERTS')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'ALERTS'
              ? 'bg-white text-[#F95721] shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>System Alerts ({adminNotifications.filter(n => !n.read).length})</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: COMPOSE & SEND BROADCAST */}
      {/* ==================================================== */}
      {activeTab === 'BROADCAST' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: 7 Columns */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1-Click Templates Strip */}
            <div className="bg-gradient-to-r from-orange-50/70 via-white to-orange-50/40 border border-orange-200/80 rounded-3xl p-4 space-y-2.5 shadow-2xs">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F95721]" /> Quick 1-Click Campaign Templates
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {templates.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="p-2.5 rounded-2xl bg-white border border-gray-100 hover:border-orange-300 hover:bg-orange-50 text-left transition-all tap-active shadow-2xs group"
                  >
                    <span className="text-base block mb-1">{tpl.icon}</span>
                    <span className="text-[11px] font-bold text-gray-800 group-hover:text-[#F95721] line-clamp-1 block">
                      {tpl.name.replace(/^[^\s]+\s*/, '')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Device Permission & Quick Test Strip */}
            <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-2xl flex items-center justify-center ${
                  permissionState === 'granted' 
                    ? 'bg-green-100 text-green-700' 
                    : permissionState === 'denied' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-orange-100 text-[#F95721]'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">Your Browser Push Status:</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      permissionState === 'granted'
                        ? 'bg-green-100 text-green-700'
                        : permissionState === 'denied'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {permissionState === 'granted' ? '✅ Enabled' : permissionState === 'denied' ? '❌ Blocked' : '⚠️ Click to Allow'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {permissionState === 'granted' 
                      ? 'This device will receive instant pop-up notifications.'
                      : permissionState === 'denied'
                      ? 'Blocked in browser settings. Unblock in browser URL bar to test.'
                      : 'Click Allow to test real push notifications on your screen.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {permissionState !== 'granted' && (
                  <button
                    type="button"
                    onClick={handleRequestPermission}
                    className="px-3 py-2 bg-gradient-to-r from-[#F95721] to-[#FF7A3D] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Enable Push</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleTestOnDevice}
                  className="px-3 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                  <span>Send Test Push</span>
                </button>
              </div>
            </div>

            {/* Campaign Form */}
            <form onSubmit={handleSendBroadcast} className="bg-white border border-gray-100 rounded-3xl p-5 space-y-4 shadow-subtle">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#F95721]" />
                  <span>{formData.id ? 'Edit & Dispatch Campaign' : 'Compose Notification'}</span>
                </h3>
                {formData.id && (
                  <button
                    type="button"
                    onClick={() => setFormData({ title: '', message: '', type: 'deal', targetAudience: 'ALL', actionUrl: 'offers', imageUrl: '' })}
                    className="text-xs text-gray-400 hover:text-gray-700"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
                  <span>Notification Title *</span>
                  <span className="text-[10px] text-gray-400 font-normal">{formData.title.length}/65 chars</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🔥 Weekend Flash Sale: 40% OFF!"
                  value={formData.title}
                  maxLength={65}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 outline-none focus:border-[#F95721] focus:bg-white transition-all"
                />
              </div>

              {/* Message Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
                  <span>Message Body *</span>
                  <span className="text-[10px] text-gray-400 font-normal">{formData.message.length}/180 chars</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type your message text here..."
                  value={formData.message}
                  maxLength={180}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 outline-none focus:border-[#F95721] focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Type & Target Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">Notification Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-800 outline-none focus:border-[#F95721] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="deal">🔥 Flash Deal / Discount</option>
                    <option value="promo">✨ New Arrival / Promotion</option>
                    <option value="system">📦 Order & Shipping Notice</option>
                    <option value="alert">⚠️ Important Alert</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">Target Segment</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-800 outline-none focus:border-[#F95721] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="ALL">🌐 All Users (1,450+ App Installs)</option>
                    <option value="CUSTOMERS">👥 Registered Members (980+)</option>
                    <option value="GUESTS">👤 Guest Shoppers (470+)</option>
                  </select>
                </div>
              </div>

              {/* Destination Action Link & Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">Destination Action</label>
                  <select
                    value={formData.actionUrl}
                    onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-800 outline-none focus:border-[#F95721] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="offers">🎉 Offers & Today&apos;s Deals</option>
                    <option value="categories">📂 All Categories</option>
                    <option value="cleaning">🧹 Cleaning Category</option>
                    <option value="kitchen">🍳 Kitchen Utilities</option>
                    <option value="personal-care">🪒 Personal Care</option>
                    <option value="home-storage">📦 Home Storage</option>
                    <option value="cart">🛒 User Cart</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800">Banner Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 outline-none focus:border-[#F95721] focus:bg-white transition-all"
                  >
                  </input>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full sm:flex-1 py-3 bg-gradient-to-r from-[#F95721] to-[#FF7A3D] hover:from-[#E44813] hover:to-[#F95721] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-float active:scale-98 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Sending Broadcast...' : '🚀 Send Push Notification Now'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestOnDevice}
                  className="w-full sm:w-auto px-4 py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                  title="Test notification directly on this browser screen"
                >
                  <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                  <span>Test on My Screen</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="w-full sm:w-auto px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                >
                  <Save className="w-4 h-4 text-gray-600" />
                  <span>Save Draft</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Preview: 5 Columns */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-gray-100 rounded-3xl p-5 space-y-4 shadow-subtle sticky top-24">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#F95721]" /> Live Multi-Device Preview
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Real-time</span>
              </div>

              {/* Android/iOS Lock Screen Push Preview */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  1. Phone Lockscreen Push
                </span>
                <div className="bg-gray-900/95 backdrop-blur-xl text-white rounded-2xl p-3.5 shadow-xl border border-gray-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-[#F95721] flex items-center justify-center text-[8px] font-black text-white">
                        S
                      </div>
                      <span className="text-[11px] font-extrabold text-gray-200">SBS STORE</span>
                    </div>
                    <span className="text-[10px] text-gray-400">now</span>
                  </div>
                  <p className="text-xs font-bold text-white leading-snug">
                    {formData.title || '🔥 Weekend Flash Sale: 40% OFF!'}
                  </p>
                  <p className="text-[11px] text-gray-300 leading-relaxed line-clamp-2">
                    {formData.message || 'Grab mini washing machines and smart kitchen sealers at half price today!'}
                  </p>
                  {formData.imageUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden max-h-28 border border-gray-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.imageUrl} alt="Preview banner" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* In-App Customer Inbox Card Preview */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  2. In-App Notification Center
                </span>
                <div className="bg-gradient-to-r from-orange-50/80 via-white to-orange-50/30 border border-[#FEDDC7] rounded-2xl p-3 shadow-2xs space-y-1.5 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F95721]" />
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 p-1.5 flex items-center justify-center flex-shrink-0 shadow-2xs text-[#F95721]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="text-xs font-bold text-gray-900 truncate">
                          {formData.title || 'Weekend Flash Sale'}
                        </h5>
                        <span className="text-[9px] text-gray-400">Just now</span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2 mt-0.5">
                        {formData.message || 'Grab smart products at unbeatable prices.'}
                      </p>
                      <div className="pt-1 flex items-center gap-1 text-[10px] font-bold text-[#F95721]">
                        <span>Tap to open &ldquo;{formData.actionUrl}&rdquo;</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: DRAFTS & CAMPAIGNS */}
      {/* ==================================================== */}
      {activeTab === 'DRAFTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              Saved Notification Drafts ({userNotificationDrafts.length})
            </h3>
            <button
              onClick={() => setActiveTab('BROADCAST')}
              className="px-3 py-1.5 bg-[#F95721] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New</span>
            </button>
          </div>

          {userNotificationDrafts.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center space-y-2 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-gray-800">No drafts saved</p>
              <p className="text-[11px] text-gray-400">Draft campaigns in the Broadcast tab to edit and schedule them later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {userNotificationDrafts.map((draft) => (
                <div key={draft.id} className="bg-white border border-gray-200 rounded-3xl p-4 shadow-subtle space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                        Draft
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(draft.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-gray-900">{draft.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{draft.message}</p>
                    
                    <div className="pt-1 flex flex-wrap gap-2 text-[10px] text-gray-500 font-semibold">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-md">Type: {draft.type}</span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded-md">Target: {draft.targetAudience}</span>
                      {draft.actionUrl && <span className="bg-orange-50 text-[#F95721] px-2 py-0.5 rounded-md">➔ {draft.actionUrl}</span>}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => loadDraftToComposer(draft)}
                      className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-[#F95721] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <span>Edit & Launch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteNotificationDraft(draft.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: SENT BROADCAST HISTORY */}
      {/* ==================================================== */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Broadcast Delivery History</h3>
              <p className="text-xs text-gray-500">{userNotifications.length} campaigns dispatched to customers</p>
            </div>
          </div>

          {userNotifications.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center space-y-2 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <History className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-gray-800">No broadcast history</p>
              <p className="text-[11px] text-gray-400">Sent push campaigns will be logged here with recipient metrics.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {userNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-white border border-gray-100 rounded-3xl p-4 shadow-subtle space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00A859] p-2 flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900">{notif.title}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#00A859] text-[9px] font-black uppercase">
                            Delivered
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteBroadcastNotification(notif.id)}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg transition-colors"
                      title="Delete from log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-semibold text-gray-700">
                        <Users className="w-3 h-3 text-[#F95721]" /> {notif.recipientCount || '1,240+'} Recipients
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {notif.sentAt ? new Date(notif.sentAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recently'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        sendBroadcastNotification({
                          title: notif.title,
                          message: notif.message,
                          type: notif.type,
                          targetAudience: notif.targetAudience,
                          actionUrl: notif.actionUrl,
                          imageUrl: notif.imageUrl,
                        });
                      }}
                      className="text-xs font-bold text-[#F95721] hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Re-Broadcast</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: ADMIN OPERATIONAL ALERTS */}
      {/* ==================================================== */}
      {activeTab === 'ALERTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Internal Operational Alerts</h3>
              <p className="text-xs text-gray-500">Real-time alerts for orders, low stock and customer returns</p>
            </div>
            {adminNotifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs font-bold text-gray-500 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {adminNotifications.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-2 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-800">No operational alerts</p>
                <p className="text-[11px] text-gray-400">All inventory and order alerts are clear.</p>
              </div>
            ) : (
              adminNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-3.5 rounded-3xl border transition-all cursor-pointer space-y-1.5 ${
                    n.read 
                      ? 'bg-white border-gray-100 shadow-2xs opacity-80' 
                      : 'bg-orange-50/50 border-orange-200/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white p-1.5 flex items-center justify-center border border-gray-100 shadow-2xs">
                        {getAdminIcon(n.type)}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-gray-900">{n.title}</h4>
                        <span className="text-[10px] text-gray-400">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        n.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {n.priority}
                      </span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-[#F95721]" />
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-600 pl-10 leading-relaxed">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
