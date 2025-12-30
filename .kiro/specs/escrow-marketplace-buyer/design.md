# Design Document: Escrow Marketplace Buyer Interface

## Overview

The escrow marketplace buyer interface is a React-based web application that provides a secure, trust-focused experience for purchasing second-hand electronics. The system emphasizes buyer protection through escrow services, transparent verification processes, and clear communication of safety measures.

The application follows a component-based architecture using React, React Router for navigation, Tailwind CSS for styling, and Zustand for state management. The design prioritizes mobile-first responsive layouts with clean, modern aesthetics inspired by GameLoot.

## Architecture

### Technology Stack
- **Frontend Framework**: React 18 with JSX
- **Routing**: React Router v6 for client-side navigation
- **Styling**: Tailwind CSS for utility-first responsive design
- **State Management**: Zustand for lightweight global state
- **Build Tool**: Vite for fast development and building

### Application Structure
```
src/
├── app/                    # Application setup and routing
├── pages/buyer/           # Page-level components for buyer flows
├── components/            # Reusable UI components organized by domain
├── store/                 # Zustand state stores
├── data/                  # Mock data for development
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions and constants
└── styles/               # Global styles and Tailwind configuration
```

### State Management Architecture
The application uses Zustand stores for different domains:
- **Auth Store**: User authentication and role management
- **Product Store**: Product catalog and filtering
- **Order Store**: Order lifecycle and status management
- **Escrow Store**: Escrow status and payment flow tracking

## Components and Interfaces

### Core Page Components

#### 1. Home Page (`pages/buyer/Home.jsx`)
**Purpose**: Product discovery and browsing interface
**Key Features**:
- Responsive product grid layout
- Product filtering and search
- Trust badges and escrow indicators
- Quick purchase actions

**Props Interface**:
```javascript
// No props - uses global product store
```

#### 2. Product Detail Page (`pages/buyer/ProductDetail.jsx`)
**Purpose**: Detailed product information and purchase initiation
**Key Features**:
- Product image gallery with zoom
- Comprehensive product specifications
- Seller reputation display
- Escrow protection explanation
- Purchase flow initiation

**Props Interface**:
```javascript
// Uses URL params for product ID
```

#### 3. Checkout Page (`pages/buyer/Checkout.jsx`)
**Purpose**: Secure payment processing with escrow visualization
**Key Features**:
- Order summary and pricing breakdown
- Mock payment interface
- Escrow timeline visualization
- Payment protection messaging

**Props Interface**:
```javascript
// Uses order store for checkout data
```

#### 4. Orders Page (`pages/buyer/Orders.jsx`)
**Purpose**: Order tracking and management dashboard
**Key Features**:
- Order list with status indicators
- Verification countdown timers
- Quick action buttons
- Status timeline visualization

**Props Interface**:
```javascript
// No props - uses global order store
```

#### 5. Verify Order Page (`pages/buyer/VerifyOrder.jsx`)
**Purpose**: Product verification and approval interface
**Key Features**:
- Verification countdown warning
- Product verification checklist
- Binary approval/dispute actions
- Clear consequence messaging

**Props Interface**:
```javascript
// Uses URL params for order ID
```

#### 6. Raise Dispute Page (`pages/buyer/RaiseDispute.jsx`)
**Purpose**: Dispute filing and return initiation
**Key Features**:
- Issue categorization
- Evidence upload interface
- Detailed problem description
- Escrow protection confirmation

**Props Interface**:
```javascript
// Uses URL params for order ID
```

### Reusable Component Library

#### Common Components (`components/common/`)

**Navbar Component**:
```javascript
interface NavbarProps {
  currentUser?: User;
  cartCount?: number;
}
```

**Button Component**:
```javascript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'success';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

**Badge Component**:
```javascript
interface BadgeProps {
  type: 'escrow' | 'condition' | 'status' | 'trust';
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}
```

**Modal Component**:
```javascript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

#### Product Components (`components/product/`)

**ProductCard Component**:
```javascript
interface ProductCardProps {
  product: Product;
  onBuyNow: (productId: string) => void;
  showEscrowBadge?: boolean;
}
```

**ProductGrid Component**:
```javascript
interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onProductSelect: (productId: string) => void;
}
```

**ProductGallery Component**:
```javascript
interface ProductGalleryProps {
  images: string[];
  productName: string;
  currentImageIndex?: number;
  onImageChange?: (index: number) => void;
}
```

#### Escrow Components (`components/escrow/`)

**EscrowTimeline Component**:
```javascript
interface EscrowTimelineProps {
  currentStep: 'paid' | 'shipped' | 'delivered' | 'verified';
  steps: TimelineStep[];
}
```

**EscrowInfoPanel Component**:
```javascript
interface EscrowInfoPanelProps {
  amount: number;
  status: EscrowStatus;
  protectionDetails: string[];
}
```

