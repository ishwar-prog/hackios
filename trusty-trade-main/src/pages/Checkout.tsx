import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EscrowTimeline } from '@/components/shared/EscrowTimeline';
import { useProductStore } from '@/store/useProductStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useEscrowStore } from '@/store/useEscrowStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useWalletStore } from '@/store/useWalletStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useToast } from '@/hooks/use-toast';
import { paymentService } from '@/services/paymentService';
import { ChevronLeft, Shield, Wallet, CheckCircle2, Lock, AlertTriangle, AlertCircle } from 'lucide-react';

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Product details form state (numeric inputs)
  const [purchaseYear, setPurchaseYear] = useState('');
  const [usageDuration, setUsageDuration] = useState('');
  const [warrantyDuration, setWarrantyDuration] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { getProduct, deleteProduct } = useProductStore();
  const { formatPrice } = useCurrencyStore();
  const { createOrder } = useOrderStore();
  const { createEscrowAccount } = useEscrowStore();
  const { isAuthenticated, user, setRedirectIntent } = useAuthStore();
  const { balance, debitForPurchase } = useWalletStore();
  const { notifyOrderPlaced, notifyPaymentSuccess, notifyEscrowHeld } = useNotificationStore();
  
  const product = id ? getProduct(id) : null;
  
  // CRITICAL: Self-purchase guard - check if user owns this product
  const isOwnProduct = product && user?.id === product.sellerId;

  // Check auth on mount - if not authenticated, redirect to login with intent
  useEffect(() => {
    if (!isAuthenticated && id) {
      setRedirectIntent({ type: 'checkout', productId: id });
      toast({
        title: "Login Required",
        description: "Please sign in to proceed with checkout.",
      });
      navigate('/login');
    }
  }, [isAuthenticated, id, setRedirectIntent, navigate, toast]);

  // HARD RULE: Redirect if trying to buy own product
  useEffect(() => {
    if (isAuthenticated && isOwnProduct) {
      toast({
        title: "Cannot Purchase Own Product",
        description: "You cannot buy your own listing.",
        variant: "destructive",
      });
      navigate(`/product/${id}`);
    }
  }, [isAuthenticated, isOwnProduct, id, navigate, toast]);

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Block checkout for own products
  if (isOwnProduct) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Cannot Purchase Own Product</h1>
          <p className="text-muted-foreground mb-6">You cannot buy your own listing.</p>
          <Link to="/"><Button>Back to Browse</Button></Link>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <Link to="/"><Button>Back to Browse</Button></Link>
        </div>
      </Layout>
    );
  }

  const serviceFee = paymentService.calculateServiceFee(product.price);
  const total = paymentService.calculateTotal(product.price);
  const hasInsufficientBalance = balance < total;

  // Validate numeric inputs
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const currentYear = new Date().getFullYear();

    // Purchase Year validation (YYYY format, numbers only)
    if (!purchaseYear) {
      errors.purchaseYear = 'Purchase year is required';
    } else if (!/^\d{4}$/.test(purchaseYear)) {
      errors.purchaseYear = 'Enter a valid 4-digit year';
    } else {
      const year = parseInt(purchaseYear);
      if (year < 2000 || year > currentYear) {
        errors.purchaseYear = `Year must be between 2000 and ${currentYear}`;
      }
    }

    // Usage Duration validation (months, numbers only)
    if (!usageDuration) {
      errors.usageDuration = 'Usage duration is required';
    } else if (!/^\d+$/.test(usageDuration)) {
      errors.usageDuration = 'Enter numbers only (months)';
    } else {
      const months = parseInt(usageDuration);
      const maxMonths = (currentYear - parseInt(purchaseYear || '2000')) * 12 + 12;
      if (months < 0 || months > maxMonths) {
        errors.usageDuration = `Usage cannot exceed product age (${maxMonths} months max)`;
      }
    }

    // Warranty Duration validation (months, numbers only)
    if (!warrantyDuration) {
      errors.warrantyDuration = 'Warranty duration is required';
    } else if (!/^\d+$/.test(warrantyDuration)) {
      errors.warrantyDuration = 'Enter numbers only (months)';
    } else {
      const warranty = parseInt(warrantyDuration);
      if (warranty < 0 || warranty > 60) {
        errors.warrantyDuration = 'Warranty must be 0-60 months';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = async () => {
    if (!product) return;

    // Validate form first
    if (!validateForm()) {
      toast({
        title: "Invalid Input",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    // Check wallet balance
    if (hasInsufficientBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You need ₹${total.toLocaleString()} but have ₹${balance.toLocaleString()}. Please add funds to your wallet.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      // Create order first
      const order = await createOrder(product.id, total);
      
      // Process wallet payment
      const paymentSuccess = debitForPurchase(total, order.id, product.name);
      
      if (!paymentSuccess) {
        throw new Error('Payment failed');
      }
      
      // Create escrow account
      createEscrowAccount(order.id, total);
      
      // Remove product from browse (post-purchase)
      deleteProduct(product.id);
      
      // Trigger notifications
      notifyOrderPlaced(order.id, product.name, total);
      notifyPaymentSuccess(order.id, total);
      notifyEscrowHeld(order.id, total);
      
      toast({
        title: "Payment Secured!",
        description: "Your funds are now held in escrow. The seller has been notified.",
      });
      
      navigate('/orders');
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8 max-w-5xl">
        <Link to={`/product/${product.id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ChevronLeft className="h-4 w-4" />Back to product
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Secure Escrow Checkout</h1>
              <p className="text-muted-foreground">Your payment is protected until you verify the product</p>
            </div>

            {/* Order Summary */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-semibold text-foreground mb-4">Order Summary</h2>
              <div className="flex gap-4">
                <img src={product.image} alt={product.name} className="h-20 w-20 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.condition} • {product.category}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="escrow-badge"><Shield className="h-3 w-3" />Escrow Protected</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">{formatPrice(product.price)}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Product price</span>
                  <span className="text-foreground">{formatPrice(product.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Escrow service fee</span>
                  <span className="text-foreground">{formatPrice(serviceFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-success font-medium">FREE</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method - WALLET ONLY */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-semibold text-foreground mb-4">Payment Method</h2>
              
              {/* Wallet Balance Display */}
              <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${hasInsufficientBalance ? 'border-destructive bg-destructive/5' : 'border-primary bg-primary/5'}`}>
                <Wallet className={`h-6 w-6 ${hasInsufficientBalance ? 'text-destructive' : 'text-primary'}`} />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Wallet Balance</p>
                  <p className={`text-lg font-bold ${hasInsufficientBalance ? 'text-destructive' : 'text-success'}`}>
                    {formatPrice(balance)}
                  </p>
                </div>
                {!hasInsufficientBalance && (
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>

              {hasInsufficientBalance && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">Insufficient Balance</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You need {formatPrice(total)} but have {formatPrice(balance)}. 
                        Please add {formatPrice(total - balance)} to your wallet.
                      </p>
                      <Link to="/wallet">
                        <Button variant="outline" size="sm" className="mt-3">
                          Add Funds to Wallet
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Details - Numeric Inputs */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="font-semibold text-foreground mb-4">Product Details (Required)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="purchaseYear">Purchase Year (YYYY)</Label>
                  <Input
                    id="purchaseYear"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="2023"
                    value={purchaseYear}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setPurchaseYear(val);
                    }}
                    className={`mt-1.5 ${formErrors.purchaseYear ? 'border-destructive' : ''}`}
                  />
                  {formErrors.purchaseYear && (
                    <p className="text-xs text-destructive mt-1">{formErrors.purchaseYear}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="usageDuration">Usage Duration (months)</Label>
                  <Input
                    id="usageDuration"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="12"
                    value={usageDuration}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setUsageDuration(val);
                    }}
                    className={`mt-1.5 ${formErrors.usageDuration ? 'border-destructive' : ''}`}
                  />
                  {formErrors.usageDuration && (
                    <p className="text-xs text-destructive mt-1">{formErrors.usageDuration}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="warrantyDuration">Warranty Remaining (months)</Label>
                  <Input
                    id="warrantyDuration"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="6"
                    value={warrantyDuration}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setWarrantyDuration(val);
                    }}
                    className={`mt-1.5 ${formErrors.warrantyDuration ? 'border-destructive' : ''}`}
                  />
                  {formErrors.warrantyDuration && (
                    <p className="text-xs text-destructive mt-1">{formErrors.warrantyDuration}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Escrow Info */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-trust flex items-center justify-center shrink-0">
                  <Lock className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Seller cannot access funds without your approval</p>
                  <p className="text-sm text-muted-foreground mt-1">Your payment will be held securely in escrow until you verify the product. You have 5 days after delivery to test and approve.</p>
                </div>
              </div>
            </div>

            <Button size="xl" variant="trust" className="w-full" onClick={handlePayment} disabled={isProcessing || hasInsufficientBalance}>
              {isProcessing ? (<><div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Processing...</>) : hasInsufficientBalance ? (<><AlertCircle className="h-5 w-5" />Insufficient Wallet Balance</>) : (<><Wallet className="h-5 w-5" />Pay {formatPrice(total)} from Wallet</>)}
            </Button>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-card rounded-xl border border-border p-5">
              <h2 className="font-semibold text-foreground mb-6">Money Held in Escrow — How It Works</h2>
              <EscrowTimeline currentStep={0} variant="checkout" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
