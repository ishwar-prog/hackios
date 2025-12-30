import { Shield, CheckCircle2, RefreshCcw } from 'lucide-react';

export const TrustBanner = () => {
  return (
    <div className="bg-gradient-trust text-primary-foreground py-3">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="font-medium">100% Escrow Protected</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-primary-foreground/30" />
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Verify Before Seller Gets Paid</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-primary-foreground/30" />
          <div className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            <span>Full Refund Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
};
