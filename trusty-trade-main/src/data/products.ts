export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  images: string[];
  specifications: Record<string, string>;
  sellerId: string;
  category: string;
  brand: string;
  model: string;
  createdAt: Date;
  updatedAt: Date;
  // Legacy fields for compatibility
  image: string; // Will be images[0]
  escrowProtected: boolean;
  openBoxDelivery: boolean;
  returnEligible: boolean;
  seller: Seller;
}

export interface Seller {
  id: string;
  name: string;
  rating: number;
  totalSales: number;
  joinDate: Date;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  responseTime: string; // e.g., "within 2 hours"
  // Legacy fields for compatibility
  completedSales: number;
  onTimeShipping: number;
  disputeResolution: number;
}

export interface Order {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  amount: number;
  escrowStatus: EscrowStatus;
  createdAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  verificationDeadline?: Date;
  verifiedAt?: Date;
  disputeId?: string;
  // Legacy fields for compatibility
  product: Product;
  orderDate: string;
  shippedDate?: string;
  deliveredDate?: string;
  daysLeftToVerify?: number;
  trackingNumber?: string;
}

export type OrderStatus = 
  | 'pending_payment'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'verified'
  | 'disputed'
  | 'completed'
  | 'refunded';

export type EscrowStatus = 
  | 'held'
  | 'released'
  | 'refunded'
  | 'disputed';

