import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useProductStore } from '@/store/useProductStore';
import { Heart, Trash2, ShoppingCart, Shield } from 'lucide-react';

const conditionColors = {
  'excellent': 'bg-emerald-400 text-black border-emerald-500',
  'good': 'bg-sky-400 text-black border-sky-500',
  'fair': 'bg-amber-400 text-black border-amber-500',
  'poor': 'bg-gray-400 text-black border-gray-500',
};

const Wishlist = () => {
  const { items, removeFromWishlist, clearWishlist } = useWishlistStore();
  const { getProduct } = useProductStore();

  const wishlistProducts = items
    .map(id => getProduct(id))
    .filter(Boolean);

  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Wishlist</h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          {items.length > 0 && (
            <Button variant="outline" onClick={clearWishlist}>
              Clear All
            </Button>
          )}
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-4">
              Save items you like by clicking the heart icon on products.
            </p>
            <Link to="/">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlistProducts.map((product) => product && (
              <div key={product.id} className="bg-card rounded-xl border border-border p-4 flex gap-4">
                <Link to={`/product/${product.id}`} className="shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                </Link>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={conditionColors[product.condition]}>
                          {product.condition}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{product.category}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="escrow-badge">
                          <Shield className="h-3 w-3" />
                          Escrow Protected
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-foreground">${product.price}</p>
                      {product.originalPrice && (
                        <p className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-4">
                    <Button asChild size="sm">
                      <Link to={`/checkout/${product.id}`}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy Now
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWishlist(product.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wishlist;
