export interface ProductDescriptionBlock {
  id?: string;
  title?: string;
  text: string;
  image?: string;
  badge?: string;
}

export interface Product {
  id: string;
  barcode?: string; // Optional physical barcode (EAN-13, UPC, Code 128, etc.)
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
  video?: string; // S3 canonical key or video URL
  videos?: string[]; // Additional demo video keys or URLs
  videoThumbnail?: string; // S3 canonical key or poster thumbnail URL
  inStock: boolean;
  stockCount: number;
  description: string;
  features?: string[];
  descriptionBlocks?: ProductDescriptionBlock[]; // Visual storytelling blocks with supporting images
  isTrending?: boolean;
  isBestSeller?: boolean;
  isDealOfDay?: boolean;
  isFeatured?: boolean;
  isSuperDeal?: boolean;
  isTopRated?: boolean;
  subtitle?: string;
  featureIcons?: { icon: string; label: string }[];
  specifications?: { label: string; value: string }[];
  faqs?: { question: string; answer: string }[];
  shippingInfo?: string;
  returnPolicy?: string;
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

export type OrderStatus = 'To Pay' | 'Processing' | 'Shipped' | 'Delivered' | 'Returns' | 'Cancelled';

export type PaymentStatus = 'PENDING' | 'CUSTOMER_CONFIRMED' | 'PAYMENT_VERIFIED' | 'PAYMENT_FAILED' | 'CANCELLED';

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
  codCharge?: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus?: PaymentStatus;
  paymentConfirmedAt?: string;
  whatsappConfirmedAt?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  userId?: string;
  prepaidDiscount?: number;
}

export type CouponChannelApplicability = 'PHYSICAL_STORE_ONLY' | 'ONLINE_ONLY' | 'ALL_CHANNELS';
export type CouponCustomerEligibility = 'ALL' | 'NEW_CUSTOMERS_ONLY' | 'RETURNING_CUSTOMERS_ONLY';

export type CouponJourney = 
  | 'IN_STORE_QR' 
  | 'WEBSITE' 
  | 'PROMO' 
  | 'WEBSITE_FLOATING' 
  | 'PRODUCT_PAGE' 
  | 'ORDER_SUCCESS' 
  | 'BROADCAST_CAMPAIGN';

export type CouponIssuanceStatus = 
  | 'ISSUED' 
  | 'REDEEMED' 
  | 'EXPIRED' 
  | 'CANCELLED';

export interface Coupon {
  id: string;
  code: string;
  title: string;
  discountType: 'PERCENT' | 'FLAT' | 'fixed';
  value: number;
  minOrderValue: number;
  expiresAt: string;
  description: string;
  maxDiscount?: number;
  eligibleCategory?: string;
  eligibleProduct?: string;
  isActive?: boolean;
  channel?: CouponChannelApplicability;
  channelApplicability?: CouponChannelApplicability;
  customerEligibility?: CouponCustomerEligibility;
  usageLimitPerCustomer?: number;
  termsAndConditions?: string;
  totalIssued?: number;
  totalRedeemed?: number;
  redemptionRate?: number;
}

export interface CouponIssuance {
  id: string;
  coupon_code: string;
  phone: string;
  phone_normalized: string;
  customer_name?: string;
  discount_type: 'PERCENT' | 'FLAT' | 'PERCENTAGE' | 'fixed';
  discount_value: number;
  journey: CouponJourney | string;
  touchpoint_ref: string;
  status: CouponIssuanceStatus | string;
  discount_applied?: number;
  issued_at: string;
  redeemed_at?: string;
  redeemed_by_cashier?: string;
  attributed_order_number?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerLookupResult {
  found: boolean;
  source?: 'profile' | 'guest_order';
  reason?: string;
  customer?: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    reward_points?: number;
    created_at?: string;
  };
  order_summary?: {
    total_orders: number;
    recent_order?: {
      order_number: string;
      total: number;
      status: string;
      created_at: string;
    } | null;
  };
}

export interface RedeemCouponSuccess {
  success: true;
  coupon_code: string;
  phone: string;
  discount_value: number;
  discount_type: 'PERCENT' | 'FLAT' | 'PERCENTAGE' | 'fixed';
  min_order_value?: number;
  customer_name?: string;
  redeemed_at: string;
  redeemed_by_cashier: string;
  message: string;
}