export interface Dispute {
  id: string;
  orderId: string;
  buyerId: string;
  issueType: DisputeIssueType;
  description: string;
  evidence: string[]; // image URLs
  status: DisputeStatus;
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

export type DisputeIssueType = 
  | 'not_as_described'
  | 'damaged'
  | 'not_working'
  | 'missing_parts'
  | 'counterfeit'
  | 'other';

export type DisputeStatus = 
  | 'open'
  | 'investigating'
  | 'resolved_refund'
  | 'resolved_partial'
  | 'resolved_favor_seller'
  | 'closed';

export interface EscrowAccount {
  id: string;
  orderId: string;
  amount: number;
  status: EscrowStatus;
  createdAt: Date;
  releasedAt?: Date;
  refundedAt?: Date;
}

// Legacy condition mapping for compatibility
export const conditionMapping = {
  'New': 'excellent' as const,
  'Like New': 'excellent' as const,
  'Good': 'good' as const,
  'Fair': 'fair' as const,
} as const;

export const products: Product[] = [
  {
    id: '1',
    name: 'iPhone 14 Pro Max 256GB',
    price: 849,
    originalPrice: 1099,
    image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=400&fit=crop'],
    condition: 'excellent',
    category: 'Phones',
    brand: 'Apple',
    model: 'iPhone 14 Pro Max',
    description: 'Pristine condition iPhone 14 Pro Max with original accessories. Battery health at 98%. No scratches or dents.',
    specifications: {
      'Storage': '256GB',
      'Color': 'Deep Purple',
      'Battery Health': '98%',
      'Network': 'Unlocked',
      'Display': '6.7" Super Retina XDR',
    },
    sellerId: 'seller-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    seller: {
      id: 'seller-1',
      name: 'TechTrader Pro',
      rating: 4.9,
      totalSales: 342,
      completedSales: 342,
      onTimeShipping: 99,
      disputeResolution: 98,
      joinDate: new Date('2023-01-01'),
      verificationStatus: 'verified',
      responseTime: 'within 2 hours',
    },
    escrowProtected: true,
    openBoxDelivery: true,
    returnEligible: true,
  },
  {
    id: '2',
    name: 'MacBook Pro 14" M3 Pro',
    price: 1899,
    originalPrice: 2499,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'],
    condition: 'excellent',
    category: 'Laptops',
    brand: 'Apple',
    model: 'MacBook Pro 14"',
    description: 'MacBook Pro 14" with M3 Pro chip. Barely used, includes original box and charger. AppleCare+ until 2025.',
    specifications: {
      'Processor': 'M3 Pro 12-Core',
      'RAM': '18GB Unified',
      'Storage': '512GB SSD',
      'Display': '14.2" Liquid Retina XDR',
      'Battery Cycles': '23',
    },
    sellerId: 'seller-2',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    seller: {
      id: 'seller-2',
      name: 'Premium Devices',
      rating: 4.8,
      totalSales: 156,
      completedSales: 156,
      onTimeShipping: 97,
      disputeResolution: 100,
      joinDate: new Date('2023-03-01'),
      verificationStatus: 'verified',
      responseTime: 'within 4 hours',
    },
    escrowProtected: true,
    openBoxDelivery: true,
    returnEligible: true,
  },
  {
    id: '3',
    name: 'PlayStation 5 Disc Edition',
    price: 399,
    originalPrice: 499,
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop'],
    condition: 'good',
    category: 'Consoles',
    brand: 'Sony',
    model: 'PlayStation 5',
    description: 'PS5 with one controller and all cables. Minor cosmetic wear on stand. Works perfectly.',
    specifications: {
      'Edition': 'Disc',
      'Storage': '825GB SSD',
      'Controllers': '1x DualSense',
      'Firmware': 'Latest',
      'Accessories': 'HDMI, Power Cable',
    },
    sellerId: 'seller-3',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    seller: {
      id: 'seller-3',
      name: 'GameHub Central',
      rating: 4.7,
      totalSales: 89,
      completedSales: 89,
      onTimeShipping: 95,
      disputeResolution: 96,
      joinDate: new Date('2023-06-01'),
      verificationStatus: 'verified',
      responseTime: 'within 6 hours',
    },
    escrowProtected: true,
    openBoxDelivery: true,
    returnEligible: true,
  },
  {
    id: '4',
    name: 'Samsung Galaxy S24 Ultra',
    price: 799,
    originalPrice: 1199,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop'],
    condition: 'excellent',
    category: 'Phones',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    description: 'Galaxy S24 Ultra with S Pen. Screen protector since day one. Includes original box and fast charger.',
    specifications: {
      'Storage': '256GB',
      'Color': 'Titanium Black',
      'RAM': '12GB',
      'Display': '6.8" Dynamic AMOLED',
      'Battery': '5000mAh',
    },
    sellerId: 'seller-4',
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
    seller: {
      id: 'seller-4',
      name: 'Mobile Masters',
      rating: 4.9,
      totalSales: 267,
      completedSales: 267,
      onTimeShipping: 98,
      disputeResolution: 99,
      joinDate: new Date('2022-12-01'),
      verificationStatus: 'verified',
      responseTime: 'within 1 hour',
    },
    escrowProtected: true,
    openBoxDelivery: true,
    returnEligible: true,
  },
  {
    id: '5',
    name: 'AirPods Pro 2nd Gen',
    price: 179,
    originalPrice: 249,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop'],
    condition: 'excellent',
    category: 'Accessories',
    brand: 'Apple',
    model: 'AirPods Pro 2nd Gen',
    description: 'Brand new sealed AirPods Pro 2nd Generation with MagSafe charging case.',
    specifications: {
      'Model': '2nd Generation',
      'Features': 'Active Noise Cancellation',
      'Case': 'MagSafe Charging',
      'Chip': 'H2',
      'Battery': '6hrs (30hrs with case)',
    },
    sellerId: 'seller-5',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    seller: {
      id: 'seller-5',
      name: 'Audio Experts',
      rating: 5.0,
      totalSales: 412,
      completedSales: 412,
      onTimeShipping: 100,
      disputeResolution: 100,
      joinDate: new Date('2022-08-01'),
      verificationStatus: 'verified',
      responseTime: 'within 30 minutes',
    },
    escrowProtected: true,
    openBoxDelivery: true,
    returnEligible: true,
  },
  {
    id: '6',
    name: 'Nintendo Switch OLED',
    price: 289,
    originalPrice: 349,
    image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop'],
    condition: 'good',
    category: 'Consoles',
    brand: 'Nintendo',
    model: 'Switch OLED',
    description: 'Switch OLED with dock and Joy-Cons. Screen in perfect condition. Includes carrying case.',
    specifications: {
      'Model': 'OLED',
      'Storage': '64GB',
      'Display': '7" OLED',
      'Controllers': 'Joy-Con (L/R)',
      'Accessories': 'Dock, Carrying Case',
    },
    sellerId: 'seller-3',
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-06'),
    seller: {
      id: 'seller-3',
      name: 'GameHub Central',
      rating: 4.7,
      totalSales: 89,
      completedSales: 89,
      onTimeShipping: 95,
      disputeResolution: 96,
      joinDate: new Date('2023-06-01'),
      verificationStatus: 'verified',
      responseTime: 'within 6 hours',
    },
    escrowProtected: true,
    openBoxDelivery: true,
    returnEligible: true,
  },
  {
    id: '7',
    name: 'Dell XPS 15 OLED',
    price: 1299,
    originalPrice: 1899,
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=400&fit=crop'],
    condition: 'excellent',
    category: 'Laptops',
    brand: 'Dell',
    model: 'XPS 15',
    description: 'XPS 15 with stunning OLED display. i7 processor, 16GB RAM. Perfect for professionals.',
    specifications: {
      'Processor': 'Intel i7-13700H',
      'RAM': '16GB DDR5',
      'Storage': '512GB NVMe',
      'Display': '15.6" 3.5K OLED',
      'GPU': 'RTX 4050',
    },
    sellerId: 'seller-6',
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-07'),
    seller: {
      id: 'seller-6',
      name: 'LaptopWorld',
      rating: 4.6,
      totalSales: 78,
      completedSales: 78,
      onTimeShipping: 94,
      disputeResolution: 95,
      joinDate: new Date('2023-09-01'),
      verificationStatus: 'verified',
      responseTime: 'within 8 hours',
    },
    escrowProtected: true,
    openBoxDelivery: true,
    returnEligible: true,
  },
  {
    id: '8',
    name: 'Sony WH-1000XM5',
    price: 279,
    originalPrice: 399,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop'],
    condition: 'excellent',
    category: 'Accessories',
    brand: 'Sony',
    model: 'WH-1000XM5',
    description: 'Premium noise-cancelling headphones. Used for 2 months. Includes case and all accessories.',
    specifications: {
      'Type': 'Over-ear',
      'ANC': 'Industry-leading',
      'Battery': '30 hours',
      'Connectivity': 'Bluetooth 5.2',
      'Features': 'Multipoint, LDAC',
    },
    sellerId: 'seller-5',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    seller: {
      id: 'seller-5',
      name: 'Audio Experts',
      rating: 5.0,
      totalSales: 412,
      completedSales: 412,
      onTimeShipping: 100,
      disputeResolution: 100,
      joinDate: new Date('2022-08-01'),
      verificationStatus: 'verified',
      responseTime: 'within 30 minutes',
    },
    escrowProtected: true,
    openBoxDelivery: true,
    returnEligible: true,
  },
];

