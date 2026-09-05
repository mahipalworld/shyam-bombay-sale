'use client';

import React from 'react';
import { Product } from '@/types';
import { useStore } from '@/context/StoreContext';
import { Star, Heart, Plus, Minus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { 
    cart,
    addToCart, 
    updateCartQuantity,
    removeFromCart,
    toggleWishlist, 
    isInWishlist, 
    setSelectedProductDetail 
  } = useStore();

  const wishlisted = isInWishlist(product.id);
  const cartItem = cart.find((item) => item.productId === product.id || item.product.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleClick = () => {
    if (onSelect) {
      onSelect();
    } else {
      setSelectedProductDetail(product);
    }
  };

  return (
    <div 
      className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col justify-between shadow-subtle hover:shadow-card transition-all duration-200 group relative"
    >
      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product);
        }}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:scale-110 active:scale-95 transition-all"
      >
        <Heart
          className={`w-4 h-4 ${
            wishlisted ? 'fill-[#E53E3E] text-[#E53E3E]' : 'text-gray-400 hover:text-gray-600'
          }`}
        />
      </button>

      {/* Product Image Area */}
      <div 
        onClick={handleClick}
        className="cursor-pointer aspect-square w-full rounded-xl bg-[#F9FAFB] flex items-center justify-center p-3 overflow-hidden relative"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Product Details */}
      <div className="mt-2 flex-1 flex flex-col justify-between">
        <div onClick={handleClick} className="cursor-pointer space-y-1">
          <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-[#F95721] transition-colors min-h-[32px] sm:min-h-[38px]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="font-extrabold text-gray-900">{product.rating}</span>
            <span className="text-gray-400">({product.reviewCount})</span>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline flex-wrap gap-1.5 pt-0.5">
            <span className="text-sm sm:text-base font-black text-gray-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-gray-500 font-medium line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-extrabold text-[#C83B0E] bg-orange-100/70 px-1.5 py-0.5 rounded">
              {product.discountPercentage}% OFF
            </span>
          </div>
        </div>

        {/* Dynamic Add to Cart / Quantity Stepper */}
        {quantityInCart > 0 ? (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="mt-2.5 w-full h-9 sm:h-10 px-1 bg-gradient-to-r from-[#F95721] to-[#FF7038] text-white rounded-xl flex items-center justify-between shadow-xs select-none animate-scaleUp"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (quantityInCart <= 1) {
                  removeFromCart(product.id);
                } else {
                  updateCartQuantity(product.id, quantityInCart - 1);
                }
              }}
              className="w-8 h-full flex items-center justify-center hover:bg-black/15 active:scale-75 rounded-lg transition-all"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4 stroke-[3px]" />
            </button>

            <span className="font-black text-xs sm:text-sm tracking-tight px-2 scale-100">
              {quantityInCart}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                updateCartQuantity(product.id, quantityInCart + 1);
              }}
              className="w-8 h-full flex items-center justify-center hover:bg-black/15 active:scale-75 rounded-lg transition-all"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1, e.currentTarget);
            }}
            className="mt-2.5 w-full h-9 sm:h-10 px-3 bg-[#F95721] hover:bg-[#E44813] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5px]" />
            <span>Add to Cart</span>
          </button>
        )}
      </div>
    </div>
  );
};
