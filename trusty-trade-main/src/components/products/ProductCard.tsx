import { Link } from 'react-router-dom';
import { Shield, PackageOpen, RotateCcw, Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductStore } from '@/store/useProductStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
}

const conditionColors = {
  'excellent': 'bg-emerald-400 text-black border-emerald-500',
  'good': 'bg-sky-400 text-black border-sky-500',
  'fair': 'bg-amber-400 text-black border-amber-500',
  'poor': 'bg-gray-400 text-black border-gray-500',
  'New': 'bg-emerald-400 text-black border-emerald-500',
  'Like New': 'bg-sky-400 text-black border-sky-500',
  'Good': 'bg-amber-400 text-black border-amber-500',
  'Fair': 'bg-gray-400 text-black border-gray-500',
};

const conditionDisplay = {
  'excellent': 'New',
  'good': 'Like New',
  'fair': 'Good',
  'poor': 'Fair',
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { formatPrice } = useCurrencyStore();
  const { deleteProduct } = useProductStore();
  const { addNotification } = useNotificationStore();
  
  // CRITICAL: Ownership check - product.sellerId === auth.user.id
  const isOwnProduct = user?.id === product.sellerId;
  const inWishlist = isInWishlist(product.id);

  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOwnProduct) {
      toast({
        title: "Cannot wishlist own product",
        description: "You cannot add your own products to wishlist.",
        variant: "destructive"
      });
      return;
    }
    
    toggleWishlist(product.id);
    toast({
      title: inWishlist ? "Removed from Wishlist" : "Added to Wishlist",
      description: inWishlist 
        ? `${product.name} removed from your wishlist.`
        : `${product.name} added to your wishlist.`,
    });
  };

  const handleDeleteProduct = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    deleteProduct(product.id);
    
    // Trigger real notification for product deletion
    addNotification({
      type: 'product',
      title: 'Product Removed',
      message: `Your product '${product.name}' has been removed successfully.`,
      productId: product.id,
      priority: 'medium',
    });
    
    toast({
      title: "Listing Removed",
      description: `Your product '${product.name}' has been removed successfully.`,
    });
  };

  return (
    <div className="card-elevated group overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-danger text-danger-foreground text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </div>
        )}
        <Badge 
          variant="outline" 
          className={`absolute top-3 right-3 ${conditionColors[product.condition]}`}
        >
          {conditionDisplay[product.condition] || product.condition}
        </Badge>
        
        {/* Owner badge */}
        {isOwnProduct && (
          <Badge className="absolute bottom-3 left-3 bg-warning text-warning-foreground">
            Your Listing
          </Badge>
        )}
        
        {/* Wishlist Button - Hidden for own products */}
        {!isOwnProduct && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleWishlistClick}
                className={`absolute bottom-3 right-3 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  inWishlist 
                    ? 'bg-destructive shadow-lg scale-100' 
                    : 'bg-card/80 backdrop-blur-sm border-2 border-border hover:border-destructive hover:bg-destructive/10'
                }`}
              >
                <Heart 
                  className={`h-5 w-5 transition-all duration-300 ${
                    inWishlist 
                      ? 'text-white fill-white scale-110' 
                      : 'text-muted-foreground group-hover:text-destructive'
                  }`} 
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Trust Badges */}
        <div className="flex flex-wrap gap-1.5">
          {product.escrowProtected && (
            <span className="escrow-badge">
              <Shield className="h-3 w-3" />
              Escrow
            </span>
          )}
          {product.openBoxDelivery && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              <PackageOpen className="h-3 w-3" />
              Open-Box
            </span>
          )}
          {product.returnEligible && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              <RotateCcw className="h-3 w-3" />
              Returns
            </span>
          )}
        </div>

        {/* Product Info */}
        <div>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-foreground line-clamp-2 leading-snug hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* CTA - Different for owner vs buyer */}
        {isOwnProduct ? (
          <div className="flex gap-2">
            <Button asChild className="flex-1" variant="outline">
              <Link to={`/product/${product.id}`}>View</Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
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
          </div>
        ) : (
          <Button asChild className="w-full" variant="trust">
            <Link to={`/product/${product.id}`}>View Details</Link>
          </Button>
        )}
      </div>
    </div>
  );
};
