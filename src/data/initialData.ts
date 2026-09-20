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
    image: '/categories/cleaning-products--chemicals.png',
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
    image: '/categories/bathroom--laundry.png',
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
    image: '/categories/bucket-and-plastics.png',
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
    image: '/categories/cleaning-tools.png',
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
    image: '/categories/kitchen-utility.png',
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
    image: '/categories/personal-care--grooming.png',
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
    image: '/categories/small-appliances--gadgets.png',
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
    image: '/categories/hardware--utility.png',
    bgColor: '#F1F5F9',
    accentColor: '#475569',
    itemCount: 0,
    showOnHome: true,
    subcategories: []
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    "id": "p_1789888588352",
    "name": "Kleen clean glass cleaner ",
    "category": "cleaning-products--chemicals",
    "price": 60,
    "originalPrice": 75,
    "discountPercentage": 20,
    "rating": 4.8,
    "reviewCount": 1,
    "image": "products/images/1789888566670-103294.png",
    "images": [
      "products/images/1789888566670-103294.png",
      "products/images/1789888569053-103295.png"
    ],
    "videos": [],
    "inStock": true,
    "stockCount": 9,
    "description": "Everyday home essential from SBS Store.",
    "descriptionBlocks": [],
    "features": [
      "Material: Virgin Plastic / Stainless Steel",
      "Color: Pastel Slate",
      "Warranty: 6 Months Replacement"
    ],
    "isTrending": false,
    "isBestSeller": false,
    "isDealOfDay": false,
    "isFeatured": false,
    "isSuperDeal": false,
    "isTopRated": false,
    "subtitle": "STREAK FREE SHINE",
    "specifications": [
      {
        "label": "Brand",
        "value": "SBS Certified"
      },
      {
        "label": "Category",
        "value": "bathroom--laundry"
      },
      {
        "label": "Subcategory",
        "value": "General"
      },
      {
        "label": "Condition",
        "value": "Brand New (100% Sealed)"
      }
    ]
  },
  {
    "id": "p_1789888719431",
    "name": "Kleen fresh  floor cleaner lemon 1000ml",
    "category": "cleaning-products--chemicals",
    "price": 120,
    "originalPrice": 179,
    "discountPercentage": 33,
    "rating": 4.8,
    "reviewCount": 1,
    "image": "products/images/1789888674538-103296.png",
    "images": [
      "products/images/1789888674538-103296.png",
      "products/images/1789888676847-103297.png"
    ],
    "videos": [],
    "inStock": true,
    "stockCount": 10,
    "description": "Everyday home essential from SBS Store.",
    "descriptionBlocks": [],
    "features": [
      "1000ml",
      "Capacity: 1000ml"
    ],
    "isTrending": false,
    "isBestSeller": false,
    "isDealOfDay": false,
    "isFeatured": false,
    "isSuperDeal": false,
    "isTopRated": false,
    "subtitle": "Long lasting fregrunce ",
    "featureIcons": [
      {
        "icon": "🌿",
        "label": "Lemon 🍋"
      }
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "SBS Certified"
      },
      {
        "label": "Category",
        "value": "bathroom--laundry"
      },
      {
        "label": "Subcategory",
        "value": "General"
      },
      {
        "label": "Condition",
        "value": "Brand New (100% Sealed)"
      },
      {
        "label": "Country of Origin",
        "value": "India"
      }
    ]
  },
  {
    "id": "p_1789889604412",
    "name": "Kleen fresh bathroom cleaner ",
    "category": "cleaning-products--chemicals",
    "price": 70,
    "originalPrice": 95,
    "discountPercentage": 26,
    "rating": 4.8,
    "reviewCount": 1,
    "image": "products/images/1789889134846-103302.png",
    "images": [
      "products/images/1789889134846-103302.png",
      "products/images/1789889137696-103303.png"
    ],
    "videos": [],
    "inStock": true,
    "stockCount": 10,
    "description": "Everyday home essential from SBS Store.",
    "descriptionBlocks": [],
    "features": [
      "Material: Virgin Plastic / Stainless Steel",
      "Color: Pastel Slate",
      "Warranty: 6 Months Replacement"
    ],
    "isTrending": false,
    "isBestSeller": false,
    "isDealOfDay": false,
    "isFeatured": false,
    "isSuperDeal": false,
    "isTopRated": false,
    "subtitle": "Removes hard water stains ",
    "specifications": [
      {
        "label": "Brand",
        "value": "SBS Certified"
      },
      {
        "label": "Category",
        "value": "bathroom--laundry"
      },
      {
        "label": "Subcategory",
        "value": "General"
      },
      {
        "label": "Condition",
        "value": "Brand New (100% Sealed)"
      }
    ]
  },
  {
    "id": "p_1789888261467",
    "name": "Kleen fresh liquid soap ( ayu mix )",
    "category": "cleaning-products--chemicals",
    "subcategory": "liquid-soap",
    "price": 99,
    "originalPrice": 150,
    "discountPercentage": 34,
    "rating": 4.8,
    "reviewCount": 1,
    "image": "products/images/1789888251001-103290.png",
    "images": [
      "products/images/1789888251001-103290.png",
      "products/images/1789888253453-103291.png"
    ],
    "videos": [],
    "inStock": true,
    "stockCount": 10,
    "description": "Everyday home essential from SBS Store.",
    "descriptionBlocks": [],
    "features": [
      "Material: Virgin Plastic / Stainless Steel",
      "Color: Pastel Slate",
      "Warranty: 6 Months Replacement"
    ],
    "isTrending": false,
    "isBestSeller": false,
    "isDealOfDay": false,
    "isFeatured": false,
    "isSuperDeal": false,
    "isTopRated": false,
    "subtitle": "Clean and gentle ",
    "specifications": [
      {
        "label": "Brand",
        "value": "SBS Certified"
      },
      {
        "label": "Category",
        "value": "bathroom--laundry"
      },
      {
        "label": "Subcategory",
        "value": "General"
      },
      {
        "label": "Condition",
        "value": "Brand New (100% Sealed)"
      }
    ]
  },
  {
    "id": "p_1789888149765",
    "name": "Kleen fresh liquid soap ( lemon )",
    "category": "cleaning-products--chemicals",
    "price": 99,
    "originalPrice": 150,
    "discountPercentage": 34,
    "rating": 4.8,
    "reviewCount": 1,
    "image": "products/images/1789888128526-103274.png",
    "images": [
      "products/images/1789888128526-103274.png",
      "products/images/1789888130834-103275.png"
    ],
    "videos": [],
    "inStock": true,
    "stockCount": 10,
    "description": "Everyday home essential from SBS Store.",
    "descriptionBlocks": [],
    "features": [
      "Material: Virgin Plastic / Stainless Steel",
      "Color: Pastel Slate",
      "Warranty: 6 Months Replacement"
    ],
    "isTrending": false,
    "isBestSeller": false,
    "isDealOfDay": false,
    "isFeatured": false,
    "isSuperDeal": false,
    "isTopRated": false,
    "subtitle": "Clean and gentle ",
    "specifications": [
      {
        "label": "Brand",
        "value": "SBS Certified"
      },
      {
        "label": "Category",
        "value": "bathroom--laundry"
      },
      {
        "label": "Subcategory",
        "value": "General"
      },
      {
        "label": "Condition",
        "value": "Brand New (100% Sealed)"
      }
    ]
  },
  {
    "id": "p_1789888200156",
    "name": "Kleen fresh liquid soap ( rose )",
    "category": "cleaning-products--chemicals",
    "price": 99,
    "originalPrice": 150,
    "discountPercentage": 34,
    "rating": 4.8,
    "reviewCount": 1,
    "image": "products/images/1789888189327-103288.png",
    "images": [
      "products/images/1789888189327-103288.png",
      "products/images/1789888191632-103289.png"
    ],
    "videos": [],
    "inStock": true,
    "stockCount": 10,
    "description": "Everyday home essential from SBS Store.",
    "descriptionBlocks": [],
    "features": [
      "Material: Virgin Plastic / Stainless Steel",
      "Color: Pastel Slate",
      "Warranty: 6 Months Replacement"
    ],
    "isTrending": false,
    "isBestSeller": false,
    "isDealOfDay": false,
    "isFeatured": false,
    "isSuperDeal": false,
    "isTopRated": false,
    "subtitle": "Clean and gentle ",
    "specifications": [
      {
        "label": "Brand",
        "value": "SBS Certified"
      },
      {
        "label": "Category",
        "value": "bathroom--laundry"
      },
      {
        "label": "Subcategory",
        "value": "General"
      },
      {
        "label": "Condition",
        "value": "Brand New (100% Sealed)"
      }
    ]
  },
  {
    "id": "p_1789888078167",
    "name": "Kleen fresh liquid soap ( sandal )",
    "category": "cleaning-products--chemicals",
    "price": 99,
    "originalPrice": 150,
    "discountPercentage": 34,
    "rating": 4.8,
    "reviewCount": 1,
    "image": "products/images/1789888020237-103251.png",
    "images": [
      "products/images/1789888020237-103251.png",
      "products/images/1789888031028-103264.png"
    ],
    "videos": [],
    "inStock": true,
    "stockCount": 10,
    "description": "Everyday home essential from SBS Store.",
    "descriptionBlocks": [],
    "features": [
      "Material: Virgin Plastic / Stainless Steel",
      "Color: Pastel Slate",
      "Warranty: 6 Months Replacement"
    ],
    "isTrending": false,
    "isBestSeller": false,
    "isDealOfDay": false,
    "isFeatured": false,
    "isSuperDeal": false,
    "isTopRated": false,
    "subtitle": "Clean and gentle ",
    "specifications": [
      {
        "label": "Brand",
        "value": "SBS Certified"
      },
      {
        "label": "Category",
        "value": "bathroom--laundry"
      },
      {
        "label": "Subcategory",
        "value": "General"
      },
      {
        "label": "Condition",
        "value": "Brand New (100% Sealed)"
      }
    ]
  },
  {
    "id": "7574877711992",
    "barcode": "7574877711992",
    "name": "Kleen FRESH tiles cleaner ",
    "category": "cleaning-products--chemicals",
    "price": 30,
    "originalPrice": 60,
    "discountPercentage": 50,
    "rating": 4.8,
    "reviewCount": 1,
    "image": "products/images/1789886596331-103203.png",
    "images": [
      "products/images/1789886596331-103203.png",
      "products/images/1789886612971-103204.png"
    ],
    "videos": [],
    "inStock": true,
    "stockCount": 10,
    "description": "Everyday home essential from SBS Store.",
    "descriptionBlocks": [],
    "features": [
      "Material: Virgin Plastic / Stainless Steel",
      "Color: Pastel Slate",
      "Warranty: 6 Months Replacement"
    ],
    "isTrending": false,
    "isBestSeller": false,
    "isDealOfDay": false,
    "isFeatured": false,
    "isSuperDeal": false,
    "isTopRated": false,
    "subtitle": "Does the hard work for you ",
    "specifications": [
      {
        "label": "Brand",
        "value": "SBS Certified"
      },
      {
        "label": "Category",
        "value": "bathroom--laundry"
      },
      {
        "label": "Subcategory",
        "value": "General"
      },
      {
        "label": "Condition",
        "value": "Brand New (100% Sealed)"
      },
      {
        "label": "Capacity / Volume",
        "value": "900ml"
      }
    ]
  },
  {
    "id": "p_1789889804391",
    "name": "Mitisha chemical floor cleaner ",
    "category": "cleaning-products--chemicals",
    "price": 100,
    "originalPrice": 120,
    "discountPercentage": 17,
    "rating": 4.8,
    "reviewCount": 1,
    "image": "products/images/1789889750197-103304.png",
    "images": [
      "products/images/1789889750197-103304.png",
      "products/images/1789889753145-103305.png"
    ],
    "videos": [],
    "inStock": true,
    "stockCount": 10,
    "description": "Everyday home essential from SBS Store.",
    "descriptionBlocks": [],
    "features": [
      "Material: Virgin Plastic / Stainless Steel",
      "Color: Pastel Slate",
      "Warranty: 6 Months Replacement"
    ],
    "isTrending": false,
    "isBestSeller": false,
    "isDealOfDay": false,
    "isFeatured": false,
    "isSuperDeal": false,
    "isTopRated": false,
    "specifications": [
      {
        "label": "Brand",
        "value": "SBS Certified"
      },
      {
        "label": "Category",
        "value": "bathroom--laundry"
      },
      {
        "label": "Subcategory",
        "value": "General"
      },
      {
        "label": "Condition",
        "value": "Brand New (100% Sealed)"
      }
    ]
  },
  {
    "id": "p_1789886381928",
    "name": "Mr. Safai toilet cleaner ",
    "category": "cleaning-products--chemicals",
    "price": 60,
    "originalPrice": 85,
    "discountPercentage": 29,
    "rating": 4.8,
    "reviewCount": 1,
    "image": "products/images/1789886351725-103163.png",
    "images": [
      "products/images/1789886351725-103163.png",
      "products/images/1789886416811-103174.png"
    ],
    "videos": [],
    "inStock": true,
    "stockCount": 10,
    "description": "Everyday home essential from SBS Store.",
    "descriptionBlocks": [],
    "features": [
      "Capacity: 500ml",
      "Material: Virgin Plastic / Stainless Steel",
      "Color: Pastel Slate",
      "Warranty: 6 Months Replacement"
    ],
    "isTrending": false,
    "isBestSeller": false,
    "isDealOfDay": false,
    "isFeatured": false,
    "isSuperDeal": false,
    "isTopRated": false,
    "subtitle": "Extra Thicker /Extra Shine",
    "specifications": [
      {
        "label": "Brand",
        "value": "SBS Certified"
      },
      {
        "label": "Category",
        "value": "bathroom--laundry"
      },
      {
        "label": "Subcategory",
        "value": "General"
      },
      {
        "label": "Condition",
        "value": "Brand New (100% Sealed)"
      },
      {
        "label": "Capacity / Volume",
        "value": "500ml"
      }
    ]
  },
  {
    "id": "p_1789888465482",
    "name": "Pramukh home care dishwash neem ",
    "category": "cleaning-products--chemicals",
    "price": 50,
    "originalPrice": 100,
    "discountPercentage": 50,
    "rating": 4.8,
    "reviewCount": 1,
    "image": "products/images/1789888416927-103292.png",
    "images": [
      "products/images/1789888416927-103292.png",
      "products/images/1789888419720-103293.png"
    ],
    "videos": [],
    "inStock": true,
    "stockCount": 10,
    "description": "Everyday home essential from SBS Store.",
    "descriptionBlocks": [],
    "features": [
      "Material: Virgin Plastic / Stainless Steel",
      "Color: Pastel Slate",
      "Warranty: 6 Months Replacement"
    ],
    "isTrending": false,
    "isBestSeller": false,
    "isDealOfDay": false,
    "isFeatured": false,
    "isSuperDeal": false,
    "isTopRated": false,
    "specifications": [
      {
        "label": "Brand",
        "value": "SBS Certified"
      },
      {
        "label": "Category",
        "value": "bathroom--laundry"
      },
      {
        "label": "Subcategory",
        "value": "General"
      },
      {
        "label": "Condition",
        "value": "Brand New (100% Sealed)"
      }
    ]
  },
  {
    "id": "p_1789889022728",
    "name": "QAX multipurpose kitchen cleaner ",
    "category": "cleaning-products--chemicals",
    "price": 160,
    "originalPrice": 260,
    "discountPercentage": 38,
    "rating": 4.8,
    "reviewCount": 1,
    "image": "products/images/1789888974617-103301.png",
    "images": [
      "products/images/1789888974617-103301.png",
      "products/images/1789888977015-103300.png"
    ],
    "videos": [],
    "inStock": true,
    "stockCount": 10,
    "description": "Everyday home essential from SBS Store.",
    "descriptionBlocks": [],
    "features": [
      "Material: Virgin Plastic / Stainless Steel",
      "Color: Pastel Slate",
      "Warranty: 6 Months Replacement"
    ],
    "isTrending": false,
    "isBestSeller": false,
    "isDealOfDay": false,
    "isFeatured": false,
    "isSuperDeal": false,
    "isTopRated": false,
    "subtitle": "Easy to use",
    "specifications": [
      {
        "label": "Brand",
        "value": "SBS Certified"
      },
      {
        "label": "Category",
        "value": "bathroom--laundry"
      },
      {
        "label": "Subcategory",
        "value": "General"
      },
      {
        "label": "Condition",
        "value": "Brand New (100% Sealed)"
      }
    ]
  },
  {
    "id": "p_1789888883432",
    "name": "Star toilet cleaner ",
    "category": "cleaning-products--chemicals",
    "price": 20,
    "originalPrice": 85,
    "discountPercentage": 76,
    "rating": 4.8,
    "reviewCount": 1,
    "image": "products/images/1789888863357-103298.png",
    "images": [
      "products/images/1789888863357-103298.png",
      "products/images/1789888866507-103299.png"
    ],
    "videos": [],
    "inStock": true,
    "stockCount": 10,
    "description": "Everyday home essential from SBS Store.",
    "descriptionBlocks": [],
    "features": [
      "Material: Virgin Plastic / Stainless Steel",
      "Color: Pastel Slate",
      "Warranty: 6 Months Replacement"
    ],
    "isTrending": false,
    "isBestSeller": false,
    "isDealOfDay": false,
    "isFeatured": false,
    "isSuperDeal": false,
    "isTopRated": false,
    "subtitle": "Clear strong ",
    "specifications": [
      {
        "label": "Brand",
        "value": "SBS Certified"
      },
      {
        "label": "Category",
        "value": "bathroom--laundry"
      },
      {
        "label": "Subcategory",
        "value": "General"
      },
      {
        "label": "Condition",
        "value": "Brand New (100% Sealed)"
      }
    ]
  },
  {
    "id": "123456789012345",
    "barcode": "123456789012345",
    "name": "Supar toilet cleaner ",
    "category": "cleaning-products--chemicals",
    "price": 90,
    "originalPrice": 160,
    "discountPercentage": 44,
    "rating": 4.8,
    "reviewCount": 1,
    "image": "products/images/1789887349389-103205.png",
    "images": [
      "products/images/1789887349389-103205.png",
      "products/images/1789887526409-103003.png"
    ],
    "videos": [],
    "inStock": true,
    "stockCount": 10,
    "description": "Everyday home essential from SBS Store.",
    "descriptionBlocks": [],
    "features": [
      "Material: Virgin Plastic / Stainless Steel",
      "Color: Pastel Slate",
      "Warranty: 6 Months Replacement"
    ],
    "isTrending": false,
    "isBestSeller": false,
    "isDealOfDay": false,
    "isFeatured": false,
    "isSuperDeal": false,
    "isTopRated": false,
    "subtitle": "Remove bad odour ",
    "specifications": [
      {
        "label": "Brand",
        "value": "SBS Certified"
      },
      {
        "label": "Category",
        "value": "bathroom--laundry"
      },
      {
        "label": "Subcategory",
        "value": "General"
      },
      {
        "label": "Condition",
        "value": "Brand New (100% Sealed)"
      }
    ]
  },
  {
    "id": "RFB1000",
    "barcode": "RFB1000",
    "name": "Swachh cleaning bleach ",
    "category": "cleaning-products--chemicals",
    "price": 30,
    "originalPrice": 30,
    "discountPercentage": 0,
    "rating": 4.8,
    "reviewCount": 1,
    "image": "products/images/1789886118658-103090.png",
    "images": [
      "products/images/1789886118658-103090.png"
    ],
    "videos": [],
    "inStock": true,
    "stockCount": 10,
    "description": "Everyday home essential from SBS Store.",
    "descriptionBlocks": [],
    "features": [
      "Capacity: 500ml",
      "Material: Virgin Plastic / Stainless Steel",
      "Color: Pastel Slate",
      "Warranty: 6 Months Replacement"
    ],
    "isTrending": false,
    "isBestSeller": false,
    "isDealOfDay": false,
    "isFeatured": false,
    "isSuperDeal": false,
    "isTopRated": false,
    "subtitle": "FOR WHITE COTTONS AND TERRY COTES CLOTHS",
    "specifications": [
      {
        "label": "Brand",
        "value": "SBS Certified"
      },
      {
        "label": "Category",
        "value": "bathroom--laundry"
      },
      {
        "label": "Subcategory",
        "value": "General"
      },
      {
        "label": "Condition",
        "value": "Brand New (100% Sealed)"
      },
      {
        "label": "Capacity / Volume",
        "value": "500ml"
      }
    ]
  }
];


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
