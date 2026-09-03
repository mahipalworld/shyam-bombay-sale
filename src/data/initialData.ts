import { 
  Product, 
  Category, 
  UserProfile, 
  Address, 
  Coupon, 
  Order,
  ProductStory,
  ScratchCardConfig,
  FlashDealConfig
} from '@/types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'home',
    name: 'Home',
    subtitle: 'Decor, Mats, Lightings & more',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    bgColor: '#FFF9E6',
    accentColor: '#D97706',
    itemCount: 45,
    showOnHome: true,
    subcategories: [
      { 
        id: 'decor', 
        name: 'Decor & Accents', 
        subtitle: 'Vases, sculptures & minimal tabletop accents', 
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&auto=format&fit=crop&q=80', 
        itemCount: 12 
      },
      { 
        id: 'mats', 
        name: 'Floor Mats & Rugs', 
        subtitle: 'Memory foam bath mats, runners & coir mats', 
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=80', 
        itemCount: 10 
      },
      { 
        id: 'lightings', 
        name: 'Smart Lightings', 
        subtitle: 'Fairy string lights, sunset lamps & mood bars', 
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80', 
        itemCount: 14 
      },
      { 
        id: 'wall-art', 
        name: 'Wall Accents', 
        subtitle: 'Macrame tapestries, frames & hanging decor', 
        image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=500&auto=format&fit=crop&q=80', 
        itemCount: 9 
      },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    subtitle: 'Organisers, Tools & more',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    bgColor: '#FFF0E6',
    accentColor: '#EA580C',
    itemCount: 38,
    showOnHome: true,
    subcategories: [
      { 
        id: 'tools', 
        name: 'Smart Kitchen Tools', 
        subtitle: 'Heat sealers, choppers, oil brushes & slicers', 
        image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&auto=format&fit=crop&q=80', 
        itemCount: 12 
      },
      { 
        id: 'organizers', 
        name: 'Racks & Organizers', 
        subtitle: 'Lazy susan turntables & spice organizers', 
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=80', 
        itemCount: 10 
      },
      { 
        id: 'cookware', 
        name: 'Non-Stick Cookware', 
        subtitle: 'Granite frying pans, skillets & pots', 
        image: 'https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?w=500&auto=format&fit=crop&q=80', 
        itemCount: 8 
      },
      { 
        id: 'storage', 
        name: 'Airtight Containers', 
        subtitle: 'Sealed pantry canisters & food jars', 
        image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=500&auto=format&fit=crop&q=80', 
        itemCount: 8 
      },
    ],
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    subtitle: 'Mops, Brushes & more',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
    bgColor: '#EAF4FC',
    accentColor: '#0284C7',
    itemCount: 24,
    showOnHome: true,
    subcategories: [
      { 
        id: 'mops', 
        name: 'Mops & Spinners', 
        subtitle: '360° spin mops, flat mops & ceiling mops', 
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=80', 
        itemCount: 8 
      },
      { 
        id: 'cloths', 
        name: 'Cloths & Wipes', 
        subtitle: 'Plush microfiber towels & glass cloths', 
        image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=500&auto=format&fit=crop&q=80', 
        itemCount: 9 
      },
      { 
        id: 'brushes', 
        name: 'Brushes & Grippers', 
        subtitle: 'Wall mop holders, crevice brushes & tools', 
        image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&auto=format&fit=crop&q=80', 
        itemCount: 7 
      },
    ],
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    subtitle: 'Trimmers, Grooming & more',
    image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80',
    bgColor: '#F3EFFC',
    accentColor: '#9333EA',
    itemCount: 19,
    showOnHome: true,
    subcategories: [
      { 
        id: 'grooming', 
        name: 'Grooming & Trimmers', 
        subtitle: 'Cordless precision beard shavers & clippers', 
        image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&auto=format&fit=crop&q=80', 
        itemCount: 8 
      },
      { 
        id: 'skincare', 
        name: 'Skin & Facial Care', 
        subtitle: 'Ultrasonic silicone cleansing massagers', 
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80', 
        itemCount: 6 
      },
      { 
        id: 'dental', 
        name: 'Dental Care', 
        subtitle: 'Sonic electric toothbrushes & refill heads', 
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=80', 
        itemCount: 5 
      },
    ],
  },
  {
    id: 'home-storage',
    name: 'Home & Storage',
    subtitle: 'Organise, Save Space & more',
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80',
    bgColor: '#EBF5F0',
    accentColor: '#059669',
    itemCount: 42,
    showOnHome: true,
    subcategories: [
      { 
        id: 'boxes', 
        name: 'Storage Boxes', 
        subtitle: 'Stackable steel-frame organizer boxes', 
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500&auto=format&fit=crop&q=80', 
        itemCount: 16 
      },
      { 
        id: 'closet', 
        name: 'Closet & Bathroom', 
        subtitle: 'Foldable wardrobe dividers & corner shelves', 
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=80', 
        itemCount: 14 
      },
      { 
        id: 'hangers', 
        name: 'Hooks & Hangers', 
        subtitle: 'Adhesive wall hooks & space-saving hangers', 
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&auto=format&fit=crop&q=80', 
        itemCount: 12 
      },
    ],
  },
  {
    id: 'laundry',
    name: 'Laundry',
    subtitle: 'Baskets, Lines & more',
    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop&q=80',
    bgColor: '#EDF5F9',
    accentColor: '#0891B2',
    itemCount: 15,
    showOnHome: true,
    subcategories: [
      { 
        id: 'appliances', 
        name: 'Washers & Steamers', 
        subtitle: 'Portable ultrasonic mini washing machines', 
        image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500&auto=format&fit=crop&q=80', 
        itemCount: 5 
      },
      { 
        id: 'baskets', 
        name: 'Laundry Hampers', 
        subtitle: 'Collapsible space-saving laundry baskets', 
        image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=500&auto=format&fit=crop&q=80', 
        itemCount: 6 
      },
      { 
        id: 'racks', 
        name: 'Drying & Pegs', 
        subtitle: 'Cloth drying lines, clips & hangers', 
        image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500&auto=format&fit=crop&q=80', 
        itemCount: 4 
      },
    ],
  },
  {
    id: 'travel-outdoors',
    name: 'Travel & Outdoors',
    subtitle: 'Bottles, Bags, Accessories & more',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    bgColor: '#FDEEF2',
    accentColor: '#DB2777',
    itemCount: 22,
    showOnHome: true,
    subcategories: [
      { 
        id: 'bottles', 
        name: 'Bottles & Flasks', 
        subtitle: 'Insulated thermal flasks & time-marker bottles', 
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80', 
        itemCount: 10 
      },
      { 
        id: 'bags', 
        name: 'Travel Bags & Duffels', 
        subtitle: 'Waterproof duffel bags & packing cubes', 
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80', 
        itemCount: 7 
      },
      { 
        id: 'accessories', 
        name: 'On-the-go Gadgets', 
        subtitle: 'Compact travel utilities & gadgets', 
        image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&auto=format&fit=crop&q=80', 
        itemCount: 5 
      },
    ],
  },
  {
    id: 'offers',
    name: 'Offers',
    subtitle: 'Best Deals, Combo Packs & more',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80',
    bgColor: '#FFF6E5',
    accentColor: '#EA580C',
    itemCount: 50,
    showOnHome: true,
    subcategories: [
      { 
        id: 'flash-deals', 
        name: 'Flash Deals', 
        subtitle: 'Wireless chargers & special limited discounts', 
        image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&auto=format&fit=crop&q=80', 
        itemCount: 20 
      },
      { 
        id: 'combos', 
        name: 'Combo Savers', 
        subtitle: 'Buy more, save more bundle value packs', 
        image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=500&auto=format&fit=crop&q=80', 
        itemCount: 18 
      },
      { 
        id: 'under-499', 
        name: 'Under ₹499', 
        subtitle: 'Budget essentials and daily utility picks', 
        image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=500&auto=format&fit=crop&q=80', 
        itemCount: 12 
      },
    ],
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Mini Washing Machine',
    category: 'laundry',
    subcategory: 'appliances',
    price: 1499,
    originalPrice: 2499,
    discountPercentage: 40,
    rating: 4.6,
    reviewCount: 128,
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 15,
    description: 'Compact portable ultrasonic mini washing machine with turbo spin technology. Perfect for quick washes, baby clothes, delicates, and travel essentials.',
    features: ['High-frequency vibration', 'Timer switch', 'USB Powered / Low Energy', 'Foldable & Compact'],
    descriptionBlocks: [
      {
        id: 'db1',
        title: 'Deep Ultrasonic Turbo Cleaning',
        badge: 'High Performance',
        text: 'Equipped with high-frequency ultrasonic cavitation and forward-reverse bi-directional turbine rotation to eliminate 99.8% of dirt and stains without fabric damage.',
        image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'db2',
        title: 'Compact, Foldable & Travel Ready',
        badge: 'Portability',
        text: 'Folds down to just 4 inches in height. Easily packs into suitcases or backpacks for business trips, camping, dorms, and RV travel.',
        image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'db3',
        title: 'Gentle on Delicates & Baby Clothes',
        badge: 'Fabric Care',
        text: 'Specifically calibrated cycle times protect delicate fabrics, intimate wear, masks, and baby apparel while ensuring hygienic, odor-free results.',
        image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: true,
    isDealOfDay: true,
  },
  {
    id: 'p2',
    name: 'Packet Sealer',
    category: 'kitchen',
    subcategory: 'tools',
    price: 349,
    originalPrice: 599,
    discountPercentage: 42,
    rating: 4.5,
    reviewCount: 96,
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 40,
    description: 'Handheld heat bag vacuum sealer machine for kitchen snacks, dry fruits, and food preservation. Keeps food fresh and airtight in seconds.',
    features: ['Instant 3s Heating', 'Magnetic Back for Fridge', 'Dual Mode (Sealing + Cutter)', 'Battery Operated'],
    descriptionBlocks: [
      {
        id: 'db2_1',
        title: 'Instant 3-Second Airtight Seal',
        badge: 'Freshness Guaranteed',
        text: 'Quick micro-heating element locks in flavor and crispness for chips, nuts, snacks, and frozen veggies, preventing moisture and food waste.',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'db2_2',
        title: '2-in-1 Sealer & Express Cutter',
        badge: 'Smart Design',
        text: 'Flip the switch to transition from heat sealer to razor-sharp hidden safety cutter for effortlessly opening stubborn packets without scissors.',
        image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: true,
    isDealOfDay: false,
  },
  {
    id: 'p3',
    name: 'Rechargeable Trimmer',
    category: 'personal-care',
    subcategory: 'grooming',
    price: 799,
    originalPrice: 1299,
    discountPercentage: 38,
    rating: 4.4,
    reviewCount: 154,
    image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 25,
    description: 'Cordless high precision beard and hair trimmer with stainless steel self-sharpening blades, LED battery indicator, and fast USB charging.',
    features: ['120 mins Runtime', '4 Guide Combs Included', 'IPX7 Waterproof Head', 'Ultra Quiet Motor'],
    descriptionBlocks: [
      {
        id: 'db3_1',
        title: 'Self-Sharpening Titanium Blades',
        badge: 'Zero Snag',
        text: 'Surgical-grade titanium and ceramic cutting teeth maintain razor sharpness through 500+ trims without skin irritation or snagging.',
        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'db3_2',
        title: 'Fast Type-C Charging & LED Display',
        badge: 'Long Battery',
        text: 'Get 120 minutes of continuous precision grooming on a single 1.5-hour charge, with a clear digital battery percentage readout.',
        image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: true,
    isBestSeller: true,
  },
  {
    id: 'p4',
    name: 'Spin Mop with Bucket',
    category: 'cleaning',
    subcategory: 'mops',
    price: 799,
    originalPrice: 1299,
    discountPercentage: 38,
    rating: 4.6,
    reviewCount: 210,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 18,
    description: '360° rotating magic spin mop bucket system with dual wringer spinner, microfiber refill heads, and extendable steel handle.',
    features: ['360° Rotating Head', '2 Microfiber Refills Included', 'Built-in Soap Dispenser', 'Drain Plug System'],
    descriptionBlocks: [
      {
        id: 'db4_1',
        title: '360° Effortless Centrifugal Drying',
        badge: 'Zero Hand-Wringing',
        text: 'Press down the mop handle into the stainless steel spin basket to extract 95% of water in just 3 quick spins, leaving floors clean without puddles.',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'db4_2',
        title: 'High-Density Microfiber Strands',
        badge: 'Deep Suction',
        text: 'Thick microfiber mop head captures fine pet hair, grease, and spilled liquids from tiles, hardwood, vinyl, and marble floors.',
        image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: false,
    isDealOfDay: true,
  },
  {
    id: 'p5',
    name: 'Microfiber Cleaning Cloth (Pack of 5)',
    category: 'cleaning',
    subcategory: 'cloths',
    price: 199,
    originalPrice: 399,
    discountPercentage: 50,
    rating: 4.8,
    reviewCount: 420,
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 85,
    description: 'Ultra-absorbent lint-free streak-free dual-sided plush microfiber towels for kitchen counters, car detailing, laptops, and glass.',
    features: ['Absorbs 8x Its Weight', 'Scratch & Lint Free', 'Reusable & Machine Washable', 'Pack of 5 Vibrant Colors'],
    descriptionBlocks: [
      {
        id: 'db5_1',
        title: 'Streak-Free Mirror & Glass Shine',
        badge: 'Lint-Free Tech',
        text: 'Split microfiber weave lifts dust, watermarks, and fingerprints without requiring harsh chemical sprays.',
        image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isBestSeller: true,
    isDealOfDay: false,
  },
  {
    id: 'p6',
    name: 'Bathroom Corner Organizer Shelf',
    category: 'home-storage',
    subcategory: 'closet',
    price: 299,
    originalPrice: 599,
    discountPercentage: 50,
    rating: 4.3,
    reviewCount: 88,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 50,
    description: 'Drill-free self-adhesive triangular corner caddy rack with drain holes and hanging hooks for shampoo, soap, and bath essentials.',
    features: ['Strong Magic Sticker Tape', 'Rust-Proof Matte Black Metal', 'High Load Capacity (8kg)', 'Hollow Drainage Grids'],
    descriptionBlocks: [
      {
        id: 'db6_1',
        title: 'Zero Drill Quick Wall Mounting',
        badge: 'No Wall Damage',
        text: 'Heavy-duty adhesive suction pad holds firmly onto tiles and smooth walls without screws, carrying up to 8kg of toiletries.',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: false,
  },
  {
    id: 'p7',
    name: 'Non-Stick Frying Pan (24cm)',
    category: 'kitchen',
    subcategory: 'cookware',
    price: 549,
    originalPrice: 999,
    discountPercentage: 45,
    rating: 4.5,
    reviewCount: 140,
    image: 'https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 12,
    description: '3-layer granite granite non-stick coating frying pan compatible with gas and induction stovetops. Cool-touch heat-resistant bakelite handle.',
    features: ['PFOA Free German Coating', 'Even Heat Distribution', 'Induction & Gas Friendly', 'Easy Sponge Clean'],
    descriptionBlocks: [
      {
        id: 'db7_1',
        title: 'Effortless Oil-Free Cooking',
        badge: 'Granite Non-Stick',
        text: 'Multi-layered granite non-stick surface allows crispy dosas, fluffy omelettes, and stir-fries with minimal butter or oil.',
        image: 'https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: false,
    isDealOfDay: true,
  },
  {
    id: 'p8',
    name: 'Stainless Steel Insulated Water Bottle (750ml)',
    category: 'travel-outdoors',
    subcategory: 'bottles',
    price: 499,
    originalPrice: 899,
    discountPercentage: 44,
    rating: 4.8,
    reviewCount: 260,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 35,
    description: 'Double-walled vacuum insulated thermal flask with carrying strap. Keeps beverages ice cold for 24 hours and steaming hot for 12 hours.',
    features: ['Food Grade 304 Steel', '100% Leak-proof Cap', 'Sweat Free Body', 'Ergonomic Strap'],
    descriptionBlocks: [
      {
        id: 'db8_1',
        title: '24-Hour Ice Cold Temperature Lock',
        badge: 'Vacuum Insulated',
        text: 'Advanced double-wall vacuum barrier preserves icy refreshment through scorching heat and warm comfort on cold mornings.',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: true,
  },
  {
    id: 'p9',
    name: 'Airtight Kitchen Container Set (Set of 4)',
    category: 'kitchen',
    subcategory: 'storage',
    price: 649,
    originalPrice: 1099,
    discountPercentage: 41,
    rating: 4.6,
    reviewCount: 190,
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 20,
    description: 'Modular pantry food storage containers with silicone seal ring locking flip clips for cereal, flour, pulses, and dry snacks.',
    features: ['100% Airtight & Leakproof', 'Space Saving Modular', 'Dishwasher Safe', 'BPA Free Food Safe'],
    descriptionBlocks: [
      {
        id: 'db9_1',
        title: 'Locking Silicone Ring Freshness',
        badge: 'Air & Moisture Proof',
        text: '4-side latching lids with silicone gaskets seal out humid air and pests to keep dry staples crisp for months.',
        image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isBestSeller: false,
  },
  {
    id: 'p10',
    name: 'Foldable Laundry Hamper Basket',
    category: 'laundry',
    subcategory: 'baskets',
    price: 399,
    originalPrice: 699,
    discountPercentage: 43,
    rating: 4.3,
    reviewCount: 110,
    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 28,
    description: 'Ventilated breathable durable plastic laundry basket with soft grip handles for easy carrying and space-efficient storing.',
    features: ['Collapsible Frame', 'Reinforced Bottom', 'Moisture Resistant', 'Modern Pastel Tone'],
    descriptionBlocks: [
      {
        id: 'db10_1',
        title: 'Folds Flat in Seconds',
        badge: 'Space Saver',
        text: 'Collapses to a slender 2-inch profile to slip neatly behind washing machines or between closets when empty.',
        image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: false,
  },
  {
    id: 'p11',
    name: 'Nordic Minimalist Ceramic Donut Vase',
    category: 'home',
    subcategory: 'decor',
    price: 599,
    originalPrice: 1199,
    discountPercentage: 50,
    rating: 4.8,
    reviewCount: 245,
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 32,
    description: 'Handcrafted matte finish hollow ceramic donut vase. Elevates center tables, study desks, consoles, and modern living room shelves with minimal aesthetics.',
    features: ['Matte Textured Ceramic', 'Waterproof Inner Glaze', 'Anti-Scratch Bottom Pads', 'Boho Minimal Aesthetic'],
    descriptionBlocks: [
      {
        id: 'db11_1',
        title: 'Timeless Scandinavian Aesthetic',
        badge: 'Artisan Craft',
        text: 'The iconic hollow ring design blends effortlessly with pampas grass, dried flowers, or fresh blooms to create an instant focal point.',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80'
      },
      {
        id: 'db11_2',
        title: 'Hand-Molded Ceramic Texture',
        badge: 'Premium Finish',
        text: 'Kiln-fired at 1200°C for exceptional durability with a soothing chalky matte exterior that never fades or stains.',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: true,
    isBestSeller: true,
  },
  {
    id: 'p12',
    name: 'Boho Macrame Woven Wall Hanging Decor',
    category: 'home',
    subcategory: 'decor',
    price: 499,
    originalPrice: 899,
    discountPercentage: 44,
    rating: 4.7,
    reviewCount: 168,
    image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 24,
    description: '100% natural pure cotton hand-knotted macrame tapestry with wooden dowel. Adds cozy bohemian charm and elegance to bedroom walls, study, or living room.',
    features: ['Natural Cotton Yarn', 'Sturdy Wooden Rod', 'Eco-Friendly Craft', 'Easy Wall Mounting'],
    descriptionBlocks: [
      {
        id: 'db12_1',
        title: 'Handwoven Artisanal Warmth',
        badge: '100% Pure Cotton',
        text: 'Intricately hand-tied geometric tassels add tactile texture and warm, inviting atmosphere above bed headboards or gallery walls.',
        image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: true,
  },
  {
    id: 'p13',
    name: 'Geometric Concrete Desktop Planter & Tray',
    category: 'home',
    subcategory: 'decor',
    price: 379,
    originalPrice: 699,
    discountPercentage: 45,
    rating: 4.6,
    reviewCount: 112,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 45,
    description: 'Sleek geometric minimalist cement succulent pot with matching drainage coaster tray. Ideal for indoor succulents, desk plants, and air purifiers.',
    features: ['Drainage Hole with Mesh', 'Smooth Finish Concrete', 'Includes Spill Tray', 'Compact Desk Size'],
    descriptionBlocks: [
      {
        id: 'db13_1',
        title: 'Built-in Drainage & Spill Protection',
        badge: 'Plant Health',
        text: 'Features a base drainage port and snug concrete coaster to keep your workstation clean while preventing root rot.',
        image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&auto=format&fit=crop&q=80'
      }
    ],
  },
  {
    id: 'p14',
    name: 'Ultra-Soft Memory Foam Anti-Slip Bath Mat',
    category: 'home',
    subcategory: 'mats',
    price: 399,
    originalPrice: 799,
    discountPercentage: 50,
    rating: 4.9,
    reviewCount: 380,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 50,
    description: 'Thick memory foam bathroom floor mat with micro-velvet touch and heavy-duty PVC anti-skid rubber backing. Instantly absorbs dripping water.',
    features: ['High-Density Foam Cushion', 'Anti-Slip Gripper Backing', 'Fast Water Absorption', 'Machine Wash Safe'],
    descriptionBlocks: [
      {
        id: 'db14_1',
        title: 'Cloud-Like Step Comfort',
        badge: '15mm Thick Memory Foam',
        text: 'Relieves foot pressure after warm showers while ultra-absorbent microfiber top dries soles in seconds.',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isBestSeller: true,
    isDealOfDay: true,
  },
  {
    id: 'p15',
    name: 'Anti-Skid Boho Kitchen Runner Floor Mat (120x45cm)',
    category: 'home',
    subcategory: 'mats',
    price: 649,
    originalPrice: 1299,
    discountPercentage: 50,
    rating: 4.7,
    reviewCount: 194,
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 28,
    description: 'Long printed floor runner mat with cushioned rebound support for kitchen counter standing, hallway corridors, or bed sides.',
    features: ['Oil & Stain Resistant', 'Cushioned Foot Relief', 'Non-Slip Textured Backing', 'Wipe Clean Surface'],
    descriptionBlocks: [
      {
        id: 'db15_1',
        title: 'Anti-Fatigue Standing Support',
        badge: 'Ergonomic Cushion',
        text: 'Cushioned core takes the strain off joints and lower back during long meal prep sessions, while waterproof surface wipes clean easily.',
        image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: true,
  },
  {
    id: 'p16',
    name: 'Natural Coconut Coir Welcome Door Mat',
    category: 'home',
    subcategory: 'mats',
    price: 349,
    originalPrice: 599,
    discountPercentage: 41,
    rating: 4.5,
    reviewCount: 142,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 60,
    description: 'Durable natural coconut fiber bristles trap dirt, mud, and dust from footwear before entering your home. Heavy rubber base prevents sliding.',
    features: ['100% Tough Natural Coir', 'Heavy-Duty Rubber Base', 'Traps Dirt & Moisture', 'Weather Resistant'],
    descriptionBlocks: [
      {
        id: 'db16_1',
        title: 'Tough Bristles Trap Mud & Dirt',
        badge: 'All-Weather Durability',
        text: 'Dense natural coir fibres scrape mud and grit off shoe treads to protect your indoor tile and hardwood floors.',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
      }
    ],
  },
  {
    id: 'p17',
    name: 'Warm White LED Fairy String Lights (10 Meters)',
    category: 'home',
    subcategory: 'lightings',
    price: 249,
    originalPrice: 499,
    discountPercentage: 50,
    rating: 4.8,
    reviewCount: 520,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 95,
    description: 'Flexible insulated copper wire with 100 warm golden micro-LED bulbs. USB powered with 8 lighting modes for curtains, bedframes, and festive vibe.',
    features: ['100 Micro LEDs (10M)', '8 Flash Modes + Dimming', 'Safe Touch Low Voltage', 'Bendable Copper Wire'],
    descriptionBlocks: [
      {
        id: 'db17_1',
        title: '8 Cozy Ambient Lighting Modes',
        badge: 'USB Plug & Play',
        text: 'Switch between gentle glow, waves, twinkle, and steady illumination using the convenient USB inline controller.',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: true,
    isBestSeller: true,
  },
  {
    id: 'p18',
    name: 'Rechargeable Motion Sensor Magnetic LED Bar',
    category: 'home',
    subcategory: 'lightings',
    price: 499,
    originalPrice: 999,
    discountPercentage: 50,
    rating: 4.7,
    reviewCount: 290,
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 38,
    description: 'Ultra-thin wireless magnetic stick-on LED strip with infrared human motion detection. Automatically lights up wardrobes, stairs, kitchen cabinets, and bedsides.',
    features: ['PIR Human Motion Sensor', 'Type-C USB Rechargeable', 'Magnetic Stick & Detach', '3 Color Temperatures'],
    descriptionBlocks: [
      {
        id: 'db18_1',
        title: 'Hands-Free Smart Motion Activation',
        badge: '120° Wide Sensor',
        text: 'Auto-activates when motion is detected within 3 meters and shuts off after 20 seconds of no movement to conserve power.',
        image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: true,
    isDealOfDay: true,
  },
  {
    id: 'p19',
    name: '16-Color Sunset Projection Mood Lamp',
    category: 'home',
    subcategory: 'lightings',
    price: 449,
    originalPrice: 899,
    discountPercentage: 50,
    rating: 4.6,
    reviewCount: 310,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 40,
    description: '180-degree rotating sunset aura projector lamp with wireless remote control, 16 vivid RGB gradient colors, and dynamic halo projection effects for photos and cozy bedrooms.',
    features: ['16 RGB Colors + Remote', '180° Rotatable Head', 'High-Definition HD Lens', 'USB Plug & Play'],
    descriptionBlocks: [
      {
        id: 'db19_1',
        title: 'Create Golden Hour Magic Anywhere',
        badge: '16 RGB Colors',
        text: 'Turn blank walls into dreamy sunset backdrops with remote-controlled color blends and dimmable warmth.',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: true,
  },
  {
    id: 'p20',
    name: 'Touch Sensor Dimmable Bedside Lamp',
    category: 'home',
    subcategory: 'lightings',
    price: 899,
    originalPrice: 1599,
    discountPercentage: 43,
    rating: 4.7,
    reviewCount: 175,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 20,
    description: 'Modern minimalist touch control cylindrical nightstand lamp with stepless dimming and soothing ambient warm-to-cool glow.',
    features: ['Smart Touch Base', 'Stepless Smooth Dimming', 'Eye-Care Flicker-Free', 'Built-in USB Charging Port'],
    descriptionBlocks: [
      {
        id: 'db20_1',
        title: 'Flicker-Free Eye-Comfort Glow',
        badge: 'Stepless Dimming',
        text: 'Tap anywhere on the metal base to toggle on/off or hold to smoothly dial brightness from midnight reading level to cozy ambient room glow.',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80'
      }
    ],
  },
  {
    id: 'p21',
    name: '360° Rotating Lazy Susan Spice Rack',
    category: 'kitchen',
    subcategory: 'organizers',
    price: 429,
    originalPrice: 799,
    discountPercentage: 46,
    rating: 4.7,
    reviewCount: 220,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 34,
    description: 'Smooth ball-bearing turntable organizer for kitchen cabinets, condiment bottles, makeup vanity, and pantry corners.',
    features: ['360° Smooth Rotation', 'Anti-Slip Base Pad', 'Raised Safety Rim', 'Heavy Duty BPA-Free Plastic'],
    descriptionBlocks: [
      {
        id: 'db21_1',
        title: 'Effortless Corner & Cabinet Access',
        badge: 'Smooth Gliding Bearings',
        text: 'Never knock over tall bottles again—spin seamlessly to reach spices, sauces, or skincare products with one fingertip.',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'
      }
    ],
  },
  {
    id: 'p22',
    name: 'Wall-Mount Broom & Mop Gripper Holder',
    category: 'cleaning',
    subcategory: 'brushes',
    price: 249,
    originalPrice: 499,
    discountPercentage: 50,
    rating: 4.6,
    reviewCount: 180,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 65,
    description: 'Self-adhesive heavy duty stainless steel spring clamp organizer with utility hooks for mops, brooms, wipers, and umbrella storage.',
    features: ['No Drill Strong Adhesive', 'Holds Up to 10kg', 'Silicon Roller Grip', 'Extra Utility Hooks'],
    descriptionBlocks: [
      {
        id: 'db22_1',
        title: 'Auto-Lock Spring Grip',
        badge: 'Holds Up to 10kg',
        text: 'Heavy duty rubber petals clamp onto mop and broom handles of any thickness and hold them firmly off wet floors.',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80'
      }
    ],
  },
  {
    id: 'p23',
    name: 'Sonic Electric Rechargeable Toothbrush',
    category: 'personal-care',
    subcategory: 'dental',
    price: 899,
    originalPrice: 1799,
    discountPercentage: 50,
    rating: 4.7,
    reviewCount: 195,
    image: 'https://images.unsplash.com/photo-1559591937-e1032b4b4e54?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1559591937-e1032b4b4e54?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 26,
    description: '40,000 VPM acoustic sonic motor with 5 smart cleaning modes, 2-minute smart timer, and 4 dupont replacement brush heads.',
    features: ['40,000 Micro-Brushes/min', '4 Dupont Refill Heads', '30 Days Single Charge', 'IPX7 Fully Waterproof'],
    descriptionBlocks: [
      {
        id: 'db23_1',
        title: 'Dental-Grade Plaque Removal',
        badge: '40,000 Vibrations/Min',
        text: 'Sonic vibrations drive fluid deep between teeth and gum lines, removing 7x more plaque than conventional manual brushing.',
        image: 'https://images.unsplash.com/photo-1559591937-e1032b4b4e54?w=800&auto=format&fit=crop&q=80'
      }
    ],
  },
  {
    id: 'p24',
    name: 'Foldable Wardrobe Clothes Organizer (Pack of 3)',
    category: 'home-storage',
    subcategory: 'closet',
    price: 549,
    originalPrice: 999,
    discountPercentage: 45,
    rating: 4.5,
    reviewCount: 215,
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 40,
    description: 'Reinforced steel frame non-woven fabric closet organizers with clear viewing window and dual zipper lids for sarees, shirts, and jeans.',
    features: ['Sturdy Steel Internal Frame', 'Clear Front View Window', 'Double Smooth Zippers', 'Folds Flat When Not in Use'],
    descriptionBlocks: [
      {
        id: 'db24_1',
        title: 'Clear Window & Heavy Steel Frame',
        badge: 'Stackable Durability',
        text: 'Stack multiple boxes effortlessly without collapsing. Transparent front window lets you find stored clothes without unzipping.',
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&auto=format&fit=crop&q=80'
      }
    ],
  },
  // NEW TEST PRODUCTS FOR COMPREHENSIVE SUB-CATEGORY TESTING
  {
    id: 'p25',
    name: 'Geometric Ceramic Bookshelf Figurine Set',
    category: 'home',
    subcategory: 'decor',
    price: 699,
    originalPrice: 1299,
    discountPercentage: 46,
    rating: 4.8,
    reviewCount: 92,
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 22,
    description: 'Pair of contemporary matte porcelain abstract figurines. Crafted for minimalist mantelpieces, TV consoles, and modern bookshelves.',
    features: ['Matte Glazed Porcelain', 'Weighted Anti-Tip Base', 'Velvet Padded Feet', 'Modern Abstract Form'],
    descriptionBlocks: [
      {
        id: 'db25_1',
        title: 'Modern Architectural Silhouette',
        badge: 'Nordic Art',
        text: 'Distinct sculpted curves create captivating light and shadow play across any coffee table, bookshelf, or sideboard.',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: true,
  },
  {
    id: 'p26',
    name: 'Extra-Thick Cushioned Anti-Fatigue Kitchen Mat',
    category: 'home',
    subcategory: 'mats',
    price: 799,
    originalPrice: 1599,
    discountPercentage: 50,
    rating: 4.9,
    reviewCount: 310,
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 30,
    description: '20mm high-rebound ergonomic PVC foam floor runner. Specifically engineered to relieve foot, knee, and spine strain during dishwashing and cooking.',
    features: ['20mm Thick High-Density PVC', 'Beveled Anti-Trip Edges', 'Water & Oil Proof Top', 'Diamond Texture Grip Base'],
    descriptionBlocks: [
      {
        id: 'db26_1',
        title: 'Therapeutic Joint & Spine Cushioning',
        badge: '20mm Rebound Foam',
        text: 'Absorbs body shock while standing at kitchen sinks or standing desks, promoting healthy posture and all-day comfort.',
        image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isBestSeller: true,
  },
  {
    id: 'p27',
    name: 'Smart RGB Ambient Light Bar with Music Sync',
    category: 'home',
    subcategory: 'lightings',
    price: 999,
    originalPrice: 1999,
    discountPercentage: 50,
    rating: 4.8,
    reviewCount: 280,
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 25,
    description: 'Dynamic sound-reactive RGB LED desktop light bar with 32-bit ARM processor, high-sensitivity microphone, and 18 dynamic music spectrum modes.',
    features: ['Sound & Music Reactive', '32 Independent LED Beads', 'USB-C Fast Powered', 'App & Button Control'],
    descriptionBlocks: [
      {
        id: 'db27_1',
        title: 'Audio-Visual Sound Rhythm Sync',
        badge: '32-Bit ARM Tech',
        text: 'Picks up ambient music and game sound effects with zero latency, lighting up your gaming battlestation or movie setup.',
        image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: true,
    isDealOfDay: true,
  },
  {
    id: 'p28',
    name: '12-in-1 Multi-Blade Vegetable Slicer & Mandoline',
    category: 'kitchen',
    subcategory: 'tools',
    price: 649,
    originalPrice: 1299,
    discountPercentage: 50,
    rating: 4.7,
    reviewCount: 410,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 50,
    description: 'Heavy duty vegetable chopper with catch container, safety finger guard, drain basket, and 12 interchangeable razor sharp 430 stainless blades.',
    features: ['12 Interchangeable Blades', 'Large Catch Basin with Drain', 'Safety Hand Guard Included', 'Dishwasher Friendly'],
    descriptionBlocks: [
      {
        id: 'db28_1',
        title: 'Dice, Shred & Julienne in 1 Press',
        badge: '430 Stainless Blades',
        text: 'Chop onions, potatoes, tomatoes, and greens in seconds with consistent chef-quality slices and zero tears.',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isBestSeller: true,
  },
  {
    id: 'p29',
    name: 'Oil Dispenser Bottle with Silicone Basting Brush',
    category: 'kitchen',
    subcategory: 'tools',
    price: 299,
    originalPrice: 599,
    discountPercentage: 50,
    rating: 4.6,
    reviewCount: 165,
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 60,
    description: 'Heat-resistant borosilicate glass oil dropper bottle with measurement scale and high-temperature silicone basting brush for BBQ, air fryers, and pans.',
    features: ['Controlled Squeeze Dropper', 'Heat-Resistant Silicone Brush', 'Graduated Scale Window', 'Anti-Drip Return Channel'],
    descriptionBlocks: [
      {
        id: 'db29_1',
        title: 'Precision Squeeze & Brush Control',
        badge: 'Save 70% Oil',
        text: 'Squeeze the dropper top to draw exact oil quantity, then brush directly onto pans or grills for healthy low-calorie cooking.',
        image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80'
      }
    ],
  },
  {
    id: 'p30',
    name: 'Airtight Stackable Food Storage Containers (Set of 6)',
    category: 'kitchen',
    subcategory: 'storage',
    price: 899,
    originalPrice: 1799,
    discountPercentage: 50,
    rating: 4.8,
    reviewCount: 230,
    image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 35,
    description: 'Complete pantry storage canister set with 6 different sizes, chalkboard label stickers, marker, and airtight easy-snap lids.',
    features: ['6 Modular Sizes', '100% Leak-Proof Lock', 'Bonus Labels & Chalk Pen', 'Stackable Space-Saver Design'],
    descriptionBlocks: [
      {
        id: 'db30_1',
        title: 'Modular Pantry Transformation',
        badge: 'Crystal Clear Tritan',
        text: 'Uniform stackable containers make pantry shelves look clean, organized, and effortlessly accessible.',
        image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: true,
  },
  {
    id: 'p31',
    name: 'Triangular Wall & Ceiling Microfiber Cleaning Mop',
    category: 'cleaning',
    subcategory: 'mops',
    price: 499,
    originalPrice: 999,
    discountPercentage: 50,
    rating: 4.7,
    reviewCount: 145,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 40,
    description: '360° rotatable triangle cleaning mop with 2-meter extendable handle for reaching high ceilings, fans, corners, tiles, and glass windows.',
    features: ['360° Rotatable Triangle Head', '2-Meter Telescopic Rod', '2 Chenille & Microfiber Pads', 'Automatic Squeeze Wringing'],
    descriptionBlocks: [
      {
        id: 'db31_1',
        title: 'Reach Ceilings, Fans & Corners Easily',
        badge: '2-Meter Reach',
        text: 'No ladders needed! Clean cobwebs, fan blades, high window panes, and wall corners with the agile 360° pivoting head.',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80'
      }
    ],
  },
  {
    id: 'p32',
    name: 'Ultrasonic Facial Cleansing Brush & Massager',
    category: 'personal-care',
    subcategory: 'skincare',
    price: 699,
    originalPrice: 1399,
    discountPercentage: 50,
    rating: 4.8,
    reviewCount: 190,
    image: 'https://images.unsplash.com/photo-1559591937-e1032b4b4e54?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1559591937-e1032b4b4e54?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 28,
    description: 'Medical-grade ultra-soft silicone electric facial cleanser with sonic pulsations, 5 speed levels, and heated anti-aging massage back.',
    features: ['Medical Grade Silicone', '6,000 Sonic Pulses/min', 'IPX7 Shower Proof', 'Magnetic Wireless Charging'],
    descriptionBlocks: [
      {
        id: 'db32_1',
        title: 'Deep Pore Purification & Glow',
        badge: 'Sonic Cleanse',
        text: 'Gentle silicone touchpoints unclog 99.5% of dirt, oil, and makeup residue without damaging skin barrier.',
        image: 'https://images.unsplash.com/photo-1559591937-e1032b4b4e54?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: true,
  },
  {
    id: 'p33',
    name: '1 Litre Motivational Time-Marker Water Bottle',
    category: 'travel-outdoors',
    subcategory: 'bottles',
    price: 349,
    originalPrice: 699,
    discountPercentage: 50,
    rating: 4.8,
    reviewCount: 540,
    image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 80,
    description: 'BPA-free Tritan frosted gradient water bottle with hourly hydration reminders, pop-up silicone straw, and secure one-click safety lock.',
    features: ['Hourly Time Markers', 'Pop-Up One-Click Straw', '100% Leakproof Safety Lock', 'Ergonomic Carry Handle'],
    descriptionBlocks: [
      {
        id: 'db33_1',
        title: 'Stay Hydrated All Day with Time Markers',
        badge: 'Daily Hydration Goal',
        text: 'Hourly motivational prompts keep your water intake on track for workouts, office days, and outdoor travel.',
        image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isBestSeller: true,
    isDealOfDay: true,
  },
  {
    id: 'p34',
    name: 'Expandable Waterproof Travel Duffel with Shoe Pouch',
    category: 'travel-outdoors',
    subcategory: 'bags',
    price: 799,
    originalPrice: 1599,
    discountPercentage: 50,
    rating: 4.7,
    reviewCount: 160,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 30,
    description: 'High-density Oxford waterproof carry-on travel bag with separate wet/dry pocket, independent shoe compartment, and luggage trolley strap.',
    features: ['Independent Shoe Compartment', 'Wet/Dry Separation Pocket', 'Trolley Sleeve Attachment', 'Expandable Bottom Zipper'],
    descriptionBlocks: [
      {
        id: 'db34_1',
        title: 'Smart Wet/Dry & Shoe Separation',
        badge: 'Luggage Sleeve',
        text: 'Keep clean clothes separate from gym gear, wet towels, and shoes with dedicated waterproof interior lining.',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: true,
  },
  {
    id: 'p35',
    name: '3-in-1 Foldable Magnetic Fast Wireless Charging Stand',
    category: 'offers',
    subcategory: 'flash-deals',
    price: 1199,
    originalPrice: 2499,
    discountPercentage: 52,
    rating: 4.9,
    reviewCount: 340,
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 20,
    description: 'Simultaneously fast-charges smartphone, smartwatch, and wireless earbuds on one compact foldable magnetic desk stand.',
    features: ['15W Fast Qi Magnetic Charging', 'Folds Flat to Pocket Size', 'Anti-Slip Weighted Base', 'Overcharge Heat Protection'],
    descriptionBlocks: [
      {
        id: 'db35_1',
        title: '1 Stand for All Your Daily Devices',
        badge: '15W Fast Charge',
        text: 'Declutter your nightstand and charge your phone, watch, and earbuds simultaneously with a single Type-C cable.',
        image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isTrending: true,
    isDealOfDay: true,
  },
  {
    id: 'p36',
    name: 'Luxury Fluffy Shaggy Floor Rug (150x90cm)',
    category: 'home',
    subcategory: 'mats',
    price: 899,
    originalPrice: 1799,
    discountPercentage: 50,
    rating: 4.8,
    reviewCount: 180,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 22,
    description: 'Plush high-pile microfiber faux fur living room area rug with non-slip silicone bottom. Adds heavenly softness and luxury aesthetic under coffee tables and beds.',
    features: ['4cm High-Pile Shaggy Fur', 'Non-Slip Grip Dot Bottom', 'Lint-Free Hypoallergenic', 'Machine Washable on Gentle'],
    descriptionBlocks: [
      {
        id: 'db36_1',
        title: 'Super Soft 4cm High-Pile Plushness',
        badge: 'Faux Fur Luxury',
        text: 'Sink your feet into velvet-soft microfiber pile that insulates cold floors and elevates your living room or bedroom decor.',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80'
      }
    ],
    isBestSeller: true,
  }
];

export const INITIAL_USER: UserProfile = {
  id: '',
  name: 'Shopper',
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
  }
];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_STORIES: ProductStory[] = [
  {
    id: 's1',
    productId: 'p1',
    productName: 'Mini Washing Machine',
    title: 'Mini Washer',
    subtitle: 'Ultrasonic Turbo Spin Wash',
    tag: '10s Demo',
    media: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1000&auto=format&fit=crop&q=80',
    type: 'image',
    price: 1499,
    originalPrice: 2999,
    discount: '50% OFF',
    accentColor: '#F95721',
    bgGradient: 'from-orange-600 via-orange-950 to-black',
    enabled: true,
    order: 1,
  },
  {
    id: 's2',
    productId: 'p4',
    productName: 'Cordless Precision Trimmer',
    title: 'Precision Trimmer',
    subtitle: 'Zero Cut Titanium Blade',
    tag: 'Grooming',
    media: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=1000&auto=format&fit=crop&q=80',
    type: 'image',
    price: 799,
    originalPrice: 1499,
    discount: '47% OFF',
    accentColor: '#D97706',
    bgGradient: 'from-amber-600 via-amber-950 to-black',
    enabled: true,
    order: 2,
  },
  {
    id: 's3',
    productId: 'p3',
    productName: 'Portable Food Packet Sealer',
    title: 'Mini Sealer',
    subtitle: '2-in-1 Seal & Cut Airtight',
    tag: 'Snack Hack',
    media: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=1000&auto=format&fit=crop&q=80',
    type: 'image',
    price: 199,
    originalPrice: 499,
    discount: '60% OFF',
    accentColor: '#10B981',
    bgGradient: 'from-emerald-600 via-emerald-950 to-black',
    enabled: true,
    order: 3,
  },
  {
    id: 's4',
    productId: 'p2',
    productName: 'Romantic Sunset Projection Lamp',
    title: 'Sunset Lamp',
    subtitle: 'Golden Hour 16 Color Vibes',
    tag: 'Room Aesthetic',
    media: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1000&auto=format&fit=crop&q=80',
    type: 'image',
    price: 399,
    originalPrice: 799,
    discount: '50% OFF',
    accentColor: '#8B5CF6',
    bgGradient: 'from-purple-600 via-purple-950 to-black',
    enabled: true,
    order: 4,
  },
  {
    id: 's5',
    productId: 'p7',
    productName: 'Granite Non-Stick Frying Pan',
    title: 'Granite Pan',
    subtitle: '0% Oil Healthy Cooking',
    tag: 'Kitchen Star',
    media: 'https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?w=1000&auto=format&fit=crop&q=80',
    type: 'image',
    price: 549,
    originalPrice: 1099,
    discount: '50% OFF',
    accentColor: '#EC4899',
    bgGradient: 'from-pink-600 via-rose-950 to-black',
    enabled: true,
    order: 5,
  },
  {
    id: 's6',
    productId: 'p4',
    productName: '360 Spin Mop with Bucket',
    title: 'Spin Mop',
    subtitle: 'Hands-Free 360 Spin Wringer',
    tag: 'Deep Clean',
    media: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1000&auto=format&fit=crop&q=80',
    type: 'image',
    price: 799,
    originalPrice: 1499,
    discount: '47% OFF',
    accentColor: '#3B82F6',
    bgGradient: 'from-blue-600 via-blue-950 to-black',
    enabled: true,
    order: 6,
  }
];

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
  enabled: true,
  title: 'Deals of the Day',
  badgeText: 'LIVE FLASH SALE',
  discountText: 'Up to 55% Off',
  productId: 'p3',
  productName: 'Portable Food Packet Sealer',
  dealPrice: 199,
  originalPrice: 499,
  productImage: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop&q=80',
  hoursRemaining: 5,
};