**TrustBanner Component**:
```javascript
interface TrustBannerProps {
  message: string;
  type: 'protection' | 'verification' | 'dispute';
  icon?: string;
}
```

#### Order Components (`components/order/`)

**OrderCard Component**:
```javascript
interface OrderCardProps {
  order: Order;
  onVerify?: (orderId: string) => void;
  onDispute?: (orderId: string) => void;
  showActions?: boolean;
}
```

**OrderStatusTimeline Component**:
```javascript
interface OrderStatusTimelineProps {
  status: OrderStatus;
  timeline: StatusEvent[];
  currentStep: number;
}
```

**CountdownTimer Component**:
```javascript
interface CountdownTimerProps {
  endTime: Date;
  onExpire: () => void;
  warningThreshold?: number; // hours
  format?: 'full' | 'compact';
}
```

## Data Models

### Core Data Structures

#### Product Model
```javascript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  images: string[];
  specifications: Record<string, string>;
  sellerId: string;
  category: string;
  brand: string;
  model: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Seller Model
```javascript
interface Seller {
  id: string;
  name: string;
  rating: number;
  totalSales: number;
  joinDate: Date;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  responseTime: string; // e.g., "within 2 hours"
}
```

#### Order Model
```javascript
interface Order {
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
}

type OrderStatus = 
  | 'pending_payment'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'verified'
  | 'disputed'
  | 'completed'
  | 'refunded';

type EscrowStatus = 
  | 'held'
  | 'released'
  | 'refunded'
  | 'disputed';
```

#### Dispute Model
```javascript
interface Dispute {
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

type DisputeIssueType = 
  | 'not_as_described'
  | 'damaged'
  | 'not_working'
  | 'missing_parts'
  | 'counterfeit'
  | 'other';

type DisputeStatus = 
  | 'open'
  | 'investigating'
  | 'resolved_refund'
  | 'resolved_partial'
  | 'resolved_favor_seller'
  | 'closed';
```

### State Store Interfaces

#### Product Store
```javascript
interface ProductStore {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProducts: () => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  setSelectedProduct: (product: Product | null) => void;
}
```

#### Order Store
```javascript
interface OrderStore {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  createOrder: (productId: string, amount: number) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  verifyOrder: (orderId: string) => Promise<void>;
  getOrdersByBuyer: (buyerId: string) => Order[];
}
```

#### Escrow Store
```javascript
interface EscrowStore {
  escrowAccounts: Record<string, EscrowAccount>;
  
