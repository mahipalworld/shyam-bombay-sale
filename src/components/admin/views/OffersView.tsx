'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  Tag, 
  Plus, 
  Percent, 
  Calendar, 
  Copy, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  Clock, 
  Sparkles,
  ShoppingBag,
  Gift,
  Save
} from 'lucide-react';
import { Coupon } from '@/types';

export const OffersView: React.FC = () => {
  const { 
    coupons, 
    addCoupon, 
    updateCoupon, 
    deleteCoupon, 
    scratchConfig, 
    updateScratchConfig, 
    categories, 
    products, 
    showToast 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'coupons' | 'scratch'>('coupons');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Scratch config local form
  const [scratchForm, setScratchForm] = useState({
    enabled: scratchConfig?.enabled !== false,
    code: scratchConfig?.code || 'SBS150',
    title: scratchConfig?.title || 'Flat ₹150 OFF',
    description: scratchConfig?.description || 'Valid on all orders above ₹499',
    discountAmount: scratchConfig?.discountAmount || 150,
    minOrderValue: scratchConfig?.minOrderValue || 499,
    expiresAt: scratchConfig?.expiresAt || '2026-12-31',
    scratchThresholdPercent: scratchConfig?.scratchThresholdPercent || 35,
  });

  const handleSaveScratch = (e: React.FormEvent) => {
    e.preventDefault();
    updateScratchConfig(scratchForm);
    showToast('Scratch card settings updated!');
  };

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    discountType: 'PERCENT' as 'PERCENT' | 'FLAT',
    value: '15',
    minOrderValue: '999',
    maxDiscount: '300',
    expiresAt: '2026-12-31',
    description: '',
    eligibleCategory: 'ALL',
    isActive: true,
  });

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormData({
      code: `SBS${Math.floor(10 + Math.random() * 90)}`,
      title: 'Special Festival Offer',
      discountType: 'PERCENT',
      value: '20',
      minOrderValue: '1299',
      maxDiscount: '250',
      expiresAt: '2026-12-31',
      description: 'Get 20% discount on everyday essentials.',
      eligibleCategory: 'ALL',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      title: c.title,
      discountType: c.discountType,
      value: c.value.toString(),
      minOrderValue: c.minOrderValue.toString(),
      maxDiscount: (c.maxDiscount || 500).toString(),
      expiresAt: c.expiresAt,
      description: c.description,
      eligibleCategory: c.eligibleCategory || 'ALL',
      isActive: c.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      showToast('Enter valid coupon code', 'error');
      return;
    }

    const payload = {
      code: formData.code.toUpperCase().trim(),
      title: formData.title.trim(),
      discountType: formData.discountType,
      value: parseFloat(formData.value) || 0,
      minOrderValue: parseFloat(formData.minOrderValue) || 0,
      maxDiscount: parseFloat(formData.maxDiscount) || undefined,
      expiresAt: formData.expiresAt,
      description: formData.description,
      eligibleCategory: formData.eligibleCategory === 'ALL' ? undefined : formData.eligibleCategory,
      isActive: formData.isActive,
    };

    if (editingCoupon) {
      updateCoupon(editingCoupon.id, payload);
      showToast(`Coupon "${payload.code}" updated!`);
    } else {
      addCoupon(payload);
      showToast(`Coupon "${payload.code}" created!`);
    }
    setIsModalOpen(false);
  };

  const handleToggleActive = (c: Coupon) => {
    const nextStatus = c.isActive === false;
    updateCoupon(c.id, { isActive: nextStatus });
    showToast(`Coupon ${c.code} is now ${nextStatus ? 'Active' : 'Disabled'}`);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Coupon code "${code}" copied to clipboard! 📋`);
  };

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 leading-tight">Offers & Discounts</h1>
          <p className="text-[11px] text-gray-500">
            Promotions, coupon codes, and mystery scratch rewards
          </p>
        </div>

        {activeTab === 'coupons' && (
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-[#F95721] hover:bg-[#E44813] text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-sm shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Coupon</span>
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'coupons' ? 'bg-white text-[#F95721] shadow-xs' : 'text-gray-600'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Promo Coupons ({coupons.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('scratch')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'scratch' ? 'bg-white text-[#F95721] shadow-xs' : 'text-gray-600'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Scratch & Win Reward</span>
        </button>
      </div>

      {/* TAB 1: Coupons List */}
      {activeTab === 'coupons' && (
      <div className="space-y-3">
        {coupons.map((c) => {
          const isExpired = new Date(c.expiresAt).getTime() < new Date().getTime();
          const isActive = c.isActive !== false && !isExpired;

          return (
            <div
              key={c.id}
              className={`bg-white border rounded-3xl p-4 shadow-2xs space-y-3 transition-all ${
                isActive ? 'border-gray-100' : 'border-gray-200 opacity-60 bg-gray-50'
              }`}
            >
              {/* Top Row: Discount Pill & Code */}
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-[#F95721]">
                      {c.discountType === 'FLAT' ? `₹${c.value} FLAT OFF` : `${c.value}% OFF`}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      !c.isActive 
                        ? 'bg-gray-200 text-gray-600' 
                        : isExpired 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {!c.isActive ? 'Disabled' : isExpired ? 'Expired' : 'Active'}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-gray-800">{c.title}</h3>
                </div>

                {/* Coupon Code Pill */}
                <button
                  onClick={() => handleCopyCode(c.code)}
                  className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#F95721] border border-dashed border-orange-300 rounded-xl font-mono text-xs font-black flex items-center gap-1.5"
                  title="Copy code"
                >
                  <span>{c.code}</span>
                  <Copy className="w-3 h-3 text-orange-400" />
                </button>
              </div>

              <p className="text-[11px] text-gray-500 leading-relaxed">{c.description}</p>

              {/* Conditions List */}
              <div className="bg-gray-50 rounded-2xl p-2.5 flex items-center justify-between text-[10px] font-bold text-gray-600">
                <span>Min Order: ₹{c.minOrderValue}</span>
                {c.maxDiscount && <span>Max Cap: ₹{c.maxDiscount}</span>}
                <span>Expires: {c.expiresAt}</span>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(c)}
                  className={`text-xs font-bold px-3 py-1 rounded-xl transition-all ${
                    c.isActive !== false
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-[#00A859] text-white'
                  }`}
                >
                  {c.isActive !== false ? 'Disable' : 'Enable'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete coupon "${c.code}"?`)) deleteCoupon(c.id);
                    }}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* TAB 2: Scratch & Win Surprise Mystery Card Manager */}
      {activeTab === 'scratch' && (
        <form onSubmit={handleSaveScratch} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-[#F95721]" />
                <span>Scratch & Win Reward Settings</span>
              </h3>
              <p className="text-[10px] text-gray-500">
                Configure the mystery prize revealed on customer scratch cards
              </p>
            </div>

            <button
              type="button"
              onClick={() => setScratchForm({ ...scratchForm, enabled: !scratchForm.enabled })}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                scratchForm.enabled ? 'bg-[#00A859] text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {scratchForm.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Coupon Code Granted *</label>
              <input
                type="text"
                value={scratchForm.code}
                onChange={(e) => setScratchForm({ ...scratchForm, code: e.target.value.toUpperCase() })}
                className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] font-mono font-black text-[#F95721]"
                placeholder="SBS150"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Discount Amount (₹) *</label>
              <input
                type="number"
                value={scratchForm.discountAmount}
                onChange={(e) => setScratchForm({ ...scratchForm, discountAmount: parseFloat(e.target.value) || 0 })}
                className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721] font-bold"
                placeholder="150"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Reward Title</label>
              <input
                type="text"
                value={scratchForm.title}
                onChange={(e) => setScratchForm({ ...scratchForm, title: e.target.value })}
                className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721]"
                placeholder="Flat ₹150 OFF"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Min Order Total (₹)</label>
              <input
                type="number"
                value={scratchForm.minOrderValue}
                onChange={(e) => setScratchForm({ ...scratchForm, minOrderValue: parseFloat(e.target.value) || 0 })}
                className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721]"
                placeholder="499"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Terms / Subtitle Description</label>
            <input
              type="text"
              value={scratchForm.description}
              onChange={(e) => setScratchForm({ ...scratchForm, description: e.target.value })}
              className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721]"
              placeholder="Valid on all orders above ₹499"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Expires On</label>
              <input
                type="date"
                value={scratchForm.expiresAt}
                onChange={(e) => setScratchForm({ ...scratchForm, expiresAt: e.target.value })}
                className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Scratch Trigger Area (%)</label>
              <input
                type="number"
                min={15}
                max={70}
                value={scratchForm.scratchThresholdPercent}
                onChange={(e) => setScratchForm({ ...scratchForm, scratchThresholdPercent: parseInt(e.target.value) || 35 })}
                className="w-full border rounded-2xl px-3.5 py-2.5 outline-none focus:border-[#F95721]"
                placeholder="35"
              />
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">Preview Reward</span>
              <p className="font-black text-sm text-[#F95721]">{scratchForm.title}</p>
              <p className="text-[10px] text-gray-600">{scratchForm.description}</p>
            </div>
            <span className="font-mono font-black text-xs px-3 py-1.5 bg-white border border-dashed border-[#F95721] text-[#F95721] rounded-xl">
              {scratchForm.code}
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#F95721] hover:bg-[#E44813] text-white font-bold rounded-2xl shadow-sm shadow-orange-500/20 flex items-center justify-center gap-1.5 text-xs active:scale-98 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Scratch Card Reward Settings</span>
          </button>
        </form>
      )}

      {/* Add / Edit Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-sm w-full mx-auto p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-gray-900">
                {editingCoupon ? 'Edit Offer' : 'Create Offer'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FLASH30"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721] font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721] font-bold"
                  >
                    <option value="PERCENT">% Percentage</option>
                    <option value="FLAT">₹ Flat Off</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    Value ({formData.discountType === 'PERCENT' ? '%' : '₹'}) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721] font-bold text-[#F95721]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Offer Title</label>
                <input
                  type="text"
                  placeholder="e.g. Monsoon Super Saver"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Category Restriction</label>
                <select
                  value={formData.eligibleCategory}
                  onChange={(e) => setFormData({ ...formData, eligibleCategory: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F95721]"
                >
                  <option value="ALL">Applicable to all categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#F95721] text-white font-bold rounded-xl shadow-xs"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
