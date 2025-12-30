import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, Camera, Power, Wifi, 
  Battery, Volume2, Monitor, Smartphone,
  AlertTriangle, Clock, Shield
} from 'lucide-react';

const VerificationGuide = () => {
  const checklistItems = {
    phones: [
      { icon: Power, text: 'Device powers on and boots properly' },
      { icon: Monitor, text: 'Screen has no dead pixels or burn-in' },
      { icon: Battery, text: 'Battery holds charge as described' },
      { icon: Wifi, text: 'WiFi and cellular connectivity work' },
      { icon: Camera, text: 'All cameras function properly' },
      { icon: Volume2, text: 'Speakers and microphone work' },
    ],
    laptops: [
      { icon: Power, text: 'Laptop powers on and boots properly' },
      { icon: Monitor, text: 'Screen has no defects or dead pixels' },
      { icon: Battery, text: 'Battery life matches description' },
      { icon: Wifi, text: 'WiFi and Bluetooth work' },
      { icon: Volume2, text: 'Keyboard and trackpad function' },
      { icon: Camera, text: 'All ports work correctly' },
    ],
    consoles: [
      { icon: Power, text: 'Console powers on without issues' },
      { icon: Monitor, text: 'Video output works properly' },
      { icon: Volume2, text: 'Audio output is clear' },
      { icon: Wifi, text: 'Network connectivity works' },
      { icon: Camera, text: 'Controllers pair and function' },
      { icon: Battery, text: 'Disc drive works (if applicable)' },
    ],
  };

  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Verification Guide</h1>
          <p className="text-lg text-muted-foreground">
            Follow this guide to properly verify your purchase and ensure everything works as described.
          </p>
        </div>

        {/* Time Warning */}
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <Clock className="h-6 w-6 text-warning shrink-0" />
            <div>
              <p className="font-semibold text-warning">You have 5 days to verify</p>
              <p className="text-sm text-warning/80 mt-1">
                After delivery, you have 5 days to test the product and either approve 
                the transaction or raise a dispute. If you don't respond, payment is 
                automatically released to the seller.
              </p>
            </div>
          </div>
        </div>

        {/* General Steps */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">General Verification Steps</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Inspect the Packaging</p>
                <p className="text-sm text-muted-foreground">
                  Check for any damage to the shipping box. Take photos before opening.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Check Physical Condition</p>
                <p className="text-sm text-muted-foreground">
                  Compare the item's condition to the listing description. Look for any 
                  scratches, dents, or damage not mentioned.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Verify Accessories</p>
                <p className="text-sm text-muted-foreground">
                  Ensure all accessories mentioned in the listing are included.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">4</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Test Functionality</p>
                <p className="text-sm text-muted-foreground">
                  Power on the device and test all features. Use the category-specific 
                  checklists below.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-success">5</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Approve or Dispute</p>
                <p className="text-sm text-muted-foreground">
                  If everything checks out, approve the transaction. If there are issues, 
                  raise a dispute with evidence.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Checklists */}
        <div className="space-y-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground">Category-Specific Checklists</h3>
          
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-foreground">Phones & Tablets</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {checklistItems.phones.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-foreground">Laptops & Computers</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {checklistItems.laptops.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-foreground">Gaming Consoles</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {checklistItems.consoles.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Pro Tips
          </h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Record a video while unboxing and testing the item</li>
            <li>• Test the item for at least a few hours before approving</li>
            <li>• Check serial numbers match the listing if provided</li>
            <li>• Test all features, not just the main ones</li>
            <li>• Keep all packaging until verification is complete</li>
          </ul>
        </div>

        {/* What if issues found */}
        <div className="bg-warning/5 border border-warning/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-warning shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Found an Issue?</h3>
              <p className="text-muted-foreground mb-4">
                If the item doesn't match the description or has problems:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Document the issue with photos/videos</li>
                <li>Go to your order and click "Raise Dispute"</li>
                <li>Select the issue type and describe the problem</li>
                <li>Upload your evidence</li>
                <li>Our team will review and arrange a return if needed</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link to="/orders">
            <Button size="lg">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Go to My Orders
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default VerificationGuide;
