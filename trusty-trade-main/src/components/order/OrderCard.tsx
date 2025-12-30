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

const statusConfig = {
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
  }
}

export const OrderCard = ({ 
  order, 
  onVerify, 
  onDispute, 
  showActions = true,
  className 
}: OrderCardProps) => {
  const config = statusConfig[order.status]
  const StatusIcon = config.icon

  const handleExpire = () => {
    // Auto-verify when timer expires
    if (onVerify) {
      onVerify(order.id)
    }
  }

  const conditionDisplay = {
    'excellent': 'Excellent',
    'good': 'Good',
    'fair': 'Fair',
    'poor': 'Poor',
  }

  return (
    <div className={cn('bg-card border border-border rounded-lg p-6', className)}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image */}
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <img
            src={order.product.image}
            alt={order.product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Order Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
            <div>
              <h3 className="font-semibold text-foreground line-clamp-2">
                {order.product.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Order #{order.id} • {order.product.category}
              </p>
              <Badge variant="outline" className="mt-1 text-xs">
                {conditionDisplay[order.product.condition]}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">${order.amount}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()}
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
          {order.status === 'delivered' && order.verificationDeadline && (
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
              {order.status === 'delivered' && (
                <>
                  <Button
                    size="sm"
                    variant="trust"
                    onClick={() => onVerify?.(order.id)}
                    className="flex-1 sm:flex-none"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Product
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDispute?.(order.id)}
                    className="flex-1 sm:flex-none"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
                </>
              )}
              
              {order.status === 'shipped' && order.trackingNumber && (
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
            order.escrowStatus === 'held' && 'text-primary',
            order.escrowStatus === 'released' && 'text-success',
            order.escrowStatus === 'refunded' && 'text-muted-foreground',
            order.escrowStatus === 'disputed' && 'text-destructive'
          )}>
            {order.escrowStatus === 'held' && 'Funds Secured'}
            {order.escrowStatus === 'released' && 'Payment Released'}
            {order.escrowStatus === 'refunded' && 'Refund Processed'}
            {order.escrowStatus === 'disputed' && 'Under Review'}
          </span>
        </div>
      </div>
    </div>
  )
}