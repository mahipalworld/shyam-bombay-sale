'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Product } from '@/types';
import { useStore } from '@/context/StoreContext';
import { Heart, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { ResolvedImage } from './common/ResolvedMedia';

interface ProductCardProps {
  product: Product;
  onSelect?: () => void;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, priority = false }) => {
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

  // Canonical list of unique images for this card
  const cardImages = useMemo(() => {
    const list: string[] = [];
    if (product.image) list.push(product.image);
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [product.image, product.images]);

  const [cardImgIndex, setCardImgIndex] = useState(0);
  const [cardDragOffset, setCardDragOffset] = useState(0);
  const [isCardDragging, setIsCardDragging] = useState(false);
  const cardTouchRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const cardIsHorizontalRef = useRef<boolean | null>(null);

  const handleCardTouchStart = (e: React.TouchEvent) => {
    if (cardImages.length <= 1) return;
    const touch = e.touches[0];
    cardTouchRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    cardIsHorizontalRef.current = null;
    setIsCardDragging(true);
    setCardDragOffset(0);
  };

  const handleCardTouchMove = (e: React.TouchEvent) => {
    if (!cardTouchRef.current || cardImages.length <= 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - cardTouchRef.current.x;
    const deltaY = touch.clientY - cardTouchRef.current.y;

    if (cardIsHorizontalRef.current === null) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        cardIsHorizontalRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (cardIsHorizontalRef.current) {
      let offset = deltaX;
      if ((cardImgIndex === 0 && deltaX > 0) || (cardImgIndex === cardImages.length - 1 && deltaX < 0)) {
        offset = deltaX * 0.35;
      }
      setCardDragOffset(offset);
    }
  };

  const handleCardTouchEnd = () => {
    if (!cardTouchRef.current) return;
    const currentOffset = cardDragOffset;
    const isHorizontal = cardIsHorizontalRef.current;

    setIsCardDragging(false);
    setCardDragOffset(0);
    cardTouchRef.current = null;
    cardIsHorizontalRef.current = null;

    if (!isHorizontal) return;

    if (Math.abs(currentOffset) > 35) {
      if (currentOffset < 0 && cardImgIndex < cardImages.length - 1) {
        if ('vibrate' in navigator) navigator.vibrate(8);
        setCardImgIndex((prev) => prev + 1);
      } else if (currentOffset > 0 && cardImgIndex > 0) {
        if ('vibrate' in navigator) navigator.vibrate(8);
        setCardImgIndex((prev) => prev - 1);
      }
    }
  };

  const [justAdded, setJustAdded] = useState(false);

  const handleClick = () => {
    if (onSelect) {
      onSelect();
    } else {
      setSelectedProductDetail(product);
    }
  };

  const handleCycleImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cardImages.length > 1) {
      setCardImgIndex((prev) => (prev + 1) % cardImages.length);
      if ('vibrate' in navigator) navigator.vibrate(8);
    } else {
      handleClick();
    }
  };

  return (
    <div 
      className="bg-white rounded-2xl border border-gray-100 hover:border-orange-200/80 p-2.5 sm:p-3 flex flex-col justify-between shadow-subtle hover:shadow-card transition-all duration-200 group relative"
    >
      {/* Wishlist Button with 44x44px accessible touch target */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product);
        }}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className="absolute top-1 right-1 z-10 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:scale-110 active:scale-95 transition-all tap-active"
      >
        <div className="w-7 h-7 rounded-full bg-white/95 backdrop-blur-xs shadow-2xs flex items-center justify-center border border-gray-100/60">
          <Heart
            className={`w-3.5 h-3.5 ${
              wishlisted ? 'fill-[#E53E3E] text-[#E53E3E]' : 'text-gray-400 hover:text-gray-600'
            }`}
          />
        </div>
      </button>

      {/* Product Image Area with Finger Sliding & Tap Fallback — Pure white seamless container */}
      <div 
        onClick={() => {
          if (Math.abs(cardDragOffset) > 8) return;
          handleClick();
        }}
        onTouchStart={handleCardTouchStart}
        onTouchMove={handleCardTouchMove}
        onTouchEnd={handleCardTouchEnd}
        onTouchCancel={handleCardTouchEnd}
        className="cursor-pointer aspect-square w-full rounded-xl bg-white flex items-center justify-center overflow-hidden relative select-none touch-pan-y"
      >
        {/* Discount Badge on Product Image Top-Left Corner */}
        {product.discountPercentage > 0 && (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <span className="px-2 py-0.5 rounded-md bg-[#008744] text-white text-[10px] font-black shadow-2xs tracking-wide">
              {product.discountPercentage}% OFF
            </span>
          </div>
        )}

        <div 
          className="w-full h-full flex"
          style={{
            transform: `translateX(calc(-${cardImgIndex * 100}% + ${cardDragOffset}px))`,
            transition: isCardDragging ? 'none' : 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform',
          }}
        >
          {cardImages.map((img, i) => (
            <div key={i} className="w-full h-full flex-shrink-0 flex items-center justify-center p-2.5 relative">
              <ResolvedImage
                src={img}
                alt={product.name}
                priority={priority && i === 0}
                fetchPriority={i > 0 ? 'low' : (priority ? 'high' : undefined)}
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300 pointer-events-none"
              />
            </div>
          ))}
        </div>

        {/* Small Dot Indicators on Card if Multiple Images — Also Tappable */}
        {cardImages.length > 1 && (
          <div 
            onClick={handleCycleImage}
            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-white/85 backdrop-blur-xs px-2 py-1 rounded-full shadow-2xs cursor-pointer"
            title="Tap to see next image"
          >
            {cardImages.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  cardImgIndex === i
                    ? 'w-2.5 bg-[#F95721]'
                    : 'w-1 bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="mt-2 flex-1 flex flex-col justify-between">
        <div onClick={handleClick} className="cursor-pointer space-y-1">
          {/* Truncate Product Name to 2 lines max with ellipsis */}
          <h3 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-[#F95721] transition-colors min-h-[32px] sm:min-h-[38px]">
            {product.name}
          </h3>

          {/* Compact Trust / Verified Pill */}
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#00A859]">
            <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
            <span>SBS Verified</span>
          </div>

          {/* Price Row: Bold larger current price + muted strikethrough MRP */}
          <div className="flex items-baseline flex-wrap gap-1.5 pt-0.5">
            <span className="text-base sm:text-lg font-black text-gray-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 font-medium line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Add to Cart / Compact Stepper */}
        {quantityInCart > 0 ? (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="mt-2.5 w-full h-8 sm:h-9 px-1 bg-gradient-to-r from-[#F95721] to-[#E44813] text-white rounded-xl flex items-center justify-between shadow-xs select-none animate-scaleUp"
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
              className="w-7 h-full flex items-center justify-center hover:bg-black/15 active:scale-75 rounded-lg transition-all"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5 stroke-[3px]" />
            </button>

            <span className="font-black text-xs sm:text-sm tracking-tight px-1 scale-100">
              {quantityInCart}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                const maxStock = Math.min(10, product.stockCount || 10);
                if (quantityInCart < maxStock) {
                  updateCartQuantity(product.id, quantityInCart + 1);
                }
              }}
              disabled={quantityInCart >= Math.min(10, product.stockCount || 10)}
              className="w-7 h-full flex items-center justify-center hover:bg-black/15 disabled:opacity-30 active:scale-75 rounded-lg transition-all"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3px]" />
            </button>
          </div>
        ) : justAdded ? (
          <div className="mt-2.5 w-full h-8 sm:h-9 px-3 bg-[#00A859] text-white text-xs font-black rounded-xl flex items-center justify-center gap-1 shadow-xs animate-scaleUp">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Added!</span>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setJustAdded(true);
              addToCart(product, 1, e.currentTarget);
              if ('vibrate' in navigator) navigator.vibrate(10);
              setTimeout(() => setJustAdded(false), 900);
            }}
            className="mt-2.5 w-full h-8 sm:h-9 px-3 bg-orange-50 hover:bg-[#F95721] text-[#F95721] hover:text-white border border-orange-200/90 hover:border-[#F95721] text-xs font-black rounded-xl flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all duration-150"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3px]" />
            <span>ADD</span>
          </button>
        )}
      </div>
    </div>
  );
};
