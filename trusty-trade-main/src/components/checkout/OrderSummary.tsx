import { Shield, PackageOpen, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Product } from '@/data/products'

interface OrderSummaryProps {
  product: Product
  className?: string
}

export const OrderSummary = ({ product, className }: OrderSummaryProps) => {
  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0

  const conditionDisplay = {
    'excellent': 'Excellent',
    'good': 'Good',
    'fair': 'Fair',
    'poor': 'Poor',
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>
      
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        {/* Product Info */}
        <div className="flex gap-4">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <div className="absolute top-1 left-1 bg-danger text-danger-foreground text-xs font-bold px-1.5 py-0.5 rounded">
                -{discount}%
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground line-clamp-2 text-sm">
              {product.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
            <Badge 
              variant="outline" 
              className="mt-2 text-xs"
            >
              {conditionDisplay[product.condition]}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Trust Features */}
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-foreground">Protection Features</h5>
          <div className="flex flex-wrap gap-2">
            <span className="escrow-badge text-xs">
              <Shield className="h-3 w-3" />
              Escrow Protected
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              <PackageOpen className="h-3 w-3" />
              Open-Box Delivery
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              <RotateCcw className="h-3 w-3" />
              Return Eligible
            </span>
          </div>
        </div>

        <Separator />

        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Item Price</span>
            <div className="text-right">
              <span className="text-sm font-semibold text-foreground">${product.price}</span>
              {product.originalPrice && (
                <div className="text-xs text-muted-foreground line-through">
                  ${product.originalPrice}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Escrow Fee</span>
            <span className="text-sm text-success font-medium">FREE</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Shipping</span>
            <span className="text-sm text-success font-medium">FREE</span>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-foreground">Total</span>
            <span className="text-lg font-bold text-foreground">${product.price}</span>
          </div>
        </div>

        {/* Seller Info */}
        <Separator />
        
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-foreground">Seller</h5>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{product.seller.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>⭐ {product.seller.rating}</span>
                <span>•</span>
                <span>{product.seller.totalSales} sales</span>
                <span>•</span>
                <Badge variant="outline" className="text-xs">
                  {product.seller.verificationStatus}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}