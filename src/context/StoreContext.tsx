'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Product,
  CartItem,
  WishlistItem,
  Category,
  Subcategory,
  UserProfile,
  Address,
  Coupon,
  Order,
  OrderStatus,
  PaymentStatus,
  AdminRole,
  AdminTeamMember,
  RoleAuditLog,
  AdminNotification,
  ReturnRequest,
  PaymentRecord,
  InventoryLog,
  HeroBannerItem,
  TodayDealItem,
  BestSellersConfig,
  HomepageSection,
  StoreSettings,
  UserBroadcastNotification,
  ProductStory,
  ScratchCardConfig,
  FlashDealConfig,
  RewardTransaction
} from '@/types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_USER,
  INITIAL_ADDRESSES,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  INITIAL_STORIES,
  INITIAL_SCRATCH_CONFIG,
  INITIAL_FLASH_DEAL_CONFIG
} from '@/data/initialData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import confetti from 'canvas-confetti';
import { 
  triggerBrowserPushNotification, 
  requestNotificationPermission, 
  playNotificationChime 
} from '@/utils/pushNotifications';


interface StoreContextType {
  // Notification Reward
  isNotificationRewardClaimed: boolean;
  isNotificationPromptOpen: boolean;
  setIsNotificationPromptOpen: React.Dispatch<React.SetStateAction<boolean>>;
  claimNotificationReward: () => Promise<{ success: boolean; message: string }>;
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  wishlist: WishlistItem[];
  user: UserProfile;
  addresses: Address[];
  orders: Order[];
  adminOrders: Order[];
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  activeTab: string;
  selectedCategoryFilter: string | null;
  selectedSubcategoryFilter: string | null;
  activeSubcategoryModal: { category: Category; subcategory: Subcategory | null } | null;
  selectedProductDetail: Product | null;
  isCheckoutOpen: boolean;
  selectedOrderForModal: Order | null;
  isSearchOpen: boolean;
  isEditProfileOpen: boolean;
  isAddressesOpen: boolean;
  isCouponsOpen: boolean;
  isHelpCenterOpen: boolean;
  isRewardsOpen: boolean;
  orderListFilter: OrderStatus | 'ALL' | null;
  toast: { message: string; type?: 'success' | 'info' | 'error' } | null;
  flyingItems: { id: string; image: string; startX: number; startY: number; endX: number; endY: number }[];
  removeFlyingItem: (id: string) => void;

  // User Broadcast / Push Notifications
  userNotifications: UserBroadcastNotification[];
  userNotificationDrafts: UserBroadcastNotification[];
  isUserNotificationsModalOpen: boolean;
  setIsUserNotificationsModalOpen: (open: boolean) => void;
  sendBroadcastNotification: (notif: Omit<UserBroadcastNotification, 'id' | 'createdAt' | 'status' | 'read'>) => void;
  saveNotificationDraft: (draft: Partial<UserBroadcastNotification> & { title: string; message: string }) => void;
  deleteNotificationDraft: (id: string) => void;
  deleteBroadcastNotification: (id: string) => void;
  markUserNotificationRead: (id: string) => void;
  markAllUserNotificationsRead: () => void;
  clearAllUserNotifications: () => void;

  // Admin specific states
  adminRole: AdminRole;
  adminTeamMembers: AdminTeamMember[];
  roleAuditLogs: RoleAuditLog[];
  adminNotifications: AdminNotification[];
  returnRequests: ReturnRequest[];
  paymentRecords: PaymentRecord[];
  inventoryLogs: InventoryLog[];
  heroBanners: HeroBannerItem[];
  homepageCategories: string[];
  trendingNowProducts: string[];
  todayDeals: TodayDealItem[];
  bestSellersConfig: BestSellersConfig;
  homepageSections: HomepageSection[];
  storeSettings: StoreSettings;

  // Actions
  setActiveTab: (tab: string) => void;
  setSelectedCategoryFilter: (category: string | null) => void;
  setSelectedSubcategoryFilter: (subcategory: string | null) => void;
  setActiveSubcategoryModal: (modal: { category: Category; subcategory: Subcategory | null } | null) => void;
  setSelectedProductDetail: (product: Product | null) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setSelectedOrderForModal: (order: Order | null) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsEditProfileOpen: (open: boolean) => void;
  setIsAddressesOpen: (open: boolean) => void;
  setIsCouponsOpen: (open: boolean) => void;
  setIsHelpCenterOpen: (open: boolean) => void;
  setIsRewardsOpen: (open: boolean) => void;
  setOrderListFilter: (filter: OrderStatus | 'ALL' | null) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;

  // Cart actions
  addToCart: (product: Product, quantity?: number, startSource?: HTMLElement | { x: number; y: number } | null) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  toggleCartItemSelection: (productId: string) => void;
  toggleSelectAllCartItems: (selectAll: boolean) => void;
  clearCart: () => void;

  // Wishlist actions
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;

  // Checkout & Orders
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  placeOrder: (
    paymentMethod: string, 
    address: Address, 
    options?: {
      paymentStatus?: PaymentStatus;
      paymentConfirmedAt?: string;
      whatsappConfirmedAt?: string;
      keepCart?: boolean;
      pointsRedeemed?: number;
      pointsDiscount?: number;
    }
  ) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderPaymentStatus: (
    orderId: string, 
    paymentStatus: PaymentStatus, 
    extra?: { paymentConfirmedAt?: string; whatsappConfirmedAt?: string }
  ) => void;
  addCustomerNotification: (notification: {
    title: string;
    message: string;
    type?: 'order' | 'deal' | 'promo' | 'system' | 'alert';
    orderId?: string;
    actionUrl?: string;
  }) => void;
  refreshOrders: () => Promise<void>;

  // User Profile & Addresses
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  addAddress: (address: Omit<Address, 'id'> & { id?: string }) => Promise<void>;
  updateAddress: (id: string, updates: Partial<Address>) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;

  // SBS Rewards System
  rewardTransactions: RewardTransaction[];
  redeemRewardPoints: (pointsToRedeem: number, orderId?: string) => Promise<{ success: boolean; discountAmount: number; error?: string }>;
  awardOrderRewardPoints: (orderId: string, orderTotal: number) => Promise<void>;

  // Admin Catalog
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetCatalogToDefault: () => void;

