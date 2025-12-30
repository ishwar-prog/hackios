import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Header } from './Header';
import { TrustBanner } from './TrustBanner';
import { EmailVerificationBanner } from '@/components/shared/EmailVerificationBanner';

interface LayoutProps {
  children: ReactNode;
  showTrustBanner?: boolean;
}

export const Layout = ({ children, showTrustBanner = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EmailVerificationBanner />
      {showTrustBanner && <TrustBanner />}
      <main>{children}</main>
      <footer className="border-t border-border bg-card mt-16">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Buy Safely</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/how-escrow-works" className="hover:text-foreground transition-colors">How Escrow Works</Link></li>
                <li><Link to="/buyer-protection" className="hover:text-foreground transition-colors">Buyer Protection</Link></li>
                <li><Link to="/verification-guide" className="hover:text-foreground transition-colors">Verification Guide</Link></li>
                <li><Link to="/return-policy" className="hover:text-foreground transition-colors">Return Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Categories</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/?category=Phones" className="hover:text-foreground transition-colors">Phones</Link></li>
                <li><Link to="/?category=Laptops" className="hover:text-foreground transition-colors">Laptops</Link></li>
                <li><Link to="/?category=Consoles" className="hover:text-foreground transition-colors">Consoles</Link></li>
                <li><Link to="/?category=Accessories" className="hover:text-foreground transition-colors">Accessories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li>
                  <a 
                    href="mailto:support@trustytrade.com?subject=Support%20Request&body=Hi%20Trusty%20Trade%20Support,%0A%0A" 
                    className="hover:text-foreground transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li><Link to="/marketplace-rules" className="hover:text-foreground transition-colors">Marketplace Rules</Link></li>
                <li><Link to="/help" className="hover:text-foreground transition-colors">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/nav" className="hover:text-foreground transition-colors">About Trusty Trade</Link></li>
                <li><Link to="/buyer-protection" className="hover:text-foreground transition-colors">Trust & Safety</Link></li>
                <li><Link to="/marketplace-rules" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link to="/admin" className="hover:text-foreground transition-colors">Admin Portal</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 Trusty Trade. Your money is protected until you're satisfied.
          </div>
        </div>
      </footer>
    </div>
  );
};
