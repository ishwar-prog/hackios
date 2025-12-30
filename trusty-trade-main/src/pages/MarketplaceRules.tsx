import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  Shield, CheckCircle2, XCircle, AlertTriangle, 
  Users, Package, MessageCircle, Ban
} from 'lucide-react';

const MarketplaceRules = () => {
  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Marketplace Rules</h1>
          <p className="text-lg text-muted-foreground">
            These rules help maintain a safe, trustworthy marketplace for everyone. 
            Violations may result in account restrictions or permanent bans.
          </p>
        </div>

        {/* Core Principles */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Core Principles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <p className="text-muted-foreground">Be honest and accurate in all listings</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <p className="text-muted-foreground">Communicate respectfully with all users</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <p className="text-muted-foreground">Complete transactions through the platform</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <p className="text-muted-foreground">Report suspicious activity immediately</p>
            </div>
          </div>
        </div>

        {/* For Sellers */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Rules for Sellers
          </h3>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-foreground mb-2">Listing Requirements</p>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>• Provide accurate descriptions of item condition</li>
                <li>• Upload real photos of the actual item (no stock images)</li>
                <li>• Disclose all defects, damage, or issues</li>
                <li>• Set fair, reasonable prices</li>
                <li>• List only items you own and can ship</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">Shipping Requirements</p>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>• Ship within 2 business days of payment</li>
                <li>• Use tracked shipping methods only</li>
                <li>• Pack items securely to prevent damage</li>
                <li>• Update tracking information promptly</li>
              </ul>
            </div>
          </div>
        </div>

        {/* For Buyers */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Rules for Buyers
          </h3>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-foreground mb-2">Purchase Guidelines</p>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>• Read listings carefully before purchasing</li>
                <li>• Ask questions before buying if unsure</li>
                <li>• Complete verification within the 5-day window</li>
                <li>• Provide honest feedback and ratings</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground mb-2">Dispute Guidelines</p>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>• Only raise disputes for legitimate issues</li>
                <li>• Provide clear evidence when filing claims</li>
                <li>• Respond promptly to admin inquiries</li>
                <li>• Return items in the same condition received</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Prohibited Items */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Prohibited Items
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
            <ul className="space-y-2">
              <li>• Counterfeit or replica products</li>
              <li>• Stolen goods</li>
              <li>• Items with removed serial numbers</li>
              <li>• Weapons or dangerous items</li>
            </ul>
            <ul className="space-y-2">
              <li>• Illegal substances</li>
              <li>• Adult content</li>
              <li>• Items that violate intellectual property</li>
              <li>• Recalled products</li>
            </ul>
          </div>
        </div>

        {/* Prohibited Behaviors */}
        <div className="bg-warning/5 border border-warning/20 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Ban className="h-5 w-5 text-warning" />
            Prohibited Behaviors
          </h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Attempting to complete transactions outside the platform</li>
            <li>• Creating multiple accounts to circumvent restrictions</li>
            <li>• Harassment, threats, or abusive communication</li>
            <li>• Manipulating reviews or ratings</li>
            <li>• Filing false disputes or claims</li>
            <li>• Sharing personal information of other users</li>
          </ul>
        </div>

        {/* Consequences */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Consequences of Violations
          </h3>
          <div className="space-y-3 text-muted-foreground">
            <p><strong className="text-foreground">Warning:</strong> First-time minor violations</p>
            <p><strong className="text-foreground">Limited Account:</strong> Repeated minor violations or first-time moderate violations</p>
            <p><strong className="text-foreground">Suspended Account:</strong> Serious violations or repeated moderate violations</p>
            <p><strong className="text-foreground">Permanent Ban:</strong> Severe violations, fraud, or illegal activity</p>
          </div>
        </div>

        <div className="text-center">
          <Link to="/help">
            <Button size="lg">
              <MessageCircle className="h-5 w-5 mr-2" />
              Questions? Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default MarketplaceRules;
