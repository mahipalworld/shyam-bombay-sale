'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
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
  Briefcase,
  ArrowLeft,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  MessageCircle,
  Clock,
  CheckCircle2,
  LogIn,
  UserPlus,
  Lock
} from 'lucide-react';
import { Address, Order } from '@/types';

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    clearCart,
    addresses, 
    addAddress, 
    cartSubtotal, 
    cartDiscount, 
    cartDeliveryCharge, 
    cartTotal, 
    placeOrder, 
    updateOrderPaymentStatus,
    setSelectedOrderForModal,
    setActiveTab,
    showToast,
    user,
    storeSettings
  } = useStore();

  const { supabaseUser, authUser, openAuthModal, signInWithGoogle } = useAuth();

  const selectedCartItems = cart.filter((item) => item && item.product && item.selected);
  const [checkoutStep, setCheckoutStep] = useState<'FORM' | 'UPI_PAYMENT' | 'WHATSAPP_CONFIRMATION'>('FORM');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('UPI');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Active reserved order & payment state
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [paymentConfirmedTime, setPaymentConfirmedTime] = useState<string>('');
  const [isWhatsAppOpened, setIsWhatsAppOpened] = useState<boolean>(false);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  // New address form state - starts empty with no default dummy data
  const [newAddr, setNewAddr] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    type: 'HOME' as 'HOME' | 'WORK' | 'OTHER',
  });

  useEffect(() => {
    if (isCheckoutOpen) {
      setCheckoutStep('FORM');
      setActiveOrder(null);
      setPaymentConfirmedTime('');
      setIsWhatsAppOpened(false);
      setCopiedUpi(false);

      if (addresses.length === 0) {
        setIsAddingNewAddress(true);
        // Start completely clean with no prefilled dummy values
        setNewAddr({
          name: (authUser?.name && authUser.name !== 'Shopper') ? authUser.name : '',
          phone: (authUser?.phone && !authUser.phone.includes('7387467108')) ? authUser.phone : '',
          street: '',
          city: '',
          state: '',
          pincode: '',
          type: 'HOME',
        });
      } else {
        const defaultAddr = addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || '';
        setSelectedAddressId(defaultAddr);
      }
      setFormError(null);
    }
  }, [isCheckoutOpen, addresses, authUser]);

  useEffect(() => {
    if (authUser || supabaseUser) {
      const realName = (authUser?.name && authUser.name !== 'Shopper')
        ? authUser.name
        : (supabaseUser?.user_metadata?.full_name || supabaseUser?.user_metadata?.name || '');
      const realPhone = (authUser?.phone && !authUser.phone.includes('7387467108'))
        ? authUser.phone
        : (supabaseUser?.user_metadata?.phone || '');

      setNewAddr(prev => ({
        ...prev,
        name: prev.name ? prev.name : realName,
        phone: prev.phone ? prev.phone : realPhone,
      }));
    }
  }, [authUser, supabaseUser]);

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

  const handleGoogleSignInFromCheckout = async () => {
    setIsGoogleLoading(true);
    const { error: err } = await signInWithGoogle();
    if (err) {
      showToast(err, 'error');
      setIsGoogleLoading(false);
    }
  };

  // Step 1 -> Proceed / Place Order (Requires Sign In)
  const handleProceedCheckout = () => {
    // REQUIREMENT: Sign In is required before placing order
    if (!supabaseUser) {
      showToast('Please sign in or create an account to place your order 🔐', 'error');
      openAuthModal('login');
      return;
    }

    let targetAddress = currentAddress;

    // 1. If user has no address saved, try to auto-save from form
    if (!targetAddress && addresses.length === 0) {
      const saved = handleAddNewAddress();
      if (!saved) {
        setIsAddingNewAddress(true);
        setFormError('⚠️ Please fill and save your delivery address to proceed.');
        showToast('Please enter your delivery address first to proceed!', 'error');
        return;
      }
      targetAddress = saved;
    }

    if (!targetAddress) {
      showToast('Please select a delivery address first!', 'error');
      setIsAddingNewAddress(true);
      return;
    }

    setIsProcessingOrder(true);

    setTimeout(() => {
      try {
        if (selectedPayment === 'UPI') {
          // Rule 1: Create SBS Order BEFORE payment
          const order = placeOrder('UPI (GPay / PhonePe)', targetAddress, {
            paymentStatus: 'PENDING',
            keepCart: true // Rule 4: Do not clear cart too early
          });
          setActiveOrder(order);
          setIsProcessingOrder(false);
          setCheckoutStep('UPI_PAYMENT');
        } else {
          // COD or Card
          const order = placeOrder(selectedPayment, targetAddress);
          setIsProcessingOrder(false);
          setIsCheckoutOpen(false);
          try {
            triggerConfetti({ particleCount: 150, duration: 3500 });
          } catch { }
          setSelectedOrderForModal(order);
          setActiveTab('profile');
        }
      } catch (err) {
        setIsProcessingOrder(false);
        showToast('Unable to process order. Please try again.', 'error');
      }
    }, 400);
  };

  // Step 2 -> "✓ I've Completed Payment"
  const handleCustomerConfirmedPayment = () => {
    if (!activeOrder) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    setPaymentConfirmedTime(timeStr);

    // Rule 2: "I've Completed Payment" only means customer confirmation
    updateOrderPaymentStatus(activeOrder.id, 'CUSTOMER_CONFIRMED', {
      paymentConfirmedAt: new Date().toISOString()
    });

    setCheckoutStep('WHATSAPP_CONFIRMATION');
    showToast('Payment confirmation submitted! 👍');
  };

  // Step 3 -> "💬 Send Confirmation on WhatsApp"
  const handleSendWhatsAppConfirmation = () => {
    if (!activeOrder) return;

    const currentConfirmedTime = paymentConfirmedTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    
    // Rule 3: Detect WhatsApp button interaction & record timestamp
    updateOrderPaymentStatus(activeOrder.id, 'CUSTOMER_CONFIRMED', {
      whatsappConfirmedAt: new Date().toISOString()
    });

    setIsWhatsAppOpened(true);

    const message = `Hi SBS 👋\n\nI've completed the payment for my order.\n\nOrder ID: ${activeOrder.orderNumber}\nAmount: ₹${activeOrder.total.toLocaleString('en-IN')}\nPayment confirmation time: ${currentConfirmedTime}\n\nPlease verify my payment and confirm my order. Thank you!`;

    const rawPhone = (storeSettings?.contactPhone && !storeSettings.contactPhone.includes('99887')) ? storeSettings.contactPhone : '9226294797';
    let cleanPhone = rawPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Step 4 -> "Return to Home"
  const handleReturnToHome = () => {
    // Rule 4: Clear cart only after reaching final confirmation state
    clearCart();
    setIsCheckoutOpen(false);
    setCheckoutStep('FORM');
    setActiveOrder(null);
    setActiveTab('home');

    try {
      triggerConfetti({ particleCount: 120, duration: 3000 });
    } catch { }

    showToast('Thank you! Your order is placed and waiting for payment verification 📦', 'success');
  };

  const storeUpiId = (storeSettings?.upiId && !storeSettings.upiId.includes('fam@') && !storeSettings.upiId.includes('sbsstore@')) ? storeSettings.upiId : 'suhanarajpurohit3@oksbi';
  const orderAmount = activeOrder ? activeOrder.total : cartTotal;
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(storeUpiId)}&pn=SBS&am=${orderAmount.toFixed(2)}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(upiDeepLink)}&margin=10`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(storeUpiId);
    setCopiedUpi(true);
    showToast('UPI ID copied to clipboard! 📋');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col relative no-scrollbar">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {checkoutStep === 'UPI_PAYMENT' && (
              <button
                onClick={() => setCheckoutStep('FORM')}
                className="p-1 -ml-1 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                title="Back to Checkout Form"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-base font-black text-gray-900">
                {checkoutStep === 'FORM' && 'Secure Checkout'}
                {checkoutStep === 'UPI_PAYMENT' && 'UPI Payment'}
                {checkoutStep === 'WHATSAPP_CONFIRMATION' && 'Payment Confirmation'}
              </h2>
              <p className="text-[10px] text-gray-500 font-medium">
                {checkoutStep === 'FORM' && (supabaseUser ? 'Signed In & Encrypted' : 'Sign in required to place order')}
                {checkoutStep === 'UPI_PAYMENT' && `Order ID: ${activeOrder?.orderNumber || 'SBS-XXXX'}`}
                {checkoutStep === 'WHATSAPP_CONFIRMATION' && `Order ID: ${activeOrder?.orderNumber || 'SBS-XXXX'}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* STEP 1: CHECKOUT FORM (Address + Payment Method)          */}
        {/* ======================================================== */}
        {checkoutStep === 'FORM' && (
          <>
            <div className="p-4 space-y-4">

              {/* Sign In Required Prompt Banner (When Not Logged In) */}
              {!supabaseUser && (
                <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 border-2 border-orange-200 rounded-3xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#F95721] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-black text-gray-900 text-xs">Sign In Required</h3>
                      <p className="text-[11px] text-gray-600 leading-relaxed mt-0.5 font-medium">
                        Please sign in or create an account to save your address, complete your purchase, and receive order updates.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="py-2.5 px-3 bg-[#F95721] hover:bg-[#E44813] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In / Register</span>
                    </button>

                    <button
                      type="button"
                      disabled={isGoogleLoading}
                      onClick={handleGoogleSignInFromCheckout}
                      className="py-2.5 px-3 bg-white border border-gray-200 hover:border-gray-400 text-gray-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Google</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Delivery Address */}
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

              {/* Payment Method */}
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
                        <span className="text-xs font-bold text-gray-900">UPI (GPay / PhonePe / Paytm / QR)</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#00A859] bg-[#EBF7F0] px-2 py-0.5 rounded-full">
                      Instant & Zero Fee
                    </span>
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

              {/* Order Items Quick Preview */}
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
                onClick={handleProceedCheckout}
                className="w-full py-3.5 bg-[#F95721] hover:bg-[#E44813] disabled:bg-gray-400 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-float active:scale-98 transition-all"
              >
                {isProcessingOrder ? (
                  <span className="animate-pulse">Reserving Order...</span>
                ) : !supabaseUser ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Place Order • ₹{cartTotal.toLocaleString('en-IN')}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{selectedPayment === 'UPI' ? `Proceed to UPI Pay • ₹${cartTotal.toLocaleString('en-IN')}` : `Place Order • ₹${cartTotal.toLocaleString('en-IN')}`}</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* STEP 2: UPI PAYMENT SCREEN (QR + Deep Link + Confirm)     */}
        {/* ======================================================== */}
        {checkoutStep === 'UPI_PAYMENT' && (
          <div className="p-4 space-y-4 animate-fadeIn">
            {/* Total Order Amount Banner */}
            <div className="bg-gradient-to-br from-orange-500 to-[#F95721] text-white rounded-3xl p-4 text-center shadow-lg space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-100">Total Order Amount</span>
              <p className="text-3xl font-black tracking-tight">₹{orderAmount.toLocaleString('en-IN')}</p>
              <div className="inline-flex items-center gap-1.5 bg-black/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white/90">
                <span>Order #{activeOrder?.orderNumber}</span>
              </div>
            </div>

            {/* UPI QR Code Container */}
            <div className="bg-white border-2 border-orange-100 rounded-3xl p-4 text-center space-y-3 shadow-2xs">
              <div className="flex items-center justify-center gap-1.5 text-xs font-black text-gray-800">
                <QrCode className="w-4 h-4 text-[#F95721]" />
                <span>Scan & Pay with Any UPI App</span>
              </div>

              {/* QR Image Container */}
              <div className="flex justify-center py-1">
                <div className="p-2.5 bg-white rounded-2xl border-2 border-gray-100 shadow-xs inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeUrl}
                    alt="UPI Payment QR Code"
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg"
                    loading="eager"
                  />
                </div>
              </div>

              {/* UPI ID Info & Copy */}
              <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-2.5 flex items-center justify-between gap-2 text-xs">
                <div className="text-left min-w-0">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">UPI ID</span>
                  <span className="font-mono font-bold text-gray-900 truncate block">{storeUpiId}</span>
                </div>
                <button
                  type="button"
                  onClick={copyUpiId}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-400 rounded-xl font-bold text-gray-700 text-[11px] shadow-2xs active:scale-95 transition-all flex-shrink-0"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-gray-500 font-medium">
                Supports Google Pay, PhonePe, Paytm, BHIM, CRED, Amazon Pay & all banking UPI apps
              </p>
            </div>

            {/* Mobile "Pay through UPI App" Button (Deep Link) */}
            <div>
              <a
                href={upiDeepLink}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>Pay through UPI App</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
              <p className="text-[10px] text-gray-400 text-center mt-1.5 font-medium">
                Tap above to open installed UPI apps directly on mobile
              </p>
            </div>

            {/* Completion Button */}
            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCustomerConfirmedPayment}
                className="w-full py-3.5 bg-[#F95721] hover:bg-[#E44813] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-float active:scale-98 transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>✓ I&apos;ve Completed Payment</span>
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-1.5 font-medium">
                Click after transferring ₹{orderAmount.toLocaleString('en-IN')} in your UPI app
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: WHATSAPP CONFIRMATION SCREEN                      */}
        {/* ======================================================== */}
        {checkoutStep === 'WHATSAPP_CONFIRMATION' && (
          <div className="p-4 space-y-4 animate-fadeIn">
            {/* Confirmation Header Info */}
            <div className="text-center space-y-2 py-2">
              <div className="w-14 h-14 bg-orange-100 text-[#F95721] rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-gray-900">Payment confirmation</h3>
              <p className="text-xs text-gray-600 leading-relaxed px-2 font-medium">
                Send us a quick WhatsApp message after completing your payment. We&apos;ll verify your payment and respond as quickly as possible.
              </p>
            </div>

            {/* Pre-filled Details Card */}
            <div className="bg-orange-50/70 border border-orange-200 rounded-3xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-orange-200/60">
                <span className="text-gray-500 font-bold">Order ID</span>
                <span className="font-mono font-black text-gray-900 text-sm">{activeOrder?.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-orange-200/60">
                <span className="text-gray-500 font-bold">Order Amount</span>
                <span className="font-black text-[#F95721] text-sm">₹{activeOrder?.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" /> Payment Confirmation Time
                </span>
                <span className="font-bold text-gray-800">{paymentConfirmedTime || 'Just now'}</span>
              </div>
            </div>

            {/* WhatsApp Confirmation Action Button */}
            {!isWhatsAppOpened ? (
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSendWhatsAppConfirmation}
                  className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1caa4f] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>💬 Send Confirmation on WhatsApp</span>
                </button>
                <p className="text-[10px] text-gray-400 text-center font-medium">
                  Opens WhatsApp with pre-filled order details automatically
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {/* Confirmation Opened Badge */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3 text-emerald-900">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="font-black block text-emerald-950 text-xs">WhatsApp confirmation opened ✓</span>
                    <span className="text-[11px] text-emerald-800">
                      We will verify your UPI payment and update your order timeline shortly.
                    </span>
                  </div>
                </div>

                {/* Return to Home Button */}
                <button
                  type="button"
                  onClick={handleReturnToHome}
                  className="w-full py-3.5 bg-[#F95721] hover:bg-[#E44813] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-float active:scale-98 transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span>Return to Home</span>
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSendWhatsAppConfirmation}
                    className="text-[11px] font-bold text-gray-500 hover:text-emerald-700 underline"
                  >
                    Reopen WhatsApp message
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
