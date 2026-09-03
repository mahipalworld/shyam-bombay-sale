'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  FlashDealConfig
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
import { triggerBrowserPushNotification } from '@/utils/pushNotifications';


interface StoreContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  wishlist: WishlistItem[];
  user: UserProfile;
  addresses: Address[];
  orders: Order[];
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
  placeOrder: (paymentMethod: string, address: Address) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // User Profile & Addresses
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  setDefaultAddress: (addressId: string) => void;
  deleteAddress: (addressId: string) => void;

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
  cartSubtotal: number;
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

  // Initialize with initial cart items
  const [cart, setCart] = useState<CartItem[]>([
    { id: 'c1', productId: 'p1', product: INITIAL_PRODUCTS[0], quantity: 1, selected: true },
    { id: 'c2', productId: 'p2', product: INITIAL_PRODUCTS[1], quantity: 1, selected: true },
    { id: 'c3', productId: 'p3', product: INITIAL_PRODUCTS[2], quantity: 1, selected: true },
  ]);

  // Initial wishlist items
  const [wishlist, setWishlist] = useState<WishlistItem[]>([
    { id: 'w1', productId: 'p1', product: INITIAL_PRODUCTS[0], addedAt: new Date().toISOString() },
    { id: 'w2', productId: 'p2', product: INITIAL_PRODUCTS[1], addedAt: new Date().toISOString() },
    { id: 'w3', productId: 'p3', product: INITIAL_PRODUCTS[2], addedAt: new Date().toISOString() },
    { id: 'w4', productId: 'p4', product: INITIAL_PRODUCTS[3], addedAt: new Date().toISOString() },
    { id: 'w5', productId: 'p5', product: INITIAL_PRODUCTS[4], addedAt: new Date().toISOString() },
    { id: 'w6', productId: 'p6', product: INITIAL_PRODUCTS[5], addedAt: new Date().toISOString() },
  ]);

  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<string>('home');
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
  const [orderListFilter, setOrderListFilter] = useState<OrderStatus | 'ALL' | null>(null);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);
  const [flyingItems, setFlyingItems] = useState<Array<{ id: string; image: string; startX: number; startY: number; endX: number; endY: number }>>([]);
  const [isUserNotificationsModalOpen, setIsUserNotificationsModalOpen] = useState(false);

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
      message: 'All orders above ₹1,700 now qualify for free express courier dispatch across India.',
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

  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([
    { id: 'n1', title: 'New Order Received', message: 'Order SBS-99012 placed by Mahipal Singh', type: 'order', priority: 'high', read: false, timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 'n2', title: 'Low Stock Alert', message: 'Mini Washing Machine is below threshold (5 items left)', type: 'stock', priority: 'high', read: false, timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
    { id: 'n3', title: 'Return Request', message: 'Return requested for Rechargeable Trimmer (Order SBS-98104)', type: 'return', priority: 'medium', read: true, timestamp: new Date(Date.now() - 3600000 * 24).toISOString() }
  ]);

  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([
    { id: 'ret_1', orderId: 'ord_102', customerName: 'Mahipal Singh', productName: 'Rechargeable Trimmer', productImage: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80', reason: 'Product battery heating issue', date: '2026-08-29T10:00:00Z', status: 'Pending', amount: 799 }
  ]);

  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([
    { id: 'pay_1', orderId: 'ord_101', customerName: 'Mahipal Singh', amount: 1848, method: 'UPI', status: 'Success', timestamp: '2026-08-28T14:32:00Z' },
    { id: 'pay_2', orderId: 'ord_102', customerName: 'Mahipal Singh', amount: 789, method: 'Card', status: 'Success', timestamp: '2026-08-26T11:17:00Z' },
    { id: 'pay_3', orderId: 'ord_103', customerName: 'Mahipal Singh', amount: 1097, method: 'COD', status: 'Success', timestamp: '2026-08-23T16:00:00Z' },
    { id: 'pay_4', orderId: 'ord_104', customerName: 'Mahipal Singh', amount: 589, method: 'UPI', status: 'Pending', timestamp: '2026-08-29T18:02:00Z' }
  ]);

  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([
    { id: 'log_1', productId: 'p1', productName: 'Mini Washing Machine', changeQuantity: -1, type: 'remove', reason: 'Order SBS-98231 checkout', timestamp: '2026-08-28T14:30:00Z' },
    { id: 'log_2', productId: 'p1', productName: 'Mini Washing Machine', changeQuantity: 10, type: 'add', reason: 'Stock replenishment by Owner', timestamp: '2026-08-27T09:00:00Z' }
  ]);

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
    contactPhone: '+91 99887 76655',
    address: 'Shyam Bazaar, Jaipur, Rajasthan, 302001',
    businessHours: '09:00 AM - 09:00 PM',
    deliveryCharge: 40,
    freeDeliveryThreshold: 499,
    deliveryZones: ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur'],
    codEnabled: true,
    upiId: 'sbsstore@upi',
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
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem('sbs_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedOrders = localStorage.getItem('sbs_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      const savedUser = localStorage.getItem('sbs_user');
      if (savedUser) setUser(JSON.parse(savedUser));

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
      if (savedPayments) setPaymentRecords(JSON.parse(savedPayments));

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
      if (savedSettings) setStoreSettings(JSON.parse(savedSettings));

    } catch (e) {
      console.error('Failed to load storage state', e);
    }
    setIsLoaded(true);
  }, []);

  // --- Supabase: Load products & categories from DB on mount ---
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const loadCatalog = async () => {
      try {
        const [{ data: cats }, { data: prods }] = await Promise.all([
          supabase.from('categories').select('*').order('name'),
          supabase.from('products').select('*').order('name'),
        ]);

        if (cats && cats.length > 0) {
          const mappedCats = cats.map((c: any) => {
            const initMatch = INITIAL_CATEGORIES.find(ic => ic.id === c.id);
            return {
              id: c.id,
              name: c.name,
              subtitle: c.subtitle,
              image: c.image,
              bgColor: c.bg_color || initMatch?.bgColor,
              accentColor: c.accent_color || initMatch?.accentColor,
              itemCount: c.item_count || initMatch?.itemCount,
              subcategories: c.subcategories || initMatch?.subcategories || [],
              showOnHome: c.show_on_home !== undefined ? c.show_on_home : initMatch?.showOnHome,
            };
          });
          const remoteCatIds = new Set(mappedCats.map(c => c.id));
          const missingInitialCats = INITIAL_CATEGORIES.filter(c => !remoteCatIds.has(c.id));
          setCategories([...mappedCats, ...missingInitialCats]);
        }

        if (prods && prods.length > 0) {
          const mappedRemote: Product[] = prods.map((p: any) => {
            const initMatch = INITIAL_PRODUCTS.find(ip => ip.id === p.id);
            return {
              id: p.id,
              name: p.name,
              category: p.category,
              subcategory: p.subcategory || initMatch?.subcategory,
              price: p.price,
              originalPrice: p.original_price,
              discountPercentage: p.discount_percentage,
              rating: p.rating,
              reviewCount: p.review_count,
              image: p.image,
              images: (p.images && p.images.length > 0) ? p.images : (initMatch?.images || [p.image]),
              inStock: p.in_stock,
              stockCount: p.stock_count,
              description: p.description,
              descriptionBlocks: p.description_blocks || initMatch?.descriptionBlocks,
              features: p.features || initMatch?.features || [],
              isTrending: p.is_trending,
              isBestSeller: p.is_best_seller,
              isDealOfDay: p.is_deal_of_day,
            };
          });

          // Merge remote products with missing initial products
          const remoteIds = new Set(mappedRemote.map(p => p.id));
          const missingInitial = INITIAL_PRODUCTS.filter(p => !remoteIds.has(p.id));
          setProducts([...mappedRemote, ...missingInitial]);
        }
      } catch (err) {
        console.error('Failed to load from Supabase', err);
      }
    };
    loadCatalog();
  }, []);

  // --- Supabase: Sync cart/wishlist/orders when auth user changes ---
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const handleAuthChange = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

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

        // Load wishlist
        const { data: dbWishlist } = await supabase
          .from('wishlist_items')
          .select('*, products(*)')
          .eq('user_id', userId);

        if (dbWishlist && dbWishlist.length > 0) {
          setWishlist(dbWishlist.map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            addedAt: item.created_at,
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
          })));
        }

        // Load orders
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
            items: o.items,
            subtotal: o.subtotal,
            discount: o.discount,
            deliveryCharge: o.delivery_charge,
            total: o.total,
            shippingAddress: o.shipping_address,
            paymentMethod: o.payment_method,
            trackingNumber: o.tracking_number,
            estimatedDelivery: o.estimated_delivery,
          })));
        }
      }
    };

    // Run once on mount
    handleAuthChange();

    // Also listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
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
  const selectedCartItems = cart.filter((item) => item.selected);
  const cartSelectedItemsCount = selectedCartItems.reduce((acc, item) => acc + item.quantity, 0);

  const cartOriginalMRP = selectedCartItems.reduce(
    (acc, item) => acc + item.product.originalPrice * item.quantity,
    0
  );

  const cartSubtotal = selectedCartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const cartDiscountMRP = cartOriginalMRP - cartSubtotal;

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'FLAT') {
      couponDiscount = appliedCoupon.value;
    } else {
      couponDiscount = Math.round((cartSubtotal * appliedCoupon.value) / 100);
    }
    // Cap max discount if configured
    if (appliedCoupon.maxDiscount && couponDiscount > appliedCoupon.maxDiscount) {
      couponDiscount = appliedCoupon.maxDiscount;
    }
  }

  const cartDiscount = cartDiscountMRP + couponDiscount;
  const cartDeliveryCharge = cartSubtotal >= storeSettings.freeDeliveryThreshold || cartSubtotal === 0 ? 0 : storeSettings.deliveryCharge;
  const cartTotal = Math.max(0, cartSubtotal - couponDiscount + cartDeliveryCharge);

  // Checkout & Coupon
  const applyCoupon = (code: string) => {
    if (!code || !code.trim()) {
      showToast('Please enter a coupon code', 'error');
      return false;
    }
    const cleanCode = code.trim().toUpperCase();
    let found = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.isActive !== false);
    
    // Fallback check in INITIAL_COUPONS if not present in state
    if (!found) {
      found = INITIAL_COUPONS.find((c) => c.code.toUpperCase() === cleanCode);
      if (found) {
        setCoupons((prev) => (prev.some((c) => c.code.toUpperCase() === cleanCode) ? prev : [...prev, found!]));
      }
    }

    if (!found) {
      showToast(`Invalid coupon code "${cleanCode}". Try SBS150, SBS100 or SAVE10!`, 'error');
      return false;
    }

    if (cartSubtotal < found.minOrderValue) {
      showToast(`Cart total must be at least ₹${found.minOrderValue} for ${found.code} (Current: ₹${cartSubtotal})`, 'error');
      return false;
    }

    setAppliedCoupon(found);
    showToast(`Coupon "${found.code}" applied successfully! 🎉`);
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed');
  };

  const placeOrder = (paymentMethod: string, address: Address) => {
    const orderNum = `SBS-${Math.floor(10000 + Math.random() * 90000)}`;
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
      discount: couponDiscount,
      deliveryCharge: cartDeliveryCharge,
      total: cartTotal,
      shippingAddress: address,
      paymentMethod,
      trackingNumber: `TRK-SBS-${Math.floor(100000 + Math.random() * 900000)}`,
      estimatedDelivery: '3-4 Business Days',
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Persist order to Supabase if user is logged in
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          supabase.from('orders').insert({
            id: newOrder.id,
            order_number: newOrder.orderNumber,
            user_id: session.user.id,
            status: newOrder.status,
            items: newOrder.items,
            subtotal: newOrder.subtotal,
            discount: newOrder.discount,
            delivery_charge: newOrder.deliveryCharge,
            total: newOrder.total,
            shipping_address: newOrder.shippingAddress,
            payment_method: newOrder.paymentMethod,
            tracking_number: newOrder.trackingNumber,
            estimated_delivery: newOrder.estimatedDelivery,
          });
        }
      });
    }

    // Create payment ledger record
    const payMethodMap: Record<string, PaymentRecord['method']> = {
      'Cash on Delivery': 'COD',
      'UPI (GPay / PhonePe)': 'UPI',
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
      status: mappedMethod === 'COD' ? 'Pending' : 'Success',
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

    // Remove only checked items from cart
    setCart((prev) => prev.filter((item) => !item.selected));
    setAppliedCoupon(null);

    // Update user stats
    setUser((prev) => ({
      ...prev,
      ordersCount: prev.ordersCount + 1,
      rewardPoints: prev.rewardPoints + Math.round(cartTotal * 0.05),
    }));

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) { }

    showToast(`Order ${newOrder.orderNumber} placed successfully! 🎉`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
    showToast(`Order status updated to ${status}`);

    // Update COD payment status to success if order becomes delivered
    if (status === 'Delivered') {
      setPaymentRecords((prevPays) =>
        prevPays.map((p) => p.orderId === orderId && p.status === 'Pending' ? { ...p, status: 'Success' } : p)
      );
    }
  };

  // User Profile & Addresses
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
    showToast('Profile updated successfully!');
  };

  const addAddress = (newAddr: Omit<Address, 'id'>) => {
    const address: Address = {
      ...newAddr,
      id: `addr_${Date.now()}`,
    };
    if (address.isDefault) {
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: false })).concat(address));
    } else {
      setAddresses((prev) => [...prev, address]);
    }
    showToast('Address added!');
  };

  const setDefaultAddress = (addressId: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === addressId }))
    );
    showToast('Default address updated');
  };

  const deleteAddress = (addressId: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== addressId));
    showToast('Address deleted');
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
  };

  const deleteProduct = (id: string) => {
    const p = products.find(prod => prod.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (p) {
      addInventoryLog(id, -p.stockCount, 'remove', 'Product catalog deletion');
    }
    showToast('Product removed');
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
  const isEmailAuthorizedAdmin = (email?: string | null): boolean => {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'mahipalstudent71@gmail.com') return true;
    const member = adminTeamMembers.find(m => m.email.trim().toLowerCase() === cleanEmail);
    return Boolean(member && member.status === 'ACTIVE');
  };

  const getEffectiveAdminRole = (email?: string | null): AdminRole => {
    if (!email) return 'STAFF';
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'mahipalstudent71@gmail.com') return 'OWNER';
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

  const updateReturnRequestStatus = (id: string, status: ReturnRequest['status']) => {
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
            const ord = orders.find(o => o.id === ret.orderId);
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
      setHomepageCategories((prev) => prev.includes(newId) ? prev : [...prev, newId]);
    }
    showToast(`Category "${newCategory.name}" added`);
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
          return prev.filter(cId => cId !== id);
        }
      });
    }
    showToast('Category updated successfully');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setHomepageCategories((prev) => prev.filter((cId) => cId !== id));
    showToast('Category removed');
  };

  const reorderCategories = (ids: string[]) => {
    // Sort based on list of IDs
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
      isActive: coup.isActive !== false
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    showToast(`Coupon code ${newCoupon.code} created`);
  };

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Coupon details updated');
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    showToast('Coupon deleted');
  };

  // Stories Management Actions
  const addStory = (story: Omit<ProductStory, 'id'>) => {
    const newStory: ProductStory = {
      ...story,
      id: `story_${Date.now()}`,
    };
    setStories((prev) => [newStory, ...prev]);
    showToast(`Story "${newStory.title}" created successfully! 🎉`);
  };

  const updateStory = (id: string, updates: Partial<ProductStory>) => {
    setStories((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast('Story updated successfully!');
  };

  const deleteStory = (id: string) => {
    setStories((prev) => prev.filter((s) => s.id !== id));
    showToast('Story deleted');
  };

  const toggleStory = (id: string) => {
    setStories((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  // Scratch Card & Flash Deal Config Updaters
  const updateScratchConfig = (updates: Partial<ScratchCardConfig>) => {
    setScratchConfig((prev) => ({ ...prev, ...updates }));
    showToast('Scratch card settings saved! 🎁');
  };

  const updateFlashDealConfig = (updates: Partial<FlashDealConfig>) => {
    setFlashDealConfig((prev) => ({ ...prev, ...updates }));
    showToast('Flash deals settings saved! ⚡');
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

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        cart,
        wishlist,
        user,
        addresses,
        orders,
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

        updateUserProfile,
        addAddress,
        setDefaultAddress,
        deleteAddress,

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

        cartSubtotal,
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
