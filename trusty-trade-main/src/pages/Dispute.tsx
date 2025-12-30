import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useOrderStore } from '@/store/useOrderStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { 
  Shield, ChevronLeft, Upload, AlertTriangle, CheckCircle2, X, Camera
} from 'lucide-react';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

const issueCategories = [
  { value: 'wrong-item', label: 'Wrong item received' },
  { value: 'not-as-described', label: 'Not as described' },
  { value: 'damaged', label: 'Item is damaged' },
  { value: 'not-working', label: 'Item is not working' },
];

const Dispute = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getOrder, updateOrderStatus } = useOrderStore();
  const { notifyDisputeRaised, notifyDisputeReceived } = useNotificationStore();
  
  const order = getOrder(id || '');

  const [issueCategory, setIssueCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // MANDATORY: Evidence images
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidenceImages(prev => [...prev, reader.result as string]);
        setImageError('');
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setEvidenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Validate category
    if (!issueCategory) {
      toast({
        title: "Select Issue Category",
        description: "Please select what's wrong with the item.",
        variant: "destructive",
      });
      return;
    }

    // Validate description
    if (!description || description.length < 20) {
      toast({
        title: "Describe the Issue",
        description: "Please provide a detailed description (at least 20 characters).",
        variant: "destructive",
      });
      return;
    }

    // MANDATORY: Validate images
    if (evidenceImages.length === 0) {
      setImageError('Evidence images are required to raise a dispute');
      toast({
        title: "Images Required",
        description: "Please upload at least one photo showing the issue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      // Update order status to disputed
      updateOrderStatus(order.id, 'disputed');
      
      // Trigger notifications
      notifyDisputeRaised(order.id, order.product.name);
      notifyDisputeReceived(order.id, order.product.name); // Seller notification
      
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <Layout showTrustBanner={false}>
        <div className="container py-16 max-w-xl text-center">
          <div className="bg-card rounded-2xl border border-border p-8">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Dispute Submitted Successfully
            </h1>
            <p className="text-muted-foreground mb-6">
              Your dispute has been logged with {evidenceImages.length} evidence image(s). Our team will review your case and arrange a return pickup within 24-48 hours.
            </p>
            
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 justify-center">
                <Shield className="h-5 w-5 text-primary" />
                <p className="font-semibold text-foreground">
                  Your funds remain protected in escrow
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Your ₹{order.amount.toLocaleString()} is safely held until the dispute is resolved. 
                You'll receive a full refund once the return is processed.
              </p>
            </div>

            <Link to="/orders">
              <Button size="lg" className="w-full">
                Return to My Orders
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8 max-w-2xl">
        {/* Back Button */}
        <Link 
          to={`/verify/${order.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to verification
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Raise a Dispute
          </h1>
          <p className="text-muted-foreground">
            Tell us what went wrong and we'll help resolve it
          </p>
        </div>

        {/* Product Summary */}
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <div className="flex gap-4">
            <img
              src={order.product.image}
              alt={order.product.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
            <div>
              <h2 className="font-semibold text-foreground">{order.product.name}</h2>
              <p className="text-sm text-muted-foreground">Order ID: {order.id}</p>
            </div>
          </div>
        </div>

        {/* Dispute Form */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-5">
          {/* Issue Category */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              What's wrong with this item? *
            </label>
            <Select value={issueCategory} onValueChange={setIssueCategory}>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Select an issue category" />
              </SelectTrigger>
              <SelectContent>
                {issueCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Describe the issue in detail *
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please explain what's wrong with the product, including any specific details that would help us understand the issue..."
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/20 characters minimum
            </p>
          </div>

          {/* MANDATORY Image Upload */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Upload Evidence Photos (Required) *
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              You must upload at least one photo showing the issue to submit a dispute.
            </p>

            {/* Image Preview Grid */}
            {evidenceImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {evidenceImages.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={img} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
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

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                imageError ? 'border-destructive bg-destructive/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 10MB (multiple photos allowed)
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
            {evidenceImages.length > 0 && (
              <p className="text-sm text-success mt-2">
                ✓ {evidenceImages.length} image(s) uploaded
              </p>
            )}
          </div>
        </div>

        {/* Escrow Protection Notice */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">
                Your funds remain protected in escrow
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Once you submit this dispute, we'll arrange a return pickup. 
                Your full payment of ₹{order.amount.toLocaleString()} will be refunded after the item is returned.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          size="xl"
          variant="destructive"
          className="w-full mt-6"
          onClick={handleSubmit}
          disabled={isSubmitting || evidenceImages.length === 0}
        >
          {isSubmitting ? (
            <>
              <div className="h-5 w-5 border-2 border-danger-foreground/30 border-t-danger-foreground rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5" />
              Raise Dispute & Request Refund
            </>
          )}
        </Button>
      </div>
    </Layout>
  );
};

export default Dispute;