  // Admin UI & Role Actions
  setAdminRole: (role: AdminRole) => void;
  addTeamMember: (member: Omit<AdminTeamMember, 'id' | 'addedAt'>, actorEmail?: string) => { success: boolean; error?: string };
  updateTeamMemberRole: (id: string, newRole: AdminRole, actorEmail?: string) => void;
  toggleTeamMemberStatus: (id: string, actorEmail?: string) => void;
  removeTeamMember: (id: string, actorEmail?: string) => { success: boolean; error?: string };
  isEmailAuthorizedAdmin: (email?: string | null) => boolean;
  getEffectiveAdminRole: (email?: string | null) => AdminRole;
  addNotification: (notification: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  updateReturnRequestStatus: (id: string, status: ReturnRequest['status']) => void;

  // Categories Actions
  addCategory: (category: Omit<Category, 'id' | 'itemCount'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (ids: string[]) => void;

  // Offers/Coupons Actions
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;

  // Inventory actions
  addInventoryLog: (productId: string, changeQuantity: number, type: 'add' | 'remove' | 'adjustment', reason: string) => void;

  // Homepage Settings Setters
  homepageSubcategories: { categoryId: string; subcategoryId: string }[];
  setHeroBanners: React.Dispatch<React.SetStateAction<HeroBannerItem[]>>;
  setHomepageCategories: React.Dispatch<React.SetStateAction<string[]>>;
  setHomepageSubcategories: React.Dispatch<React.SetStateAction<{ categoryId: string; subcategoryId: string }[]>>;
  setTrendingNowProducts: React.Dispatch<React.SetStateAction<string[]>>;
  setTodayDeals: React.Dispatch<React.SetStateAction<TodayDealItem[]>>;
  setBestSellersConfig: React.Dispatch<React.SetStateAction<BestSellersConfig>>;
  setHomepageSections: React.Dispatch<React.SetStateAction<HomepageSection[]>>;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;

  // Stories, Scratch Card & Interactive Features
  stories: ProductStory[];
  setStories: React.Dispatch<React.SetStateAction<ProductStory[]>>;
  addStory: (story: Omit<ProductStory, 'id'>) => void;
  updateStory: (id: string, updates: Partial<ProductStory>) => void;
  deleteStory: (id: string) => void;
  toggleStory: (id: string) => void;
  scratchConfig: ScratchCardConfig;
  setScratchConfig: React.Dispatch<React.SetStateAction<ScratchCardConfig>>;
  updateScratchConfig: (updates: Partial<ScratchCardConfig>) => void;
  flashDealConfig: FlashDealConfig;
  setFlashDealConfig: React.Dispatch<React.SetStateAction<FlashDealConfig>>;
  updateFlashDealConfig: (updates: Partial<FlashDealConfig>) => void;

  // Calculation helpers
  cartOriginalMRP: number;
  cartSubtotal: number;
  cartDiscountMRP: number;
  couponDiscount: number;
  cartDiscount: number;
  cartDeliveryCharge: number;
  cartTotal: number;
  cartSelectedItemsCount: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

  // Clean empty initial cart for all visitors
  const [cart, setCart] = useState<CartItem[]>([]);

  // Clean empty initial wishlist
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [rewardTransactions, setRewardTransactions] = useState<RewardTransaction[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const currentUserIdRef = useRef<string | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'admin' || window.location.hash.includes('admin')) {
        return 'admin';
      }
    }
    return 'home';
  });

  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== 'undefined' && window.location.hash.includes('admin')) {
        setActiveTab('admin');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);
  const [selectedCategoryFilter, setSelectedCategoryFilterState] = useState<string | null>(null);
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState<string | null>(null);
  const [activeSubcategoryModal, setActiveSubcategoryModal] = useState<{ category: Category; subcategory: Subcategory | null } | null>(null);

  const setSelectedCategoryFilter = (category: string | null) => {
    setSelectedCategoryFilterState(category);
    setSelectedSubcategoryFilter(null);
  };
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [isAddressesOpen, setIsAddressesOpen] = useState<boolean>(false);
  const [isCouponsOpen, setIsCouponsOpen] = useState<boolean>(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState<boolean>(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState<boolean>(false);
  const [orderListFilter, setOrderListFilter] = useState<OrderStatus | 'ALL' | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);
  const [flyingItems, setFlyingItems] = useState<Array<{ id: string; image: string; startX: number; startY: number; endX: number; endY: number }>>([]);
  const [isUserNotificationsModalOpen, setIsUserNotificationsModalOpen] = useState(false);
  const [isNotificationRewardClaimed, setIsNotificationRewardClaimed] = useState(false);
  const [isNotificationPromptOpen, setIsNotificationPromptOpen] = useState(false);

  const [userNotifications, setUserNotifications] = useState<UserBroadcastNotification[]>([
    {
      id: 'un_1',
      title: '🔥 Super Weekend Sale: Up to 40% OFF!',
      message: 'Exclusive discounts on Mini Washing Machine, Cordless Trimmers, and Smart Kitchen tools. Grab before stock runs out!',
      type: 'deal',
      targetAudience: 'ALL',
      actionUrl: 'offers',
      imageUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80',
      read: false,
      status: 'SENT',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      recipientCount: 1240,
    },
    {
      id: 'un_2',
      title: '🎉 Welcome to SBS Store: ₹100 Flat OFF',
      message: 'Use coupon code SBSWELCOME on checkout on your first order. Happy smart shopping!',
      type: 'promo',
      targetAudience: 'CUSTOMERS',
      actionUrl: 'categories',
      read: false,
      status: 'SENT',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      recipientCount: 980,
    },
    {
      id: 'un_3',
      title: '🚚 Free Express Delivery Live',
      message: 'All qualifying orders now qualify for free express courier dispatch across India.',
      type: 'system',
      targetAudience: 'ALL',
      read: true,
      status: 'SENT',
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      recipientCount: 1450,
    },
  ]);

  const [userNotificationDrafts, setUserNotificationDrafts] = useState<UserBroadcastNotification[]>([
    {
      id: 'und_1',
      title: '⚡ Flash Midnight Sealer Combo',
      message: 'Get 2 Heat Sealing Machines + extra batteries for just ₹499 tonight only!',
      type: 'deal',
      targetAudience: 'ALL',
      actionUrl: 'cleaning',
      read: false,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
    },
  ]);

  const removeFlyingItem = (id: string) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Admin specific states
  const [adminRole, setAdminRole] = useState<AdminRole>('OWNER');
  const [adminTeamMembers, setAdminTeamMembers] = useState<AdminTeamMember[]>([
    {
      id: 'super_admin_1',
      name: 'Mahipal Singh (Super Admin)',
      email: 'mahipalstudent71@gmail.com',
      role: 'OWNER',
      status: 'ACTIVE',
      isSuperAdmin: true,
      department: 'Store Executive Ownership',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      addedAt: '2026-01-01T00:00:00Z',
      lastActive: new Date().toISOString()
    },
    {
      id: 'team_2',
      name: 'Kailash Sharma',
      email: 'kailash.manager@gmail.com',
      role: 'MANAGER',
      status: 'ACTIVE',
      department: 'Store Operations & Catalog',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      addedAt: '2026-02-15T10:00:00Z',
      lastActive: '2026-09-02T14:20:00Z'
    },
    {
      id: 'team_3',
      name: 'Divya Patel',
      email: 'divya.marketing@gmail.com',
      role: 'MARKETING',
      status: 'ACTIVE',
      department: 'Growth & Promotions',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      addedAt: '2026-03-01T11:30:00Z',
      lastActive: '2026-09-01T09:15:00Z'
    },
    {
      id: 'team_4',
      name: 'Suresh Kumar',
      email: 'suresh.staff@gmail.com',
      role: 'STAFF',
      status: 'ACTIVE',
      department: 'Warehouse & Inventory',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      addedAt: '2026-04-10T16:45:00Z',
      lastActive: '2026-09-03T08:00:00Z'
    }
  ]);

  const [roleAuditLogs, setRoleAuditLogs] = useState<RoleAuditLog[]>([
    {
      id: 'log_audit_1',
      actorEmail: 'mahipalstudent71@gmail.com',
      action: 'MEMBER_ADDED',
      targetEmail: 'kailash.manager@gmail.com',
      details: 'Added as Store Manager with catalog and orders permissions',
      timestamp: '2026-02-15T10:00:00Z'
    },
    {
      id: 'log_audit_2',
      actorEmail: 'mahipalstudent71@gmail.com',
      action: 'MEMBER_ADDED',
      targetEmail: 'divya.marketing@gmail.com',
      details: 'Added as Marketing Head for campaigns and banner manager',
      timestamp: '2026-03-01T11:30:00Z'
    }
  ]);

  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);

  const syncPaymentRecordsFromOrders = (ordersList: Order[]) => {
    setPaymentRecords(
      ordersList.map((ord) => {
        let status: PaymentRecord['status'] = 'Pending';
        if (ord.paymentStatus === 'PAYMENT_VERIFIED') status = 'Verified';
        else if (ord.paymentStatus === 'CUSTOMER_CONFIRMED') status = 'Customer Confirmed';
        else if (ord.paymentStatus === 'PAYMENT_FAILED') status = 'Failed';
        else if (ord.status === 'Delivered' && ord.paymentMethod === 'COD') status = 'Success';
        else if (!ord.paymentMethod?.includes('UPI') && ord.paymentMethod !== 'COD') status = 'Verified';

        let method: PaymentRecord['method'] = 'UPI';
        if (ord.paymentMethod?.includes('UPI')) method = 'UPI';
        else if (ord.paymentMethod === 'COD') method = 'COD';
        else if (ord.paymentMethod?.toLowerCase().includes('card')) method = 'Card';
        else if (ord.paymentMethod?.toLowerCase().includes('net')) method = 'Net Banking';

        return {
          id: `pay_${ord.id}`,
          orderId: ord.id,
          customerName: ord.shippingAddress?.name || 'Customer',
          amount: ord.total,
          method,
          status,
          timestamp: ord.createdAt || new Date().toISOString(),
        };
      })
    );
  };
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);

  const [heroBanners, setHeroBanners] = useState<HeroBannerItem[]>([
    {
      id: 'hb1',
      image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=1000&auto=format&fit=crop&q=80',
      heading: 'Everyday Essentials Sale',
      description: 'Get up to 40% off on cleaning products and kitchen utilities.',
      ctaText: 'Shop Now',
      ctaDestination: 'cleaning',
      enabled: true
    },
    {
      id: 'hb2',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1000&auto=format&fit=crop&q=80',
      heading: 'Smart Kitchen Tools',
      description: 'Airtight containers and vacuum pack sealers for a smarter pantry.',
      ctaText: 'Explore Kitchen',
      ctaDestination: 'kitchen',
      enabled: true
    }
  ]);

  const [homepageCategories, setHomepageCategories] = useState<string[]>([
    'cleaning', 'kitchen', 'personal-care', 'home-storage'
  ]);

  const [homepageSubcategories, setHomepageSubcategories] = useState<{ categoryId: string; subcategoryId: string }[]>([
    { categoryId: 'home', subcategoryId: 'decor' },
    { categoryId: 'home', subcategoryId: 'mats' },
    { categoryId: 'home', subcategoryId: 'lightings' },
    { categoryId: 'kitchen', subcategoryId: 'tools' },
    { categoryId: 'cleaning', subcategoryId: 'mops' },
    { categoryId: 'personal-care', subcategoryId: 'grooming' },
    { categoryId: 'home-storage', subcategoryId: 'boxes' },
    { categoryId: 'travel-outdoors', subcategoryId: 'bottles' },
  ]);

  const [trendingNowProducts, setTrendingNowProducts] = useState<string[]>([
    'p1', 'p2', 'p3', 'p8'
  ]);

  const [todayDeals, setTodayDeals] = useState<TodayDealItem[]>([
    {
      id: 'td1',
      productId: 'p1',
      discount: 40,
      title: 'Deals of the Day',
      bannerImage: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80',
      startDate: '2026-08-30',
      endDate: '2026-09-05',
      enabled: true
    }
  ]);

  const [bestSellersConfig, setBestSellersConfig] = useState<BestSellersConfig>({
    mode: 'auto',
    manualProductIds: ['p4', 'p5', 'p6']
  });

  const [homepageSections, setHomepageSections] = useState<HomepageSection[]>([
    { id: 'hero', name: 'Hero Banner', enabled: true },
    { id: 'categories', name: 'Categories Carousel', enabled: true },
    { id: 'trending', name: 'Trending Now', enabled: true },
    { id: 'deals', name: 'Today\'s Deals', enabled: true },
    { id: 'bestsellers', name: 'Best Sellers', enabled: true },
    { id: 'trust', name: 'Trust Badge Info', enabled: true }
  ]);

  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: 'Shyam Business Store',
    logo: 'SBS',
    contactEmail: 'support@sbsstore.com',
    contactPhone: '+91 92262 94797',
    address: 'Shyam Bazaar, Jaipur, Rajasthan, 302001',
    businessHours: '09:00 AM - 09:00 PM',
    deliveryCharge: 40,
    freeDeliveryThreshold: 499,
    deliveryZones: ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur'],
    codEnabled: true,
    upiId: 'suhanarajpurohit3@oksbi',
    lowStockThreshold: 5,
    orderNotification: true,
    lowStockNotification: true,
    customerNotification: true,
    enableStories: true,
    enableScratchCard: true,
    enableFlashDeals: true,
    enableConfetti: true,
  });

  // Stories, Scratch & Flash Deals states
  const [stories, setStories] = useState<ProductStory[]>(INITIAL_STORIES);
  const [scratchConfig, setScratchConfig] = useState<ScratchCardConfig>(INITIAL_SCRATCH_CONFIG);
  const [flashDealConfig, setFlashDealConfig] = useState<FlashDealConfig>(INITIAL_FLASH_DEAL_CONFIG);

  // Load state from local storage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('sbs_cart');
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          // Auto-clean legacy dummy test cart items (c1, c2, c3)
          const isLegacyMockCart = Array.isArray(parsed) && parsed.length > 0 && parsed.every((item: any) => ['c1', 'c2', 'c3'].includes(item.id));
          if (isLegacyMockCart) {
            localStorage.removeItem('sbs_cart');
            setCart([]);
          } else {
            setCart(parsed);
          }
        } catch {
          setCart([]);
        }
      }

      const savedWishlist = localStorage.getItem('sbs_wishlist');
      if (savedWishlist) {
        try {
          const parsed = JSON.parse(savedWishlist);
          const isLegacyMockWishlist = Array.isArray(parsed) && parsed.length > 0 && parsed.every((item: any) => ['w1', 'w2', 'w3', 'w4', 'w5', 'w6'].includes(item.id));
          if (isLegacyMockWishlist) {
            localStorage.removeItem('sbs_wishlist');
            setWishlist([]);
          } else {
            setWishlist(parsed);
          }
        } catch {
          setWishlist([]);
        }
      }

      const savedOrders = localStorage.getItem('sbs_orders');
      if (savedOrders) {
        try {
          const parsed = JSON.parse(savedOrders);
          const hasStaleOrTestOrders = Array.isArray(parsed) && parsed.some((item: any) => 
            !item.orderNumber || 
            item.id?.startsWith('ord_10') || 
            item.id?.startsWith('ord_17885') || 
            item.id?.startsWith('ord_17886')
          );
          if (hasStaleOrTestOrders) {
            localStorage.removeItem('sbs_orders');
            setOrders([]);
          } else if (Array.isArray(parsed)) {
            setOrders(parsed);
          } else {
            setOrders([]);
          }
        } catch {
          setOrders([]);
        }
      }

      const savedUser = localStorage.getItem('sbs_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.id === 'usr_mahipal' || parsed.name === 'Shopper') {
            const cleanUser = { ...parsed, name: parsed.name === 'Shopper' ? '' : parsed.name };
            setUser(cleanUser);
            localStorage.setItem('sbs_user', JSON.stringify(cleanUser));
          } else {
            setUser(parsed);
          }
        } catch {
          setUser(INITIAL_USER);
        }
      }

      const savedProducts = localStorage.getItem('sbs_products');
      if (savedProducts) {
        try {
          const parsedProducts: Product[] = JSON.parse(savedProducts);
          const existingIds = new Set(parsedProducts.map(p => p.id));
          const missingInitial = INITIAL_PRODUCTS.filter(p => !existingIds.has(p.id));
          const updated = parsedProducts.map(p => {
            const initMatch = INITIAL_PRODUCTS.find(ip => ip.id === p.id);
            if (initMatch) {
              return {
                ...initMatch,
                ...p,
                subcategory: p.subcategory || initMatch.subcategory,
                images: (p.images && p.images.length > 1) ? p.images : (initMatch.images || p.images),
                descriptionBlocks: (p.descriptionBlocks && p.descriptionBlocks.length > 0)
                  ? p.descriptionBlocks
                  : initMatch.descriptionBlocks,
                features: (p.features && p.features.length > 0) ? p.features : initMatch.features,
              };
            }
            return p;
          });
          setProducts([...updated, ...missingInitial]);
        } catch {
          setProducts(INITIAL_PRODUCTS);
        }
      }

      const savedCategories = localStorage.getItem('sbs_categories');
      if (savedCategories) {
        try {
          const parsedCategories: Category[] = JSON.parse(savedCategories);
          const existingIds = new Set(parsedCategories.map(c => c.id));
          const missingInitial = INITIAL_CATEGORIES.filter(c => !existingIds.has(c.id));
          const updated = parsedCategories.map(c => {
            const initMatch = INITIAL_CATEGORIES.find(ic => ic.id === c.id);
            if (initMatch && (!c.subcategories || c.subcategories.length === 0)) {
              return { ...c, subcategories: initMatch.subcategories };
            }
            return c;
          });
          setCategories([...updated, ...missingInitial]);
        } catch {
          setCategories(INITIAL_CATEGORIES);
        }
      }

      const savedCoupons = localStorage.getItem('sbs_coupons');
      if (savedCoupons) {
        try {
          const parsed = JSON.parse(savedCoupons);
          const existingCodes = new Set(parsed.map((c: any) => c.code.toUpperCase()));
          const missingInitial = INITIAL_COUPONS.filter((c) => !existingCodes.has(c.code.toUpperCase()));
          setCoupons([...parsed, ...missingInitial]);
        } catch {
          setCoupons(INITIAL_COUPONS);
        }
      } else {
        setCoupons(INITIAL_COUPONS);
      }

      const savedRole = localStorage.getItem('sbs_admin_role');
      if (savedRole) setAdminRole(savedRole as AdminRole);

      const savedStories = localStorage.getItem('sbs_stories');
      if (savedStories) {
        try {
          setStories(JSON.parse(savedStories));
        } catch {
          setStories(INITIAL_STORIES);
        }
      }

      const savedScratch = localStorage.getItem('sbs_scratch_config');
      if (savedScratch) {
        try {
          setScratchConfig(JSON.parse(savedScratch));
        } catch {
          setScratchConfig(INITIAL_SCRATCH_CONFIG);
        }
      }

      const savedFlashDeal = localStorage.getItem('sbs_flash_deal_config');
      if (savedFlashDeal) {
        try {
          setFlashDealConfig(JSON.parse(savedFlashDeal));
        } catch {
          setFlashDealConfig(INITIAL_FLASH_DEAL_CONFIG);
        }
      }

      const savedTeamMembers = localStorage.getItem('sbs_admin_team_members');
      if (savedTeamMembers) {
        try {
          const parsed = JSON.parse(savedTeamMembers);
          // Ensure super admin is always present and active
          const hasSuper = parsed.some((m: AdminTeamMember) => m.email.toLowerCase() === 'mahipalstudent71@gmail.com');
          if (!hasSuper) {
            parsed.unshift({
              id: 'super_admin_1',
              name: 'Mahipal Singh (Super Admin)',
              email: 'mahipalstudent71@gmail.com',
              role: 'OWNER',
              status: 'ACTIVE',
              isSuperAdmin: true,
              department: 'Store Executive Ownership',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              addedAt: '2026-01-01T00:00:00Z',
              lastActive: new Date().toISOString()
            });
          }
          setAdminTeamMembers(parsed);
        } catch { }
      }

      const savedAuditLogs = localStorage.getItem('sbs_role_audit_logs');
      if (savedAuditLogs) {
        try {
          setRoleAuditLogs(JSON.parse(savedAuditLogs));
        } catch { }
      }

      const savedNotifs = localStorage.getItem('sbs_admin_notifications');
      if (savedNotifs) setAdminNotifications(JSON.parse(savedNotifs));

      const savedReturns = localStorage.getItem('sbs_return_requests');
      if (savedReturns) setReturnRequests(JSON.parse(savedReturns));

      const savedPayments = localStorage.getItem('sbs_payment_records');
      if (savedPayments) {
        try {
          const parsed = JSON.parse(savedPayments);
          if (Array.isArray(parsed)) {
            // Filter out any legacy mock entries
            const realOnly = parsed.filter((p: any) => !p.id.startsWith('pay_') || p.orderId?.startsWith('SBS-'));
            setPaymentRecords(realOnly);
          }
        } catch { }
      }

      const savedInvLogs = localStorage.getItem('sbs_inventory_logs');
      if (savedInvLogs) setInventoryLogs(JSON.parse(savedInvLogs));

      const savedBanners = localStorage.getItem('sbs_hero_banners');
      if (savedBanners) setHeroBanners(JSON.parse(savedBanners));

      const savedHomeCats = localStorage.getItem('sbs_home_categories');
      if (savedHomeCats) setHomepageCategories(JSON.parse(savedHomeCats));

      const savedHomeSubs = localStorage.getItem('sbs_home_subcategories');
      if (savedHomeSubs) setHomepageSubcategories(JSON.parse(savedHomeSubs));

      const savedTrendProds = localStorage.getItem('sbs_trending_products');
      if (savedTrendProds) setTrendingNowProducts(JSON.parse(savedTrendProds));

      const savedDeals = localStorage.getItem('sbs_today_deals');
      if (savedDeals) setTodayDeals(JSON.parse(savedDeals));

      const savedBestConfig = localStorage.getItem('sbs_bestsellers_config');
      if (savedBestConfig) setBestSellersConfig(JSON.parse(savedBestConfig));

      const savedSections = localStorage.getItem('sbs_homepage_sections');
      if (savedSections) setHomepageSections(JSON.parse(savedSections));

      const savedSettings = localStorage.getItem('sbs_store_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          // Migrate legacy test UPI and phone numbers
          if (parsed.upiId === 'fam@7387467108' || parsed.upiId === 'sbsstore@upi' || !parsed.upiId) {
            parsed.upiId = 'suhanarajpurohit3@oksbi';
          }
          if (parsed.contactPhone === '+91 99887 76655' || parsed.contactPhone === '9988776655' || !parsed.contactPhone) {
            parsed.contactPhone = '+91 92262 94797';
          }
          setStoreSettings(parsed);
          localStorage.setItem('sbs_store_settings', JSON.stringify(parsed));
        } catch {
          // ignore parsing error
        }
      }

      // Clean addresses: only genuine user addresses from DB should be loaded
      // Purge any legacy demo address from localStorage
      const savedAddresses = localStorage.getItem('sbs_saved_addresses');
      if (savedAddresses) {
        try {
          const parsed = JSON.parse(savedAddresses);
          if (Array.isArray(parsed)) {
            const hasLegacyMock = parsed.some((a: any) => a.id === 'addr_1' || a.street?.includes('Shivalik Hills'));
            if (hasLegacyMock) {
              localStorage.removeItem('sbs_saved_addresses');
              setAddresses([]);
            }
          }
        } catch { }
      }

      // Notification permission state (Never re-prompt if already granted)
      const isNotifClaimed = localStorage.getItem('sbs_notif_reward_claimed') === 'true';
      const isPermGranted = typeof Notification !== 'undefined' && Notification.permission === 'granted';
      if (isNotifClaimed || isPermGranted) {
        setIsNotificationRewardClaimed(true);
        setIsNotificationPromptOpen(false);
      }

    } catch (e) {
      console.error('Failed to load storage state', e);
    }
    setIsLoaded(true);
  }, []);

  // --- Supabase: Load products, categories, coupons, and store settings on mount ---
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const loadRemoteCatalog = async () => {
      try {
        const [
          { data: cats },
          { data: prods },
          { data: coups },
          { data: settings },
          { data: remoteReturns }
        ] = await Promise.all([
          supabase.from('categories').select('*').order('name'),
          supabase.from('products').select('*').order('name'),
          supabase.from('coupons').select('*').order('created_at'),
          supabase.from('store_settings').select('*'),
          supabase.from('return_requests').select('*').order('date', { ascending: false }),
        ]);

        if (cats && cats.length > 0) {
          const mappedCats = cats.map((c: any) => {
            const initMatch = INITIAL_CATEGORIES.find((ic) => ic.id === c.id);
            return {
              id: c.id,
              name: c.name,
              subtitle: c.subtitle,
              image: c.image,
              bgColor: c.bg_color || initMatch?.bgColor || '#FFF0E6',
              accentColor: c.accent_color || initMatch?.accentColor || '#F95721',
              itemCount: c.item_count || initMatch?.itemCount || 0,
              subcategories: c.subcategories || initMatch?.subcategories || [],
              showOnHome: c.show_on_home !== undefined ? c.show_on_home : (initMatch?.showOnHome ?? true),
            };
          });
          setCategories(mappedCats);
        }

        if (prods && prods.length > 0) {
          const mappedRemote: Product[] = prods.map((p: any) => {
            const initMatch = INITIAL_PRODUCTS.find((ip) => ip.id === p.id);
            return {
              id: p.id,
              name: p.name,
              category: p.category,
              subcategory: p.subcategory || initMatch?.subcategory,
              price: Number(p.price),
              originalPrice: Number(p.original_price),
              discountPercentage: p.discount_percentage,
              rating: Number(p.rating),
              reviewCount: p.review_count,
              image: p.image,
              images: (p.images && p.images.length > 0) ? p.images : (initMatch?.images || [p.image]),
              video: p.video || initMatch?.video || undefined,
              videos: (p.videos && p.videos.length > 0) ? p.videos : (initMatch?.videos || []),
              videoThumbnail: p.video_thumbnail || initMatch?.videoThumbnail || undefined,
              inStock: p.in_stock,
              stockCount: p.stock_count,
              description: p.description,
              descriptionBlocks: p.description_blocks || initMatch?.descriptionBlocks,
              features: p.features || initMatch?.features || [],
              isTrending: Boolean(p.is_trending),
              isBestSeller: Boolean(p.is_best_seller),
              isDealOfDay: Boolean(p.is_deal_of_day),
              isFeatured: Boolean(p.is_featured),
              isSuperDeal: Boolean(p.is_super_deal),
              isTopRated: Boolean(p.is_top_rated),
            };
          });

          setProducts(mappedRemote);
        }

        if (coups && coups.length > 0) {
          const mappedCoupons: Coupon[] = coups.map((c: any) => ({
            id: c.id,
            code: c.code,
            title: c.title,
            discountType: c.discount_type,
            value: Number(c.value),
            minOrderValue: Number(c.min_order_value),
            maxDiscount: c.max_discount ? Number(c.max_discount) : undefined,
            expiresAt: c.expires_at,
            description: c.description,
            isActive: c.is_active !== undefined ? Boolean(c.is_active) : true,
          }));
          setCoupons(mappedCoupons);
        }

        if (remoteReturns && remoteReturns.length > 0) {
          setReturnRequests(remoteReturns.map((r: any) => ({
            id: r.id,
            orderId: r.order_id,
            customerName: r.customer_name,
            productName: r.product_name,
            productImage: r.product_image,
            reason: r.reason,
            date: r.date,
            status: r.status,
            amount: Number(r.amount)
          })));
        }

        if (settings && settings.length > 0) {
          settings.forEach((s: any) => {
            if (s.id === 'stories' && Array.isArray(s.data)) setStories(s.data);
            if (s.id === 'scratch_config' && s.data) setScratchConfig(s.data);
            if (s.id === 'flash_deal_config' && s.data) setFlashDealConfig(s.data);
            if (s.id === 'hero_banners' && Array.isArray(s.data)) setHeroBanners(s.data);
            if (s.id === 'store_settings' && s.data) setStoreSettings(s.data);
          });
        }
      } catch (err) {
        console.error('Failed to load catalog from Supabase:', err);
      }
    };

    loadRemoteCatalog();

    // Real-Time Cross-Device Synchronization Channel for Catalog, Orders, & Coupons
    const catalogChannel = supabase
      .channel('sbs_catalog_realtime')
      // Products Realtime Sync
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'products' }, (payload) => {
        const p = payload.new as any;
        if (!p || !p.id) return;
        const newProd: Product = {
          id: p.id,
          name: p.name,
          category: p.category,
          subcategory: p.subcategory,
          price: Number(p.price),
          originalPrice: Number(p.original_price),
          discountPercentage: p.discount_percentage,
          rating: Number(p.rating),
          reviewCount: p.review_count,
          image: p.image,
          images: p.images || [p.image],
          video: p.video || undefined,
          videos: p.videos || [],
          videoThumbnail: p.video_thumbnail || undefined,
          inStock: p.in_stock,
          stockCount: p.stock_count,
          description: p.description,
          descriptionBlocks: p.description_blocks || [],
          features: p.features || [],
          isTrending: Boolean(p.is_trending),
          isBestSeller: Boolean(p.is_best_seller),
          isDealOfDay: Boolean(p.is_deal_of_day),
          isFeatured: Boolean(p.is_featured),
          isSuperDeal: Boolean(p.is_super_deal),
          isTopRated: Boolean(p.is_top_rated),
        };
        setProducts((prev) => (prev.some((x) => x.id === newProd.id) ? prev : [newProd, ...prev]));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (payload) => {
        const p = payload.new as any;
        if (!p || !p.id) return;
        setProducts((prev) =>
          prev.map((item) =>
            item.id === p.id
              ? {
                  ...item,
                  name: p.name ?? item.name,
                  category: p.category ?? item.category,
                  subcategory: p.subcategory ?? item.subcategory,
                  price: p.price !== undefined ? Number(p.price) : item.price,
                  originalPrice: p.original_price !== undefined ? Number(p.original_price) : item.originalPrice,
                  discountPercentage: p.discount_percentage ?? item.discountPercentage,
                  rating: p.rating !== undefined ? Number(p.rating) : item.rating,
                  reviewCount: p.review_count ?? item.reviewCount,
                  image: p.image ?? item.image,
                  images: p.images ?? item.images,
                  video: p.video !== undefined ? p.video : item.video,
                  videos: p.videos !== undefined ? p.videos : item.videos,
                  videoThumbnail: p.video_thumbnail !== undefined ? p.video_thumbnail : item.videoThumbnail,
                  inStock: p.in_stock ?? item.inStock,
                  stockCount: p.stock_count ?? item.stockCount,
                  description: p.description ?? item.description,
                  descriptionBlocks: p.description_blocks ?? item.descriptionBlocks,
                  features: p.features ?? item.features,
                  isTrending: p.is_trending !== undefined ? Boolean(p.is_trending) : item.isTrending,
                  isBestSeller: p.is_best_seller !== undefined ? Boolean(p.is_best_seller) : item.isBestSeller,
                  isDealOfDay: p.is_deal_of_day !== undefined ? Boolean(p.is_deal_of_day) : item.isDealOfDay,
                  isFeatured: p.is_featured !== undefined ? Boolean(p.is_featured) : item.isFeatured,
                  isSuperDeal: p.is_super_deal !== undefined ? Boolean(p.is_super_deal) : item.isSuperDeal,
                  isTopRated: p.is_top_rated !== undefined ? Boolean(p.is_top_rated) : item.isTopRated,
                }
              : item
          )
        );
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'products' }, (payload) => {
        const old = payload.old as any;
        if (old?.id) setProducts((prev) => prev.filter((p) => p.id !== old.id));
      })
      // Categories Realtime Sync
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'categories' }, (payload) => {
        const c = payload.new as any;
        if (!c || !c.id) return;
        const newCat: Category = {
          id: c.id,
          name: c.name,
          subtitle: c.subtitle,
          image: c.image,
          bgColor: c.bg_color || '#FFF0E6',
          accentColor: c.accent_color || '#F95721',
          itemCount: c.item_count || 0,
          subcategories: c.subcategories || [],
          showOnHome: c.show_on_home !== undefined ? c.show_on_home : true,
        };
        setCategories((prev) => (prev.some((x) => x.id === newCat.id) ? prev : [...prev, newCat]));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'categories' }, (payload) => {
        const c = payload.new as any;
        if (!c || !c.id) return;
        setCategories((prev) =>
          prev.map((item) =>
            item.id === c.id
              ? {
                  ...item,
                  name: c.name ?? item.name,
                  subtitle: c.subtitle ?? item.subtitle,
                  image: c.image ?? item.image,
                  bgColor: c.bg_color ?? item.bgColor,
                  accentColor: c.accent_color ?? item.accentColor,
                  itemCount: c.item_count ?? item.itemCount,
                  subcategories: c.subcategories ?? item.subcategories,
                  showOnHome: c.show_on_home !== undefined ? c.show_on_home : item.showOnHome,
                }
              : item
          )
        );
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'categories' }, (payload) => {
        const old = payload.old as any;
        if (old?.id) setCategories((prev) => prev.filter((c) => c.id !== old.id));
      })
      // Orders Realtime Sync
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const o = payload.new as any;
        if (!o || !o.id) return;
        const newOrd: Order = {
          id: o.id,
          orderNumber: o.order_number,
          createdAt: o.created_at,
          status: o.status,
          paymentStatus: o.payment_status || (o.payment_method?.includes('UPI') ? 'PENDING' : 'PAYMENT_VERIFIED'),
          paymentConfirmedAt: o.payment_confirmed_at,
          whatsappConfirmedAt: o.whatsapp_confirmed_at,
          items: o.items || [],
          subtotal: Number(o.subtotal),
          discount: Number(o.discount),
          deliveryCharge: Number(o.delivery_charge),
          total: Number(o.total),
          shippingAddress: o.shipping_address,
          paymentMethod: o.payment_method,
          trackingNumber: o.tracking_number,
          estimatedDelivery: o.estimated_delivery,
          userId: o.user_id,
        };
        // Always add to adminOrders stream for admin management
        setAdminOrders((prev) => {
          const updated = prev.some((x) => x.id === newOrd.id) ? prev : [newOrd, ...prev];
          syncPaymentRecordsFromOrders(updated);
          return updated;
        });
        // Only append to customer's personal orders if it belongs to current authenticated user
        if (currentUserIdRef.current && newOrd.userId === currentUserIdRef.current) {
          setOrders((prev) => (prev.some((x) => x.id === newOrd.id) ? prev : [newOrd, ...prev]));
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        const o = payload.new as any;
        if (!o || !o.id) return;
        const updateFn = (ord: Order) => (ord.id === o.id ? { 
          ...ord, 
          status: o.status || ord.status,
          paymentStatus: o.payment_status || ord.paymentStatus,
          paymentConfirmedAt: o.payment_confirmed_at || ord.paymentConfirmedAt,
          whatsappConfirmedAt: o.whatsapp_confirmed_at || ord.whatsappConfirmedAt,
          trackingNumber: o.tracking_number || ord.trackingNumber 
        } : ord);
        setOrders((prev) => prev.map(updateFn));
        setAdminOrders((prev) => {
          const updated = prev.map(updateFn);
          syncPaymentRecordsFromOrders(updated);
          return updated;
        });
      })
      // Direct Cross-Device Broadcast Sync for Instant Screen Updates
      .on('broadcast', { event: 'cross_device_order_placed' }, (payload) => {
        const o = payload.payload as any;
        if (!o || !o.id) return;
        setAdminOrders((prev) => (prev.some((x) => x.id === o.id) ? prev : [o, ...prev]));
        if (currentUserIdRef.current && o.userId === currentUserIdRef.current) {
          setOrders((prev) => (prev.some((x) => x.id === o.id) ? prev : [o, ...prev]));
        }
        setPaymentRecords((prev) => (prev.some((p) => p.orderId === o.id) ? prev : [{
          id: `pay_${Date.now()}_${Math.floor(Math.random() * 100)}`,
          orderId: o.id,
          customerName: o.shippingAddress?.name || 'Customer',
          amount: o.total,
          method: (o.paymentMethod?.includes('UPI') ? 'UPI' : o.paymentMethod === 'COD' ? 'COD' : 'Card') as any,
          status: o.paymentStatus === 'PAYMENT_VERIFIED' ? 'Verified' : o.paymentStatus === 'CUSTOMER_CONFIRMED' ? 'Customer Confirmed' : 'Pending',
          timestamp: o.createdAt || new Date().toISOString()
        }, ...prev]));
      })
      .on('broadcast', { event: 'cross_device_payment_updated' }, (payload) => {
        const { orderId, paymentStatus, paymentConfirmedAt, whatsappConfirmedAt } = payload.payload;
        if (!orderId) return;
        const paymentUpdateFn = (ord: Order) => (ord.id === orderId ? {
          ...ord,
          paymentStatus,
          paymentConfirmedAt: paymentConfirmedAt || ord.paymentConfirmedAt,
          whatsappConfirmedAt: whatsappConfirmedAt || ord.whatsappConfirmedAt,
          status: paymentStatus === 'PAYMENT_VERIFIED' && (ord.status === 'To Pay' as any) ? 'Processing' : ord.status
        } : ord);
        setOrders((prev) => prev.map(paymentUpdateFn));
        setAdminOrders((prev) => prev.map(paymentUpdateFn));
        setPaymentRecords((prev) =>
          prev.map((p) => (p.orderId === orderId ? {
            ...p,
            status: paymentStatus === 'CUSTOMER_CONFIRMED' ? 'Customer Confirmed' : paymentStatus === 'PAYMENT_VERIFIED' ? 'Verified' : paymentStatus === 'PAYMENT_FAILED' ? 'Failed' : p.status
          } : p))
        );
      })
      // Coupons Realtime Sync
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'coupons' }, (payload) => {
        const c = payload.new as any;
        if (!c || !c.id) return;
        const newCoup: Coupon = {
          id: c.id,
          code: c.code,
          title: c.title,
          discountType: c.discount_type,
          value: Number(c.value),
          minOrderValue: Number(c.min_order_value),
          maxDiscount: c.max_discount ? Number(c.max_discount) : undefined,
          expiresAt: c.expires_at,
          description: c.description,
          isActive: c.is_active !== undefined ? Boolean(c.is_active) : true,
        };
        setCoupons((prev) => (prev.some((x) => x.id === newCoup.id) ? prev : [newCoup, ...prev]));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'coupons' }, (payload) => {
        const c = payload.new as any;
        if (!c || !c.id) return;
        setCoupons((prev) =>
          prev.map((item) =>
            item.id === c.id
              ? {
                  ...item,
                  code: c.code ?? item.code,
                  title: c.title ?? item.title,
                  discountType: c.discount_type ?? item.discountType,
                  value: c.value !== undefined ? Number(c.value) : item.value,
                  minOrderValue: c.min_order_value !== undefined ? Number(c.min_order_value) : item.minOrderValue,
                  maxDiscount: c.max_discount !== undefined ? Number(c.max_discount) : item.maxDiscount,
                  expiresAt: c.expires_at ?? item.expiresAt,
                  description: c.description ?? item.description,
                  isActive: c.is_active !== undefined ? Boolean(c.is_active) : item.isActive,
                }
              : item
          )
        );
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'coupons' }, (payload) => {
        const old = payload.old as any;
        if (old?.id) setCoupons((prev) => prev.filter((c) => c.id !== old.id));
      })
      // Store Settings Realtime Sync (Stories, Flash Deals, Scratch Cards, Banners)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, (payload) => {
        const s = (payload.new || payload.old) as any;
        if (!s || !s.id) return;
        if (s.id === 'stories' && Array.isArray(s.data)) setStories(s.data);
        if (s.id === 'scratch_config' && s.data) setScratchConfig(s.data);
        if (s.id === 'flash_deal_config' && s.data) setFlashDealConfig(s.data);
        if (s.id === 'hero_banners' && Array.isArray(s.data)) setHeroBanners(s.data);
        if (s.id === 'store_settings' && s.data) setStoreSettings(s.data);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(catalogChannel);
    };
  }, []);

  // --- Supabase: Sync cart/wishlist/orders when auth user changes ---
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const handleAuthChange = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      currentUserIdRef.current = userId || null;

      if (userId) {
        // Load user's cart from Supabase and merge with guest cart
        const { data: dbCart } = await supabase
          .from('cart_items')
          .select('*, products(*)')
          .eq('user_id', userId);

        if (dbCart && dbCart.length > 0) {
          const dbCartMapped: CartItem[] = dbCart.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            product: {
              id: item.products.id, name: item.products.name,
              category: item.products.category, price: item.products.price,
              originalPrice: item.products.original_price,
              discountPercentage: item.products.discount_percentage,
              rating: item.products.rating, reviewCount: item.products.review_count,
              image: item.products.image, inStock: item.products.in_stock,
              stockCount: item.products.stock_count, description: item.products.description || '',
              features: item.products.features || [],
            },
            quantity: item.quantity,
            selected: item.selected,
          }));
          // Merge guest cart items into DB cart
          setCart(prev => {
            const merged = [...dbCartMapped];
            prev.forEach(guestItem => {
              const exists = merged.find(i => i.productId === guestItem.productId);
              if (!exists) merged.push(guestItem);
            });
            return merged;
          });
        }

        // Load user addresses from Supabase user_addresses table
        const { data: dbAddresses } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (dbAddresses && dbAddresses.length > 0) {
          const mappedAddr: Address[] = dbAddresses.map((a: any) => ({
            id: a.id,
            name: a.name,
            phone: a.phone,
            street: a.street,
            city: a.city,
            state: a.state,
            pincode: a.pincode,
            type: a.type || 'HOME',
            isDefault: Boolean(a.is_default),
          }));
          setAddresses(mappedAddr);
          try {
            localStorage.setItem('sbs_saved_addresses', JSON.stringify(mappedAddr));
          } catch { }
        } else {
          // Genuinely new user or user with no address: Start strictly empty!
          setAddresses([]);
          try {
            localStorage.removeItem('sbs_saved_addresses');
          } catch { }
        }

        // Load reward transactions and sync balance
        const { data: dbTxns } = await supabase
          .from('reward_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (dbTxns && dbTxns.length > 0) {
          setRewardTransactions(dbTxns.map((t: any) => ({
            id: t.id,
            userId: t.user_id,
            type: t.type,
            points: t.points,
            description: t.description,
            orderId: t.order_id,
            createdAt: t.created_at,
          })));
        } else {
          // Record initial welcome points transaction if none exists
          const welcomeTx: any = {
            id: `rt_welcome_${userId}`,
            user_id: userId,
            type: 'WELCOME',
            points: 250,
            description: 'Welcome to SBS VIP Rewards 🎉',
            created_at: new Date().toISOString(),
          };
          supabase.from('reward_transactions').upsert(welcomeTx).then();
          setRewardTransactions([{
            id: welcomeTx.id,
            userId,
            type: 'WELCOME',
            points: 250,
            description: welcomeTx.description,
            createdAt: welcomeTx.created_at,
          }]);
        }

        // Load strictly this customer's own orders
        const userEmail = session?.user?.email?.toLowerCase();
        const isUserAdmin = userEmail === 'mahipalstudent71@gmail.com' || adminTeamMembers.some(m => m.email.toLowerCase() === userEmail && m.status === 'ACTIVE');

        const { data: dbOrders } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (dbOrders && dbOrders.length > 0) {
          setOrders(dbOrders.map((o: any) => ({
            id: o.id,
            orderNumber: o.order_number,
            createdAt: o.created_at,
            status: o.status,
            paymentStatus: o.payment_status || (o.payment_method?.includes('UPI') ? 'PENDING' : 'PAYMENT_VERIFIED'),
            paymentConfirmedAt: o.payment_confirmed_at,
            whatsappConfirmedAt: o.whatsapp_confirmed_at,
            items: o.items || [],
            subtotal: Number(o.subtotal),
            discount: Number(o.discount),
            deliveryCharge: Number(o.delivery_charge),
            total: Number(o.total),
            shippingAddress: o.shipping_address,
            paymentMethod: o.payment_method,
            trackingNumber: o.tracking_number,
            estimatedDelivery: o.estimated_delivery,
            userId: o.user_id,
          })));
        } else {
          // Zero orders for new user or clean account
          setOrders([]);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('sbs_orders');
          }
        }

        // If user is Admin or in local development, load all store orders for Admin management views
        const isDevMode = typeof window !== 'undefined' && (
          window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1' || 
          window.location.hash.includes('admin')
        );

        if (isUserAdmin || isDevMode) {
          const { data: allAdminOrders } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

          if (allAdminOrders) {
            const mappedOrders = allAdminOrders.map((o: any) => ({
              id: o.id,
              orderNumber: o.order_number,
              createdAt: o.created_at,
              status: o.status,
              paymentStatus: o.payment_status || (o.payment_method?.includes('UPI') ? 'PENDING' : 'PAYMENT_VERIFIED'),
              paymentConfirmedAt: o.payment_confirmed_at,
              whatsappConfirmedAt: o.whatsapp_confirmed_at,
              items: o.items || [],
              subtotal: Number(o.subtotal),
              discount: Number(o.discount),
              deliveryCharge: Number(o.delivery_charge),
              total: Number(o.total),
              shippingAddress: o.shipping_address,
              paymentMethod: o.payment_method,
              trackingNumber: o.tracking_number,
              estimatedDelivery: o.estimated_delivery,
              userId: o.user_id,
            }));
            setAdminOrders(mappedOrders);
            syncPaymentRecordsFromOrders(mappedOrders);
          }
        }
      } else {
        // Guest user: purge any stale orders with registered userId & clear addresses
        setOrders((prev) => prev.filter(o => !o.userId));
        const isDevMode = typeof window !== 'undefined' && (
          window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1' || 
          window.location.hash.includes('admin')
        );
        if (isDevMode) {
          // In local dev, fetch orders for admin testing even without session
          const { data: allAdminOrders } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

          if (allAdminOrders) {
            const mappedOrders = allAdminOrders.map((o: any) => ({
              id: o.id,
              orderNumber: o.order_number,
              createdAt: o.created_at,
              status: o.status,
              paymentStatus: o.payment_status || (o.payment_method?.includes('UPI') ? 'PENDING' : 'PAYMENT_VERIFIED'),
              paymentConfirmedAt: o.payment_confirmed_at,
              whatsappConfirmedAt: o.whatsapp_confirmed_at,
              items: o.items || [],
              subtotal: Number(o.subtotal),
              discount: Number(o.discount),
              deliveryCharge: Number(o.delivery_charge),
              total: Number(o.total),
              shippingAddress: o.shipping_address,
              paymentMethod: o.payment_method,
              trackingNumber: o.tracking_number,
              estimatedDelivery: o.estimated_delivery,
              userId: o.user_id,
            }));
            setAdminOrders(mappedOrders);
            syncPaymentRecordsFromOrders(mappedOrders);
          }
        } else {
          setAdminOrders([]);
        }
        setAddresses([]);
      }
    };

    // Run once on mount
    handleAuthChange();

    // Also listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        currentUserIdRef.current = null;
        setOrders([]);
        setAdminOrders([]);
        setAddresses([]);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sbs_orders');
          localStorage.removeItem('sbs_saved_addresses');
        }
      }
      handleAuthChange();
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Supabase: Real-time Multi-Device Push Broadcast Receiver ---
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // 1. Fetch remote broadcast notifications on mount
    supabase
      .from('broadcast_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data, error }) => {
        if (data && data.length > 0) {
          const mapped: UserBroadcastNotification[] = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            message: d.message,
            type: d.type || 'deal',
            targetAudience: d.target_audience || 'ALL',
            actionUrl: d.action_url || 'offers',
            imageUrl: d.image_url || undefined,
            status: d.status || 'SENT',
            read: false,
            recipientCount: d.recipient_count || 1450,
            createdAt: d.created_at,
            sentAt: d.created_at,
          }));

          setUserNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.id));
            const newItems = mapped.filter((m) => !existingIds.has(m.id));
            return [...newItems, ...prev];
          });
        }
      });

    // 2. Subscribe to real-time broadcasts sent from ANY device
    const channel = supabase
      .channel('sbs_broadcast_realtime')
      .on('broadcast', { event: 'new_push_notification' }, ({ payload }) => {
        if (!payload || !payload.id) return;
        console.log('⚡ Real-time push broadcast received on device:', payload);

        // Update local state
        setUserNotifications((prev) => {
          if (prev.some((n) => n.id === payload.id)) return prev;
          return [payload, ...prev];
        });

        // Trigger real native device notification popup!
        triggerBrowserPushNotification({
          title: payload.title,
          body: payload.message,
          image: payload.imageUrl,
          data: { url: payload.actionUrl ? `/${payload.actionUrl}` : '/' },
        });

        // Show in-app banner toast
        showToast(`🔔 ${payload.title}`, 'info');
      })
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'broadcast_notifications' },
        (payload) => {
          const d = payload.new as any;
          if (!d || !d.id) return;
          const notifObj: UserBroadcastNotification = {
            id: d.id,
            title: d.title,
            message: d.message,
            type: d.type || 'deal',
            targetAudience: d.target_audience || 'ALL',
            actionUrl: d.action_url || 'offers',
            imageUrl: d.image_url || undefined,
            status: d.status || 'SENT',
            read: false,
            recipientCount: d.recipient_count || 1450,
            createdAt: d.created_at,
            sentAt: d.created_at,
          };

          setUserNotifications((prev) => {
            if (prev.some((n) => n.id === notifObj.id)) return prev;
            return [notifObj, ...prev];
          });

          triggerBrowserPushNotification({
            title: notifObj.title,
            body: notifObj.message,
            image: notifObj.imageUrl,
            data: { url: notifObj.actionUrl ? `/${notifObj.actionUrl}` : '/' },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  // Save to localStorage when updated
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('sbs_cart', JSON.stringify(cart));
      localStorage.setItem('sbs_wishlist', JSON.stringify(wishlist));
      localStorage.setItem('sbs_orders', JSON.stringify(orders));
      localStorage.setItem('sbs_user', JSON.stringify(user));
      localStorage.setItem('sbs_products', JSON.stringify(products));
      localStorage.setItem('sbs_categories', JSON.stringify(categories));
      localStorage.setItem('sbs_coupons', JSON.stringify(coupons));
      localStorage.setItem('sbs_admin_role', adminRole);
      localStorage.setItem('sbs_admin_team_members', JSON.stringify(adminTeamMembers));
      localStorage.setItem('sbs_role_audit_logs', JSON.stringify(roleAuditLogs));
      localStorage.setItem('sbs_admin_notifications', JSON.stringify(adminNotifications));
      localStorage.setItem('sbs_user_notifications', JSON.stringify(userNotifications));
      localStorage.setItem('sbs_user_notification_drafts', JSON.stringify(userNotificationDrafts));
      localStorage.setItem('sbs_return_requests', JSON.stringify(returnRequests));
      localStorage.setItem('sbs_payment_records', JSON.stringify(paymentRecords));
      localStorage.setItem('sbs_inventory_logs', JSON.stringify(inventoryLogs));
      localStorage.setItem('sbs_hero_banners', JSON.stringify(heroBanners));
      localStorage.setItem('sbs_home_categories', JSON.stringify(homepageCategories));
      localStorage.setItem('sbs_home_subcategories', JSON.stringify(homepageSubcategories));
      localStorage.setItem('sbs_trending_products', JSON.stringify(trendingNowProducts));
      localStorage.setItem('sbs_today_deals', JSON.stringify(todayDeals));
      localStorage.setItem('sbs_bestsellers_config', JSON.stringify(bestSellersConfig));
      localStorage.setItem('sbs_homepage_sections', JSON.stringify(homepageSections));
      localStorage.setItem('sbs_store_settings', JSON.stringify(storeSettings));
      localStorage.setItem('sbs_stories', JSON.stringify(stories));
      localStorage.setItem('sbs_scratch_config', JSON.stringify(scratchConfig));
      localStorage.setItem('sbs_flash_deal_config', JSON.stringify(flashDealConfig));
    } catch (e) {
      console.error('Failed to save to storage', e);
    }
  }, [
    cart, wishlist, orders, user, products, categories, coupons, adminRole,
    adminTeamMembers, roleAuditLogs,
    adminNotifications, userNotifications, userNotificationDrafts, returnRequests, paymentRecords, inventoryLogs, heroBanners,
    homepageCategories, homepageSubcategories, trendingNowProducts, todayDeals, bestSellersConfig,
    homepageSections, storeSettings, stories, scratchConfig, flashDealConfig, isLoaded
  ]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Cart actions
  const addToCart = (
    product: Product, 
    quantity = 1, 
    startSource?: HTMLElement | { x: number; y: number } | null
  ) => {
    // 1. Calculate Start and End coordinates for Fly-to-Cart animation
    if (typeof window !== 'undefined') {
      let startX = window.innerWidth / 2;
      let startY = window.innerHeight / 2;

      if (startSource) {
        if ('x' in startSource && 'y' in startSource) {
          startX = startSource.x;
          startY = startSource.y;
        } else if (startSource instanceof HTMLElement) {
          const rect = startSource.getBoundingClientRect();
          startX = rect.left + rect.width / 2;
          startY = rect.top + rect.height / 2;
        }
      }

      // Find cart icon element in DOM (Header on desktop/mobile top or BottomNav on mobile)
      let endX = window.innerWidth - 45;
      let endY = 45;

      const headerCart = document.getElementById('header-cart-button');
      const bottomNavCart = document.getElementById('bottom-nav-cart-button');

      if (headerCart && headerCart.offsetParent !== null) {
        const rect = headerCart.getBoundingClientRect();
        endX = rect.left + rect.width / 2;
        endY = rect.top + rect.height / 2;
      } else if (bottomNavCart && bottomNavCart.offsetParent !== null) {
        const rect = bottomNavCart.getBoundingClientRect();
        endX = rect.left + rect.width / 2;
        endY = rect.top + rect.height / 2;
      }

      const newFlyItem = {
        id: `fly_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        image: product.image,
        startX,
        startY,
        endX,
        endY,
      };

      setFlyingItems((prev) => [...prev, newFlyItem]);

      // Trigger celebratory sparkle confetti around the cart icon
      setTimeout(() => {
        try {
          confetti({
            particleCount: 20,
            spread: 50,
            origin: {
              x: Math.max(0, Math.min(1, endX / window.innerWidth)),
              y: Math.max(0, Math.min(1, endY / window.innerHeight)),
            },
            colors: ['#F95721', '#FFA41C', '#00A859', '#FFFFFF'],
            ticks: 120,
            gravity: 1.2,
            scalar: 0.6,
            disableForReducedMotion: true,
          });
        } catch {
          // ignore if canvas not supported
        }
      }, 700);
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity, selected: true }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          productId: product.id,
          product,
          quantity,
          selected: true,
        },
      ];
    });
  };

  const removeFromCart = (identifier: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          item.productId !== identifier &&
          item.id !== identifier &&
          item.product?.id !== identifier
      )
    );
    showToast('Item removed from cart');
  };

  const updateCartQuantity = (identifier: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(identifier);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === identifier ||
        item.id === identifier ||
        item.product?.id === identifier
          ? { ...item, quantity }
          : item
      )
    );
  };

  const toggleCartItemSelection = (identifier: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === identifier ||
        item.id === identifier ||
        item.product?.id === identifier
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  };

  const toggleSelectAllCartItems = (selectAll: boolean) => {
    setCart((prev) => prev.map((item) => ({ ...item, selected: selectAll })));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist actions
  const toggleWishlist = (product: Product) => {
    const exists = wishlist.some((item) => item.productId === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((item) => item.productId !== product.id));
      showToast('Removed from wishlist');
    } else {
      setWishlist((prev) => [
        ...prev,
        {
          id: `wish_${Date.now()}`,
          productId: product.id,
          product,
          addedAt: new Date().toISOString(),
        },
      ]);
      showToast(`Added "${product.name}" to wishlist! ❤️`);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.productId === productId);
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.productId !== productId));
    showToast('Removed from wishlist');
  };

  // Calculations
  const selectedCartItems = cart.filter((item) => item && item.product && item.selected);
  const cartSelectedItemsCount = selectedCartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);

  const cartOriginalMRP = selectedCartItems.reduce(
    (acc, item) => acc + (item.product?.originalPrice ?? item.product?.price ?? 0) * (item.quantity || 1),
    0
  );

  const cartSubtotal = selectedCartItems.reduce(
    (acc, item) => acc + (item.product?.price ?? 0) * (item.quantity || 1),
    0
  );

  const cartDiscountMRP = Math.max(0, cartOriginalMRP - cartSubtotal);

  let couponDiscount = 0;
  if (appliedCoupon && cartSubtotal >= (appliedCoupon.minOrderValue || 0)) {
    if (appliedCoupon.discountType === 'FLAT') {
      couponDiscount = appliedCoupon.value || 0;
    } else {
      couponDiscount = Math.round((cartSubtotal * (appliedCoupon.value || 0)) / 100);
    }
    // Cap max discount if configured
    if (appliedCoupon.maxDiscount && couponDiscount > appliedCoupon.maxDiscount) {
      couponDiscount = appliedCoupon.maxDiscount;
    }
  }

  const cartDiscount = cartDiscountMRP + couponDiscount;
  const cartDeliveryCharge = cartSubtotal >= (storeSettings?.freeDeliveryThreshold ?? 499) || cartSubtotal === 0 ? 0 : (storeSettings?.deliveryCharge ?? 40);
  const cartTotal = Math.max(0, cartSubtotal - couponDiscount + cartDeliveryCharge);

  // Checkout & Coupon
  const applyCoupon = (code: string) => {
    if (!code || !code.trim()) {
      showToast('Please enter a coupon code', 'error');
      return false;
    }
    const cleanCode = code.trim().toUpperCase();
    const existingCoupon = coupons.find((c) => c && c.code && c.code.toUpperCase() === cleanCode);

    if (existingCoupon) {
      if (existingCoupon.isActive === false) {
        showToast(`Coupon "${cleanCode}" is currently inactive or disabled.`, 'error');
        return false;
      }
      if (cartSubtotal < (existingCoupon.minOrderValue || 0)) {
        showToast(`Cart subtotal of at least ₹${existingCoupon.minOrderValue} required for coupon "${cleanCode}" (current: ₹${cartSubtotal})`, 'error');
        return false;
      }
      setAppliedCoupon(existingCoupon);
      showToast(`Coupon "${existingCoupon.code}" applied! 🎉`);
      return true;
    }

    // Check INITIAL_COUPONS only if not registered yet
    const fallback = INITIAL_COUPONS.find((c) => c && c.code && c.code.toUpperCase() === cleanCode);
    if (!fallback) {
      showToast(`Invalid coupon code "${cleanCode}". Try SBS150, SBS100 or SAVE10!`, 'error');
      return false;
    }

    if (cartSubtotal < (fallback.minOrderValue || 0)) {
      showToast(`Cart subtotal of at least ₹${fallback.minOrderValue} required for coupon "${cleanCode}" (current: ₹${cartSubtotal})`, 'error');
      return false;
    }

    setCoupons((prev) => (prev.some((c) => c && c.code && c.code.toUpperCase() === cleanCode) ? prev : [...prev, fallback]));
    setAppliedCoupon(fallback);
    showToast(`Coupon "${fallback.code}" applied! 🎉`);
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed');
  };

  const addCustomerNotification = (notif: {
    title: string;
    message: string;
    type?: 'order' | 'deal' | 'promo' | 'system' | 'alert';
    orderId?: string;
    actionUrl?: string;
  }) => {
    const newNotif: UserBroadcastNotification = {
      id: `un_cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: notif.title,
      message: notif.message,
      type: notif.type || 'order',
      targetAudience: 'ALL',
      orderId: notif.orderId,
      actionUrl: notif.actionUrl || (notif.orderId ? 'orders' : undefined),
      read: false,
      status: 'SENT',
      createdAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
    };

    setUserNotifications((prev) => [newNotif, ...prev]);

    // Dispatch real browser push notification if permitted
    try {
      triggerBrowserPushNotification({
        title: newNotif.title,
        body: newNotif.message,
        data: { url: '/orders' }
      });
    } catch { }
  };

  const placeOrder = (
    paymentMethod: string, 
    address: Address, 
    options?: {
      paymentStatus?: PaymentStatus;
      paymentConfirmedAt?: string;
      whatsappConfirmedAt?: string;
      keepCart?: boolean;
      pointsRedeemed?: number;
      pointsDiscount?: number;
    }
  ) => {
    const orderNum = `SBS-${Math.floor(1000 + Math.random() * 9000)}`;
    const isUpi = paymentMethod.includes('UPI') || paymentMethod === 'UPI';
    const initialPaymentStatus: PaymentStatus = options?.paymentStatus || (isUpi ? 'PENDING' : 'PAYMENT_VERIFIED');
    const finalDiscount = couponDiscount + (options?.pointsDiscount || 0);
    const finalTotal = Math.max(0, cartTotal - (options?.pointsDiscount || 0));

    // Auto-save address permanently if provided
    if (address && address.street) {
      addAddress(address);
    }

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      status: 'Processing',
      items: selectedCartItems.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      })),
      subtotal: cartSubtotal,
      discount: finalDiscount,
      deliveryCharge: cartDeliveryCharge,
      total: finalTotal,
      shippingAddress: address,
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      paymentConfirmedAt: options?.paymentConfirmedAt,
      whatsappConfirmedAt: options?.whatsappConfirmedAt,
      trackingNumber: `TRK-SBS-${Math.floor(100000 + Math.random() * 900000)}`,
      estimatedDelivery: '3-4 Business Days',
      userId: currentUserIdRef.current || undefined,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setAdminOrders((prev) => [newOrder, ...prev]);

    // Add Customer Notification: Order Placed
    addCustomerNotification({
      title: 'Order Placed',
      message: `Your SBS order #${orderNum} has been placed.`,
      type: 'order',
      orderId: newOrder.id
    });

    // Persist order to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const sessionUserId = session?.user?.id || null;
        if (sessionUserId && !newOrder.userId) {
          newOrder.userId = sessionUserId;
          setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, userId: sessionUserId } : o));
          setAdminOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, userId: sessionUserId } : o));
        }
        const orderPayload: any = {
          id: newOrder.id,
          order_number: newOrder.orderNumber,
          user_id: sessionUserId,
          status: newOrder.status,
          items: newOrder.items,
          subtotal: newOrder.subtotal,
          discount: newOrder.discount,
          delivery_charge: newOrder.deliveryCharge,
          total: newOrder.total,
          shipping_address: newOrder.shippingAddress,
          payment_method: newOrder.paymentMethod,
          payment_status: newOrder.paymentStatus,
          payment_confirmed_at: newOrder.paymentConfirmedAt,
          whatsapp_confirmed_at: newOrder.whatsappConfirmedAt,
          tracking_number: newOrder.trackingNumber,
          estimated_delivery: newOrder.estimatedDelivery,
        };

        supabase.from('orders').insert(orderPayload).then(({ error }) => {
          if (error) {
            console.error('Supabase order insert error (attempting fallback):', error);
            const fallback = { ...orderPayload };
            delete fallback.payment_status;
            delete fallback.payment_confirmed_at;
            delete fallback.whatsapp_confirmed_at;
            supabase.from('orders').insert(fallback).then();
          }
        });

        // Broadcast to all active open screens (including admin laptop dashboard) in real time
        try {
          const broadcastCh = supabase.channel('sbs_catalog_realtime');
          broadcastCh.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              broadcastCh.send({
                type: 'broadcast',
                event: 'cross_device_order_placed',
                payload: newOrder,
              });
            }
          });
        } catch (e) { }
      });
    }

    // Create payment ledger record
    const payMethodMap: Record<string, PaymentRecord['method']> = {
      'Cash on Delivery': 'COD',
      'UPI (GPay / PhonePe)': 'UPI',
      'UPI': 'UPI',
      'Credit Card': 'Card',
      'Net Banking': 'Net Banking'
    };
    const mappedMethod = payMethodMap[paymentMethod] || 'UPI';

    const newPayment: PaymentRecord = {
      id: `pay_${Date.now()}`,
      orderId: newOrder.id,
      customerName: user.name,
      amount: cartTotal,
      method: mappedMethod,
      status: mappedMethod === 'COD' ? 'Pending' : mappedMethod === 'UPI' ? 'Pending' : 'Success',
      timestamp: new Date().toISOString()
    };
    setPaymentRecords((prev) => [newPayment, ...prev]);

    // Deduct stock and log inventory
    selectedCartItems.forEach((item) => {
      setProducts((prevProds) =>
        prevProds.map((p) => {
          if (p.id === item.productId) {
            const nextCount = Math.max(0, p.stockCount - item.quantity);
            // Log inventory change
            addInventoryLog(p.id, -item.quantity, 'remove', `Checkout for Order ${orderNum}`);

            // Check low stock trigger
            if (nextCount <= storeSettings.lowStockThreshold) {
              addNotification({
                title: 'Low Stock Alert',
                message: `${p.name} is running low (${nextCount} left)`,
                type: 'stock',
                priority: 'high'
              });
            }
            return {
              ...p,
              stockCount: nextCount,
              inStock: nextCount > 0
            };
          }
          return p;
        })
      );
    });

    // Create new order admin notification
    addNotification({
      title: 'New Order Placed',
      message: `Order ${orderNum} of ₹${cartTotal} by ${user.name}`,
      type: 'order',
      priority: 'high'
    });

    // If keepCart is false or not passed, remove selected items from cart
    if (!options?.keepCart) {
      setCart((prev) => prev.filter((item) => !item.selected));
      setAppliedCoupon(null);
    }

    // Update user stats
    setUser((prev) => ({
      ...prev,
      ordersCount: prev.ordersCount + 1,
    }));

    if (options?.pointsRedeemed && options.pointsRedeemed > 0) {
      redeemRewardPoints(options.pointsRedeemed, orderNum);
    }
    awardOrderRewardPoints(orderNum, finalTotal);

    return newOrder;
  };

  const updateOrderPaymentStatus = async (
    orderId: string, 
    paymentStatus: PaymentStatus, 
    extra?: { paymentConfirmedAt?: string; whatsappConfirmedAt?: string }
  ) => {
    let orderNum = '';
    let oldPaymentStatus: PaymentStatus | undefined;

    const existingOrd = adminOrders.find(o => o.id === orderId) || orders.find(o => o.id === orderId);
    const willMoveToProcessing = paymentStatus === 'PAYMENT_VERIFIED' && (existingOrd?.status === ('To Pay' as any));

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          orderNum = ord.orderNumber;
          oldPaymentStatus = ord.paymentStatus;
          return {
            ...ord,
            paymentStatus,
            paymentConfirmedAt: extra?.paymentConfirmedAt || ord.paymentConfirmedAt,
            whatsappConfirmedAt: extra?.whatsappConfirmedAt || ord.whatsappConfirmedAt,
            status: willMoveToProcessing ? 'Processing' : ord.status
          };
        }
        return ord;
      })
    );

    setAdminOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            paymentStatus,
            paymentConfirmedAt: extra?.paymentConfirmedAt || ord.paymentConfirmedAt,
            whatsappConfirmedAt: extra?.whatsappConfirmedAt || ord.whatsappConfirmedAt,
            status: willMoveToProcessing ? 'Processing' : ord.status
          };
        }
        return ord;
      });
      syncPaymentRecordsFromOrders(updated);
      return updated;
    });

    // Only create customer notification if payment status actually changed
    if (oldPaymentStatus !== paymentStatus) {
      const numDisplay = orderNum || orderId;
      if (paymentStatus === 'CUSTOMER_CONFIRMED') {
        addCustomerNotification({
          title: 'Payment Confirmation Submitted',
          message: `We've received your payment confirmation for order #${numDisplay}. We're verifying your payment.`,
          type: 'order',
          orderId
        });
      } else if (paymentStatus === 'PAYMENT_VERIFIED') {
        addCustomerNotification({
          title: 'Payment Verified 🎉',
          message: `Your payment for order #${numDisplay} has been confirmed. Your order is now processing.`,
          type: 'order',
          orderId
        });
        showToast(`Payment for #${numDisplay} verified ✓`, 'success');
      } else if (paymentStatus === 'PAYMENT_FAILED') {
        addCustomerNotification({
          title: 'Payment Verification Failed',
          message: `We couldn't verify the payment for order #${numDisplay}. Please contact SBS.`,
          type: 'alert',
          orderId
        });
        showToast(`Payment for #${numDisplay} marked as failed`, 'error');
      }
    }

    // Persist to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      const updateData: any = { payment_status: paymentStatus };
      if (willMoveToProcessing) {
        updateData.status = 'Processing';
      }
      if (extra?.paymentConfirmedAt) updateData.payment_confirmed_at = extra.paymentConfirmedAt;
      if (extra?.whatsappConfirmedAt) updateData.whatsapp_confirmed_at = extra.whatsappConfirmedAt;

      const { error } = await supabase.from('orders').update(updateData).eq('id', orderId);
      if (error) {
        console.error('Supabase update order payment error:', error);
        showToast(`Failed to update payment status: ${error.message}`, 'error');
      }

      // Broadcast to other open admin screens
      try {
        const broadcastCh = supabase.channel('sbs_catalog_realtime');
        broadcastCh.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            broadcastCh.send({
              type: 'broadcast',
              event: 'cross_device_payment_updated',
              payload: { orderId, paymentStatus, ...extra },
            });
          }
        });
      } catch (e) { }
    }
  };

  const refreshOrders = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const userEmail = session?.user?.email?.toLowerCase();
      const isUserAdmin = userEmail === 'mahipalstudent71@gmail.com' || adminTeamMembers.some(m => m.email.toLowerCase() === userEmail && m.status === 'ACTIVE');
      const isDevMode = typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' || 
        window.location.hash.includes('admin')
      );

      // 1. Fetch full store orders for admin management
      if (isUserAdmin || isDevMode) {
        const { data: allOrders, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && allOrders) {
          const mapped = allOrders.map((o: any) => ({
            id: o.id,
            orderNumber: o.order_number,
            createdAt: o.created_at,
            status: o.status,
            paymentStatus: o.payment_status || (o.payment_method?.includes('UPI') ? 'PENDING' : 'PAYMENT_VERIFIED'),
            paymentConfirmedAt: o.payment_confirmed_at,
            whatsappConfirmedAt: o.whatsapp_confirmed_at,
            items: o.items || [],
            subtotal: Number(o.subtotal),
            discount: Number(o.discount),
            deliveryCharge: Number(o.delivery_charge),
            total: Number(o.total),
            shippingAddress: o.shipping_address,
            paymentMethod: o.payment_method,
            trackingNumber: o.tracking_number,
            estimatedDelivery: o.estimated_delivery,
            userId: o.user_id,
          }));
          setAdminOrders(mapped);
          syncPaymentRecordsFromOrders(mapped);
        }
      }

      // 2. Fetch customer's own orders
      if (userId) {
        const { data: myOrders } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (myOrders && myOrders.length > 0) {
          setOrders(myOrders.map((o: any) => ({
            id: o.id,
            orderNumber: o.order_number,
            createdAt: o.created_at,
            status: o.status,
            paymentStatus: o.payment_status || (o.payment_method?.includes('UPI') ? 'PENDING' : 'PAYMENT_VERIFIED'),
            paymentConfirmedAt: o.payment_confirmed_at,
            whatsappConfirmedAt: o.whatsapp_confirmed_at,
            items: o.items || [],
            subtotal: Number(o.subtotal),
            discount: Number(o.discount),
            deliveryCharge: Number(o.delivery_charge),
            total: Number(o.total),
            shippingAddress: o.shipping_address,
            paymentMethod: o.payment_method,
            trackingNumber: o.tracking_number,
            estimatedDelivery: o.estimated_delivery,
            userId: o.user_id,
          })));
        } else {
          setOrders([]);
        }
      }
      showToast('Orders refreshed! 🔄', 'success');
    } catch (e) {
      console.error('Failed to refresh orders:', e);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    let orderNum = '';
    let trackingNum = '';
    let oldStatus: OrderStatus | undefined;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          orderNum = ord.orderNumber;
          trackingNum = ord.trackingNumber || '';
          oldStatus = ord.status;
          return { ...ord, status };
        }
        return ord;
      })
    );

    setAdminOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id === orderId) {
          return { ...ord, status };
        }
        return ord;
      });
      syncPaymentRecordsFromOrders(updated);
      return updated;
    });

    // Only create notification if status actually changed (avoid duplicates on repeated saves)
    if (oldStatus && oldStatus !== status) {
      const numDisplay = orderNum || orderId;
      if (status === 'Processing') {
        addCustomerNotification({
          title: 'Order Processing',
          message: `Your SBS order #${numDisplay} is being prepared.`,
          type: 'order',
          orderId
        });
      } else if (status === 'Shipped') {
        addCustomerNotification({
          title: 'Order Shipped / Out for Delivery 🚚',
          message: `Your SBS order #${numDisplay} is on the way! ${trackingNum ? `Tracking: ${trackingNum}` : ''}`,
          type: 'order',
          orderId
        });
      } else if (status === 'Delivered') {
        addCustomerNotification({
          title: 'Order Delivered ✓',
          message: `Your SBS order #${numDisplay} has been delivered ✓`,
          type: 'order',
          orderId
        });
      } else if (status === 'Cancelled') {
        addCustomerNotification({
          title: 'Order Cancelled',
          message: `Your SBS order #${numDisplay} has been cancelled.`,
          type: 'alert',
          orderId
        });
      }
    }

    if (isSupabaseConfigured && supabase) {
      const existingOrd = adminOrders.find(o => o.id === orderId) || orders.find(o => o.id === orderId);
      const isCod = existingOrd?.paymentMethod === 'COD';
      const updates: any = { status };
      if (status === 'Delivered' && isCod) {
        updates.payment_status = 'PAYMENT_VERIFIED';
      }

      const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
      if (error) {
        console.error('Supabase update order status error:', error);
        showToast(`Failed to update order status: ${error.message}`, 'error');
        // Rollback state
        if (oldStatus) {
          setOrders((prev) => prev.map((ord) => (ord.id === orderId ? { ...ord, status: oldStatus! } : ord)));
          setAdminOrders((prev) => {
            const rolled = prev.map((ord) => (ord.id === orderId ? { ...ord, status: oldStatus! } : ord));
            syncPaymentRecordsFromOrders(rolled);
            return rolled;
          });
        }
        return;
      }
    }

    showToast(`Order status updated to ${status}`);
  };

  // User Profile & Addresses
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('sbs_user', JSON.stringify(updated));
      } catch { }
      return updated;
    });
    showToast('Profile updated successfully!');
  };

  const addAddress = async (newAddr: Omit<Address, 'id'> & { id?: string }) => {
    const addressId = newAddr.id || `addr_${Date.now()}`;
    const address: Address = {
      ...newAddr,
      id: addressId,
    };

    setAddresses((prev) => {
      const existingIdx = prev.findIndex(a => 
        (a.id === address.id) || 
        (a.street && address.street && a.street.trim().toLowerCase() === address.street.trim().toLowerCase() && a.pincode === address.pincode)
      );
      let updated: Address[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], ...address, isDefault: address.isDefault ?? updated[existingIdx].isDefault };
      } else if (address.isDefault || prev.length === 0) {
        updated = prev.map((a) => ({ ...a, isDefault: false })).concat({ ...address, isDefault: true });
      } else {
        updated = [...prev, address];
      }
      try {
        localStorage.setItem('sbs_saved_addresses', JSON.stringify(updated));
      } catch { }
      return updated;
    });
    showToast('Address saved! 📍');

    // Persist to Supabase user_addresses
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uId = session?.user?.id;
        if (uId) {
          if (address.isDefault) {
            // Unset previous defaults in DB
            await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', uId);
          }
          await supabase.from('user_addresses').upsert({
            id: address.id,
            user_id: uId,
            name: address.name,
            phone: address.phone,
            street: address.street,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            type: address.type,
            is_default: address.isDefault,
            updated_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Failed to sync address to Supabase:', err);
      }
    }
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    setAddresses((prev) => {
      const updated = prev.map((a) => {
        if (a.id === id) {
          return { ...a, ...updates };
        }
        if (updates.isDefault) {
          return { ...a, isDefault: false };
        }
        return a;
      });
      try {
        localStorage.setItem('sbs_saved_addresses', JSON.stringify(updated));
      } catch { }
      return updated;
    });
    showToast('Address updated! 📍');

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uId = session?.user?.id;
        if (uId) {
          if (updates.isDefault) {
            await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', uId);
          }
          const dbUpdates: any = { updated_at: new Date().toISOString() };
          if (updates.name !== undefined) dbUpdates.name = updates.name;
          if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
          if (updates.street !== undefined) dbUpdates.street = updates.street;
          if (updates.city !== undefined) dbUpdates.city = updates.city;
          if (updates.state !== undefined) dbUpdates.state = updates.state;
          if (updates.pincode !== undefined) dbUpdates.pincode = updates.pincode;
          if (updates.type !== undefined) dbUpdates.type = updates.type;
          if (updates.isDefault !== undefined) dbUpdates.is_default = updates.isDefault;

          await supabase.from('user_addresses').update(dbUpdates).eq('id', id);
        }
      } catch (err) {
        console.error('Failed to update address in Supabase:', err);
      }
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    setAddresses((prev) => {
      const updated = prev.map((a) => ({ ...a, isDefault: a.id === addressId }));
      try {
        localStorage.setItem('sbs_saved_addresses', JSON.stringify(updated));
      } catch { }
      return updated;
    });
    showToast('Default address updated');

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uId = session?.user?.id;
        if (uId) {
          await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', uId);
          await supabase.from('user_addresses').update({ is_default: true, updated_at: new Date().toISOString() }).eq('id', addressId);
        }
      } catch (err) {
        console.error('Failed to set default address in Supabase:', err);
      }
    }
  };

  const deleteAddress = async (addressId: string) => {
    setAddresses((prev) => {
      const updated = prev.filter((a) => a.id !== addressId);
      try {
        localStorage.setItem('sbs_saved_addresses', JSON.stringify(updated));
      } catch { }
      return updated;
    });
    showToast('Address deleted');

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_addresses').delete().eq('id', addressId);
      } catch (err) {
        console.error('Failed to delete address from Supabase:', err);
      }
    }
  };

  // SBS Rewards Processing
  const redeemRewardPoints = async (
    pointsToRedeem: number, 
    orderId?: string
  ): Promise<{ success: boolean; discountAmount: number; error?: string }> => {
    const threshold = storeSettings.rewardPointsThreshold || 100;
    const discountVal = storeSettings.rewardDiscountAmount || 50;
    const currentPoints = user.rewardPoints || 0;

    if (currentPoints < threshold || currentPoints < pointsToRedeem) {
      return { success: false, discountAmount: 0, error: `Need at least ${threshold} points to redeem.` };
    }

    const calculatedDiscount = Math.floor(pointsToRedeem / threshold) * discountVal;
    if (calculatedDiscount <= 0) {
      return { success: false, discountAmount: 0, error: 'Points not eligible for discount value.' };
    }

    // 1. Optimistically deduct points from user balance
    const nextPoints = currentPoints - pointsToRedeem;
    setUser(prev => ({ ...prev, rewardPoints: nextPoints }));

    const txn: RewardTransaction = {
      id: `rt_redeem_${Date.now()}`,
      userId: currentUserIdRef.current || 'local_user',
      type: 'REDEEMED',
      points: -pointsToRedeem,
      description: `Redeemed ${pointsToRedeem} points for ₹${calculatedDiscount} discount`,
      orderId,
      createdAt: new Date().toISOString(),
    };
    setRewardTransactions(prev => [txn, ...prev]);

    // 2. Persist to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uId = session?.user?.id;
        if (uId) {
          await supabase.from('profiles').update({ reward_points: nextPoints }).eq('id', uId);
          await supabase.from('reward_transactions').insert({
            id: txn.id,
            user_id: uId,
            type: txn.type,
            points: txn.points,
            description: txn.description,
            order_id: txn.orderId || null,
            created_at: txn.createdAt
          });
        }
      } catch (err) {
        console.error('Failed to persist reward redemption:', err);
      }
    }

    showToast(`Redeemed ${pointsToRedeem} points for ₹${calculatedDiscount} OFF! 🎁`);
    return { success: true, discountAmount: calculatedDiscount };
  };

  const awardOrderRewardPoints = async (orderId: string, orderTotal: number) => {
    // 5% cashback points on completed orders
    const earnedPoints = Math.round(orderTotal * 0.05);
    if (earnedPoints <= 0) return;

    const currentPoints = user.rewardPoints || 0;
    const nextPoints = currentPoints + earnedPoints;
    setUser(prev => ({ ...prev, rewardPoints: nextPoints }));

    const txn: RewardTransaction = {
      id: `rt_earn_${Date.now()}`,
      userId: currentUserIdRef.current || 'local_user',
      type: 'EARNED',
      points: earnedPoints,
      description: `Earned 5% reward on Order ${orderId}`,
      orderId,
      createdAt: new Date().toISOString(),
    };
    setRewardTransactions(prev => [txn, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uId = session?.user?.id;
        if (uId) {
          await supabase.from('profiles').update({ reward_points: nextPoints }).eq('id', uId);
          await supabase.from('reward_transactions').insert({
            id: txn.id,
            user_id: uId,
            type: txn.type,
            points: txn.points,
            description: txn.description,
            order_id: txn.orderId,
            created_at: txn.createdAt
          });
        }
      } catch (err) {
        console.error('Failed to persist reward points earned:', err);
      }
    }
  };

  // Admin Catalog Actions
  const addProduct = (prod: Omit<Product, 'id'>) => {
    const newId = `p_${Date.now()}`;
    const newProduct: Product = {
      ...prod,
      id: newId,
    };
    setProducts((prev) => [newProduct, ...prev]);
    addInventoryLog(newId, prod.stockCount, 'add', 'Initial stock on creation');
    showToast(`Product "${newProduct.name}" added to store!`);

    // Sync to Supabase Cloud Database for all devices
    if (isSupabaseConfigured && supabase) {
      supabase.from('products').insert({
        id: newId,
        name: newProduct.name,
        category: newProduct.category,
        subcategory: newProduct.subcategory || null,
        price: newProduct.price,
        original_price: newProduct.originalPrice,
        discount_percentage: newProduct.discountPercentage,
        rating: newProduct.rating,
        review_count: newProduct.reviewCount,
        image: newProduct.image,
        images: newProduct.images || [newProduct.image],
        video: newProduct.video || null,
        videos: newProduct.videos || [],
        video_thumbnail: newProduct.videoThumbnail || null,
        in_stock: newProduct.inStock,
        stock_count: newProduct.stockCount,
        description: newProduct.description,
        description_blocks: newProduct.descriptionBlocks || [],
        features: newProduct.features || [],
        is_trending: Boolean(newProduct.isTrending),
        is_best_seller: Boolean(newProduct.isBestSeller),
        is_deal_of_day: Boolean(newProduct.isDealOfDay),
        is_featured: Boolean(newProduct.isFeatured),
        is_super_deal: Boolean(newProduct.isSuperDeal),
        is_top_rated: Boolean(newProduct.isTopRated),
      }).then(({ error }) => {
        if (error) console.error('Supabase add product error:', error);
      });
    }
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          // If stock count changed, log it
          if (updates.stockCount !== undefined && updates.stockCount !== p.stockCount) {
            const diff = updates.stockCount - p.stockCount;
            addInventoryLog(id, diff, diff > 0 ? 'add' : 'remove', 'Manual stock adjustment in edit');
          }
          return { ...p, ...updates };
        }
        return p;
      })
    );
    showToast('Product updated successfully');

    // Sync updates to Supabase Cloud Database for all devices
    if (isSupabaseConfigured && supabase) {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.subcategory !== undefined) dbUpdates.subcategory = updates.subcategory;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice;
      if (updates.discountPercentage !== undefined) dbUpdates.discount_percentage = updates.discountPercentage;
      if (updates.rating !== undefined) dbUpdates.rating = updates.rating;
      if (updates.reviewCount !== undefined) dbUpdates.review_count = updates.reviewCount;
      if (updates.image !== undefined) dbUpdates.image = updates.image;
      if (updates.images !== undefined) dbUpdates.images = updates.images;
      if (updates.video !== undefined) dbUpdates.video = updates.video;
      if (updates.videos !== undefined) dbUpdates.videos = updates.videos;
      if (updates.videoThumbnail !== undefined) dbUpdates.video_thumbnail = updates.videoThumbnail;
      if (updates.inStock !== undefined) dbUpdates.in_stock = updates.inStock;
      if (updates.stockCount !== undefined) dbUpdates.stock_count = updates.stockCount;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.descriptionBlocks !== undefined) dbUpdates.description_blocks = updates.descriptionBlocks;
      if (updates.features !== undefined) dbUpdates.features = updates.features;
      if (updates.isTrending !== undefined) dbUpdates.is_trending = updates.isTrending;
      if (updates.isBestSeller !== undefined) dbUpdates.is_best_seller = updates.isBestSeller;
      if (updates.isDealOfDay !== undefined) dbUpdates.is_deal_of_day = updates.isDealOfDay;
      if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;
      if (updates.isSuperDeal !== undefined) dbUpdates.is_super_deal = updates.isSuperDeal;
      if (updates.isTopRated !== undefined) dbUpdates.is_top_rated = updates.isTopRated;

      supabase.from('products').update(dbUpdates).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase update product error:', error);
      });
    }
  };

  const deleteProduct = (id: string) => {
    const p = products.find(prod => prod.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (p) {
      addInventoryLog(id, -p.stockCount, 'remove', 'Product catalog deletion');
    }
    showToast('Product removed');

    if (isSupabaseConfigured && supabase) {
      supabase.from('products').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase delete product error:', error);
      });
    }
  };

  const resetCatalogToDefault = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    try {
      localStorage.setItem('sbs_products', JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem('sbs_categories', JSON.stringify(INITIAL_CATEGORIES));
    } catch (e) { }
    showToast('Catalog refreshed with all 36+ products & subcategories! ✨', 'success');
  };

  // Admin Team & Role Authorization Methods
  const PRIMARY_STORE_ADMINS = [
    'mahipalstudent71@gmail.com',
    'shyambombaysale@gmail.com',
    'mahipalworld71@gmail.com'
  ];

  const isEmailAuthorizedAdmin = (email?: string | null): boolean => {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();
    if (PRIMARY_STORE_ADMINS.includes(cleanEmail)) return true;
    const member = adminTeamMembers.find(m => m.email.trim().toLowerCase() === cleanEmail);
    return Boolean(member && member.status === 'ACTIVE');
  };

  const getEffectiveAdminRole = (email?: string | null): AdminRole => {
    if (!email) return 'STAFF';
    const cleanEmail = email.trim().toLowerCase();
    if (PRIMARY_STORE_ADMINS.includes(cleanEmail)) return 'OWNER';
    const member = adminTeamMembers.find(m => m.email.trim().toLowerCase() === cleanEmail);
    return member?.role || 'STAFF';
  };

  const addTeamMember = (
    member: Omit<AdminTeamMember, 'id' | 'addedAt'>,
    actorEmail = 'mahipalstudent71@gmail.com'
  ): { success: boolean; error?: string } => {
    const cleanEmail = member.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid Google email address' };
    }

    if (cleanEmail === 'mahipalstudent71@gmail.com') {
      return { success: false, error: 'This email is already the permanent Super Admin' };
    }

    if (adminTeamMembers.some(m => m.email.trim().toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An admin account with this email already exists' };
    }

    const newMember: AdminTeamMember = {
      ...member,
      email: cleanEmail,
      id: `team_${Date.now()}`,
      addedAt: new Date().toISOString(),
      lastActive: undefined,
    };

    setAdminTeamMembers(prev => [newMember, ...prev]);

    const newLog: RoleAuditLog = {
      id: `audit_${Date.now()}`,
      actorEmail,
      action: 'MEMBER_ADDED',
      targetEmail: cleanEmail,
      details: `Granted ${member.role} role (${member.department || 'General Admin'})`,
      timestamp: new Date().toISOString()
    };
    setRoleAuditLogs(prev => [newLog, ...prev]);

    showToast(`Added ${member.name} as ${member.role} 🎉`, 'success');
    return { success: true };
  };

  const updateTeamMemberRole = (id: string, newRole: AdminRole, actorEmail = 'mahipalstudent71@gmail.com') => {
    const target = adminTeamMembers.find(m => m.id === id);
    if (!target) return;

    if (target.email.toLowerCase() === 'mahipalstudent71@gmail.com') {
      showToast('Super Admin role cannot be modified', 'info');
      return;
    }

    setAdminTeamMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));

    const newLog: RoleAuditLog = {
      id: `audit_${Date.now()}`,
      actorEmail,
      action: 'ROLE_UPDATED',
      targetEmail: target.email,
      details: `Role updated from ${target.role} to ${newRole}`,
      timestamp: new Date().toISOString()
    };
    setRoleAuditLogs(prev => [newLog, ...prev]);
    showToast(`Updated role of ${target.name} to ${newRole}`, 'success');
  };

  const toggleTeamMemberStatus = (id: string, actorEmail = 'mahipalstudent71@gmail.com') => {
    const target = adminTeamMembers.find(m => m.id === id);
    if (!target) return;

    if (target.email.toLowerCase() === 'mahipalstudent71@gmail.com') {
      showToast('Super Admin account cannot be suspended', 'error');
      return;
    }

    const nextStatus = target.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setAdminTeamMembers(prev => prev.map(m => m.id === id ? { ...m, status: nextStatus } : m));

    const newLog: RoleAuditLog = {
      id: `audit_${Date.now()}`,
      actorEmail,
      action: 'STATUS_CHANGED',
      targetEmail: target.email,
      details: `Account status changed to ${nextStatus}`,
      timestamp: new Date().toISOString()
    };
    setRoleAuditLogs(prev => [newLog, ...prev]);
    showToast(`${target.name} is now ${nextStatus.toLowerCase()}`, nextStatus === 'ACTIVE' ? 'success' : 'info');
  };

  const removeTeamMember = (id: string, actorEmail = 'mahipalstudent71@gmail.com'): { success: boolean; error?: string } => {
    const target = adminTeamMembers.find(m => m.id === id);
    if (!target) return { success: false, error: 'Member not found' };

    if (target.email.toLowerCase() === 'mahipalstudent71@gmail.com' || target.isSuperAdmin) {
      return { success: false, error: 'Super Admin cannot be removed' };
    }

    setAdminTeamMembers(prev => prev.filter(m => m.id !== id));

    const newLog: RoleAuditLog = {
      id: `audit_${Date.now()}`,
      actorEmail,
      action: 'MEMBER_REMOVED',
      targetEmail: target.email,
      details: `Revoked ${target.role} admin access and removed from team`,
      timestamp: new Date().toISOString()
    };
    setRoleAuditLogs(prev => [newLog, ...prev]);
    showToast(`Removed ${target.name} from admin team`, 'info');
    return { success: true };
  };

  // Admin Custom Actions
  const addNotification = (notif: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AdminNotification = {
      ...notif,
      id: `n_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      read: false,
      timestamp: new Date().toISOString()
    };
    setAdminNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setAdminNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setAdminNotifications([]);
    showToast('All notifications cleared');
  };

  const updateReturnRequestStatus = async (id: string, status: ReturnRequest['status']) => {
    setReturnRequests((prev) =>
      prev.map((ret) => {
        if (ret.id === id) {
          // If status transitions to Refunded, update payment ledgers as well
          if (status === 'Refunded') {
            const newPayment: PaymentRecord = {
              id: `pay_${Date.now()}`,
              orderId: ret.orderId,
              customerName: ret.customerName,
              amount: ret.amount,
              method: 'UPI',
              status: 'Refunded',
              timestamp: new Date().toISOString()
            };
            setPaymentRecords((prevPays) => [newPayment, ...prevPays]);

            // Log inventory returning
            const ord = orders.find(o => o.id === ret.orderId) || adminOrders.find(o => o.id === ret.orderId);
            if (ord) {
              const matchedItem = ord.items.find(i => i.name === ret.productName);
              if (matchedItem) {
                setProducts(prevProds =>
                  prevProds.map(p => {
                    if (p.id === matchedItem.productId) {
                      addInventoryLog(p.id, matchedItem.quantity, 'add', `Returned stock from Order ${ord.orderNumber}`);
                      return { ...p, stockCount: p.stockCount + matchedItem.quantity, inStock: true };
                    }
                    return p;
                  })
                );
              }
            }
          }
          return { ...ret, status };
        }
        return ret;
      })
    );

    if (isSupabaseConfigured && supabase) {
      const targetRet = returnRequests.find((r) => r.id === id);
      if (targetRet) {
        const { error } = await supabase.from('return_requests').upsert({
          id: targetRet.id,
          order_id: targetRet.orderId,
          customer_name: targetRet.customerName,
          product_name: targetRet.productName,
          product_image: targetRet.productImage,
          reason: targetRet.reason,
          date: targetRet.date,
          status,
          amount: targetRet.amount,
        });
        if (error) {
          console.error('Supabase update return request error:', error);
          showToast(`Failed to update return in database: ${error.message}`, 'error');
          return;
        }
      }
    }

    showToast(`Return status updated to ${status}`);
  };

  // Categories Actions
  const addCategory = (cat: Omit<Category, 'id' | 'itemCount'>) => {
    const newId = cat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `cat_${Date.now()}`;
    const newCategory: Category = {
      ...cat,
      id: newId,
      itemCount: 0,
      showOnHome: cat.showOnHome !== undefined ? cat.showOnHome : true,
    };
    setCategories((prev) => [...prev, newCategory]);
    if (newCategory.showOnHome) {
      setHomepageCategories((prev) => (prev.includes(newId) ? prev : [...prev, newId]));
    }
    showToast(`Category "${newCategory.name}" added`);

    if (isSupabaseConfigured && supabase) {
      supabase.from('categories').insert({
        id: newId,
        name: newCategory.name,
        subtitle: newCategory.subtitle,
        image: newCategory.image,
        bg_color: newCategory.bgColor,
        accent_color: newCategory.accentColor,
        item_count: newCategory.itemCount,
        subcategories: newCategory.subcategories || [],
      }).then(({ error }) => {
        if (error) console.error('Supabase add category error:', error);
      });
    }
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    if (updates.showOnHome !== undefined) {
      setHomepageCategories((prev) => {
        if (updates.showOnHome) {
          return prev.includes(id) ? prev : [...prev, id];
        } else {
          return prev.filter((cId) => cId !== id);
        }
      });
    }
    showToast('Category updated successfully');

    if (isSupabaseConfigured && supabase) {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
      if (updates.image !== undefined) dbUpdates.image = updates.image;
      if (updates.bgColor !== undefined) dbUpdates.bg_color = updates.bgColor;
      if (updates.accentColor !== undefined) dbUpdates.accent_color = updates.accentColor;
      if (updates.itemCount !== undefined) dbUpdates.item_count = updates.itemCount;
      if (updates.subcategories !== undefined) dbUpdates.subcategories = updates.subcategories;

      supabase.from('categories').update(dbUpdates).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase update category error:', error);
      });
    }
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setHomepageCategories((prev) => prev.filter((cId) => cId !== id));
    showToast('Category removed');

    if (isSupabaseConfigured && supabase) {
      supabase.from('categories').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase delete category error:', error);
      });
    }
  };

  const reorderCategories = (ids: string[]) => {
    setCategories((prev) => {
      const sorted = [...prev].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
      return sorted;
    });
  };

  // Offers/Coupons Actions
  const addCoupon = (coup: Omit<Coupon, 'id'>) => {
    const newCoupon: Coupon = {
      ...coup,
      id: `coup_${Date.now()}`,
      isActive: coup.isActive !== false,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    showToast(`Coupon code ${newCoupon.code} created`);

    if (isSupabaseConfigured && supabase) {
      supabase.from('coupons').insert({
        id: newCoupon.id,
        code: newCoupon.code,
        title: newCoupon.title,
        discount_type: newCoupon.discountType,
        value: newCoupon.value,
        min_order_value: newCoupon.minOrderValue,
        max_discount: newCoupon.maxDiscount || null,
        expires_at: newCoupon.expiresAt,
        description: newCoupon.description,
        is_active: newCoupon.isActive !== false,
      }).then(({ error }) => {
        if (error) console.error('Supabase add coupon error:', error);
      });
    }
  };

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Coupon details updated');

    if (isSupabaseConfigured && supabase) {
      const dbUpdates: any = {};
      if (updates.code !== undefined) dbUpdates.code = updates.code;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.discountType !== undefined) dbUpdates.discount_type = updates.discountType;
      if (updates.value !== undefined) dbUpdates.value = updates.value;
      if (updates.minOrderValue !== undefined) dbUpdates.min_order_value = updates.minOrderValue;
      if (updates.maxDiscount !== undefined) dbUpdates.max_discount = updates.maxDiscount;
      if (updates.expiresAt !== undefined) dbUpdates.expires_at = updates.expiresAt;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      supabase.from('coupons').update(dbUpdates).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase update coupon error:', error);
      });
    }
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    showToast('Coupon deleted');

    if (isSupabaseConfigured && supabase) {
      supabase.from('coupons').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase delete coupon error:', error);
      });
    }
  };

  // Stories Management Actions
  const addStory = (story: Omit<ProductStory, 'id'>) => {
    const newStory: ProductStory = {
      ...story,
      id: `story_${Date.now()}`,
    };
    const nextStories = [newStory, ...stories];
    setStories(nextStories);
    showToast(`Story "${newStory.title}" created successfully! 🎉`);

    if (isSupabaseConfigured && supabase) {
      supabase.from('store_settings').upsert({ id: 'stories', data: nextStories }).then();
    }
  };

  const updateStory = (id: string, updates: Partial<ProductStory>) => {
    const nextStories = stories.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setStories(nextStories);
    showToast('Story updated successfully!');

    if (isSupabaseConfigured && supabase) {
      supabase.from('store_settings').upsert({ id: 'stories', data: nextStories }).then();
    }
  };

  const deleteStory = (id: string) => {
    const nextStories = stories.filter((s) => s.id !== id);
    setStories(nextStories);
    showToast('Story deleted');

    if (isSupabaseConfigured && supabase) {
      supabase.from('store_settings').upsert({ id: 'stories', data: nextStories }).then();
    }
  };

  const toggleStory = (id: string) => {
    const nextStories = stories.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    setStories(nextStories);

    if (isSupabaseConfigured && supabase) {
      supabase.from('store_settings').upsert({ id: 'stories', data: nextStories }).then();
    }
  };

  // Scratch Card & Flash Deal Config Updaters
  const updateScratchConfig = (updates: Partial<ScratchCardConfig>) => {
    const nextConfig = { ...scratchConfig, ...updates };
    setScratchConfig(nextConfig);
    showToast('Scratch card settings saved! 🎁');

    if (isSupabaseConfigured && supabase) {
      supabase.from('store_settings').upsert({ id: 'scratch_config', data: nextConfig }).then();
    }
  };

  const updateFlashDealConfig = (updates: Partial<FlashDealConfig>) => {
    const nextConfig = { ...flashDealConfig, ...updates };
    setFlashDealConfig(nextConfig);
    showToast('Flash deals settings saved! ⚡');

    if (isSupabaseConfigured && supabase) {
      supabase.from('store_settings').upsert({ id: 'flash_deal_config', data: nextConfig }).then();
    }
  };

  // Inventory actions
  const addInventoryLog = (productId: string, changeQuantity: number, type: 'add' | 'remove' | 'adjustment', reason: string) => {
    const p = products.find((prod) => prod.id === productId);
    const newLog: InventoryLog = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      productId,
      productName: p ? p.name : 'Unknown Product',
      changeQuantity,
      type,
      reason,
      timestamp: new Date().toISOString()
    };
    setInventoryLogs((prev) => [newLog, ...prev]);
  };

  // User Broadcast / Push Notification actions
  const sendBroadcastNotification = (
    notif: Omit<UserBroadcastNotification, 'id' | 'createdAt' | 'status' | 'read'>
  ) => {
    const newNotif: UserBroadcastNotification = {
      ...notif,
      id: `un_${Date.now()}`,
      createdAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
      status: 'SENT',
      read: false,
      recipientCount: notif.recipientCount || Math.floor(Math.random() * 500) + 1200,
    };

    // 1. Update local admin state
    setUserNotifications((prev) => [newNotif, ...prev]);

    // 2. Dispatch real browser web push notification on this admin screen
    triggerBrowserPushNotification({
      title: newNotif.title,
      body: newNotif.message,
      image: newNotif.imageUrl,
      data: { url: newNotif.actionUrl ? `/${newNotif.actionUrl}` : '/' },
    });

    // 3. Persist to Supabase Database and broadcast to ALL other customer devices in real-time
    if (isSupabaseConfigured && supabase) {
      // Insert to DB for all future/offline visitors
      supabase
        .from('broadcast_notifications')
        .insert({
          id: newNotif.id,
          title: newNotif.title,
          message: newNotif.message,
          type: newNotif.type,
          target_audience: newNotif.targetAudience,
          action_url: newNotif.actionUrl,
          image_url: newNotif.imageUrl,
          status: 'SENT',
          recipient_count: newNotif.recipientCount,
          created_at: newNotif.createdAt,
        })
        .then(({ error }) => {
          if (error) console.error('Supabase broadcast save error:', error);
        });

      // Broadcast to all active open devices in real time
      const realtimeChannel = supabase.channel('sbs_broadcast_realtime');
      realtimeChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          realtimeChannel.send({
            type: 'broadcast',
            event: 'new_push_notification',
            payload: newNotif,
          });
        }
      });
    }

    showToast(`🚀 Broadcast sent live to all customer devices (${newNotif.recipientCount} reach)!`, 'success');
  };

  const saveNotificationDraft = (
    draft: Partial<UserBroadcastNotification> & { title: string; message: string }
  ) => {
    if (draft.id) {
      setUserNotificationDrafts((prev) =>
        prev.map((d) => (d.id === draft.id ? ({ ...d, ...draft, status: 'DRAFT' } as UserBroadcastNotification) : d))
      );
      showToast('Draft updated successfully 💾');
    } else {
      const newDraft: UserBroadcastNotification = {
        id: `und_${Date.now()}`,
        title: draft.title,
        message: draft.message,
        type: draft.type || 'promo',
        targetAudience: draft.targetAudience || 'ALL',
        actionUrl: draft.actionUrl,
        imageUrl: draft.imageUrl,
        read: false,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
      };
      setUserNotificationDrafts((prev) => [newDraft, ...prev]);
      showToast('Notification saved as draft 💾');
    }
  };

  const deleteNotificationDraft = (id: string) => {
    setUserNotificationDrafts((prev) => prev.filter((d) => d.id !== id));
    showToast('Draft deleted');
  };

  const deleteBroadcastNotification = (id: string) => {
    setUserNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Broadcast removed from history');
  };

  const markUserNotificationRead = (id: string) => {
    setUserNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllUserNotificationsRead = () => {
    setUserNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read');
  };

  const clearAllUserNotifications = () => {
    setUserNotifications([]);
    showToast('All notifications cleared');
  };

  // Notification Reward Claim Action
  const claimNotificationReward = async (): Promise<{ success: boolean; message: string }> => {
    const permission = await requestNotificationPermission();

    if (permission !== 'granted') {
      showToast('⚠️ Please allow notification permission in your browser to claim 250 points!', 'error');
      return { success: false, message: 'Notification permission not granted' };
    }

    if (isNotificationRewardClaimed) {
      showToast('You have already claimed your 250 notification welcome points! 🎁', 'info');
      setIsNotificationPromptOpen(false);
      return { success: true, message: 'Already claimed' };
    }

    // 1. Award 250 points to user
    setUser((prev) => ({
      ...prev,
      rewardPoints: (prev.rewardPoints || 0) + 250,
      couponsCount: (prev.couponsCount || 0) + 1,
    }));

    // Update Supabase profiles table if logged in
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getUser().then(({ data: { user: authUsr } }) => {
        if (authUsr) {
          supabase
            .from('profiles')
            .update({ reward_points: (user.rewardPoints || 0) + 250 })
            .eq('id', authUsr.id)
            .then();
        }
      });
    }

    // 2. Mark as claimed
    setIsNotificationRewardClaimed(true);
    try {
      localStorage.setItem('sbs_notif_reward_claimed', 'true');
    } catch { }

    // 3. Audio chime + Confetti celebration
    playNotificationChime();
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch { }

    showToast('🎉 +250 SBS Reward Points credited to your wallet!', 'success');

    // 4. Welcome push notification on device
    triggerBrowserPushNotification({
      title: '🎁 +250 Points Unlocked!',
      body: 'Welcome to SBS VIP Alerts! You will now receive flash deals & order updates.',
      data: { url: '/profile' },
    });

    setIsNotificationPromptOpen(false);
    return { success: true, message: '+250 Points credited successfully' };
  };

  return (
    <StoreContext.Provider
      value={{
        isNotificationRewardClaimed,
        isNotificationPromptOpen,
        setIsNotificationPromptOpen,
        claimNotificationReward,

        products,
        categories,
        cart,
        wishlist,
        user,
        addresses,
        orders,
        adminOrders,
        coupons,
        appliedCoupon,
        activeTab,
        selectedCategoryFilter,
        selectedSubcategoryFilter,
        activeSubcategoryModal,
        selectedProductDetail,
        isCheckoutOpen,
        selectedOrderForModal,
        isSearchOpen,
        isEditProfileOpen,
        isAddressesOpen,
        isCouponsOpen,
        orderListFilter,
        toast,
        flyingItems,
        removeFlyingItem,

        // User broadcast notifications
        userNotifications,
        userNotificationDrafts,
        isUserNotificationsModalOpen,
        setIsUserNotificationsModalOpen,
        sendBroadcastNotification,
        saveNotificationDraft,
        deleteNotificationDraft,
        deleteBroadcastNotification,
        markUserNotificationRead,
        markAllUserNotificationsRead,
        clearAllUserNotifications,

        // Admin states
        adminRole,
        adminTeamMembers,
        roleAuditLogs,
        adminNotifications,
        returnRequests,
        paymentRecords,
        inventoryLogs,
        heroBanners,
        homepageCategories,
        trendingNowProducts,
        todayDeals,
        bestSellersConfig,
        homepageSections,
        storeSettings,

        setActiveTab,
        setSelectedCategoryFilter,
        setSelectedSubcategoryFilter,
        setActiveSubcategoryModal,
        setSelectedProductDetail,
        setIsCheckoutOpen,
        setSelectedOrderForModal,
        setIsSearchOpen,
        setIsEditProfileOpen,
        setIsAddressesOpen,
        setIsCouponsOpen,
        isHelpCenterOpen,
        setIsHelpCenterOpen,
        isRewardsOpen,
        setIsRewardsOpen,
        setOrderListFilter,
        showToast,

        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleCartItemSelection,
        toggleSelectAllCartItems,
        clearCart,

        toggleWishlist,
        isInWishlist,
        removeFromWishlist,

        applyCoupon,
        removeCoupon,
        placeOrder,
        updateOrderStatus,
        updateOrderPaymentStatus,
        addCustomerNotification,
        refreshOrders,

        updateUserProfile,
        addAddress,
        updateAddress,
        setDefaultAddress,
        deleteAddress,

        rewardTransactions,
        redeemRewardPoints,
        awardOrderRewardPoints,

        addProduct,
        updateProduct,
        deleteProduct,
        resetCatalogToDefault,

        // Admin & Role Actions
        setAdminRole,
        addTeamMember,
        updateTeamMemberRole,
        toggleTeamMemberStatus,
        removeTeamMember,
        isEmailAuthorizedAdmin,
        getEffectiveAdminRole,
        addNotification,
        markNotificationRead,
        clearAllNotifications,
        updateReturnRequestStatus,

        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,

        addCoupon,
        updateCoupon,
        deleteCoupon,

        // Stories, Scratch Card & Flash Deals
        stories,
        setStories,
        addStory,
        updateStory,
        deleteStory,
        toggleStory,
        scratchConfig,
        setScratchConfig,
        updateScratchConfig,
        flashDealConfig,
        setFlashDealConfig,
        updateFlashDealConfig,

        addInventoryLog,

        // Homepage setters
        homepageSubcategories,
        setHeroBanners,
        setHomepageCategories,
        setHomepageSubcategories,
        setTrendingNowProducts,
        setTodayDeals,
        setBestSellersConfig,
        setHomepageSections,
        setStoreSettings,

        cartOriginalMRP,
        cartSubtotal,
        cartDiscountMRP,
        couponDiscount,
        cartDiscount: cartDiscount,
        cartDeliveryCharge,
        cartTotal,
        cartSelectedItemsCount,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
