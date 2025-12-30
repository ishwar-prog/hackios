import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProductStore, type NewProductInput } from '@/store/useProductStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useDraftProductStore } from '@/store/useDraftProductStore';
import { useToast } from '@/hooks/use-toast';
import { firestoreService } from '@/services/firestoreService';
import { compressImage } from '@/lib/imageCompression';
import { Upload, X, Camera, Shield, CheckCircle2, AlertCircle, Package, IndianRupee, LogIn } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const categories = [
  { value: 'Phones', label: 'Phones' },
  { value: 'Laptops', label: 'Laptops' },
  { value: 'Consoles', label: 'Consoles' },
  { value: 'Tablets', label: 'Tablets' },
  { value: 'Accessories', label: 'Accessories (Audio, Wearables)' },
  { value: 'TV', label: 'TV & Monitors' },
  { value: 'Cameras', label: 'Cameras' },
  { value: 'Kitchen', label: 'Kitchen Appliances' },
];

const conditions = [
  { value: 'excellent', label: 'Excellent - Like new, minimal signs of use' },
  { value: 'good', label: 'Good - Normal wear, fully functional' },
  { value: 'fair', label: 'Fair - Visible wear, works properly' },
  { value: 'poor', label: 'Poor - Heavy wear, may have issues' },
];

