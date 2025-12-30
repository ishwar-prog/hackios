import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SellerReputationPanel } from '@/components/shared/SellerReputationPanel';
import { EscrowExplanationPanel } from '@/components/shared/EscrowExplanationPanel';
import { useProductStore } from '@/store/useProductStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, PackageOpen, RotateCcw, ChevronRight, 
  CheckCircle2, Truck, Package, Clock, Heart,
  Flag, AlertTriangle, ChevronLeft, Star, MessageCircle, Send, Trash2
} from 'lucide-react';
import { useState } from 'react';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReportStore } from '@/store/useReportStore';

const conditionColors: Record<string, string> = {
  'excellent': 'bg-emerald-400 text-black border-emerald-500',
  'good': 'bg-sky-400 text-black border-sky-500',
  'fair': 'bg-amber-400 text-black border-amber-500',
  'poor': 'bg-gray-400 text-black border-gray-500',
};

const conditionDisplay: Record<string, string> = {
  'excellent': 'New', 'good': 'Like New', 'fair': 'Good', 'poor': 'Fair',
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getProduct, rateSeller, deleteProduct } = useProductStore();
  const { formatPrice } = useCurrencyStore();
  const { user, isAuthenticated, setRedirectIntent } = useAuthStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { submitReport } = useReportStore();
  const { addNotification } = useNotificationStore();
  
  const product = getProduct(id || '');
  const [selectedImage, setSelectedImage] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{text: string; sender: 'user' | 'seller'; time: Date}[]>([]);

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

  // CRITICAL: Ownership check - product.sellerId === auth.user.id
  const isOwnProduct = user?.id === product.sellerId;
  const inWishlist = isInWishlist(product.id);
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const images = product.images?.length > 1 ? product.images : [product.image, product.image, product.image];

  const handleWishlistClick = () => {
    if (isOwnProduct) { toast({ title: "Cannot wishlist own product", variant: "destructive" }); return; }
    toggleWishlist(product.id);
    toast({ title: inWishlist ? "Removed from Wishlist" : "Added to Wishlist" });
  };

  const handleReportSeller = () => {
    if (!reportReason || !reportDescription) { toast({ title: "Missing Information", variant: "destructive" }); return; }
    submitReport({ reporterId: user?.id || 'buyer-1', reporterName: user?.name || 'Anonymous', reportedUserId: product.sellerId, reportedUserName: product.seller.name, reportedUserType: 'seller', reason: reportReason as any, description: reportDescription, evidence: [], productId: product.id });
    toast({ title: "Report Submitted" });
    setReportDialogOpen(false); setReportReason(''); setReportDescription('');
  };

  const handleRateSeller = () => {
    if (selectedRating === 0) { toast({ title: "Select Rating", variant: "destructive" }); return; }
    rateSeller(product.id, selectedRating);
    toast({ title: "Rating Submitted", description: `You rated ${product.seller.name} ${selectedRating} stars.` });
    setRatingDialogOpen(false); setSelectedRating(0);
  };

  const handleBuyClick = () => {
    // HARD RULE: Prevent self-purchase
    if (isOwnProduct) { 
      toast({ title: "Cannot buy own product", description: "You cannot purchase your own listing.", variant: "destructive" }); 
      return; 
    }
    
    // If not authenticated, redirect to login with checkout intent
    if (!isAuthenticated) {
      setRedirectIntent({ type: 'checkout', productId: product.id });
      toast({ title: "Login Required", description: "Please sign in to proceed with checkout." });
      navigate('/login');
      return;
    }
    
    navigate(`/checkout/${product.id}`);
  };

  // Owner action: Delete product
  const handleDeleteProduct = () => {
    deleteProduct(product.id);
    
    // Trigger real notification
    addNotification({
      type: 'product',
      title: 'Product Removed',
      message: `Your product '${product.name}' has been removed successfully.`,
      productId: product.id,
      priority: 'medium',
    });
    
    toast({ title: "Listing Removed", description: `Your product '${product.name}' has been removed successfully.` });
    navigate('/');
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatMessages(prev => [...prev, { text: chatMessage, sender: 'user', time: new Date() }]);
    setChatMessage('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, { text: "Thanks for your message! I'll get back to you shortly.", sender: 'seller', time: new Date() }]);
    }, 1500);
  };

  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4" /><span>{product.category}</span>
          <ChevronRight className="h-4 w-4" /><span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted relative">
              <img src={images[selectedImage]} alt={product.name} className="h-full w-full object-cover" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setSelectedImage(p => p > 0 ? p - 1 : images.length - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-card/90 backdrop-blur-sm border-2 border-primary flex items-center justify-center shadow-lg hover:bg-primary group transition-colors">
                    <ChevronLeft className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                  </button>
                  <button onClick={() => setSelectedImage(p => p < images.length - 1 ? p + 1 : 0)} className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-card/90 backdrop-blur-sm border-2 border-primary flex items-center justify-center shadow-lg hover:bg-primary group transition-colors">
                    <ChevronRight className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, i) => (<button key={i} onClick={() => setSelectedImage(i)} className={`h-2 rounded-full transition-all ${selectedImage === i ? 'w-6 bg-primary' : 'w-2 bg-white/60 hover:bg-white'}`} />))}
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (<button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 ${selectedImage === i ? 'border-primary' : 'border-transparent hover:border-border'}`}><img src={img} alt="" className="h-full w-full object-cover" /></button>))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className="trust-badge"><Shield className="h-3.5 w-3.5" />Escrow Protected</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"><PackageOpen className="h-3.5 w-3.5" />Open-Box</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"><RotateCcw className="h-3.5 w-3.5" />Returns</span>
            </div>

            <div>
              <Badge variant="outline" className={`mb-2 ${conditionColors[product.condition]}`}>{conditionDisplay[product.condition] || product.condition}</Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{product.name}</h1>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-foreground">{formatPrice(product.price)}</span>
              {product.originalPrice && (<><span className="text-xl text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span><Badge className="bg-danger text-danger-foreground">Save {discount}%</Badge></>)}
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="bg-secondary rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-sm font-bold text-primary">{product.seller.name.charAt(0)}</span></div>
                  <div>
                    <p className="font-medium text-foreground">{product.seller.name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground"><Star className="h-4 w-4 fill-warning text-warning" /><span>{product.seller.rating}</span><span>•</span><span>{product.seller.totalSales} sales</span></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    if (!isAuthenticated) {
                      toast({ title: "Login Required", description: "Please sign in to chat with the seller.", variant: "destructive" });
                      navigate('/login');
                      return;
                    }
                    setChatOpen(true);
                  }} disabled={isOwnProduct}><MessageCircle className="h-4 w-4 mr-1" />Chat</Button>
                  <Dialog open={ratingDialogOpen} onOpenChange={(open) => {
                    if (open && !isAuthenticated) {
                      toast({ title: "Login Required", description: "Please sign in to rate the seller.", variant: "destructive" });
                      navigate('/login');
                      return;
                    }
                    setRatingDialogOpen(open);
                  }}>
                    <DialogTrigger asChild><Button variant="outline" size="sm"><Star className="h-4 w-4 mr-1" />Rate</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Rate Seller</DialogTitle><DialogDescription>How was your experience with {product.seller.name}?</DialogDescription></DialogHeader>
                      <div className="py-6">
                        <div className="flex justify-center gap-2">
                          {[1,2,3,4,5].map(star => (<button key={star} onClick={() => setSelectedRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="p-1 hover:scale-110 transition-transform"><Star className={`h-10 w-10 ${star <= (hoverRating || selectedRating) ? 'fill-warning text-warning' : 'text-muted-foreground'}`} /></button>))}
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-4">{selectedRating > 0 ? `${selectedRating} star${selectedRating > 1 ? 's' : ''}` : 'Select a rating'}</p>
                      </div>
                      <Button onClick={handleRateSeller} className="w-full">Submit Rating</Button>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                    <DialogTrigger asChild><Button variant="ghost" size="sm"><Flag className="h-4 w-4" /></Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Report Seller</DialogTitle><DialogDescription>Report {product.seller.name} for violating rules.</DialogDescription></DialogHeader>
                      <div className="space-y-4 py-4">
                        <div><label className="text-sm font-medium mb-2 block">Reason</label><Select value={reportReason} onValueChange={setReportReason}><SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger><SelectContent><SelectItem value="scam">Scam / Fraud</SelectItem><SelectItem value="fake_product">Fake Product</SelectItem><SelectItem value="harassment">Harassment</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
                        <div><label className="text-sm font-medium mb-2 block">Description</label><Textarea placeholder="Describe the issue..." value={reportDescription} onChange={e => setReportDescription(e.target.value)} /></div>
                        <Button onClick={handleReportSeller} className="w-full">Submit Report</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            <div className="bg-secondary rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-3">Specifications</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(product.specifications).map(([key, value]) => (<div key={key} className="flex justify-between col-span-2 sm:col-span-1 py-1 border-b border-border last:border-0"><dt className="text-muted-foreground">{key}</dt><dd className="font-medium text-foreground">{value}</dd></div>))}
              </dl>
            </div>

            <div className="flex gap-3">
              {isOwnProduct ? (
                /* Owner controls: Show delete button instead of buy */
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="xl" variant="destructive" className="flex-1">
                        <Trash2 className="h-5 w-5 mr-2" />
                        Remove Listing
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Listing?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove "{product.name}" from the marketplace. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteProduct}>
                          Remove Listing
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button size="xl" variant="outline" asChild>
                    <Link to="/seller">Manage Listings</Link>
                  </Button>
                </>
              ) : (
                /* Buyer controls: Show buy button */
                <>
                  <Button size="xl" variant="trust" className="flex-1" onClick={handleBuyClick}>
                    <Shield className="h-5 w-5 mr-2" />
                    Proceed to Secure Checkout
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="xl" variant="outline" onClick={handleWishlistClick} className={inWishlist ? 'text-destructive' : ''}>
                        <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{inWishlist ? "Remove" : "Add to wishlist"}</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>

            {isOwnProduct && (
              <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <p className="text-sm text-warning font-medium">This is your listing</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  You cannot purchase your own product. Manage your listings from the <Link to="/seller" className="text-primary hover:underline">Seller Dashboard</Link>.
                </p>
              </div>
            )}

            <Accordion type="single" collapsible><AccordionItem value="process" className="border-border"><AccordionTrigger className="text-sm font-medium">What happens after I buy?</AccordionTrigger><AccordionContent><div className="space-y-3 pt-2">{[{n:'1',t:'Your payment is held securely in escrow'},{n:'2',t:'Seller ships with open-box delivery'},{n:'3',t:'You inspect and verify the product'}].map(s=>(<div key={s.n} className="flex items-start gap-3"><div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><span className="text-xs font-bold text-primary">{s.n}</span></div><p className="text-sm text-muted-foreground">{s.t}</p></div>))}<div className="flex items-start gap-3"><div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center shrink-0"><CheckCircle2 className="h-3.5 w-3.5 text-success" /></div><p className="text-sm text-muted-foreground">Approve to release payment, or dispute for refund.</p></div></div></AccordionContent></AccordionItem></Accordion>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12"><SellerReputationPanel seller={product.seller} /><EscrowExplanationPanel /></div>

        <div className="mt-8 bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4"><PackageOpen className="h-5 w-5 text-primary" /><h3 className="font-semibold text-foreground">Open-Box Delivery</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{icon:Truck,title:'Inspect at Delivery',desc:'Open and check with delivery agent'},{icon:Package,title:'Verification Window',desc:'5 days to test and verify'},{icon:Clock,title:'Take Your Time',desc:'Funds protected until you confirm'}].map(item=>(<div key={item.title} className="flex items-start gap-3"><div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0"><item.icon className="h-5 w-5 text-primary" /></div><div><p className="font-medium text-foreground text-sm">{item.title}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div></div>))}
          </div>
        </div>
      </div>

      {/* Chat with Seller Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-primary" />Chat with {product.seller.name}</DialogTitle></DialogHeader>
          <div className="h-64 overflow-y-auto space-y-3 p-2 bg-muted/50 rounded-lg">
            {chatMessages.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">Start a conversation with the seller</p>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="Type a message..." value={chatMessage} onChange={e => setChatMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} className="flex-1 px-4 py-2 border border-border rounded-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            <Button size="icon" className="rounded-full" onClick={handleSendMessage} disabled={!chatMessage.trim()}><Send className="h-4 w-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProductDetail;
