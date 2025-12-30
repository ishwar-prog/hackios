import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useOrderStore } from '@/store/useOrderStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { 
  Shield, AlertTriangle, Timer, ChevronLeft, Upload, X, CheckCircle2, XCircle, Camera
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VerificationItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
}

const Verification = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getOrder, verifyOrder, updateOrderStatus, calculateVerificationTimeLeft, loading } = useOrderStore();
  const { addNotification } = useNotificationStore();
  
  const order = getOrder(id || '');

  // Verification checklist state
  const [checklist, setChecklist] = useState<VerificationItem[]>([
    { id: 'working', label: 'Device is working properly', description: 'All functions tested and operational', checked: false },
    { id: 'physical', label: 'Physical condition matches description', description: 'No undisclosed damage or wear', checked: false },
    { id: 'accessories', label: 'All accessories included', description: 'Charger, cables, box as listed', checked: false },
    { id: 'authentic', label: 'Product is authentic', description: 'Not counterfeit or refurbished (if sold as new)', checked: false },
  ]);

  // Reference images state (mandatory)
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState('');

  if (!order) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Order Not Found</h1>
          <Link to="/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const daysLeft = calculateVerificationTimeLeft(order);
  const allChecked = checklist.every(item => item.checked);
  const hasImages = referenceImages.length > 0;

  const handleChecklistChange = (itemId: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImages(prev => [...prev, reader.result as string]);
        setImageError('');
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmPurchase = async () => {
    // Validate images
    if (!hasImages) {
      setImageError('Please upload at least one reference image');
      toast({
        title: "Images Required",
        description: "Please upload reference images to confirm your purchase.",
        variant: "destructive",
      });
      return;
    }

    // Validate checklist
    if (!allChecked) {
      toast({
        title: "Complete Checklist",
        description: "Please verify all items before confirming.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await verifyOrder(order.id);
      
      // Add notification for successful verification
      addNotification({
        type: 'order',
        title: 'Purchase Confirmed',
        message: `You have confirmed ${order.product.name}. Payment released to seller.`,
        orderId: order.id,
        priority: 'high',
        actionUrl: '/orders'
      });

      toast({
        title: "Purchase Confirmed!",
        description: "Payment has been released to the seller. Thank you!",
      });
      navigate('/orders');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm purchase. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectPurchase = () => {
    // Validate images for rejection too
    if (!hasImages) {
      setImageError('Please upload reference images showing the issue');
      toast({
        title: "Images Required",
        description: "Please upload images showing the problem before rejecting.",
        variant: "destructive",
      });
      return;
    }

    // Update status to verification_pending (not auto-remove)
    updateOrderStatus(order.id, 'disputed');
    
    // Add notification
    addNotification({
      type: 'dispute',
      title: 'Verification Rejected',
      message: `You have rejected ${order.product.name}. Please raise a dispute for resolution.`,
      orderId: order.id,
      priority: 'high',
      actionUrl: `/dispute/${order.id}`
    });

    toast({
      title: "Purchase Rejected",
      description: "Please proceed to raise a dispute for resolution.",
    });
    navigate(`/dispute/${order.id}`);
  };

  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8 max-w-3xl">
        {/* Back Button */}
        <Link 
          to="/orders"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to orders
        </Link>

        {/* Warning Banner */}
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
              <Timer className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="font-bold text-warning text-lg">
                {daysLeft !== null ? `${daysLeft} days left to verify this product` : 'Verification period active'}
              </p>
              <p className="text-sm text-warning/80 mt-1">
                Please complete your verification before the deadline. If you don't respond, 
                payment will be automatically released to the seller.
              </p>
            </div>
          </div>
        </div>

        {/* Product Summary */}
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <div className="flex gap-4">
            <img
              src={order.product.image}
              alt={order.product.name}
              className="h-20 w-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">{order.product.name}</h2>
              <p className="text-sm text-muted-foreground">
                {order.product.condition} • Order ID: {order.id}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="escrow-badge">
                  <Shield className="h-3 w-3" />
                  Funds in Escrow: ₹{order.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Verification Checklist */}
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Verification Checklist (Required)
          </h3>
          <div className="space-y-4">
            {checklist.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={() => handleChecklistChange(item.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {item.checked && <CheckCircle2 className="h-5 w-5 text-success" />}
              </label>
            ))}
          </div>
        </div>

        {/* Mandatory Reference Image Upload */}
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Reference Images (Required)
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload photos of the product as received. This is mandatory for verification.
          </p>

          {/* Image Preview Grid */}
          {referenceImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {referenceImages.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                  <img src={img} alt={`Reference ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              imageError ? 'border-destructive bg-destructive/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG up to 10MB (multiple allowed)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          {imageError && (
            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {imageError}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            size="lg"
            variant="trust"
            onClick={handleConfirmPurchase}
            disabled={loading || !allChecked || !hasImages}
            className="w-full"
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Confirm Purchase
          </Button>
          <Button
            size="lg"
            variant="destructive"
            onClick={handleRejectPurchase}
            disabled={loading}
            className="w-full"
          >
            <XCircle className="h-5 w-5 mr-2" />
            Reject Purchase
          </Button>
        </div>

        {/* What Happens Next */}
        <div className="bg-secondary rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">What happens next?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                <Shield className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">If you confirm</p>
                <p className="text-xs text-muted-foreground">
                  Payment is instantly released to the seller. Transaction complete!
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-danger/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4 text-danger" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">If you reject</p>
                <p className="text-xs text-muted-foreground">
                  Order stays in "Verification Pending". Raise a dispute for resolution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Verification;
