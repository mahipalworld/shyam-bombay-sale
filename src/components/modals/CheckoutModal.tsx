'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { triggerConfetti } from '@/utils/confetti';
import { 
  X, 
  MapPin, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  ShieldCheck, 
  Plus,
  AlertCircle,
  Home,
  Briefcase
} from 'lucide-react';
import { Address } from '@/types';

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    addresses, 
    addAddress, 
    cartSubtotal, 
    cartDiscount, 
    cartDeliveryCharge, 
    cartTotal, 
    placeOrder, 
    setSelectedOrderForModal,
    setActiveTab,
    showToast,
    user
  } = useStore();

  const selectedCartItems = cart.filter((item) => item && item.product && item.selected);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('UPI');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // New address form state
  const [newAddr, setNewAddr] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: 'Gujarat',
    pincode: '',
    type: 'HOME' as 'HOME' | 'WORK' | 'OTHER',
  });

  useEffect(() => {
    if (isCheckoutOpen) {
      if (addresses.length === 0) {
        setIsAddingNewAddress(true);
      } else {
        const defaultAddr = addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || '';
        setSelectedAddressId(defaultAddr);
      }
      setFormError(null);
    }
  }, [isCheckoutOpen, addresses]);

  if (!isCheckoutOpen) return null;

  const currentAddress = addresses.find((a) => a.id === selectedAddressId) || (addresses.length > 0 ? addresses[0] : null);

  const validateAddress = (addr: typeof newAddr) => {
    if (!addr.name.trim()) return 'Please enter recipient name';
    if (!addr.phone.trim() || addr.phone.replace(/\D/g, '').length < 10) return 'Please enter a valid 10-digit phone number';
    if (!addr.street.trim() || addr.street.trim().length < 5) return 'Please enter full house/flat number and street area';
    if (!addr.city.trim()) return 'Please enter your city';
    if (!addr.pincode.trim() || addr.pincode.trim().length !== 6) return 'Please enter a valid 6-digit Pincode';
    return null;
  };

  const handleAddNewAddress = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const error = validateAddress(newAddr);
    if (error) {
      setFormError(error);
      showToast(error, 'error');
      return null;
    }

    setFormError(null);
    const createdId = `addr_${Date.now()}`;
    const newAddressObj: Address = {
      id: createdId,
      ...newAddr,
      isDefault: addresses.length === 0,
    };

    addAddress(newAddressObj);
    setSelectedAddressId(createdId);
    setIsAddingNewAddress(false);
    showToast('Delivery address saved! 📍');
    return newAddressObj;
  };

  const handleCompleteOrder = () => {
    // 1. If user has no address saved
    if (!currentAddress && addresses.length === 0) {
      // Try to auto-save the address if form is filled
      const saved = handleAddNewAddress();
      if (!saved) {
        setIsAddingNewAddress(true);
        setFormError('⚠️ Please fill and save your delivery address to proceed.');
        showToast('Please enter your delivery address first to proceed!', 'error');
        return;
      }
      return;
    }

    if (!currentAddress) {
      showToast('Please select a delivery address first!', 'error');
      setIsAddingNewAddress(true);
      return;
    }

    setIsProcessingOrder(true);

    setTimeout(() => {
      try {
        const order = placeOrder(selectedPayment, currentAddress);
        setIsProcessingOrder(false);
        setIsCheckoutOpen(false);
        try {
          triggerConfetti({ particleCount: 150, duration: 3500 });
        } catch { }
        setSelectedOrderForModal(order);
        setActiveTab('profile');
      } catch (err) {
        setIsProcessingOrder(false);
        showToast('Unable to complete order. Please try again.', 'error');
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col relative no-scrollbar">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-gray-900">Secure Checkout</h2>
            <p className="text-[10px] text-gray-500 font-medium">100% Verified & Encrypted</p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Step 1: Delivery Address */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#F95721]" />
                Delivery Address *
              </span>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewAddress(!isAddingNewAddress);
                    setFormError(null);
                  }}
                  className="text-[11px] font-bold text-[#F95721] hover:underline flex items-center gap-0.5"
                >
                  {isAddingNewAddress ? 'Select Existing Address' : '+ Add Another Address'}
                </button>
              )}
            </div>

            {/* Missing Address Banner */}
            {addresses.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-extrabold block text-amber-950">Address Not Entered</span>
                  Please fill in your delivery details below first to proceed with your order.
                </div>
              </div>
            )}

            {isAddingNewAddress || addresses.length === 0 ? (
              <form onSubmit={handleAddNewAddress} className="bg-orange-50/50 border-2 border-orange-200 rounded-2xl p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-orange-200/60">
                  <span className="font-bold text-gray-900 text-xs">Add New Shipping Address</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNewAddr({ ...newAddr, type: 'HOME' })}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                        newAddr.type === 'HOME' ? 'bg-[#F95721] text-white' : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                    >
                      <Home className="w-3 h-3" /> Home
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewAddr({ ...newAddr, type: 'WORK' })}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                        newAddr.type === 'WORK' ? 'bg-[#F95721] text-white' : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                    >
                      <Briefcase className="w-3 h-3" /> Work
                    </button>
                  </div>
                </div>

                {formError && (
                  <p className="text-[11px] font-bold text-red-600 bg-red-50 p-2 rounded-xl border border-red-100">
                    {formError}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-0.5">Full Name *</label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      required
                      value={newAddr.name}
                      onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-[#F95721] text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-0.5">Mobile Number *</label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile"
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-[#F95721] text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-0.5">House / Flat / Street / Area *</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 302, Sai Residency, Laxmipura"
                    required
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-[#F95721] text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-0.5">City *</label>
                    <input
                      type="text"
                      placeholder="e.g. Vadodara"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-2.5 py-2 bg-white outline-none focus:border-[#F95721] text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-0.5">State *</label>
                    <input
                      type="text"
                      placeholder="State"
                      required
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-2.5 py-2 bg-white outline-none focus:border-[#F95721] text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-0.5">Pincode *</label>
                    <input
                      type="text"
                      placeholder="6-digit PIN"
                      maxLength={6}
                      required
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-2.5 py-2 bg-white outline-none focus:border-[#F95721] text-xs font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#F95721] hover:bg-[#E44813] text-white font-bold rounded-xl text-xs shadow-xs active:scale-98 transition-all"
                >
                  Save & Use This Address
                </button>
              </form>
            ) : (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`block p-3 rounded-2xl border cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-[#F95721] bg-[#FFF8F4] ring-1 ring-orange-200 shadow-2xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-0.5 accent-[#F95721]"
                      />
                      <div className="text-xs flex-1">
                        <div className="flex items-center gap-1.5 font-bold text-gray-900">
                          <span>{addr.name}</span>
                          <span className="text-[9px] bg-orange-100 text-[#F95721] px-1.5 py-0.5 rounded font-black uppercase">
                            {addr.type}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-0.5">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-gray-500 text-[11px] mt-0.5">📞 {addr.phone}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#F95721]" />
              Select Payment Mode
            </span>

            <div className="space-y-2">
              {/* UPI */}
              <label
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedPayment === 'UPI' ? 'border-[#F95721] bg-[#FFF8F4] ring-1 ring-orange-200' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === 'UPI'}
                    onChange={() => setSelectedPayment('UPI')}
                    className="accent-[#F95721]"
                  />
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#00A859]" />
                    <span className="text-xs font-bold text-gray-900">UPI (GPay / PhonePe / Paytm)</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#00A859] bg-[#EBF7F0] px-2 py-0.5 rounded-full">
                  Fastest
                </span>
              </label>

              {/* Cards / Netbanking */}
              <label
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedPayment === 'Card' ? 'border-[#F95721] bg-[#FFF8F4] ring-1 ring-orange-200' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === 'Card'}
                    onChange={() => setSelectedPayment('Card')}
                    className="accent-[#F95721]"
                  />
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#0284C7]" />
                    <span className="text-xs font-bold text-gray-900">Credit / Debit Card / Netbanking</span>
                  </div>
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedPayment === 'COD' ? 'border-[#F95721] bg-[#FFF8F4] ring-1 ring-orange-200' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === 'COD'}
                    onChange={() => setSelectedPayment('COD')}
                    className="accent-[#F95721]"
                  />
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-[#D97706]" />
                    <span className="text-xs font-bold text-gray-900">Cash on Delivery (COD)</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Step 3: Order Items Quick Preview */}
          <div className="bg-gray-50 rounded-2xl p-3 space-y-1.5 text-xs">
            <span className="font-bold text-gray-700 block text-[11px]">Order Items ({selectedCartItems.length})</span>
            {selectedCartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-gray-600 text-[11px]">
                <span className="line-clamp-1">{item.product?.name} × {item.quantity}</span>
                <span className="font-semibold text-gray-900">₹{((item.product?.price ?? 0) * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          {/* Amount Breakdown */}
          <div className="border-t border-gray-100 pt-2 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Items Total</span>
              <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Savings</span>
              <span className="text-[#00A859]">-₹{cartDiscount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery Charges</span>
              <span>{cartDeliveryCharge === 0 ? <span className="text-[#00A859] font-bold">FREE</span> : `₹${cartDeliveryCharge}`}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t font-bold text-sm text-gray-900">
              <span>Total Payable</span>
              <span className="text-lg text-[#F95721]">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <button
            disabled={isProcessingOrder}
            onClick={handleCompleteOrder}
            className="w-full py-3.5 bg-[#F95721] hover:bg-[#E44813] disabled:bg-gray-400 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-float active:scale-98 transition-all"
          >
            {isProcessingOrder ? (
              <span className="animate-pulse">Processing Order...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Place Order • ₹{cartTotal.toLocaleString('en-IN')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
