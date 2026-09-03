'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { 
  X, 
  MapPin, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  CheckCircle2, 
  ShieldCheck, 
  Plus,
  ArrowRight
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
    setActiveTab 
  } = useStore();

  const selectedCartItems = cart.filter((item) => item.selected);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || ''
  );
  const [selectedPayment, setSelectedPayment] = useState<string>('UPI');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // New address form state
  const [newAddr, setNewAddr] = useState({
    name: 'Mahipal Singh',
    phone: '+91 98765 43210',
    street: '',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '',
    type: 'HOME' as 'HOME' | 'WORK' | 'OTHER',
  });

  if (!isCheckoutOpen) return null;

  const currentAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.pincode) return;
    addAddress({
      ...newAddr,
      isDefault: false,
    });
    setIsAddingNewAddress(false);
  };

  const handleCompleteOrder = () => {
    if (!currentAddress) return;
    setIsProcessingOrder(true);

    setTimeout(() => {
      const order = placeOrder(selectedPayment, currentAddress);
      setIsProcessingOrder(false);
      setIsCheckoutOpen(false);
      setSelectedOrderForModal(order);
      setActiveTab('profile');
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col relative">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Checkout</h2>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Step 1: Delivery Address */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#F35C16]" />
                Delivery Address
              </span>
              <button
                onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                className="text-[11px] font-bold text-[#F35C16] hover:underline"
              >
                {isAddingNewAddress ? 'Select Existing' : '+ Add New'}
              </button>
            </div>

            {isAddingNewAddress ? (
              <form onSubmit={handleAddNewAddress} className="bg-orange-50/60 border border-orange-200 rounded-2xl p-3 space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Street / Flat / Area"
                  required
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 bg-white outline-none focus:border-[#F35C16]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 bg-white outline-none focus:border-[#F35C16]"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    required
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2 bg-white outline-none focus:border-[#F35C16]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#F35C16] text-white font-bold rounded-xl text-xs"
                >
                  Save Address
                </button>
              </form>
            ) : (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`block p-3 rounded-2xl border cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-[#F35C16] bg-[#FFF8F4]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-0.5 text-[#F35C16]"
                      />
                      <div className="text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-gray-900">
                          <span>{addr.name}</span>
                          <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 rounded uppercase">
                            {addr.type}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-0.5">{addr.street}, {addr.city} - {addr.pincode}</p>
                        <p className="text-gray-500 text-[11px] mt-0.5">{addr.phone}</p>
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
              <CreditCard className="w-4 h-4 text-[#F35C16]" />
              Select Payment Mode
            </span>

            <div className="space-y-2">
              {/* UPI */}
              <label
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedPayment === 'UPI' ? 'border-[#F35C16] bg-[#FFF8F4]' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === 'UPI'}
                    onChange={() => setSelectedPayment('UPI')}
                    className="text-[#F35C16]"
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
                  selectedPayment === 'Card' ? 'border-[#F35C16] bg-[#FFF8F4]' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === 'Card'}
                    onChange={() => setSelectedPayment('Card')}
                    className="text-[#F35C16]"
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
                  selectedPayment === 'COD' ? 'border-[#F35C16] bg-[#FFF8F4]' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === 'COD'}
                    onChange={() => setSelectedPayment('COD')}
                    className="text-[#F35C16]"
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
                <span className="line-clamp-1">{item.product.name} × {item.quantity}</span>
                <span className="font-semibold text-gray-900">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
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
              <span className="text-lg text-[#F35C16]">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <button
            disabled={isProcessingOrder}
            onClick={handleCompleteOrder}
            className="w-full py-3.5 bg-[#F35C16] hover:bg-[#E04F0E] disabled:bg-gray-400 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-float active:scale-98 transition-all"
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
