'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { Home, LayoutGrid, ShoppingCart, Heart, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, cart, wishlist } = useStore();
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: totalCartCount },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlist.length > 0 ? wishlist.length : undefined },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-100/90 py-1.5 px-3 shadow-[0_-4px_25px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={item.id === 'cart' ? 'bottom-nav-cart-button' : undefined}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 tap-active ${
                isActive ? 'text-[#F35C16]' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5px]' : 'stroke-[1.8px]'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 bg-[#F35C16] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold mt-1 tracking-tight transition-colors ${isActive ? 'text-[#F35C16]' : 'text-gray-500'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-3 h-0.5 rounded-full bg-[#F35C16]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
