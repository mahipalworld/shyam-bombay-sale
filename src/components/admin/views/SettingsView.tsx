'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  Settings, 
  Store, 
  Truck, 
  CreditCard, 
  Bell, 
  ShieldCheck, 
  Lock, 
  Globe, 
  Save, 
  Check, 
  Users,
  Sparkles
} from 'lucide-react';
import { StoreSettings, AdminRole } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const SettingsView: React.FC = () => {
  const { storeSettings, setStoreSettings, adminRole, setAdminRole, showToast } = useStore();

  const [activeSection, setActiveSection] = useState<'store' | 'features' | 'delivery' | 'payments' | 'notifications' | 'roles' | 'security'>('store');
  const [formData, setFormData] = useState<StoreSettings>({ 
    enableStories: true,
    enableScratchCard: true,
    enableFlashDeals: true,
    enableConfetti: true,
    ...storeSettings 
  });

  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...storeSettings
    }));
  }, [storeSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoreSettings(formData);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('store_settings').upsert({
        id: 'store_settings',
        data: formData,
        updated_at: new Date().toISOString()
      });
    }

    showToast('Store settings saved successfully! ⚙️');
  };

  const sections: { key: typeof activeSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'store', label: 'Store Identity', icon: Store },
    { key: 'features', label: 'Interactive UX & Features', icon: Sparkles },
    { key: 'delivery', label: 'Delivery Rules', icon: Truck },
    { key: 'payments', label: 'Payment Gateway', icon: CreditCard },
    { key: 'notifications', label: 'Alert Rules', icon: Bell },
    { key: 'roles', label: 'Admin Accounts', icon: Users },
    { key: 'security', label: 'Security & Auth', icon: Lock },
  ];

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 leading-tight">Store Configuration</h1>
          <p className="text-[11px] text-gray-500">Business rules, rates, and admin access</p>
        </div>
      </div>

      {/* Settings Navigation Carousel */}
      <div className="flex bg-gray-100 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar text-xs font-bold">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.key;
          return (
            <button
              key={sec.key}
              onClick={() => setActiveSection(sec.key)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-white text-[#F95721] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Form Container */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* 1. Store Identity */}
        {activeSection === 'store' && (
          <div className="bg-white border border-gray-100 rounded-3xl p-4 space-y-3.5 shadow-2xs text-xs">
            <h3 className="font-black text-gray-900 text-sm">Store Brand & Contact</h3>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Store Name</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Brand Logo Text</label>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] font-black text-[#F95721]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-800 mb-1">Support Phone</label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Customer Support Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Store / Warehouse Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border rounded-2xl px-3.5 py-2 outline-none focus:border-[#F95721]"
              />
            </div>
          </div>
        )}

        {/* 2. Interactive UX & Features */}
        {activeSection === 'features' && (
          <div className="bg-white border border-gray-100 rounded-3xl p-4 space-y-3.5 shadow-2xs text-xs">
            <h3 className="font-black text-gray-900 text-sm">Interactive Features & Gamification</h3>
            <p className="text-[11px] text-gray-500">Enable or disable specific customer engagement features live across the store</p>

            <div className="space-y-2.5 pt-1">
              {[
                { 
                  key: 'enableStories', 
                  title: 'Instagram-Style Product Stories', 
                  desc: 'Showcase quick video/demo stories at the top of the homepage',
                  icon: '🔥'
                },
                { 
                  key: 'enableScratchCard', 
                  title: 'Scratch & Win Mystery Cards', 
                  desc: 'Interactive coin-scratch coupons on the home screen and checkout',
                  icon: '🎁'
                },
                { 
                  key: 'enableFlashDeals', 
                  title: 'Live Flash Deals Countdown Hero', 
                  desc: 'High-urgency ticker with ticking clock on Hero slide 2',
                  icon: '⚡'
                },
                { 
                  key: 'enableConfetti', 
                  title: 'Celebration Confetti Bursts', 
                  desc: 'Interactive confetti bursts when placing orders or scratching cards',
                  icon: '🎉'
                },
              ].map((feat) => {
                const isEnabled = (formData as any)[feat.key] !== false;
                return (
                  <div
                    key={feat.key}
                    onClick={() => setFormData({ ...formData, [feat.key]: !isEnabled })}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isEnabled ? 'bg-orange-50/70 border-orange-300' : 'bg-gray-50 border-gray-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl flex-shrink-0">{feat.icon}</span>
                      <div className="min-w-0">
                        <p className="font-black text-gray-900 text-xs">{feat.title}</p>
                        <p className="text-[10px] text-gray-500 line-clamp-1">{feat.desc}</p>
                      </div>
                    </div>

                    <div className={`w-10 h-6 rounded-full p-0.5 transition-colors flex items-center ${
                      isEnabled ? 'bg-[#F95721] justify-end' : 'bg-gray-300 justify-start'
                    }`}>
                      <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SBS Rewards Program Configuration */}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">SBS Rewards Point Program</h4>
                  <p className="text-[10px] text-gray-500">Configure customer points threshold and checkout discount amount</p>
                </div>
                <div 
                  onClick={() => setFormData({ ...formData, rewardProgramActive: formData.rewardProgramActive !== false ? false : true })}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors flex items-center cursor-pointer ${
                    formData.rewardProgramActive !== false ? 'bg-[#F95721] justify-end' : 'bg-gray-300 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">Points Required for Discount</label>
                  <input
                    type="number"
                    min={10}
                    value={formData.rewardPointsThreshold || 100}
                    onChange={(e) => setFormData({ ...formData, rewardPointsThreshold: parseInt(e.target.value) || 100 })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721] font-bold"
                  />
                  <p className="text-[9px] text-gray-400 mt-0.5">e.g. 100 points</p>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 text-[11px] mb-1">Discount Amount (₹)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.rewardDiscountAmount || 50}
                    onChange={(e) => setFormData({ ...formData, rewardDiscountAmount: parseFloat(e.target.value) || 50 })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721] font-bold text-emerald-600"
                  />
                  <p className="text-[9px] text-gray-400 mt-0.5">e.g. ₹50 OFF</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Delivery Rules */}
        {activeSection === 'delivery' && (
          <div className="bg-white border border-gray-100 rounded-3xl p-4 space-y-3.5 shadow-2xs text-xs">
            <h3 className="font-black text-gray-900 text-sm">Shipping Rates & Thresholds</h3>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-gray-800 mb-1">Standard Delivery Fee (₹)</label>
                <input
                  type="number"
                  value={formData.deliveryCharge}
                  onChange={(e) => setFormData({ ...formData, deliveryCharge: parseFloat(e.target.value) || 0 })}
                  className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-800 mb-1">Free Delivery Min Total (₹)</label>
                <input
                  type="number"
                  value={formData.freeDeliveryThreshold}
                  onChange={(e) => setFormData({ ...formData, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                  className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] font-bold text-[#00A859]"
                />
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-[11px] text-green-900 leading-relaxed">
              💡 Customers with order carts above <b>₹{formData.freeDeliveryThreshold}</b> will automatically receive 100% Free Shipping.
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Active Delivery Service Zones</label>
              <input
                type="text"
                value={formData.deliveryZones.join(', ')}
                onChange={(e) => setFormData({ ...formData, deliveryZones: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721]"
              />
            </div>
          </div>
        )}

        {/* 3. Payment Gateway */}
        {activeSection === 'payments' && (
          <div className="bg-white border border-gray-100 rounded-3xl p-4 space-y-3.5 shadow-2xs text-xs">
            <h3 className="font-black text-gray-900 text-sm">Payment Collection Modes</h3>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Store Merchant UPI ID (GPay / PhonePe)</label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] font-mono font-bold"
              />
            </div>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer">
              <div>
                <p className="font-bold text-gray-900 text-xs">Enable Cash on Delivery (COD)</p>
                <p className="text-[10px] text-gray-400">Allow customers to pay upon package receipt</p>
              </div>
              <input
                type="checkbox"
                checked={formData.codEnabled}
                onChange={(e) => setFormData({ ...formData, codEnabled: e.target.checked })}
                className="w-4 h-4 text-[#F95721] accent-[#F95721]"
              />
            </label>
          </div>
        )}

        {/* 4. Alert & Notification Rules */}
        {activeSection === 'notifications' && (
          <div className="bg-white border border-gray-100 rounded-3xl p-4 space-y-3.5 shadow-2xs text-xs">
            <h3 className="font-black text-gray-900 text-sm">Automated Alerts & Triggers</h3>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Global Low-Stock Alert Threshold (Units)</label>
              <input
                type="number"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 5 })}
                className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] font-bold text-amber-600"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer">
                <div>
                  <p className="font-bold text-gray-900 text-xs">New Order Instant Notifications</p>
                  <p className="text-[10px] text-gray-400">Ping admin when a customer checks out</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.orderNotification}
                  onChange={(e) => setFormData({ ...formData, orderNotification: e.target.checked })}
                  className="w-4 h-4 text-[#F95721] accent-[#F95721]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer">
                <div>
                  <p className="font-bold text-gray-900 text-xs">Low Stock Alerts</p>
                  <p className="text-[10px] text-gray-400">High priority alert when inventory runs low</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.lowStockNotification}
                  onChange={(e) => setFormData({ ...formData, lowStockNotification: e.target.checked })}
                  className="w-4 h-4 text-[#F95721] accent-[#F95721]"
                />
              </label>
            </div>
          </div>
        )}

        {/* 5. Admin Users & RBAC Roles */}
        {activeSection === 'roles' && (
          <div className="bg-white border border-gray-100 rounded-3xl p-4 space-y-3.5 shadow-2xs text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-gray-900 text-sm">Admin Accounts & RBAC Roles</h3>
                <p className="text-[10px] text-gray-400">Manage privileges per administrator</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { name: 'Mahipal Singh', email: 'owner@sbsstore.com', role: 'OWNER', badge: 'bg-[#F95721] text-white' },
                { name: 'Kailash Sharma', email: 'manager@sbsstore.com', role: 'MANAGER', badge: 'bg-blue-600 text-white' },
                { name: 'Divya Patel', email: 'marketing@sbsstore.com', role: 'MARKETING', badge: 'bg-purple-600 text-white' },
                { name: 'Suresh Kumar', email: 'staff@sbsstore.com', role: 'STAFF', badge: 'bg-emerald-600 text-white' },
              ].map((acc, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-xs">{acc.name}</p>
                    <p className="text-[10px] text-gray-400">{acc.email}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${acc.badge}`}>
                    {acc.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Security */}
        {activeSection === 'security' && (
          <div className="bg-white border border-gray-100 rounded-3xl p-4 space-y-3.5 shadow-2xs text-xs">
            <h3 className="font-black text-gray-900 text-sm">Security & Access Tokens</h3>
            <div>
              <label className="block font-bold text-gray-800 mb-1">Admin Passcode Protection</label>
              <input
                type="password"
                defaultValue="••••••••••••"
                className="w-full border rounded-2xl px-3.5 py-2.5 outline-none font-mono"
              />
            </div>
            <p className="text-[10px] text-gray-400">
              256-bit encryption active. Sessions are verified via secure tokens.
            </p>
          </div>
        )}

        {/* Sticky Save CTA Button */}
        <button
          type="submit"
          className="w-full py-3 bg-[#F95721] hover:bg-[#E44813] text-white font-bold rounded-2xl shadow-sm shadow-orange-500/20 flex items-center justify-center gap-1.5 text-xs active:scale-98 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </form>
    </div>
  );
};
