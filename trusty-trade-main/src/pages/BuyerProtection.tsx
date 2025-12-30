import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  Shield, CheckCircle2, Lock, RefreshCw, 
  AlertTriangle, Clock, DollarSign, Eye
} from 'lucide-react';

const BuyerProtection = () => {
  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Buyer Protection</h1>
          <p className="text-lg text-muted-foreground">
            At Trusty Trade, your safety is our priority. Every purchase is protected by our comprehensive buyer protection program.
          </p>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-trust rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="h-12 w-12" />
            <div>
              <h2 className="text-2xl font-bold">100% Money-Back Guarantee</h2>
              <p className="text-white/80">Your payment is protected until you're satisfied</p>
            </div>
          </div>
        </div>

        {/* Protection Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Escrow Protection</h3>
            <p className="text-muted-foreground">
              Your payment is held securely in escrow until you verify the product. 
              The seller cannot access your money until you approve the transaction.
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <Eye className="h-6 w-6 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Open-Box Delivery</h3>
            <p className="text-muted-foreground">
              Inspect your item at delivery with the courier present. 
              If something's wrong, you can refuse the delivery immediately.
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">5-Day Verification Window</h3>
            <p className="text-muted-foreground">
              Take your time to test the product thoroughly. You have 5 full days 
              after delivery to verify everything works as described.
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <RefreshCw className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Easy Returns</h3>
            <p className="text-muted-foreground">
              If the product doesn't match the description, raise a dispute and 
              we'll arrange a return pickup. Full refund guaranteed.
            </p>
          </div>
        </div>

        {/* What's Covered */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">What's Covered?</h3>
          <div className="space-y-3">
            {[
              'Item not as described in the listing',
              'Item is damaged or defective',
              'Item doesn\'t work or function properly',
              'Missing parts or accessories mentioned in listing',
              'Counterfeit or fake products',
              'Item never delivered'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How to File a Claim */}
        <div className="bg-warning/5 border border-warning/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-warning shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">How to File a Claim</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Go to your order in "My Orders"</li>
                <li>Click "Raise Dispute" within the verification window</li>
                <li>Select the issue type and describe the problem</li>
                <li>Upload photos as evidence (optional but recommended)</li>
                <li>Our team will review and arrange a return pickup</li>
                <li>Receive your full refund once the item is returned</li>
              </ol>
            </div>
          </div>
        </div>

        {/* External Resources */}
        <div className="bg-muted rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Learn More</h3>
          <div className="flex flex-wrap gap-4">
            <a 
              href="https://en.wikipedia.org/wiki/Escrow" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              What is Escrow? (Wikipedia) →
            </a>
            <a 
              href="https://en.wikipedia.org/wiki/Consumer_protection" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Consumer Protection Laws →
            </a>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/">
            <Button size="lg">Start Shopping Safely</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default BuyerProtection;