export interface RedeemCouponFailure {
  success: false;
  error: 
    | 'invalid_phone' 
    | 'missing_coupon_code' 
    | 'missing_cashier_id' 
    | 'coupon_not_found' 
    | 'coupon_expired' 
    | 'channel_not_applicable' 
    | 'already_redeemed' 
    | 'no_issuance_found' 
    | string;
  reason?: string;
  redeemed_at?: string;
  redeemed_by_cashier?: string;
  message: string;
}

export type RedeemCouponResult = RedeemCouponSuccess | RedeemCouponFailure;

export type AdminRole = 'OWNER' | 'MANAGER' | 'MARKETING' | 'STAFF';

export interface AdminTeamMember {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: 'ACTIVE' | 'SUSPENDED';
  department?: string;
  avatarUrl?: string;
  isSuperAdmin?: boolean;
  addedAt: string;
  lastActive?: string;
}

export interface RoleAuditLog {
  id: string;
  actorEmail: string;
  action: 'MEMBER_ADDED' | 'ROLE_UPDATED' | 'STATUS_CHANGED' | 'MEMBER_REMOVED';
  targetEmail: string;
  details: string;
  timestamp: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'return' | 'payment';
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  timestamp: string;
  link?: string;
  orderId?: string;
}

export interface UserBroadcastNotification {
  id: string;
  title: string;
  message: string;
  type: 'promo' | 'deal' | 'order' | 'system' | 'alert';
  targetAudience: 'ALL' | 'CUSTOMERS' | 'GUESTS';
  orderId?: string;
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
  customerPhone?: string;
  customerAddress?: string;
  productName: string;
  productImage: string;
  reason: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Refunded';
  amount: number;
  pickupStatus?: 'Pending' | 'Scheduled' | 'Picked Up' | 'Inspected';
  pickupCourier?: string;
  pickupTrackingNumber?: string;
  inspectionNotes?: string;
  refundTxnId?: string;
  refundMethod?: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  method: 'UPI' | 'Card' | 'Net Banking' | 'COD';
  status: 'Success' | 'Pending' | 'Failed' | 'Refunded' | 'Customer Confirmed' | 'Verified' | 'Cancelled';
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
  productId?: string;
  heading: string;
  description: string;
  image: string;
  ctaText: string;
  ctaDestination: string;
  badgeText?: string;
  discountText?: string;
  accentColor?: string;
  bgGradient?: string;
  enabled: boolean;
  order?: number;
}

export interface QuickActionItem {
  id: string;
  label: string;
  subtitle?: string;
  icon?: string;
  image?: string;
  badge?: string;
  actionType: 'category' | 'product' | 'tab' | 'url';
  actionValue: string;
  enabled: boolean;
  order: number;
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
  id: 'stories' | 'hero' | 'quick_actions' | 'categories' | 'aisles' | 'trending' | 'deals' | 'bestsellers' | 'trust';
  name: string;
  enabled: boolean;
}

export interface ProductStory {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  media: string;
  type: 'image' | 'video';
  productId: string;
  productName: string;
  price: number;
  originalPrice: number;
  discount: string;
  accentColor: string;
  bgGradient: string;
  enabled: boolean;
  order: number;
}

export interface ScratchCardConfig {
  enabled: boolean;
  code: string;
  title: string;
  description: string;
  discountAmount: number;
  minOrderValue: number;
  expiresAt: string;
  scratchThresholdPercent: number;
}

export interface FlashDealConfig {
  enabled: boolean;
  title: string;
  badgeText: string;
  discountText: string;
  productId: string;
  productName?: string;
  dealPrice: number;
  originalPrice?: number;
  productImage?: string;
  hoursRemaining: number;
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
  codCharge?: number;
  upiId: string;
  lowStockThreshold: number;
  orderNotification: boolean;
  lowStockNotification: boolean;
  customerNotification: boolean;
  enableStories?: boolean;
  enableScratchCard?: boolean;
  enableFlashDeals?: boolean;
  enableConfetti?: boolean;
  rewardPointsThreshold?: number; // e.g. 100 points
  rewardDiscountAmount?: number; // e.g. ₹50 OFF
  rewardProgramActive?: boolean;
}

export interface RewardTransaction {
  id: string;
  userId: string;
  type: 'EARNED' | 'REDEEMED' | 'WELCOME';
  points: number;
  description: string;
  orderId?: string;
  createdAt: string;
}

export interface S3MediaItem {
  key: string;
  url: string;
  name: string;
  size: number;
  lastModified: string;
  type: 'image' | 'video';
}

export interface StorageStatus {
  configured: boolean;
  status: 'connected' | 'not_configured' | 'error';
  bucket: string;
  region: string;
  cloudfrontEnabled?: boolean;
  message?: string;
}