// Additional products for expanded catalog
export const additionalProducts: Product[] = [
  {
    id: '9',
    name: 'iPad Pro 12.9" M2',
    price: 899,
    originalPrice: 1199,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'],
    condition: 'excellent',
    category: 'Tablets',
    brand: 'Apple',
    model: 'iPad Pro 12.9"',
    description: 'iPad Pro with M2 chip and Apple Pencil 2nd Gen. Perfect for creative work and productivity.',
    specifications: {
      'Processor': 'M2 8-Core',
      'Storage': '256GB',
      'Display': '12.9" Liquid Retina XDR',
      'Connectivity': 'Wi-Fi + Cellular',
      'Accessories': 'Apple Pencil 2nd Gen',
    },
    sellerId: 'seller-1',
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-09'),
    seller: {
      id: 'seller-1',
      name: 'TechTrader Pro',
      rating: 4.9,
      totalSales: 342,
      completedSales: 342,
      onTimeShipping: 99,
      disputeResolution: 98,
      joinDate: new Date('2023-01-01'),
      verificationStatus: 'verified',
      responseTime: 'within 2 hours',
    },
    escrowProtected: true,
    openBoxDelivery: true,
    returnEligible: true,
  },
  {
    id: '10',
    name: 'Google Pixel 8 Pro',
    price: 649,
    originalPrice: 999,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'],
    condition: 'good',
    category: 'Phones',
    brand: 'Google',
    model: 'Pixel 8 Pro',
    description: 'Pixel 8 Pro with amazing camera AI features. Minor wear on corners but fully functional.',
    specifications: {
      'Storage': '128GB',
      'Color': 'Obsidian',
      'RAM': '12GB',
      'Camera': '50MP Triple',
      'Display': '6.7" LTPO OLED',
    },
    sellerId: 'seller-4',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    seller: {
      id: 'seller-4',
      name: 'Mobile Masters',
      rating: 4.9,
      totalSales: 267,
      completedSales: 267,
      onTimeShipping: 98,
      disputeResolution: 99,
      joinDate: new Date('2022-12-01'),
      verificationStatus: 'verified',
      responseTime: 'within 1 hour',
    },
    escrowProtected: true,
    openBoxDelivery: true,
    returnEligible: true,
  },
  {
    id: '11',
    name: 'Xbox Series X',
    price: 449,
    originalPrice: 499,
    image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&h=400&fit=crop'],
    condition: 'excellent',
    category: 'Consoles',
    brand: 'Microsoft',
    model: 'Xbox Series X',
    description: 'Xbox Series X in pristine condition. Includes wireless controller and all original accessories.',
    specifications: {
      'Storage': '1TB NVMe SSD',
      'Performance': '4K Gaming',
      'Controllers': '1x Wireless Controller',
      'Features': 'Quick Resume, Smart Delivery',
      'Backwards Compatibility': 'Yes',
    },
    sellerId: 'seller-3',
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11'),
    seller: {
      id: 'seller-3',
      name: 'GameHub Central',
      rating: 4.7,
      totalSales: 89,
      completedSales: 89,
      onTimeShipping: 95,
      disputeResolution: 96,
      joinDate: new Date('2023-06-01'),
      verificationStatus: 'verified',
      responseTime: 'within 6 hours',
    },
    escrowProtected: true,
    openBoxDelivery: true,
    returnEligible: true,
  },
  {
    id: '12',
    name: 'Apple Watch Series 9',
    price: 329,
    originalPrice: 399,
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop'],
    condition: 'excellent',
    category: 'Accessories',
    brand: 'Apple',
    model: 'Apple Watch Series 9',
    description: 'Apple Watch Series 9 with GPS + Cellular. Includes sport band and magnetic charger.',
    specifications: {
      'Size': '45mm',
      'Connectivity': 'GPS + Cellular',
      'Display': 'Always-On Retina',
      'Health': 'ECG, Blood Oxygen',
      'Band': 'Sport Band',
    },
    sellerId: 'seller-1',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    seller: {
      id: 'seller-1',
      name: 'TechTrader Pro',
      rating: 4.9,
      totalSales: 342,
      completedSales: 342,
      onTimeShipping: 99,
      disputeResolution: 98,
      joinDate: new Date('2023-01-01'),
      verificationStatus: 'verified',
      responseTime: 'within 2 hours',
    },
    escrowProtected: true,
    openBoxDelivery: true,
    returnEligible: true,
  },
  {
    id: '13',
    name: 'Surface Laptop Studio',
    price: 1599,
    originalPrice: 2199,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop'],
    condition: 'good',
    category: 'Laptops',
    brand: 'Microsoft',
    model: 'Surface Laptop Studio',
    description: 'Versatile Surface Laptop Studio with unique hinge design. Perfect for creative professionals.',
    specifications: {
      'Processor': 'Intel i7-11370H',
      'RAM': '16GB',
      'Storage': '512GB SSD',
      'Display': '14.4" PixelSense',
      'GPU': 'RTX 3050 Ti',
    },
    sellerId: 'seller-6',
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
    seller: {
      id: 'seller-6',
      name: 'LaptopWorld',
      rating: 4.6,
      totalSales: 78,
      completedSales: 78,
      onTimeShipping: 94,
      disputeResolution: 95,
      joinDate: new Date('2023-09-01'),
      verificationStatus: 'verified',
      responseTime: 'within 8 hours',
    },
    escrowProtected: true,
    openBoxDelivery: true,
    returnEligible: true,
  },
  {
    id: '14',
    name: 'Steam Deck 512GB',
    price: 549,
    originalPrice: 649,
    image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=400&fit=crop'],
    condition: 'excellent',
    category: 'Consoles',
    brand: 'Valve',
    model: 'Steam Deck',
    description: 'Steam Deck handheld gaming PC. Includes carrying case and screen protector already applied.',
    specifications: {
      'Storage': '512GB NVMe SSD',
      'Display': '7" LCD Touchscreen',
      'Processor': 'AMD APU',
      'RAM': '16GB LPDDR5',
      'OS': 'SteamOS 3.0',
    },
    sellerId: 'seller-3',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    seller: {
      id: 'seller-3',
      name: 'GameHub Central',
      rating: 4.7,
      totalSales: 89,
      completedSales: 89,
      onTimeShipping: 95,
      disputeResolution: 96,
      joinDate: new Date('2023-06-01'),
      verificationStatus: 'verified',
      responseTime: 'within 6 hours',
    },
    escrowProtected: true,
    openBoxDelivery: true,
    returnEligible: true,
  },
  {
    id: '15',
    name: 'Canon EOS R5',
    price: 2899,
    originalPrice: 3899,
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop'],
    condition: 'excellent',
    category: 'Cameras',
    brand: 'Canon',
    model: 'EOS R5',
    description: 'Professional mirrorless camera with 45MP sensor. Low shutter count, includes RF 24-70mm lens.',
    specifications: {
      'Sensor': '45MP Full Frame',
      'Video': '8K RAW Recording',
      'Lens': 'RF 24-70mm f/2.8L',
      'Shutter Count': '2,847',
      'Image Stabilization': '8-stop IBIS',
    },
    sellerId: 'seller-7',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    seller: {
      id: 'seller-7',
      name: 'Pro Camera Shop',
      rating: 4.8,
      totalSales: 134,
      completedSales: 134,
      onTimeShipping: 96,
      disputeResolution: 98,
      joinDate: new Date('2023-04-01'),
      verificationStatus: 'verified',
      responseTime: 'within 4 hours',
    },
    escrowProtected: true,
    openBoxDelivery: true,
    returnEligible: true,
  },
];

