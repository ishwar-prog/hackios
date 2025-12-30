import { Shield, Lock, RefreshCcw } from 'lucide-react';

export const EscrowExplanationPanel = () => {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Escrow Protection</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Lock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">Your money is held securely</p>
            <p className="text-xs text-muted-foreground">Funds are protected by a trusted third-party escrow service</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">Seller gets paid only after you approve</p>
            <p className="text-xs text-muted-foreground">You control when the payment is released</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <RefreshCcw className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">Full refund if product fails verification</p>
            <p className="text-xs text-muted-foreground">No questions asked — your money is always protected</p>
          </div>
        </div>
      </div>
    </div>
  );
};