const Sell = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addProduct } = useProductStore();
  const { user, isAuthenticated, setRedirectIntent } = useAuthStore();
  const { notifyProductListed } = useNotificationStore();
  const { draft, images: draftImages, saveDraft, clearDraft, hasDraft } = useDraftProductStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState<NewProductInput>({
    name: '',
    category: '',
    brand: '',
    condition: 'good',
    price: 0,
    originalPrice: undefined,
    description: '',
    location: '',
    purchaseYear: '',
    usageDuration: '',
    warrantyRemaining: false,
    warrantyDuration: '',
    accessoriesIncluded: '',
    conditionNotes: '',
    images: []
  });

  useEffect(() => {
    if (hasDraft() && draft) {
      setFormData(prev => ({ ...prev, ...draft }));
      setImages(draftImages);
      toast({ title: "Draft Restored", description: "Your previous listing draft has been restored." });
    }
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // Process files with compression to avoid localStorage size limits
    for (const file of Array.from(files)) {
      try {
        // Compress image to max 800x800 at 70% quality (~50-100KB each)
        const compressedImage = await compressImage(file, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.7
        });
        setImages(prev => [...prev, compressedImage]);
      } catch (error) {
        console.error('Image compression failed:', error);
        toast({
          title: "Image Upload Failed",
          description: "Could not process the image. Please try a different file.",
          variant: "destructive"
        });
      }
    }
  };

  const removeImage = (index: number) => setImages(prev => prev.filter((_, i) => i !== index));

  const validateForm = (): boolean => {
    if (images.length === 0) {
      toast({ title: "Images Required", description: "Please upload at least one image.", variant: "destructive" });
      return false;
    }
    if (!formData.name || !formData.category || !formData.brand || !formData.price) {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!isAuthenticated) {
      saveDraft(formData, images);
      setShowAuthModal(true);
      return;
    }
    await submitProduct();
  };

  const submitProduct = async () => {
    setIsSubmitting(true);
    try {
      // Use Firestore service to create product
      const productData = {
        sellerId: user?.id || 'user-1',
        title: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        originalPrice: formData.originalPrice,
        condition: formData.condition,
        images: images, // In real app, these would be uploaded to Firebase Storage first
        specifications: {
          brand: formData.brand,
          location: formData.location,
          purchaseYear: formData.purchaseYear,
          usageDuration: formData.usageDuration,
          warrantyRemaining: formData.warrantyRemaining ? 'Yes' : 'No',
          warrantyDuration: formData.warrantyDuration,
          accessoriesIncluded: formData.accessoriesIncluded,
          conditionNotes: formData.conditionNotes
        },
        brand: formData.brand,
        model: formData.name, // Use name as model for now
        location: formData.location,
        status: 'listed' as const
      };

      // Create product in Firestore - this will throw if it fails
      const productId = await firestoreService.createProduct(productData);
      
      // Add product to local store for immediate UI update
      const product = addProduct({ ...formData, images }, user?.id || 'user-1', user?.name || 'User');
      
      // Notify about successful listing
      notifyProductListed(productId, formData.name);
      clearDraft();
      
      // Show SUCCESS toast (green) - only reached if Firestore operation succeeded
      toast({ 
        title: "Product Listed Successfully!", 
        description: "Your product is now live on the marketplace.",
        variant: "default" // This shows green success toast
      });
      
      navigate(`/product/${productId}`);
    } catch (error) {
      console.error('Product listing error:', error);
      // Show ERROR toast (red) only on actual failure
      toast({ 
        title: "Listing Failed", 
        description: error instanceof Error ? error.message : "Failed to list product. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    saveDraft(formData, images);
    setRedirectIntent({ type: 'sell' });
    setShowAuthModal(false);
    navigate('/login');
  };

  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Sell Your Product</h1>
          <p className="text-muted-foreground">List your electronics on ReBoxed with escrow protection.</p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-primary shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Escrow Protection for Sellers</h3>
              <p className="text-sm text-muted-foreground">Buyers pay upfront and funds are held securely. You get paid once the buyer verifies the product.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Product Images</h2>
              <span className="text-destructive">*</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                  <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"><X className="h-4 w-4" /></button>
                </div>
              ))}
              {images.length < 8 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground" /><span className="text-sm text-muted-foreground">Add Photo</span>
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            {images.length === 0 && <div className="flex items-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" />At least one image is required</div>}
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4"><Package className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold text-foreground">Product Details</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2"><Label htmlFor="name">Product Name *</Label><Input id="name" placeholder="e.g., iPhone 14 Pro Max 256GB" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1.5" /></div>
              <div><Label htmlFor="category">Category *</Label><Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map(cat => (<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>))}</SelectContent></Select></div>
              <div><Label htmlFor="brand">Brand *</Label><Input id="brand" placeholder="e.g., Apple, Samsung, Sony" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="mt-1.5" /></div>
              <div><Label htmlFor="condition">Condition *</Label><Select value={formData.condition} onValueChange={(value: 'excellent' | 'good' | 'fair' | 'poor') => setFormData({ ...formData, condition: value })}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Select condition" /></SelectTrigger><SelectContent>{conditions.map(cond => (<SelectItem key={cond.value} value={cond.value}>{cond.label}</SelectItem>))}</SelectContent></Select></div>
              <div><Label htmlFor="location">Location (City) *</Label><Input id="location" placeholder="e.g., Mumbai, Delhi" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="mt-1.5" /></div>
              <div className="md:col-span-2"><Label htmlFor="description">Description *</Label><Textarea id="description" placeholder="Describe your product in detail..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1.5 min-h-[100px]" /></div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label htmlFor="purchaseYear">Purchase Year</Label><Input id="purchaseYear" placeholder="e.g., 2023" value={formData.purchaseYear} onChange={(e) => setFormData({ ...formData, purchaseYear: e.target.value })} className="mt-1.5" /></div>
              <div><Label htmlFor="usageDuration">Usage Duration</Label><Input id="usageDuration" placeholder="e.g., 6 months" value={formData.usageDuration} onChange={(e) => setFormData({ ...formData, usageDuration: e.target.value })} className="mt-1.5" /></div>
              <div><Label htmlFor="warranty">Warranty Remaining</Label><Select value={formData.warrantyRemaining ? 'yes' : 'no'} onValueChange={(value) => setFormData({ ...formData, warrantyRemaining: value === 'yes' })}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></div>
              {formData.warrantyRemaining && <div><Label htmlFor="warrantyDuration">Warranty Duration</Label><Input id="warrantyDuration" placeholder="e.g., 6 months remaining" value={formData.warrantyDuration} onChange={(e) => setFormData({ ...formData, warrantyDuration: e.target.value })} className="mt-1.5" /></div>}
              <div className="md:col-span-2"><Label htmlFor="accessories">Accessories Included</Label><Input id="accessories" placeholder="e.g., Original charger, box, earphones" value={formData.accessoriesIncluded} onChange={(e) => setFormData({ ...formData, accessoriesIncluded: e.target.value })} className="mt-1.5" /></div>
              <div className="md:col-span-2"><Label htmlFor="conditionNotes">Detailed Condition Notes</Label><Textarea id="conditionNotes" placeholder="Any scratches, dents, or issues? Be honest." value={formData.conditionNotes} onChange={(e) => setFormData({ ...formData, conditionNotes: e.target.value })} className="mt-1.5" /></div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-2 mb-4"><IndianRupee className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold text-foreground">Pricing</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label htmlFor="price">Your Price (INR) *</Label><div className="relative mt-1.5"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span><Input id="price" type="number" min="1" placeholder="0" value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="pl-8" /></div><p className="text-sm text-muted-foreground mt-2">Escrow fee (5%) will be added for buyer protection.</p></div>
              <div><Label htmlFor="originalPrice">Original Price (INR) <span className="text-muted-foreground text-xs">(Optional)</span></Label><div className="relative mt-1.5"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span><Input id="originalPrice" type="number" min="1" placeholder="0" value={formData.originalPrice || ''} onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) || undefined })} className="pl-8" /></div><p className="text-sm text-muted-foreground mt-2">Show buyers the discount they're getting.</p></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="submit" size="lg" className="flex-1 bg-gradient-trust" disabled={isSubmitting}>{isSubmitting ? (<><div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Listing Product...</>) : (<><CheckCircle2 className="h-5 w-5" />List Product</>)}</Button>
            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/')}>Cancel</Button>
          </div>
        </form>
      </div>

      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><LogIn className="h-5 w-5 text-primary" />Sign In Required</DialogTitle><DialogDescription>You need to sign in to list your product. Don't worry, your listing details have been saved and will be restored after you sign in.</DialogDescription></DialogHeader>
          <div className="py-4"><div className="bg-muted/50 rounded-lg p-4"><p className="text-sm text-muted-foreground"><strong className="text-foreground">Your draft is saved:</strong> {formData.name || 'Untitled Product'}</p></div></div>
          <DialogFooter className="gap-2"><Button variant="outline" onClick={() => setShowAuthModal(false)}>Cancel</Button><Button onClick={handleLoginRedirect}><LogIn className="h-4 w-4 mr-2" />Sign In to Continue</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Sell;
