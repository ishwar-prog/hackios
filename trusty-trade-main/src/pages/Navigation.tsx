import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';

const Navigation = () => {
  const buyerRoutes = [
    { path: '/', label: 'Home (Product Listing)', description: 'Browse all products with filters' },
    { path: '/product/1', label: 'Product Detail', description: 'View product details, seller info, and escrow protection' },
    { path: '/checkout/1', label: 'Checkout', description: 'Secure escrow checkout process' },
    { path: '/orders', label: 'My Orders', description: 'Track your orders and verification status' },
    { path: '/verify/ORD-1', label: 'Verification Page', description: 'Verify received products' },
    { path: '/dispute/ORD-1', label: 'Dispute Page', description: 'File disputes for problematic orders' },
  ];

  const sellerRoutes = [
    { path: '/seller', label: 'Seller Dashboard', description: 'Manage your listings and sales' },
  ];

  const accountRoutes = [
    { path: '/profile', label: 'Profile Settings', description: 'Manage your account and preferences' },
    { path: '/security', label: 'Security Center', description: 'Manage account security settings' },
    { path: '/settings', label: 'Settings', description: 'Configure app preferences and notifications' },
    { path: '/notifications', label: 'Notifications', description: 'View and manage your notifications' },
  ];

  const supportRoutes = [
    { path: '/help', label: 'Help Center', description: 'Get support and find answers' },
  ];

  const testRoutes = [
    { path: '/test', label: 'Test Page', description: 'Simple test page' },
    { path: '/simple-orders', label: 'Simple Orders', description: 'Simplified orders page' },
  ];

  const renderRouteSection = (title: string, routes: typeof buyerRoutes, bgColor: string) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-foreground mb-4">{title}</h2>
      <div className="grid gap-4">
        {routes.map((route) => (
          <Link
            key={route.path}
            to={route.path}
            className={`block p-6 ${bgColor} rounded-xl border border-border hover:border-primary/30 transition-all hover:shadow-md`}
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {route.label}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {route.description}
            </p>
            <code className="text-xs bg-muted px-2 py-1 rounded text-primary">
              {route.path}
            </code>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Escrow Marketplace - Navigation
        </h1>
        <p className="text-muted-foreground mb-8">
          All available pages in the buyer interface. Click any link to navigate.
        </p>

        <div className="grid gap-4">
          {renderRouteSection("🛒 Buyer Experience", buyerRoutes, "bg-card")}
          {renderRouteSection("💼 Seller Tools", sellerRoutes, "bg-primary/5")}
          {renderRouteSection("👤 Account Management", accountRoutes, "bg-success/5")}
          {renderRouteSection("❓ Support & Help", supportRoutes, "bg-warning/5")}
          {renderRouteSection("🧪 Testing & Development", testRoutes, "bg-muted")}
        </div>

        <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-xl">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            🛡️ Complete Escrow Marketplace Ecosystem
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-foreground mb-2">✅ Buyer Features:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Product browsing with advanced filters</li>
                <li>• Escrow-protected checkout process</li>
                <li>• Order tracking and status updates</li>
                <li>• Product verification system</li>
                <li>• Dispute filing and resolution</li>
                <li>• Comprehensive notifications</li>
                <li>• Account management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">✅ Seller Features:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Seller dashboard with analytics</li>
                <li>• Listing management</li>
                <li>• Order processing</li>
                <li>• Performance metrics</li>
                <li>• Sales tracking</li>
                <li>• Customer management</li>
                <li>• Revenue analytics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">✅ Platform Features:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Security center with 2FA</li>
                <li>• Help center with FAQ</li>
                <li>• Settings and preferences</li>
                <li>• Notification management</li>
                <li>• Profile customization</li>
                <li>• Trust-focused UI design</li>
                <li>• Responsive mobile design</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-primary/20">
            <h4 className="font-semibold text-foreground mb-2">🔧 Technical Implementation:</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-1 text-muted-foreground">
                <li>• React 18 + TypeScript for type safety</li>
                <li>• React Router v6 for navigation</li>
                <li>• Tailwind CSS + shadcn/ui components</li>
                <li>• Zustand for state management</li>
              </ul>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Vite for fast development</li>
                <li>• Property-based testing setup</li>
                <li>• Mock data for comprehensive demos</li>
                <li>• Responsive design patterns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Navigation;