'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/context/StoreContext';

export interface FlyingItem {
  id: string;
  image: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const FlyToCartAnimation: React.FC = () => {
  const { flyingItems, removeFlyingItem } = useStore();

  return (
    <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden">
      {flyingItems.map((item) => (
        <FlyingItemElement
          key={item.id}
          item={item}
          onComplete={() => removeFlyingItem(item.id)}
        />
      ))}
    </div>
  );
};

const FlyingItemElement: React.FC<{
  item: FlyingItem;
  onComplete: () => void;
}> = ({ item, onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start animation on next frame
    const startTimer = requestAnimationFrame(() => {
      setIsAnimating(true);
    });

    // Complete and remove particle after flight duration
    const endTimer = setTimeout(() => {
      // Trigger cart icon bounce
      const headerCart = document.getElementById('header-cart-button');
      const bottomNavCart = document.getElementById('bottom-nav-cart-button');

      if (headerCart) {
        headerCart.classList.add('animate-cart-bounce');
        setTimeout(() => headerCart.classList.remove('animate-cart-bounce'), 700);
      }
      if (bottomNavCart) {
        bottomNavCart.classList.add('animate-cart-bounce');
        setTimeout(() => bottomNavCart.classList.remove('animate-cart-bounce'), 700);
      }

      onComplete();
    }, 750);

    return () => {
      cancelAnimationFrame(startTimer);
      clearTimeout(endTimer);
    };
  }, [item, onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        left: isAnimating ? `${item.endX}px` : `${item.startX}px`,
        top: isAnimating ? `${item.endY}px` : `${item.startY}px`,
        transform: `translate(-50%, -50%) ${
          isAnimating ? 'scale(0.18) rotate(20deg)' : 'scale(1) rotate(-5deg)'
        }`,
        opacity: isAnimating ? 0.9 : 1,
        transition: 'left 0.75s cubic-bezier(0.19, 1, 0.22, 1), top 0.75s cubic-bezier(0.4, 0, 0.2, 1), transform 0.75s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.75s ease',
        width: '64px',
        height: '64px',
      }}
      className="bg-white rounded-2xl p-1 shadow-[0_10px_35px_rgba(243,92,22,0.45)] border-2 border-[#F35C16] flex items-center justify-center pointer-events-none"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image}
        alt="Adding to cart"
        className="w-full h-full object-contain rounded-xl"
      />
    </div>
  );
};
