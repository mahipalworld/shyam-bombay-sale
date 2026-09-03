'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Trash2, 
  Sparkles, 
  Tag, 
  Truck, 
  AlertCircle, 
  ArrowRight,
  BellRing,
  Volume2
} from 'lucide-react';
import { UserBroadcastNotification } from '@/types';
import { requestNotificationPermission, getNotificationPermissionState } from '@/utils/pushNotifications';

export const CustomerNotificationsModal: React.FC = () => {
  const { 
    userNotifications, 
    isUserNotificationsModalOpen, 
    setIsUserNotificationsModalOpen,
    markUserNotificationRead,
    markAllUserNotificationsRead,
    clearAllUserNotifications,
    setActiveTab,
    setSelectedCategoryFilter,
    showToast
  } = useStore();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'deal' | 'promo' | 'system'>('ALL');
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    getNotificationPermissionState().then(setPermissionState);
  }, [isUserNotificationsModalOpen]);

  if (!isUserNotificationsModalOpen) return null;

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const filteredNotifications = userNotifications.filter(n => {
    if (activeFilter === 'ALL') return true;
    return n.type === activeFilter;
  });

  const handleEnablePush = async () => {
    const res = await requestNotificationPermission();
    setPermissionState(res);
    if (res === 'granted') {
      showToast('Push Notifications enabled! You will now receive flash deals.', 'success');
    } else if (res === 'denied') {
      showToast('Notifications are blocked in browser settings', 'error');
    }
  };

  const handleNotificationClick = (notif: UserBroadcastNotification) => {
    markUserNotificationRead(notif.id);

    if (notif.actionUrl) {
      setIsUserNotificationsModalOpen(false);
      if (notif.actionUrl === 'offers') {
        setSelectedCategoryFilter('offers');
        setActiveTab('categories');
      } else if (notif.actionUrl === 'categories') {
        setSelectedCategoryFilter(null);
        setActiveTab('categories');
      } else if (notif.actionUrl === 'cart') {
        setActiveTab('cart');
      } else {
        setSelectedCategoryFilter(notif.actionUrl);
        setActiveTab('categories');
      }
    }
  };

  const getTypeIcon = (type: UserBroadcastNotification['type']) => {
    switch (type) {
      case 'deal':
        return <Sparkles className="w-4 h-4 text-[#F35C16]" />;
      case 'promo':
        return <Tag className="w-4 h-4 text-emerald-600" />;
      case 'system':
      case 'order':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-[#F35C16]" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
      onClick={() => setIsUserNotificationsModalOpen(false)}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[88vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-50 text-[#F35C16] flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#F35C16] text-white text-[10px] font-black">
                    {unreadCount} New
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-gray-500">Flash sales, coupons and updates</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllUserNotificationsRead}
                title="Mark all as read"
                className="p-2 text-gray-500 hover:text-[#00A859] hover:bg-emerald-50 rounded-xl transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            {userNotifications.length > 0 && (
              <button
                onClick={clearAllUserNotifications}
                title="Clear all"
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsUserNotificationsModalOpen(false)}
              className="p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Push Permission Prompt Banner (if not granted yet) */}
        {permissionState === 'default' && (
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-b border-orange-100 p-3 px-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <BellRing className="w-5 h-5 text-[#F35C16] flex-shrink-0 animate-bounce" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 leading-tight">Get Instant Deal Alerts</p>
                <p className="text-[10px] text-gray-600 leading-tight truncate">Never miss flash price drops</p>
              </div>
            </div>
            <button
              onClick={handleEnablePush}
              className="px-3 py-1.5 bg-[#F35C16] hover:bg-[#E04F0E] text-white text-[11px] font-bold rounded-xl whitespace-nowrap shadow-xs active:scale-95 transition-all"
            >
              Turn On
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex p-2 bg-gray-50 border-b border-gray-100 gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'deal', label: '🔥 Flash Deals' },
            { id: 'promo', label: '🎁 Offers' },
            { id: 'system', label: '📦 Orders' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-white text-[#F35C16] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 no-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-gray-50 border border-gray-100 text-gray-400 flex items-center justify-center mx-auto shadow-inner">
                <Bell className="w-6 h-6 stroke-[1.5px]" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-gray-800">No notifications</p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                  You are completely up to date. Keep an eye out for upcoming holiday sales!
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
                  notif.read
                    ? 'bg-white border-gray-100 hover:border-gray-200 shadow-2xs'
                    : 'bg-gradient-to-r from-orange-50/70 via-white to-orange-50/30 border-[#FEDDC7] shadow-xs'
                }`}
              >
                {/* Unread Accent Bar */}
                {!notif.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F35C16]" />
                )}

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-white border border-gray-100 p-2 flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    {getTypeIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-bold truncate ${notif.read ? 'text-gray-900' : 'text-gray-900'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                        {notif.sentAt ? new Date(notif.sentAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Just now'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>

                    {/* Optional Image Banner Preview */}
                    {notif.imageUrl && (
                      <div className="mt-2 rounded-2xl overflow-hidden max-h-32 border border-gray-100 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={notif.imageUrl} 
                          alt="Notification banner"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}

                    {notif.actionUrl && (
                      <div className="pt-1.5 flex items-center gap-1 text-[11px] font-bold text-[#F35C16] group-hover:underline">
                        <span>Explore Now</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
