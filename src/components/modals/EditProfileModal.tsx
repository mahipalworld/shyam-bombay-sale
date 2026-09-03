'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { X, User, Mail } from 'lucide-react';

export const EditProfileModal: React.FC = () => {
  const { user, updateUserProfile, isEditProfileOpen, setIsEditProfileOpen, showToast } = useStore();
  const { authUser, updateProfile } = useAuth();

  const [name, setName] = useState(authUser?.name || user.name);
  const [email, setEmail] = useState(authUser?.email || user.email);
  
  // Extract 10 digits from initial phone
  const getInitialDigits = (p?: string) => {
    if (!p) return '';
    const clean = p.replace(/\D/g, '');
    if (clean.length === 12 && clean.startsWith('91')) return clean.slice(2);
    if (clean.length === 11 && clean.startsWith('0')) return clean.slice(1);
    return clean.slice(0, 10);
  };

  const [digits, setDigits] = useState(getInitialDigits(authUser?.phone || user.phone));

  useEffect(() => {
    if (isEditProfileOpen) {
      setName(authUser?.name || user.name);
      setEmail(authUser?.email || user.email);
      setDigits(getInitialDigits(authUser?.phone || user.phone));
    }
  }, [isEditProfileOpen, authUser, user]);

  if (!isEditProfileOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPhone = digits ? `+91 ${digits}` : '';
    
    updateUserProfile({ name, email, phone: formattedPhone });
    if (authUser) {
      await updateProfile({ name, email, phone: formattedPhone });
    }
    showToast('Profile updated successfully');
    setIsEditProfileOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-sm font-bold text-gray-900">Edit Profile</h3>
          <button
            onClick={() => setIsEditProfileOpen(false)}
            className="text-gray-400 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Full Name</label>
            <div className="flex items-center border rounded-xl px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:border-[#F35C16]">
              <User className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent outline-none w-full text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Email Address</label>
            <div className="flex items-center border rounded-xl px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:border-[#F35C16]">
              <Mail className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent outline-none w-full text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Mobile Number</label>
            <div className="flex items-center border rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-[#F35C16] overflow-hidden">
              <div className="flex items-center gap-1 px-2.5 py-2 bg-gray-100/90 border-r border-gray-200 select-none shrink-0">
                <span className="text-xs" role="img" aria-label="India">🇮🇳</span>
                <span className="text-xs font-bold text-gray-700">+91</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={digits}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length === 12 && val.startsWith('91')) val = val.slice(2);
                  if (val.length === 11 && val.startsWith('0')) val = val.slice(1);
                  setDigits(val.slice(0, 10));
                }}
                maxLength={10}
                className="bg-transparent outline-none w-full px-3 py-2 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(false)}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#F35C16] hover:bg-[#E04F0E] text-white font-bold rounded-xl shadow-sm"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