  // Actions
  createEscrowAccount: (orderId: string, amount: number) => EscrowAccount;
  releaseEscrow: (orderId: string) => Promise<void>;
  refundEscrow: (orderId: string) => Promise<void>;
  getEscrowStatus: (orderId: string) => EscrowStatus;
}
```

Now I need to use the prework tool to analyze the acceptance criteria before writing the correctness properties:

<function_calls>
<invoke name="prework">
<parameter name="featureName">escrow-marketplace-buyer

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, I've identified several categories of testable properties while filtering out subjective or architectural requirements that cannot be automatically verified.

### Property Reflection

After reviewing all testable acceptance criteria, I've identified several areas where properties can be consolidated:

- **UI Component Presence**: Many requirements test that specific UI elements are rendered. These can be grouped by page type.
- **Navigation Behavior**: Multiple requirements test navigation functionality that can be combined.
- **State Management**: Several properties test state changes that can be unified.
- **Responsive Design**: Layout testing can be consolidated across breakpoints.

The following properties represent the essential correctness guarantees after removing redundancy:

### Core Properties

**Property 1: Product Card Completeness**
*For any* product displayed in a product card, the rendered output should contain product image, name, price, condition badge, escrow protection badge, open-box delivery badge, and buy now button
**Validates: Requirements 1.2, 1.4**

**Property 2: Product Detail Page Completeness**
*For any* product detail page, the rendered output should contain image gallery, specifications, condition details, seller reputation panel, escrow explanation panel, open-box delivery explanation, "What happens after I buy?" section, and "Proceed to Secure Checkout" button
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

**Property 3: Checkout Page Completeness**
*For any* checkout page, the rendered output should contain order summary, payment interface, escrow timeline, and payment flow steps (Paid → Shipped → Delivered → Verified)
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

**Property 4: Order Display Completeness**
*For any* order list page, the rendered output should display orders as a list with status timeline and visual indicators
**Validates: Requirements 4.1, 4.2, 4.5**

**Property 5: Conditional Order Actions**
*For any* delivered order, the system should display a verification countdown timer, and for any order requiring verification, the system should provide a "Verify Product" button
**Validates: Requirements 4.3, 4.4**

**Property 6: Verification Page Completeness**
*For any* product verification page, the rendered output should contain warning banner with remaining time, product summary, verification checklist (powers on, no damage, matches description), "Mark as Working" action, and "Raise Dispute" action
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

**Property 7: Dispute Page Completeness**
*For any* dispute filing page, the rendered output should contain issue type dropdown, description textarea, and image upload placeholder
**Validates: Requirements 6.1, 6.2, 6.3**

**Property 8: Navigation Consistency**
*For any* page in the application, the rendered output should contain consistent navigation elements and provide access to all required routes (Home, Product Details, Checkout, Orders, Verification, Disputes)
**Validates: Requirements 7.3, 7.4**

**Property 9: State Persistence Across Navigation**
*For any* navigation action, the application state should be maintained after the navigation completes
**Validates: Requirements 7.2**

**Property 10: URL Updates with Navigation**
*For any* navigation action, the URL should update appropriately to reflect the current page
**Validates: Requirements 7.5**

**Property 11: Responsive Grid Layout**
*For any* screen size, the product grid layout should adapt appropriately to the viewport width
**Validates: Requirements 8.1, 8.2, 8.3**

**Property 12: Trust Indicator Presence**
*For any* product view or purchase-related page, the rendered output should contain escrow protection badges, safety messaging, trust-focused microcopy, and visual indicators for escrow, verification, and refund processes
**Validates: Requirements 9.1, 9.2, 9.3, 9.5**

**Property 13: Product Navigation**
*For any* product card click, the system should navigate to the corresponding product detail page
**Validates: Requirements 1.3**

**Property 14: Post-Payment Navigation**
*For any* completed payment, the system should navigate to the order tracking page
**Validates: Requirements 3.6**

**Property 15: Data Store Synchronization**
*For any* page load, the rendered products should match the products in the data store
**Validates: Requirements 1.5**

**Property 16: Verification Time Expiration**
*For any* order where verification time expires, the system should automatically mark the product as working
**Validates: Requirements 5.6**

**Property 17: Dispute Status Update**
*For any* filed dispute, the system should update the corresponding order status to dispute processing
**Validates: Requirements 6.5**

## Error Handling

### Client-Side Error Boundaries
- **Component Error Boundaries**: Wrap major page components to catch and display user-friendly error messages
- **Network Error Handling**: Display appropriate messages for failed API calls or network issues
- **State Error Recovery**: Provide mechanisms to recover from invalid application states

### User Input Validation
- **Form Validation**: Real-time validation for dispute forms and checkout inputs
- **File Upload Validation**: Validate image uploads for disputes (size, format, content)
- **Navigation Guards**: Prevent navigation to invalid routes or unauthorized pages

### Graceful Degradation
- **Image Loading Failures**: Display placeholder images when product images fail to load
- **Timer Failures**: Handle countdown timer edge cases and expiration scenarios
- **Store Synchronization**: Handle cases where local state becomes out of sync

### Error User Experience
- **Clear Error Messages**: Use non-technical language to explain errors to users
- **Recovery Actions**: Provide clear next steps when errors occur
- **Error Persistence**: Maintain error context across navigation when appropriate

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and error conditions
- Component rendering with specific props
- User interaction scenarios (clicks, form submissions)
- Error boundary behavior
- Edge cases in countdown timers and state transitions

**Property Tests**: Verify universal properties across all inputs
- UI completeness properties across different data sets
- Navigation behavior with various route combinations
- Responsive layout behavior across viewport ranges
- State management consistency with random action sequences

### Property-Based Testing Configuration

**Testing Framework**: React Testing Library with fast-check for property-based testing
**Test Configuration**:
- Minimum 100 iterations per property test
- Each property test references its design document property
- Tag format: **Feature: escrow-marketplace-buyer, Property {number}: {property_text}**

**Generator Strategy**:
- **Product Generators**: Create realistic product data with various conditions and price ranges
- **Order Generators**: Generate orders in different states with realistic timelines
- **User Action Generators**: Simulate realistic user interaction sequences
- **Viewport Generators**: Test responsive behavior across device breakpoints

### Integration Testing

**Component Integration**: Test component interactions within page contexts
**Store Integration**: Verify Zustand store updates propagate correctly to UI
**Router Integration**: Test navigation flows and URL synchronization
**Responsive Integration**: Test layout behavior across breakpoint transitions

### Testing Priorities

1. **Critical Path Testing**: Focus on purchase flow, verification, and dispute processes
2. **Trust Feature Testing**: Ensure escrow messaging and protection indicators work correctly
3. **Responsive Testing**: Verify mobile and desktop experiences
4. **Error Scenario Testing**: Test error boundaries and recovery mechanisms
5. **Performance Testing**: Ensure smooth interactions and reasonable load times

The testing strategy ensures that both specific user scenarios and general system properties are validated, providing confidence in the system's correctness and reliability.