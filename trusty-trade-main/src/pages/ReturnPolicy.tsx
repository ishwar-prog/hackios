import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, Clock, Package, Truck, 
  CheckCircle2, XCircle, AlertTriangle
} from 'lucide-react';

const ReturnPolicy = () => {
  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Return Policy</h1>
          <p className="text-lg text-muted-foreground">
            Our return policy is designed to protect buyers while being fair to sellers. 
            Here's everything you need to know about returns on ReBoxed.
          </p>
        </div>

        {/* Key Points */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-foreground mb-4">Key Points</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-foreground">5-Day Window</p>
                <p className="text-sm text-muted-foreground">To raise a dispute</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-foreground">Full Refund</p>
                <p className="text-sm text-muted-foreground">For valid claims</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-foreground">Free Pickup</p>
                <p className="text-sm text-muted-foreground">We arrange return shipping</p>
              </div>
            </div>
          </div>
        </div>

        {/* Return Process */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Return Process</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Raise a Dispute</p>
                <p className="text-sm text-muted-foreground">
                  Within 5 days of delivery, go to your order and click "Raise Dispute". 
                  Select the issue type and provide details.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Review & Approval</p>
                <p className="text-sm text-muted-foreground">
                  Our team reviews your claim within 24-48 hours. We may contact you 
                  for additional information or evidence.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Return Pickup</p>
                <p className="text-sm text-muted-foreground">
                  If approved, we schedule a pickup at your convenience. 
                  Pack the item securely in its original packaging if possible.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-success">4</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Refund Processed</p>
                <p className="text-sm text-muted-foreground">
                  Once we receive the returned item, your full refund is processed 
                  within 3-5 business days to your original payment method.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Eligible vs Not Eligible */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-success/5 border border-success/20 rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Eligible for Return
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Item not as described</li>
              <li>• Item damaged during shipping</li>
              <li>• Item doesn't work properly</li>
              <li>• Missing parts or accessories</li>
              <li>• Counterfeit products</li>
              <li>• Wrong item received</li>
            </ul>
          </div>

          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Not Eligible for Return
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Change of mind after verification</li>
              <li>• Damage caused by buyer</li>
              <li>• Items modified by buyer</li>
              <li>• Claims after 5-day window</li>
              <li>• Items with removed serial numbers</li>
              <li>• Software/digital products</li>
            </ul>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-warning/5 border border-warning/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-warning shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Important Notes</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Always document the item's condition with photos/videos upon receipt</li>
                <li>• Keep original packaging until verification is complete</li>
                <li>• Return shipping is free for valid claims; buyer pays for change-of-mind returns</li>
                <li>• Refunds are processed to the original payment method only</li>
                <li>• Escrow fees are refunded for valid claims</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link to="/help">
            <Button size="lg">Need Help? Contact Support</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default ReturnPolicy;
