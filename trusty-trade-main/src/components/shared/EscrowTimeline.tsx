import { Check, Circle, Lock, Package, Truck, CheckCircle2, Shield } from 'lucide-react';

interface TimelineStep {
  label: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'upcoming';
}

interface EscrowTimelineProps {
  currentStep?: number;
  variant?: 'checkout' | 'order';
}

export const EscrowTimeline = ({ currentStep = 0, variant = 'checkout' }: EscrowTimelineProps) => {
  const checkoutSteps: TimelineStep[] = [
    {
      label: 'Payment Made',
      description: 'Your payment is received securely',
      icon: <Lock className="h-5 w-5" />,
      status: currentStep >= 1 ? 'completed' : currentStep === 0 ? 'current' : 'upcoming',
    },
    {
      label: 'Funds Locked in Escrow',
      description: 'Money held by trusted third-party',
      icon: <Shield className="h-5 w-5" />,
      status: currentStep >= 2 ? 'completed' : currentStep === 1 ? 'current' : 'upcoming',
    },
    {
      label: 'Seller Ships Product',
      description: 'Item dispatched with tracking',
      icon: <Package className="h-5 w-5" />,
      status: currentStep >= 3 ? 'completed' : currentStep === 2 ? 'current' : 'upcoming',
    },
    {
      label: 'You Verify Product',
      description: 'Inspect during open-box delivery',
      icon: <CheckCircle2 className="h-5 w-5" />,
      status: currentStep >= 4 ? 'completed' : currentStep === 3 ? 'current' : 'upcoming',
    },
    {
      label: 'Funds Released or Refunded',
      description: 'Based on your verification',
      icon: <Check className="h-5 w-5" />,
      status: currentStep >= 5 ? 'completed' : currentStep === 4 ? 'current' : 'upcoming',
    },
  ];

  const orderSteps: TimelineStep[] = [
    {
      label: 'Paid',
      description: 'Payment secured in escrow',
      icon: <Lock className="h-5 w-5" />,
      status: currentStep >= 1 ? 'completed' : 'upcoming',
    },
    {
      label: 'Shipped',
      description: 'On the way to you',
      icon: <Truck className="h-5 w-5" />,
      status: currentStep >= 2 ? 'completed' : currentStep === 1 ? 'current' : 'upcoming',
    },
    {
      label: 'Delivered',
      description: 'Ready for verification',
      icon: <Package className="h-5 w-5" />,
      status: currentStep >= 3 ? 'completed' : currentStep === 2 ? 'current' : 'upcoming',
    },
    {
      label: 'Verified',
      description: 'Transaction complete',
      icon: <CheckCircle2 className="h-5 w-5" />,
      status: currentStep >= 4 ? 'completed' : currentStep === 3 ? 'current' : 'upcoming',
    },
  ];

  const steps = variant === 'checkout' ? checkoutSteps : orderSteps;

  return (
    <div className="space-y-0">
      {steps.map((step, index) => (
        <div key={index} className="relative flex gap-4">
          {/* Line connector */}
          {index < steps.length - 1 && (
            <div 
              className={`absolute left-5 top-10 w-0.5 h-[calc(100%-0.5rem)] ${
                step.status === 'completed' ? 'bg-primary' : 'bg-border'
              }`}
            />
          )}
          
          {/* Icon */}
          <div 
            className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
              step.status === 'completed' 
                ? 'bg-primary border-primary text-primary-foreground' 
                : step.status === 'current'
                ? 'bg-primary/10 border-primary text-primary animate-pulse-ring'
                : 'bg-muted border-border text-muted-foreground'
            }`}
          >
            {step.status === 'completed' ? <Check className="h-5 w-5" /> : step.icon}
          </div>

          {/* Content */}
          <div className="pb-8">
            <p className={`font-semibold ${
              step.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
            }`}>
              {step.label}
            </p>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
