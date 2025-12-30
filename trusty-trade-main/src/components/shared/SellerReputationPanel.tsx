import { Star, Package, Clock, MessageSquare } from 'lucide-react';

interface SellerReputationPanelProps {
  seller: {
    name: string;
    rating: number;
    completedSales: number;
    onTimeShipping: number;
    disputeResolution: number;
  };
}

export const SellerReputationPanel = ({ seller }: SellerReputationPanelProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-semibold text-foreground mb-4">Seller Reputation</h3>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-12 rounded-full bg-gradient-trust flex items-center justify-center text-primary-foreground font-bold text-lg">
          {seller.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-foreground">{seller.name}</p>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-medium text-foreground">{seller.rating}</span>
            <span className="text-muted-foreground text-sm">/ 5.0</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-secondary rounded-lg p-3">
          <Package className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold text-foreground">{seller.completedSales}</p>
          <p className="text-xs text-muted-foreground">Sales</p>
        </div>
        <div className="bg-secondary rounded-lg p-3">
          <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold text-foreground">{seller.onTimeShipping}%</p>
          <p className="text-xs text-muted-foreground">On-Time</p>
        </div>
        <div className="bg-secondary rounded-lg p-3">
          <MessageSquare className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-lg font-bold text-foreground">{seller.disputeResolution}%</p>
          <p className="text-xs text-muted-foreground">Resolved</p>
        </div>
      </div>
    </div>
  );
};
