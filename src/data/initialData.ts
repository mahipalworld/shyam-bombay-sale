import { 
  Product, 
  Category, 
  UserProfile, 
  Address, 
  Coupon, 
  Order,
  ProductStory,
  ScratchCardConfig,
  FlashDealConfig,
  QuickActionItem
} from '@/types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cleaning-products--chemicals',
    name: 'Cleaning Products / Chemicals',
    subtitle: 'Soaps, floor & toilet cleaners',
    image: '',
    bgColor: '#FFF0E6',
    accentColor: '#F95721',
    itemCount: 15,
    showOnHome: true,
    subcategories: []
  },
  {
    id: 'bathroom--laundry',
    name: 'Bathroom & Laundry',
    subtitle: 'Bath essentials, organizers & accessories',
    image: '',
    bgColor: '#E6F4FF',
    accentColor: '#0284C7',
    itemCount: 0,
    showOnHome: true,
    subcategories: []
  },
  {
    id: 'bucket-and-plastics',
    name: 'Bucket and plastics',
    subtitle: 'Buckets, mugs & durable plastics',
    image: '',
    bgColor: '#F0FDF4',
    accentColor: '#16A34A',
    itemCount: 0,
    showOnHome: true,
    subcategories: []
  },
  {
    id: 'cleaning-tools',
    name: 'Cleaning Tools',
    subtitle: 'Brushes, mops, wipers & dusters',
    image: '',
    bgColor: '#FEF3C7',
    accentColor: '#D97706',
    itemCount: 0,
    showOnHome: true,
    subcategories: []
  },
  {
    id: 'kitchen-utility',
    name: 'Kitchen Utility',
    subtitle: 'Kitchen tools, racks & everyday essentials',
    image: '',
    bgColor: '#FFF7ED',
    accentColor: '#EA580C',
    itemCount: 0,
    showOnHome: true,
    subcategories: []
  },
  {
    id: 'personal-care--grooming',
    name: 'Personal Care / Grooming',
    subtitle: 'Personal care & grooming utilities',
    image: '',
    bgColor: '#FDF2F8',
    accentColor: '#DB2777',
    itemCount: 0,
    showOnHome: true,
    subcategories: []
  },
  {
    id: 'small-appliances--gadgets',
    name: 'Small Appliances / Gadgets',
    subtitle: 'Smart home utilities & gadgets',
    image: '',
    bgColor: '#F5F3FF',
    accentColor: '#7C3AED',
    itemCount: 0,
    showOnHome: true,
    subcategories: []
  },
  {
    id: 'hardware--utility',
    name: 'Hardware / Utility',
    subtitle: 'Hardware, fixtures & home utilities',
    image: '',
    bgColor: '#F1F5F9',
    accentColor: '#475569',
    itemCount: 0,
    showOnHome: true,
    subcategories: []
  }
];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_USER: UserProfile = {
  id: '',
  name: '',
  email: '',
  phone: '',
  ordersCount: 0,
  wishlistCount: 0,
  couponsCount: 0,
  rewardPoints: 0,
};

export const INITIAL_ADDRESSES: Address[] = [];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup_sbs150',
    code: 'SBS150',
    title: 'Surprise ₹150 OFF',
    discountType: 'FLAT',
    value: 150,
    minOrderValue: 499,
    expiresAt: '2026-12-31',
    description: 'Special surprise discount unlocked from Scratch & Win.',
  },
  {
    id: 'coup_sbs100',
    code: 'SBS100',
    title: 'Flat ₹100 Off',
    discountType: 'FLAT',
    value: 100,
    minOrderValue: 499,
    expiresAt: '2026-12-31',
    description: 'Get ₹100 instant discount on orders above ₹499.',
  },
  {
    id: 'coup_sbs50',
    code: 'SBS50',
    title: 'Flat ₹50 Off',
    discountType: 'FLAT',
    value: 50,
    minOrderValue: 299,
    expiresAt: '2026-12-31',
    description: 'Get ₹50 instant discount on orders above ₹299.',
  },
  {
    id: 'coup_save10',
    code: 'SAVE10',
    title: '10% Instant Discount',
    discountType: 'PERCENT',
    value: 10,
    minOrderValue: 499,
    expiresAt: '2026-12-31',
    description: 'Save 10% up to ₹300 on orders above ₹499.',
  },
  {
    id: 'coup_save20',
    code: 'SAVE20',
    title: '20% Mega Savings',
    discountType: 'PERCENT',
    value: 20,
    minOrderValue: 999,
    expiresAt: '2026-12-31',
    description: 'Save 20% on orders above ₹999.',
  },
  {
    id: 'coup_welcome',
    code: 'FIRSTORDER',
    title: 'Free Shipping + ₹50 Off',
    discountType: 'FLAT',
    value: 50,
    minOrderValue: 299,
    expiresAt: '2026-12-31',
    description: 'Welcome perk for your next essential order.',
  },
  {
    id: 'coup_flash',
    code: 'FLASHDEAL',
    title: 'Flash Sale 15% Off',
    discountType: 'PERCENT',
    value: 15,
    minOrderValue: 399,
    expiresAt: '2026-12-31',
    description: 'Special flash sale discount on everyday favorites.',
  },
];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_STORIES: ProductStory[] = [];

export const INITIAL_SCRATCH_CONFIG: ScratchCardConfig = {
  enabled: true,
  code: 'SBS150',
  title: 'Flat ₹150 OFF',
  description: 'Valid on all orders above ₹499',
  discountAmount: 150,
  minOrderValue: 499,
  expiresAt: '2026-12-31',
  scratchThresholdPercent: 35,
};

export const INITIAL_FLASH_DEAL_CONFIG: FlashDealConfig = {
  enabled: false,
  title: 'Deals of the Day',
  badgeText: 'LIVE FLASH SALE',
  discountText: 'Special Discount',
  productId: '',
  productName: '',
  dealPrice: 0,
  originalPrice: 0,
  productImage: '',
  hoursRemaining: 5,
};

export const INITIAL_QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'qa1',
    label: 'Cleaning Products',
    subtitle: 'Chemicals & cleaners',
    icon: '🧴',
    image: '',
    badge: 'POPULAR',
    actionType: 'category',
    actionValue: 'cleaning-products--chemicals',
    enabled: true,
    order: 1,
  },
  {
    id: 'qa2',
    label: 'Cleaning Tools',
    subtitle: 'Mops & wipes',
    icon: '🧹',
    image: '',
    actionType: 'category',
    actionValue: 'cleaning-tools',
    enabled: true,
    order: 2,
  },
  {
    id: 'qa3',
    label: 'Kitchen Utility',
    subtitle: 'Kitchen tools & racks',
    icon: '🍳',
    image: '',
    actionType: 'category',
    actionValue: 'kitchen-utility',
    enabled: true,
    order: 3,
  },
  {
    id: 'qa4',
    label: 'Personal Care',
    subtitle: 'Grooming & care',
    icon: '✂️',
    image: '',
    actionType: 'category',
    actionValue: 'personal-care--grooming',
    enabled: true,
    order: 4,
  },
  {
    id: 'qa5',
    label: 'Bathroom & Laundry',
    subtitle: 'Bath organizers',
    icon: '🚿',
    image: '',
    actionType: 'category',
    actionValue: 'bathroom--laundry',
    enabled: true,
    order: 5,
  },
  {
    id: 'qa6',
    label: 'Scratch & Win',
    subtitle: 'Win coupons',
    icon: '🎁',
    image: '',
    badge: 'FREE',
    actionType: 'tab',
    actionValue: 'rewards',
    enabled: true,
    order: 6,
  },
];
