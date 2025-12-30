import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWalletStore } from '@/store/useWalletStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, Unlock, RefreshCw } from 'lucide-react';

export const EscrowControls = () => {
  const { toast } = useToast();
  const { freezeWallet, unfreezeWallet, userWallets } = useWalletStore();
  const { orders, resolveDispute } = useOrderStore();
  
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');

  // Get disputed orders
  const disputedOrders = orders.filter(order => order.status === 'DISPUTED');

  const handleFreezeWallet = () => {
    if (!selectedUserId) {
      toast({ title: "Error", description: "Please enter a user ID", variant: "destructive" });
      return;
    }
    
    freezeWallet(selectedUserId);
    toast({ title: "Wallet Frozen", description: `Wallet for user ${selectedUserId} has been frozen` });
  };

  const handleUnfreezeWallet = () => {
    if (!selectedUserId) {
      toast({ title: "Error", description: "Please enter a user ID", variant: "destructive" });
      return;
    }
    
    unfreezeWallet(selectedUserId);
    toast({ title: "Wallet Unfrozen", description: `Wallet for user ${selectedUserId} has been unfrozen` });
  };

  const handleResolveDispute = async (approve: boolean) => {
    if (!selectedOrderId) {
      toast({ title: "Error", description: "Please select an order", variant: "destructive" });
      return;
    }

    try {
      await resolveDispute(selectedOrderId, approve, approve ? 'Refund approved by admin' : 'Dispute rejected by admin');
      toast({ 
        title: "Dispute Resolved", 
        description: `Dispute ${approve ? 'approved - refund processed' : 'rejected - payment released to seller'}` 
      });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to resolve dispute", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Wallet Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              placeholder="Enter user ID"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleFreezeWallet} variant="destructive" className="flex-1">
              <Lock className="h-4 w-4 mr-2" />
              Freeze Wallet
            </Button>
            <Button onClick={handleUnfreezeWallet} variant="outline" className="flex-1">
              <Unlock className="h-4 w-4 mr-2" />
              Unfreeze Wallet
            </Button>
          </div>

          {/* Display wallet states */}
          <div className="mt-4">
            <h4 className="font-medium mb-2">Current Wallet States:</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(userWallets).map(([userId, wallet]) => (
                <div key={userId} className="flex justify-between">
                  <span>{userId}</span>
                  <span className={`font-medium ${
                    wallet.walletState === 'FROZEN' ? 'text-destructive' : 
                    wallet.walletState === 'LIMITED' ? 'text-warning' : 'text-success'
                  }`}>
                    {wallet.walletState} (₹{wallet.availableBalance} + ₹{wallet.heldInEscrow} escrow)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Dispute Resolution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {disputedOrders.length === 0 ? (
            <p className="text-muted-foreground">No disputed orders</p>
          ) : (
            <>
              <div>
                <Label htmlFor="orderId">Select Disputed Order</Label>
                <select
                  id="orderId"
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Select an order</option>
                  {disputedOrders.map(order => (
                    <option key={order.orderId} value={order.orderId}>
                      {order.orderId} - ₹{order.amount} ({order.product.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleResolveDispute(true)} 
                  variant="destructive" 
                  className="flex-1"
                  disabled={!selectedOrderId}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Approve Refund
                </Button>
                <Button 
                  onClick={() => handleResolveDispute(false)} 
                  variant="outline" 
                  className="flex-1"
                  disabled={!selectedOrderId}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Reject Dispute
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};