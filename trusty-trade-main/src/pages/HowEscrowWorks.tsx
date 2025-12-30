import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  Shield, CreditCard, Truck, Package, 
  CheckCircle2, DollarSign, ArrowRight
} from 'lucide-react';

const HowEscrowWorks = () => {
  const steps = [
    {
      icon: CreditCard,
      title: 'Buyer Pays',
      description: 'When you purchase an item, your payment goes directly into a secure escrow account — not to the seller.',
      color: 'bg-primary/10 text-primary'
    },
    {
      icon: Shield,
      title: 'Funds Held Securely',
      description: 'Your money is protected in escrow. The seller is notified but cannot access the funds yet.',
      color: 'bg-warning/10 text-warning'
    },
    {
      icon: Truck,
      title: 'Seller Ships',
      description: 'The seller ships the item with tracking. You can monitor the delivery status in real-time.',
      color: 'bg-primary/10 text-primary'
    },
    {
      icon: Package,
      title: 'Buyer Receives & Verifies',
      description: 'You receive the item and have 5 days to inspect and test it thoroughly.',
      color: 'bg-success/10 text-success'
    },
    {
      icon: CheckCircle2,
      title: 'Buyer Approves',
      description: 'If satisfied, you approve the transaction. If not, you can raise a dispute for a full refund.',
      color: 'bg-success/10 text-success'
    },
    {
      icon: DollarSign,
      title: 'Seller Gets Paid',
      description: 'Only after your approval, the funds are released from escrow to the seller.',
      color: 'bg-success/10 text-success'
    }
  ];

  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">How Escrow Works</h1>
          <p className="text-lg text-muted-foreground">
            Escrow is a financial arrangement where a third party holds and regulates payment 
            until both parties fulfill their obligations. Here's how it protects you on Trusty Trade.
          </p>
        </div>

        {/* Visual Timeline */}
        <div className="relative mb-12">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-6 mb-8 last:mb-0">
              <div className="flex flex-col items-center">
                <div className={`h-14 w-14 rounded-full ${step.color} flex items-center justify-center`}>
                  <step.icon className="h-7 w-7" />
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-full bg-border mt-2" />
                )}
              </div>
              <div className="flex-1 pb-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Step {index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-3">For Buyers</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Money protected until you verify
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Full refund if item doesn't match
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                No risk of losing money to scams
              </li>
            </ul>
          </div>

          <div className="bg-success/5 border border-success/20 rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-3">For Sellers</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Guaranteed payment after verification
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Protection from fraudulent claims
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Build trust with buyers
              </li>
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Common Questions</h3>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-foreground">What if I don't verify within 5 days?</p>
              <p className="text-muted-foreground text-sm mt-1">
                If you don't respond within the verification window, the payment is automatically 
                released to the seller. Make sure to verify or raise a dispute in time.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Is there a fee for escrow protection?</p>
              <p className="text-muted-foreground text-sm mt-1">
                A small 5% service fee is added to cover escrow protection and platform costs. 
                This ensures secure transactions for everyone.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">What happens during a dispute?</p>
              <p className="text-muted-foreground text-sm mt-1">
                Our team reviews the case, arranges a return pickup if needed, and processes 
                a full refund once the item is returned. Funds stay in escrow during this process.
              </p>
            </div>
          </div>
        </div>

        {/* External Link */}
        <div className="bg-muted rounded-xl p-6 mb-8">
          <p className="text-muted-foreground mb-2">
            Want to learn more about escrow services?
          </p>
          <a 
            href="https://en.wikipedia.org/wiki/Escrow" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            Read about Escrow on Wikipedia <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="text-center">
          <Link to="/">
            <Button size="lg">
              <Shield className="h-5 w-5 mr-2" />
              Start Shopping with Protection
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default HowEscrowWorks;
