import { Check, Clock, Package, Shield, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EscrowStatus } from '@/data/products'

interface TimelineStep {
  key: string
  label: string
  description: string
  completed: boolean
  icon: React.ReactNode
}

interface EscrowTimelineProps {
  currentStatus: EscrowStatus
  className?: string
}

export const EscrowTimeline = ({ currentStatus, className }: EscrowTimelineProps) => {
  const getSteps = (status: EscrowStatus): TimelineStep[] => [
    {
      key: 'paid',
      label: 'Payment Secured',
      description: 'Your payment is safely held in escrow',
      completed: true,
      icon: <Shield className="h-5 w-5" />
    },
    {
      key: 'shipped',
      label: 'Item Shipped',
      description: 'Seller has shipped your item',
      completed: ['released', 'refunded'].includes(status),
      icon: <Truck className="h-5 w-5" />
    },
    {
      key: 'delivered',
      label: 'Item Delivered',
      description: 'Item delivered for your verification',
      completed: ['released', 'refunded'].includes(status),
      icon: <Package className="h-5 w-5" />
    },
    {
      key: 'verified',
      label: status === 'released' ? 'Payment Released' : 
             status === 'refunded' ? 'Refund Processed' : 'Awaiting Verification',
      description: status === 'released' ? 'Payment sent to seller' :
                   status === 'refunded' ? 'Refund sent to your account' :
                   'Verify item condition to release payment',
      completed: ['released', 'refunded'].includes(status),
      icon: status === 'released' ? <Check className="h-5 w-5" /> : <Clock className="h-5 w-5" />
    }
  ]

  const steps = getSteps(currentStatus)

  return (
    <div className={cn('space-y-6', className)}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Escrow Protection Timeline</h3>
        <p className="text-sm text-muted-foreground">
          Your payment is protected every step of the way
        </p>
      </div>

      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.key} className="timeline-step pb-6 last:pb-0">
            {/* Step Icon */}
            <div className={cn(
              'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background',
              step.completed 
                ? 'border-success bg-success text-success-foreground' 
                : 'border-muted-foreground text-muted-foreground'
            )}>
              {step.completed ? <Check className="h-5 w-5" /> : step.icon}
            </div>

            {/* Step Content */}
            <div className="ml-4 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={cn(
                  'text-sm font-semibold',
                  step.completed ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.label}
                </h4>
                {step.completed && (
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                )}
              </div>
              <p className={cn(
                'text-xs',
                step.completed ? 'text-muted-foreground' : 'text-muted-foreground/70'
              )}>
                {step.description}
              </p>
            </div>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div className={cn(
                'absolute left-5 top-10 w-0.5 h-6 -translate-x-0.5',
                steps[index + 1].completed ? 'bg-success' : 'bg-border'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Trust Message */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
        <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
        <p className="text-sm font-medium text-primary mb-1">
          100% Escrow Protected
        </p>
        <p className="text-xs text-muted-foreground">
          Seller only gets paid after you verify the item
        </p>
      </div>
    </div>
  )
}