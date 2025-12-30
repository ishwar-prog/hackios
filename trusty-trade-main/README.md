# SafeTrade - Secure Escrow Marketplace

A comprehensive escrow marketplace for buying and selling second-hand electronics with buyer protection, secure transactions, and product verification.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation & Running

1. **Navigate to the project directory:**
   ```bash
   cd trusty-trade-main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:5173
   ```

The website will automatically reload when you make changes to the code.

## 📱 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## 🛡️ Features

### Buyer Experience
- **Product Discovery**: Browse electronics with advanced filtering
- **Secure Checkout**: Escrow-protected payment process
- **Order Tracking**: Real-time status updates and verification timers
- **Product Verification**: 5-day verification window with checklist
- **Dispute Resolution**: File disputes with evidence upload
- **Account Management**: Profile, security, and notification settings

### Seller Tools
- **Seller Dashboard**: Analytics, order management, and performance metrics
- **Listing Management**: Create and manage product listings
- **Sales Tracking**: Revenue analytics and customer insights

### Platform Features
- **Security Center**: 2FA, device management, activity monitoring
- **Help Center**: FAQ, support tickets, and system status
- **Notifications**: Real-time updates and activity tracking
- **Responsive Design**: Mobile-first, works on all devices

## 🏗️ Technical Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library + fast-check (Property-based testing)

## 📄 Pages & Routes

### Main Application Routes
- `/` - Home (Product listing)
- `/product/:id` - Product details
- `/checkout/:id` - Secure checkout
- `/orders` - Order management
- `/verify/:id` - Product verification
- `/dispute/:id` - Dispute filing

### Account & Settings
- `/profile` - User profile
- `/security` - Security settings
- `/settings` - App preferences
- `/notifications` - Notification center

### Seller Tools
- `/seller` - Seller dashboard

### Support
- `/help` - Help center
- `/nav` - Navigation overview (development)

## 🧪 Testing

The project includes comprehensive testing:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run property-based tests
npm run test -- --grep "Property"
```

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── checkout/       # Checkout-specific components
│   ├── escrow/         # Escrow-related components
│   ├── layout/         # Layout components (Header, Layout)
│   ├── order/          # Order management components
│   ├── products/       # Product display components
│   ├── shared/         # Shared utility components
│   └── ui/             # shadcn/ui component library
├── data/               # Mock data and test fixtures
├── hooks/              # Custom React hooks
├── pages/              # Page-level components
├── store/              # Zustand state stores
├── styles/             # Global styles
└── utils/              # Utility functions
```

### Key Components
- **Layout System**: Consistent header, navigation, and page structure
- **Product Components**: Cards, grids, filters, and detail views
- **Escrow Components**: Timeline, protection indicators, and status displays
- **Order Components**: Status tracking, verification, and dispute handling

## 🛡️ Security Features

- **Escrow Protection**: Payments held until buyer verification
- **Two-Factor Authentication**: Optional 2FA for enhanced security
- **Device Management**: Monitor and control account access
- **Activity Tracking**: Comprehensive security audit logs
- **Secure Headers**: XSS protection and content security policies

## 📱 Mobile Support

The application is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1440px+)

## 🎨 Design System

Built with a comprehensive design system featuring:
- **Trust-focused UI**: Emphasizes security and buyer protection
- **Consistent Typography**: Clear hierarchy and readability
- **Color System**: Primary blues with trust-building accent colors
- **Component Library**: 40+ reusable UI components
- **Responsive Grid**: Flexible layouts for all screen sizes

## 📊 State Management

Uses Zustand for lightweight, efficient state management:
- **ProductStore**: Product catalog and filtering
- **OrderStore**: Order lifecycle and status
- **EscrowStore**: Payment and escrow tracking
- **AuthStore**: User authentication and preferences

## 🚀 Deployment

To build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 📞 Support

For questions or issues:
1. Check the Help Center (`/help` route)
2. Review the Navigation overview (`/nav` route)
3. Test functionality using the comprehensive demo data

---

**SafeTrade** - Secure transactions, verified products, buyer protection guaranteed.