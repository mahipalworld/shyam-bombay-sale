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
  ShoppingBag
} from 'lucide-react';
import { Coupon } from '@/types';

export const OffersView: React.FC = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon, categories, products, showToast } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

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
    if (!formData.code.trim() || !formData.value) {
      showToast('Please provide coupon code & discount', 'error');
      return;
    }

    const payload = {
      code: formData.code.toUpperCase(),
      title: formData.title || `${formData.discountType === 'FLAT' ? '₹' : ''}${formData.value}${formData.discountType === 'PERCENT' ? '%' : ''} Off`,
      discountType: formData.discountType,
      value: parseFloat(formData.value) || 10,
      minOrderValue: parseFloat(formData.minOrderValue) || 499,
      maxDiscount: parseFloat(formData.maxDiscount) || undefined,
      expiresAt: formData.expiresAt,
      description: formData.description || `Special coupon on orders above ₹${formData.minOrderValue}`,
      eligibleCategory: formData.eligibleCategory !== 'ALL' ? formData.eligibleCategory : undefined,
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
            {coupons.length} promotional campaigns available
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 bg-[#F35C16] hover:bg-[#E04F0E] text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-sm shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Coupon</span>
        </button>
      </div>

      {/* Coupons List Cards */}
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
                    <span className="text-base font-black text-[#F35C16]">
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
                  className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#F35C16] border border-dashed border-orange-300 rounded-xl font-mono text-xs font-black flex items-center gap-1.5"
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
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F35C16] font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F35C16] font-bold"
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
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F35C16] font-bold text-[#F35C16]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F35C16]"
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
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F35C16]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F35C16]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">Category Restriction</label>
                <select
                  value={formData.eligibleCategory}
                  onChange={(e) => setFormData({ ...formData, eligibleCategory: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 outline-none focus:border-[#F35C16]"
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
                  className="flex-1 py-2.5 bg-[#F35C16] text-white font-bold rounded-xl shadow-xs"
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
