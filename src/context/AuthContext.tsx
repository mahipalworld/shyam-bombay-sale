'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar_url?: string;
  reward_points: number;
}

interface AuthContextType {
  supabaseUser: User | null;
  authUser: AuthUser | null;
  loading: boolean;
  isGoogleAuth: boolean;
  isSuperAdmin: boolean;
  authProvider: string;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup';
  isPhonePromptOpen: boolean;
  openAuthModal: (tab?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  openPhonePrompt: () => void;
  closePhonePrompt: () => void;
  dismissPhonePrompt: () => void;
  savePhoneNumber: (phone: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [isPhonePromptOpen, setIsPhonePromptOpen] = useState(false);

  // Helper to check if phone prompt should be shown
  const checkShouldPromptPhone = (phone?: string | null, userId?: string) => {
    if (typeof window === 'undefined') return;
    const uId = userId || supabaseUser?.id;
    const cachedPhone = uId ? localStorage.getItem(`sbs_user_phone_${uId}`) : null;
    const effectivePhone = (phone && phone.trim().length >= 10) ? phone : cachedPhone;
    
    // Check if dismissed previously on this device
    const isDismissed = uId ? localStorage.getItem(`sbs_phone_dismissed_${uId}`) === 'true' : false;

    if (!effectivePhone && !isDismissed) {
      setIsPhonePromptOpen(true);
    } else {
      setIsPhonePromptOpen(false);
    }
  };

  // Load profile from Supabase
  const loadProfile = async (user: User) => {
    if (!supabase) return;
    const cachedPhone = (typeof window !== 'undefined') ? (localStorage.getItem(`sbs_user_phone_${user.id}`) || '') : '';
    const metadataPhone = user.user_metadata?.phone || '';

    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const phone = data?.phone || metadataPhone || cachedPhone || '';
    
    if (phone && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`sbs_user_phone_${user.id}`, phone);
      } catch { }
    }

    if (data) {
      const profileUser: AuthUser = {
        id: data.id,
        email: data.email || user.email || '',
        name: data.name || user.user_metadata?.full_name || user.user_metadata?.name || 'User',
        phone,
        avatar_url: data.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture,
        reward_points: data.reward_points ?? 250,
      };
      setAuthUser(profileUser);
      checkShouldPromptPhone(phone, user.id);
    } else {
      // Auto-create profile for Google / OAuth login
      const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      const avatar_url = user.user_metadata?.avatar_url || user.user_metadata?.picture;
      await supabase.from('profiles').upsert({
        id: user.id,
        name,
        email: user.email || '',
        phone,
        avatar_url,
        reward_points: 250,
      });
      const newAuthUser: AuthUser = {
        id: user.id,
        email: user.email || '',
        name,
        phone,
        avatar_url,
        reward_points: 250,
      };
      setAuthUser(newAuthUser);
      checkShouldPromptPhone(phone, user.id);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user);
      } else {
        setAuthUser(null);
        setIsPhonePromptOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = (tab: 'login' | 'signup' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openPhonePrompt = () => setIsPhonePromptOpen(true);
  const closePhonePrompt = () => setIsPhonePromptOpen(false);
  const dismissPhonePrompt = () => {
    if (supabaseUser && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`sbs_phone_dismissed_${supabaseUser.id}`, 'true');
      } catch { }
    }
    setIsPhonePromptOpen(false);
  };

  const savePhoneNumber = async (phoneNumber: string) => {
    if (!supabase || !supabaseUser) return { error: 'Not authenticated' };

    // Clean and validate number
    const cleanedDigits = phoneNumber.replace(/\D/g, '');
    let finalPhone = phoneNumber.trim();

    // Ensure +91 prefix
    if (cleanedDigits.length === 10) {
      finalPhone = `+91 ${cleanedDigits}`;
    } else if (cleanedDigits.length === 12 && cleanedDigits.startsWith('91')) {
      finalPhone = `+91 ${cleanedDigits.slice(2)}`;
    } else if (cleanedDigits.length === 11 && cleanedDigits.startsWith('0')) {
      finalPhone = `+91 ${cleanedDigits.slice(1)}`;
    } else if (!finalPhone.startsWith('+91')) {
      finalPhone = `+91 ${finalPhone}`;
    }

    // 1. Save to local storage immediately
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`sbs_user_phone_${supabaseUser.id}`, finalPhone);
        localStorage.setItem(`sbs_phone_dismissed_${supabaseUser.id}`, 'true');
      } catch { }
    }

    // 2. Update auth user_metadata
    try {
      await supabase.auth.updateUser({ data: { phone: finalPhone } });
    } catch { }

    // 3. Update profiles table
    const { error } = await supabase.from('profiles').update({ phone: finalPhone }).eq('id', supabaseUser.id);
    if (error) {
      console.warn('Profiles update warning:', error.message);
    }

    setAuthUser(prev => prev ? { ...prev, phone: finalPhone } : null);
    setIsPhonePromptOpen(false);
    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    if (!supabase) return { error: 'Supabase not configured' };

    let formattedPhone = phone?.trim() || '';
    if (formattedPhone) {
      const digits = formattedPhone.replace(/\D/g, '');
      if (digits.length === 10) {
        formattedPhone = `+91 ${digits}`;
      } else if (!formattedPhone.startsWith('+91')) {
        formattedPhone = `+91 ${formattedPhone}`;
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone: formattedPhone } },
    });
    if (error) return { error: error.message };

    // Create profile row
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        email,
        phone: formattedPhone,
        reward_points: 250,
      });
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signInWithGoogle = async () => {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}` : undefined,
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthUser(null);
    setSupabaseUser(null);
    setIsPhonePromptOpen(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('sbs_phone_prompt_dismissed');
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!supabase || !supabaseUser) return;
    await supabase.from('profiles').update(updates).eq('id', supabaseUser.id);
    setAuthUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const isGoogleAuth = Boolean(
    supabaseUser?.app_metadata?.provider === 'google' ||
    (Array.isArray(supabaseUser?.app_metadata?.providers) && supabaseUser.app_metadata.providers.includes('google')) ||
    supabaseUser?.identities?.some((identity: any) => identity.provider === 'google')
  );

  const PRIMARY_ADMIN_EMAILS = [
    'mahipalstudent71@gmail.com',
    'shyambombaysale@gmail.com',
    'mahipalworld71@gmail.com'
  ];

  const currentEmail = (authUser?.email || supabaseUser?.email || '').trim().toLowerCase();
  const isSuperAdmin = Boolean(currentEmail && PRIMARY_ADMIN_EMAILS.includes(currentEmail));

  const authProvider = (
    supabaseUser?.app_metadata?.provider ||
    (Array.isArray(supabaseUser?.app_metadata?.providers) && supabaseUser.app_metadata.providers[0]) ||
    (supabaseUser ? 'email' : 'none')
  );

  return (
    <AuthContext.Provider value={{
      supabaseUser,
      authUser,
      loading,
      isGoogleAuth,
      isSuperAdmin,
      authProvider,
      isAuthModalOpen,
      authModalTab,
      isPhonePromptOpen,
      openAuthModal,
      closeAuthModal,
      openPhonePrompt,
      closePhonePrompt,
      dismissPhonePrompt,
      savePhoneNumber,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};


