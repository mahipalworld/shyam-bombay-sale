'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles, AlertCircle, LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal, signIn, signUp, signInWithGoogle, openAuthModal } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isLogin = authModalTab === 'login';

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setError(null);
    setSuccess(null);
    setLoading(false);
    setGoogleLoading(false);
    setShowPassword(false);
  };

  const switchTab = (tab: 'login' | 'signup') => {
    resetForm();
    openAuthModal(tab);
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setGoogleLoading(true);
    const { error: err } = await signInWithGoogle();
    if (err) {
      setError(err);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (isLogin) {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err);
        setLoading(false);
      } else {
        resetForm();
        closeAuthModal();
      }
    } else {
      if (!name.trim()) {
        setError('Please enter your full name');
        setLoading(false);
        return;
      }
      const { error: err } = await signUp(email, password, name, phone);
      if (err) {
        setError(err);
        setLoading(false);
      } else {
        setSuccess('Account created! Please check your email to verify, then sign in.');
        setLoading(false);
      }
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
        onClick={() => {
          resetForm();
          closeAuthModal();
        }}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[400px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-10 my-auto">
        
        {/* Header with Door Logo & Brand Lockup */}
        <div className="relative bg-gradient-to-br from-[#FF6600] via-[#F95721] to-[#E44813] px-6 pt-7 pb-8 text-white overflow-hidden">
          {/* Subtle ambient lighting decorations */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 -left-8 w-28 h-28 bg-black/10 rounded-full blur-xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => {
              resetForm();
              closeAuthModal();
            }}
            aria-label="Close"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-xs transition-all active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Brand Lockup: Door Logo + Wordmark in Perfect Ratio */}
          <div className="inline-flex items-center gap-2.5 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-2xl shadow-xs mb-3.5 border border-white/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/door-logo.png?v=4"
              alt="SBS Door Logo"
              style={{ width: '26px', height: '26px', maxWidth: '26px', maxHeight: '26px' }}
              className="w-[26px] h-[26px] object-contain flex-shrink-0"
            />
            <div className="w-px h-4.5 bg-gray-200" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/sbs-wordmark.svg"
              alt="SBS - Shyam Bombay Sale"
              style={{ height: '20px', width: 'auto', maxHeight: '20px' }}
              className="h-5 w-auto object-contain flex-shrink-0"
            />
          </div>

          {/* Main Title & Subtitle */}
          <h2 className="text-white font-extrabold text-2xl tracking-tight leading-tight">
            {isLogin ? 'Sign in to SBS' : 'Create an Account'}
          </h2>
          <p className="text-orange-100/90 text-xs font-medium mt-1 leading-snug">
            {isLogin
              ? 'Access your orders, saved addresses & exclusive coupons.'
              : 'Join today for VIP perks, order tracking & faster checkout.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 -mt-4 relative z-10">
          <div className="bg-white p-1 rounded-2xl shadow-md shadow-gray-200/80 border border-gray-100 flex items-center gap-1">
            <button
              type="button"
              onClick={() => switchTab('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                isLogin
                  ? 'bg-gradient-to-r from-[#FF6600] to-[#E44813] text-white shadow-sm shadow-orange-300'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => switchTab('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                !isLogin
                  ? 'bg-gradient-to-r from-[#FF6600] to-[#E44813] text-white shadow-sm shadow-orange-300'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Welcome Points Badge on Register */}
        {!isLogin && (
          <div className="mx-6 mt-3 px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 rounded-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
              🎁
            </div>
            <p className="text-[11px] leading-tight text-amber-950 font-medium">
              <strong className="font-bold text-amber-900">250 Welcome Points Free</strong> upon sign-up!
            </p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 pt-3.5 pb-5 space-y-3">
          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading || loading}
            className="w-full py-2.5 px-4 bg-white hover:bg-gray-50/90 text-gray-700 font-bold text-xs border border-gray-200 rounded-xl flex items-center justify-center gap-2.5 shadow-xs hover:border-gray-300 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-gray-400 border-t-[#F95721] rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>{isLogin ? 'Continue with Google' : 'Sign up with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200" />
            <span className="flex-shrink mx-2 text-[10px] uppercase font-bold tracking-wider text-gray-400">or with email</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span className="leading-tight">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs text-emerald-800 animate-in fade-in duration-150">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span className="leading-tight">{success}</span>
            </div>
          )}

          {/* Name Field (Sign-up only) */}
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required={!isLogin}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6600]/25 focus:border-[#FF6600] transition-all placeholder:text-gray-400 font-medium"
              />
            </div>
          )}

          {/* Phone Field (Sign-up only) */}
          {!isLogin && (
            <div className="relative flex items-center border border-gray-200 rounded-xl bg-gray-50/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#FF6600]/25 focus-within:border-[#FF6600] transition-all overflow-hidden">
              <div className="flex items-center gap-1 px-3 py-2.5 bg-gray-100 border-r border-gray-200 select-none shrink-0">
                <span className="text-xs" role="img" aria-label="India">🇮🇳</span>
                <span className="text-xs font-bold text-gray-700">+91</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="Mobile number (optional)"
                value={phone}
                onChange={e => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length === 12 && val.startsWith('91')) val = val.slice(2);
                  if (val.length === 11 && val.startsWith('0')) val = val.slice(1);
                  setPhone(val.slice(0, 10));
                }}
                maxLength={10}
                className="w-full px-3 py-2 text-sm bg-transparent outline-none placeholder:text-gray-400 font-medium"
              />
            </div>
          )}

          {/* Email Field */}
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6600]/25 focus:border-[#FF6600] transition-all placeholder:text-gray-400 font-medium"
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={isLogin ? 'Password' : 'Password (min 6 characters)'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6600]/25 focus:border-[#FF6600] transition-all placeholder:text-gray-400 font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full py-3 bg-gradient-to-r from-[#FF6600] via-[#F95721] to-[#E44813] text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
              </span>
            ) : (
              <span>{isLogin ? 'Sign In to SBS' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Trust & Security Footer */}
        <div className="px-6 pb-4 pt-1 border-t border-gray-100/80 bg-gray-50/50 flex items-center justify-center">
          <p className="text-[10px] text-gray-400 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>256-bit SSL Encrypted • 100% Privacy Protected</span>
          </p>
        </div>
      </div>
    </div>
  );
};
