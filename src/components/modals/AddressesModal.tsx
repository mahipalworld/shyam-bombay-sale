'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { X, MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const AddressesModal: React.FC = () => {
  const { 
    addresses, 
    isAddressesOpen, 
    setIsAddressesOpen, 
    addAddress, 
    setDefaultAddress, 
    deleteAddress 
  } = useStore();

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Mahipal Singh',
    phone: '+91 98765 43210',
    street: '',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '',
    type: 'HOME' as 'HOME' | 'WORK' | 'OTHER',
    isDefault: false,
  });

  if (!isAddressesOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.street || !formData.pincode) return;
    addAddress(formData);
    setIsAdding(false);
    setFormData({
      name: 'Mahipal Singh',
      phone: '+91 98765 43210',
      street: '',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '',
      type: 'HOME',
      isDefault: false,
    });
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#F95721]" />
            <h2 className="text-base font-bold text-gray-900">Saved Addresses</h2>
          </div>
          <button
            onClick={() => setIsAddressesOpen(false)}
            className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 bg-orange-50 hover:bg-orange-100 text-[#F95721] border border-orange-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          )}

          {isAdding ? (
            <form onSubmit={handleSave} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 text-xs">
              <h3 className="font-bold text-gray-900">New Address Details</h3>
              <input
                type="text"
                required
                placeholder="Receiver Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-xl px-3 py-2 bg-white outline-none focus:border-[#F95721]"
              />
              <input
                type="tel"
                required
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border rounded-xl px-3 py-2 bg-white outline-none focus:border-[#F95721]"
              />
              <textarea
                rows={2}
                required
                placeholder="Flat / Building / Street / Area"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full border rounded-xl px-3 py-2 bg-white outline-none focus:border-[#F95721]"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 bg-white outline-none focus:border-[#F95721]"
                />
                <input
                  type="text"
                  required
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 bg-white outline-none focus:border-[#F95721]"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <span className="font-bold text-gray-700">Type:</span>
                {(['HOME', 'WORK', 'OTHER'] as const).map((t) => (
                  <label key={t} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="addr_type"
                      checked={formData.type === t}
                      onChange={() => setFormData({ ...formData, type: t })}
                      className="text-[#F95721]"
                    />
                    <span className="text-[11px] font-semibold">{t}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#F95721] text-white font-bold rounded-xl shadow-sm"
                >
                  Save Address
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white rounded-2xl border p-4 shadow-subtle space-y-2 transition-all ${
                    addr.isDefault ? 'border-[#F95721] bg-[#FFFBF8]' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-xs">{addr.name}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-semibold uppercase">
                        {addr.type}
                      </span>
                    </div>
                    {addr.isDefault ? (
                      <span className="text-[10px] font-bold text-[#00A859] bg-[#EBF7F0] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Default
                      </span>
                    ) : (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-[11px] font-bold text-[#F95721] hover:underline"
                      >
                        Set Default
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-[11px] text-gray-500">{addr.phone}</p>

                  {addresses.length > 1 && (
                    <div className="pt-2 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
