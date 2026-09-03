export interface ProductDescriptionBlock {
  id?: string;
  title?: string;
  text: string;
  image?: string;
  badge?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory?: string; // Subcategory ID (e.g., 'decor', 'mats', 'lightings')
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[]; // Multiple gallery images
  inStock: boolean;
  stockCount: number;
  description: string;
  features?: string[];
  descriptionBlocks?: ProductDescriptionBlock[]; // Visual storytelling blocks with supporting images
  isTrending?: boolean;
  isBestSeller?: boolean;
  isDealOfDay?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selected: boolean;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

export interface Subcategory {
  id: string;
  name: string;
  subtitle?: string;
  image?: string;
  itemCount?: number;
}

export interface Category {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  bgColor: string; // Pastel tint class or hex
  accentColor?: string;
  itemCount: number;
  showOnHome?: boolean;
  subcategories?: Subcategory[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  ordersCount: number;
  wishlistCount: number;
  couponsCount: number;
  rewardPoints: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  type: 'HOME' | 'WORK' | 'OTHER';
}

export type OrderStatus = 'To Pay' | 'Processing' | 'Shipped' | 'Delivered' | 'Returns';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  discountType: 'PERCENT' | 'FLAT';
  value: number;
  minOrderValue: number;
  expiresAt: string;
  description: string;
  maxDiscount?: number;
  eligibleCategory?: string;
  eligibleProduct?: string;
  isActive?: boolean;
}

export type AdminRole = 'OWNER' | 'MANAGER' | 'MARKETING' | 'STAFF';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'return' | 'payment';
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  timestamp: string;
}

export interface UserBroadcastNotification {
  id: string;
  title: string;
  message: string;
  type: 'promo' | 'deal' | 'order' | 'system' | 'alert';
  targetAudience: 'ALL' | 'CUSTOMERS' | 'GUESTS';
  actionUrl?: string;
  imageUrl?: string;
  read: boolean;
  status: 'SENT' | 'DRAFT' | 'SCHEDULED';
  sentAt?: string;
  scheduledFor?: string;
  createdAt: string;
  recipientCount?: number;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  productName: string;
  productImage: string;
  reason: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Refunded';
  amount: number;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  method: 'UPI' | 'Card' | 'Net Banking' | 'COD';
  status: 'Success' | 'Pending' | 'Failed' | 'Refunded';
  timestamp: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  changeQuantity: number;
  type: 'add' | 'remove' | 'adjustment';
  reason: string;
  timestamp: string;
}

export interface HeroBannerItem {
  id: string;
  image: string;
  heading: string;
  description: string;
  ctaText: string;
  ctaDestination: string;
  enabled: boolean;
}

export interface TodayDealItem {
  id: string;
  productId: string;
  discount: number;
  title: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  enabled: boolean;
}

export interface BestSellersConfig {
  mode: 'auto' | 'manual';
  manualProductIds: string[];
}

export interface HomepageSection {
  id: 'hero' | 'categories' | 'trending' | 'deals' | 'bestsellers' | 'trust';
  name: string;
  enabled: boolean;
}

export interface StoreSettings {
  storeName: string;
  logo: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  businessHours: string;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  deliveryZones: string[];
  codEnabled: boolean;
  upiId: string;
  lowStockThreshold: number;
  orderNotification: boolean;
  lowStockNotification: boolean;
  customerNotification: boolean;
}

