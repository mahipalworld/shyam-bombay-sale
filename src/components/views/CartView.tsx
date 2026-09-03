import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { triggerConfetti } from '@/utils/confetti';
import { ScratchCardModal } from '@/components/modals/ScratchCardModal';
import { 
  Trash2, 
  Heart, 
  Minus, 
  Plus, 
  Tag, 
  Truck, 
  ChevronRight, 
  ShoppingBag,
  Ticket,
  Sparkles,
  Gift
} from 'lucide-react';

export const CartView: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    toggleCartItemSelection,
    toggleWishlist,
    isInWishlist,
    setActiveTab,
    setIsCheckoutOpen,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    cartSubtotal,
    cartDiscount,
    cartDeliveryCharge,
    cartTotal,
  } = useStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isScratchOpen, setIsScratchOpen] = useState(false);
  const freeShippingThreshold = 1700;
  const awayFromFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  const selectedItems = cart.filter((item) => item.selected);
  const selectedOriginalMRP = selectedItems.reduce(
    (acc, item) => acc + item.product.originalPrice * item.quantity,
    0
  );

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    if (applyCoupon(couponCodeInput)) {
      setCouponCodeInput('');
      triggerConfetti();
    }
  };

  if (cart.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 pb-24 animate-fadeIn">
        <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center text-[#F95721]">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1 max-w-sm">
            Looks like you haven&apos;t added anything to your cart yet. Explore our everyday smart products!
          </p>
        </div>
        <button
          onClick={() => setActiveTab('home')}
          className="px-8 py-3.5 bg-[#F95721] hover:bg-[#E44813] text-white text-xs md:text-sm font-bold rounded-xl shadow-float transition-all tap-active"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="py-2 space-y-5 pb-36 md:pb-12 animate-fadeIn">
      {/* Title Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            My Cart <span className="text-gray-500 font-semibold text-base md:text-lg">({cart.length})</span>
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5 font-medium">
            Review your items and proceed to checkout
          </p>
        </div>
        <button
          onClick={() => setActiveTab('categories')}
          className="text-xs md:text-sm font-bold text-[#F95721] hover:underline"
        >
          Add More
        </button>
      </div>

      {/* 2-Column Responsive Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left 2 Columns: Items List & Savings */}
        <div className="lg:col-span-2 space-y-4">
          {/* Savings Alert Banner */}
          {cartDiscount > 0 && (
            <div className="bg-gradient-to-r from-[#EBF7F0] to-[#E2F5E9] border border-[#A7E3BC] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#00A859] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Tag className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-[#008746] leading-snug">
                  Yay! You saved ₹{cartDiscount.toLocaleString('en-IN')} on this order
                </p>
                <p className="text-[11px] sm:text-xs text-gray-600 font-medium truncate">
                  Great choice! Add more items for additional savings.
                </p>
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="space-y-3">
            {cart.map((item) => {
              const wishlisted = isInWishlist(item.productId);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-3.5 sm:p-4 shadow-subtle flex items-start gap-3 sm:gap-4 relative transition-all hover:border-gray-200"
                >
                  {/* Custom Checkbox */}
                  <div className="pt-2 sm:pt-3">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleCartItemSelection(item.productId)}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded text-[#F95721] focus:ring-[#F95721] cursor-pointer accent-[#F95721]"
                    />
                  </div>

                  {/* Product Thumbnail */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-[#F9FAFB] p-2 flex items-center justify-center flex-shrink-0 border border-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  {/* Info & Controls */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 sm:line-clamp-2 leading-snug">
                        {item.product.name}
                      </h3>
                      <button
                        onClick={() => toggleWishlist(item.product)}
                        className="p-1 -mr-1 text-gray-400 hover:text-[#E53E3E] transition-colors"
                        aria-label="Wishlist item"
                        title={wishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            wishlisted ? 'fill-[#E53E3E] text-[#E53E3E]' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* In Stock Badge */}
                    <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00A859]" />
                      <span className="text-[11px] font-semibold text-[#00A859]">
                        In Stock
                      </span>
                    </div>

                    {/* Price Line */}
                    <div className="flex items-baseline flex-wrap gap-1.5 mt-1 sm:mt-1.5">
                      <span className="text-sm sm:text-base font-extrabold text-[#F95721]">
                        ₹{item.product.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] sm:text-xs text-gray-400 line-through">
                        ₹{item.product.originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-[#EA580C] bg-[#FFF4EC] px-1.5 py-0.5 rounded">
                        {item.product.discountPercentage}% OFF
                      </span>
                    </div>

                    {/* Stepper + Delete Row */}
                    <div className="flex items-center justify-between mt-2.5 sm:mt-3 pt-1">
                      {/* Quantity Stepper */}
                      <div className="inline-flex items-center border border-gray-200 rounded-xl bg-gray-50/70 p-0.5 shadow-2xs">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-black rounded-lg hover:bg-white active:scale-95 transition-all"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-extrabold text-gray-900 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-black rounded-lg hover:bg-white active:scale-95 transition-all"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Delete Trash Icon */}
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 active:scale-95 transition-colors"
                        aria-label="Remove item"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Column: Shipping Meter, Coupons, Price Details, Checkout */}
        <div className="space-y-4 lg:sticky lg:top-24">
          {/* Free Delivery Milestone Progress Meter */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 space-y-2.5 shadow-subtle">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FFF4EC] text-[#F95721] flex items-center justify-center flex-shrink-0">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  {awayFromFreeShipping > 0 ? (
                    <p className="text-xs font-semibold text-gray-800 leading-tight">
                      You are <span className="font-extrabold text-[#F95721]">₹{awayFromFreeShipping}</span> away from <span className="font-extrabold text-[#00A859]">FREE Delivery</span>
                    </p>
                  ) : (
                    <p className="text-xs font-extrabold text-[#00A859] leading-tight">
                      🎉 You unlocked FREE Delivery!
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setActiveTab('categories')}
                className="text-[11px] sm:text-xs font-bold text-[#F95721] border border-[#FEDDC7] px-2.5 py-1 rounded-xl hover:bg-[#FFF4EC] flex-shrink-0 transition-colors"
              >
                Shop More
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#F95721] to-[#FA7035] h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
              <span>₹0</span>
              <span>₹{freeShippingThreshold} Target</span>
            </div>
          </div>

          {/* Coupon Application Box */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 shadow-subtle space-y-3">
            {/* Scratch & Win Quick Banner */}
            <div 
              onClick={() => setIsScratchOpen(true)}
              className="p-3 bg-gradient-to-r from-orange-50 via-[#FFF4EC] to-amber-50 rounded-2xl border border-orange-200/80 flex items-center justify-between cursor-pointer hover:border-orange-300 shadow-2xs group tap-active transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F95721] text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 leading-tight">
                    Scratch for Surprise Discount!
                  </h4>
                  <p className="text-[10px] text-gray-500">Tap to uncover a mystery coupon</p>
                </div>
              </div>
              <span className="text-[11px] font-black text-[#F95721] bg-white px-2.5 py-1 rounded-xl border border-orange-200 shadow-2xs">
                Scratch →
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-gray-800 pt-1">
              <Ticket className="w-4 h-4 text-[#F95721]" />
              <span>Apply Promo Coupon</span>
            </div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl p-2.5 px-3">
                <div>
                  <span className="text-xs font-bold text-[#F95721]">{appliedCoupon.code}</span>
                  <p className="text-[11px] text-gray-600">{appliedCoupon.title}</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SBS100"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs uppercase font-bold tracking-wider outline-none focus:border-[#F95721]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl active:scale-95 transition-all"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          <ScratchCardModal
            isOpen={isScratchOpen}
            onClose={() => setIsScratchOpen(false)}
          />

          {/* Price Details Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-4 sm:p-5 space-y-3 shadow-subtle">
            <h3 className="font-bold text-gray-900 text-sm">Price Details</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Total MRP ({selectedItems.length} items)</span>
                <span className="font-semibold text-gray-900">
                  ₹{selectedOriginalMRP.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Discount on MRP</span>
                <span className="font-bold text-[#00A859]">
                  -₹{cartDiscount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Delivery Charges</span>
                <span className="font-semibold text-gray-900">
                  {cartDeliveryCharge === 0 ? (
                    <span className="text-[#00A859] font-bold">FREE</span>
                  ) : (
                    `₹${cartDeliveryCharge}`
                  )}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-gray-900 text-sm">Total Amount</span>
                  <p className="text-[10px] text-gray-400">(Inclusive of all taxes)</p>
                </div>
                <span className="text-xl sm:text-2xl font-black text-[#F95721]">
                  ₹{cartTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Desktop Checkout Button */}
            <button
              disabled={selectedItems.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
              className="hidden lg:flex w-full py-3.5 bg-gradient-to-r from-[#F95721] to-[#FA7035] hover:from-[#E44813] hover:to-[#F95721] disabled:bg-gray-300 text-white font-bold text-sm rounded-2xl items-center justify-center gap-2 shadow-float active:scale-98 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ChevronRight className="w-4 h-4 stroke-[3px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Sleek Mobile Bottom Checkout Dock (Mobile Only) */}
      <div className="md:hidden fixed bottom-[60px] left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Total Amount</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-[#F95721]">
                ₹{cartTotal.toLocaleString('en-IN')}
              </span>
              {cartDiscount > 0 && (
                <span className="text-[10px] font-bold text-[#00A859]">
                  Save ₹{cartDiscount}
                </span>
              )}
            </div>
          </div>

          <button
            disabled={selectedItems.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className="flex-1 max-w-[200px] py-3 px-4 bg-gradient-to-r from-[#F95721] to-[#FA7035] hover:from-[#E44813] hover:to-[#F95721] disabled:bg-gray-300 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-float active:scale-95 transition-all"
          >
            <span>Checkout</span>
            <ChevronRight className="w-4 h-4 stroke-[3px]" />
          </button>
        </div>
      </div>
    </div>
  );
};