// Combine all products
export const allProducts = [...products, ...additionalProducts];

// Helper function to find product by ID
const findProductById = (id: string): Product => 
  allProducts.find(p => p.id === id)!;

// Helper to create future dates relative to now
const getFutureDate = (daysFromNow: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

const getPastDate = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

export const orders: Order[] = [
  {
    id: 'ORD-2024-001',
    productId: '1',
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
    status: 'delivered',
    amount: 849,
    escrowStatus: 'held',
    createdAt: getPastDate(10),
    shippedAt: getPastDate(9),
    deliveredAt: getPastDate(5),
    verificationDeadline: getFutureDate(3),
    product: findProductById('1'),
    orderDate: getPastDate(10).toISOString().split('T')[0],
    shippedDate: getPastDate(9).toISOString().split('T')[0],
    deliveredDate: getPastDate(5).toISOString().split('T')[0],
    daysLeftToVerify: 3,
    trackingNumber: 'TRK123456789',
  },
  {
    id: 'ORD-2024-002',
    productId: '2',
    buyerId: 'buyer-1',
    sellerId: 'seller-2',
    status: 'shipped',
    amount: 1899,
    escrowStatus: 'held',
    createdAt: getPastDate(5),
    shippedAt: getPastDate(4),
    product: findProductById('2'),
    orderDate: getPastDate(5).toISOString().split('T')[0],
    shippedDate: getPastDate(4).toISOString().split('T')[0],
    trackingNumber: 'TRK987654321',
  },
  {
    id: 'ORD-2024-003',
    productId: '5',
    buyerId: 'buyer-1',
    sellerId: 'seller-5',
    status: 'verified',
    amount: 179,
    escrowStatus: 'released',
    createdAt: getPastDate(20),
    shippedAt: getPastDate(19),
    deliveredAt: getPastDate(16),
    verifiedAt: getPastDate(14),
    product: findProductById('5'),
    orderDate: getPastDate(20).toISOString().split('T')[0],
    shippedDate: getPastDate(19).toISOString().split('T')[0],
    deliveredDate: getPastDate(16).toISOString().split('T')[0],
  },
  {
    id: 'ORD-2024-004',
    productId: '9',
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
    status: 'delivered',
    amount: 899,
    escrowStatus: 'held',
    createdAt: getPastDate(8),
    shippedAt: getPastDate(7),
    deliveredAt: getPastDate(3),
    verificationDeadline: getFutureDate(1),
    product: findProductById('9'),
    orderDate: getPastDate(8).toISOString().split('T')[0],
    shippedDate: getPastDate(7).toISOString().split('T')[0],
    deliveredDate: getPastDate(3).toISOString().split('T')[0],
    daysLeftToVerify: 1,
    trackingNumber: 'TRK555666777',
  },
  {
    id: 'ORD-2024-005',
    productId: '11',
    buyerId: 'buyer-1',
    sellerId: 'seller-3',
    status: 'delivered',
    amount: 449,
    escrowStatus: 'held',
    createdAt: getPastDate(6),
    shippedAt: getPastDate(5),
    deliveredAt: getPastDate(1),
    verificationDeadline: getFutureDate(2),
    product: findProductById('11'),
    orderDate: getPastDate(6).toISOString().split('T')[0],
    shippedDate: getPastDate(5).toISOString().split('T')[0],
    deliveredDate: getPastDate(1).toISOString().split('T')[0],
    daysLeftToVerify: 2,
    trackingNumber: 'TRK888999000',
  },
  {
    id: 'ORD-2024-006',
    productId: '12',
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
    status: 'paid',
    amount: 329,
    escrowStatus: 'held',
    createdAt: getPastDate(2),
    product: findProductById('12'),
    orderDate: getPastDate(2).toISOString().split('T')[0],
  },
  {
    id: 'ORD-2024-007',
    productId: '8',
    buyerId: 'buyer-1',
    sellerId: 'seller-5',
    status: 'disputed',
    amount: 279,
    escrowStatus: 'disputed',
    createdAt: getPastDate(15),
    shippedAt: getPastDate(14),
    deliveredAt: getPastDate(11),
    disputeId: 'DISP-2024-002',
    product: findProductById('8'),
    orderDate: getPastDate(15).toISOString().split('T')[0],
    shippedDate: getPastDate(14).toISOString().split('T')[0],
    deliveredDate: getPastDate(11).toISOString().split('T')[0],
  },
];

// Sample disputes data
export const disputes: Dispute[] = [
  {
    id: 'DISP-2024-001',
    orderId: 'ORD-2024-001',
    buyerId: 'buyer-1',
    issueType: 'not_as_described',
    description: 'The product condition was not as described. There are visible scratches on the screen that were not mentioned.',
    evidence: ['https://example.com/evidence1.jpg', 'https://example.com/evidence2.jpg'],
    status: 'investigating',
    createdAt: new Date('2024-01-22'),
  },
];

// Sample escrow accounts
export const escrowAccounts: EscrowAccount[] = [
  {
    id: 'ESC-2024-001',
    orderId: 'ORD-2024-001',
    amount: 849,
    status: 'held',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'ESC-2024-002',
    orderId: 'ORD-2024-002',
    amount: 1899,
    status: 'held',
    createdAt: new Date('2024-01-18'),
  },
  {
    id: 'ESC-2024-003',
    orderId: 'ORD-2024-003',
    amount: 179,
    status: 'released',
    createdAt: new Date('2024-01-10'),
    releasedAt: new Date('2024-01-16'),
  },
];