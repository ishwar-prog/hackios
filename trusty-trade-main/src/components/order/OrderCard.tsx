import { Link } from 'react-router-dom'
import { Package, Truck, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CountdownTimer } from './CountdownTimer'
import { cn } from '@/lib/utils'
import type { Order } from '@/data/products'

interface OrderCardProps {
  order: Order
  onVerify?: (orderId: string) => void
  onDispute?: (orderId: string) => void
  showActions?: boolean
  className?: string
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string; bgColor: string }> = {
  // Lowercase statuses (legacy)
  pending_payment: {
    label: 'Pending Payment',
    icon: Clock,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted'
  },
  paid: {
    label: 'Payment Secured',
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/10'
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    color: 'text-primary',
    bgColor: 'bg-primary/10'
  },
  delivered: {
    label: 'Delivered - Verify Now',
    icon: Package,
    color: 'text-warning',
    bgColor: 'bg-warning/10'
  },
  verified: {
    label: 'Verified & Complete',
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/10'
  },
  disputed: {
    label: 'Dispute in Progress',
    icon: AlertTriangle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10'
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/10'
  },
  refunded: {
    label: 'Refunded',
    icon: CheckCircle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted'
  },
  // Uppercase statuses (enhanced order store)
  PAID: {
    label: 'Payment Secured',
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/10'
  },
  SHIPPED: {
    label: 'Shipped',
    icon: Truck,
    color: 'text-primary',
    bgColor: 'bg-primary/10'
  },
  DELIVERED: {
    label: 'Delivered - Verify Now',
    icon: Package,
    color: 'text-warning',
    bgColor: 'bg-warning/10'
  },
  VERIFIED: {
    label: 'Verified & Complete',
    icon: CheckCircle,
    color: 'text-success',
    bgColor: 'bg-success/10'
  },
  DISPUTED: {
    label: 'Dispute in Progress',
    icon: AlertTriangle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10'
  },
  REFUNDED: {
    label: 'Refunded',
    icon: CheckCircle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted'
  }
}

// Default config for unknown statuses
const defaultStatusConfig = {
  label: 'Processing',
  icon: Clock,
  color: 'text-muted-foreground',
  bgColor: 'bg-muted'
}

export const OrderCard = ({ 
  order, 
  onVerify, 
  onDispute, 
  showActions = true,
  className 
}: OrderCardProps) => {
  // Get config with fallback to default
  const config = statusConfig[order.status] || defaultStatusConfig
  const StatusIcon = config.icon

  const handleExpire = () => {
    // Auto-verify when timer expires
    if (onVerify) {
      onVerify(order.id)
    }
  }

  const conditionDisplay: Record<string, string> = {
    'excellent': 'Excellent',
    'Excellent': 'Excellent',
    'good': 'Good',
    'Good': 'Good',
    'fair': 'Fair',
    'Fair': 'Fair',
    'poor': 'Poor',
    'Poor': 'Poor',
  }

  // Safe access to product properties with fallbacks
  const productImage = order.product?.image || '/placeholder.svg'
  const productName = order.product?.name || 'Unknown Product'
  const productCategory = typeof order.product?.category === 'string' 
    ? order.product.category 
    : order.product?.category?.name || 'Unknown Category'
  const productCondition = order.product?.condition || 'good'
  const orderId = order.orderId || order.id || 'Unknown'
  const orderAmount = order.amount || order.product?.price || 0
  const orderDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString() 
    : order.orderDate || 'Unknown Date'
  const escrowStatus = order.escrowStatus?.toLowerCase() || 'held'
  const orderStatus = order.status?.toLowerCase() || 'paid'

  return (
    <div className={cn('bg-card border border-border rounded-lg p-6', className)}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image */}
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <img
            src={productImage}
            alt={productName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Order Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
            <div>
              <h3 className="font-semibold text-foreground line-clamp-2">
                {productName}
              </h3>
              <p className="text-sm text-muted-foreground">
                Order #{orderId} • {productCategory}
              </p>
              <Badge variant="outline" className="mt-1 text-xs">
                {conditionDisplay[productCondition] || productCondition}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">₹{orderAmount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {orderDate}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 mb-3">
            <div className={cn('p-1.5 rounded-full', config.bgColor)}>
              <StatusIcon className={cn('h-4 w-4', config.color)} />
            </div>
            <span className={cn('text-sm font-medium', config.color)}>
              {config.label}
            </span>
          </div>

          {/* Verification Timer */}
          {(orderStatus === 'delivered' || order.status === 'DELIVERED') && order.verificationDeadline && (
            <div className="mb-4">
              <CountdownTimer
                endTime={order.verificationDeadline}
                onExpire={handleExpire}
                warningThreshold={24}
                format="compact"
              />
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex flex-wrap gap-2">
              {(orderStatus === 'delivered' || order.status === 'DELIVERED') && (
                <>
                  <Button
                    size="sm"
                    variant="trust"
                    onClick={() => onVerify?.(order.orderId || order.id)}
                    className="flex-1 sm:flex-none"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Product
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDispute?.(order.orderId || order.id)}
                    className="flex-1 sm:flex-none"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
                </>
              )}
              
              {(orderStatus === 'shipped' || order.status === 'SHIPPED') && order.trackingNumber && (
                <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                  <Truck className="h-4 w-4 mr-2" />
                  Track Package
                </Button>
              )}

              <Button size="sm" variant="ghost" asChild className="flex-1 sm:flex-none">
                <Link to={`/product/${order.productId}`}>
                  View Product
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Escrow Status */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Escrow Status:</span>
          <span className={cn(
            'font-medium capitalize',
            (escrowStatus === 'held' || order.escrowStatus === 'HELD') && 'text-primary',
            (escrowStatus === 'released' || order.escrowStatus === 'RELEASED') && 'text-success',
            (escrowStatus === 'refunded' || order.escrowStatus === 'REFUNDED') && 'text-muted-foreground',
            (escrowStatus === 'disputed') && 'text-destructive'
          )}>
            {(escrowStatus === 'held' || order.escrowStatus === 'HELD') && 'Funds Secured'}
            {(escrowStatus === 'released' || order.escrowStatus === 'RELEASED') && 'Payment Released'}
            {(escrowStatus === 'refunded' || order.escrowStatus === 'REFUNDED') && 'Refund Processed'}
            {escrowStatus === 'disputed' && 'Under Review'}
          </span>
        </div>
      </div>
    </div>
  )
}