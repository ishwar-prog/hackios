import { useState, useMemo, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWalletStore, type WalletStatus } from '@/store/useWalletStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useToast } from '@/hooks/use-toast';
import {
  Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Shield,
  Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const paymentMethods = [
  { id: 'gpay', name: 'Google Pay', icon: '🔵' },
  { id: 'phonepe', name: 'PhonePe', icon: '💜' },
  { id: 'paytm', name: 'Paytm', icon: '🔷' },
  { id: 'razorpay', name: 'Razorpay UPI', icon: '💙' },
  { id: 'upi', name: 'Any UPI App', icon: '📱' },
] as const;

const presetAmounts = [100, 500, 1000, 2000] as const;

const Wallet = () => {
  const { toast } = useToast();
  const { availableBalance, heldInEscrow, walletState, transactions, addMoney, getTotalBalance } = useWalletStore();
  const { addNotification } = useNotificationStore();
  
  const [isAddingMoney, setIsAddingMoney] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Memoize computed stats to prevent recalculation on every render
  const stats = useMemo(() => {
    const totalAdded = transactions
      .filter(t => t.type === 'WALLET_CREDIT')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalSpent = transactions
      .filter(t => t.type === 'ESCROW_HOLD')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalBalance = getTotalBalance();
    
    return { totalAdded, totalSpent, totalBalance };
  }, [transactions, getTotalBalance]);

  const handleAddMoney = useCallback(async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedMethod) {
      toast({
        title: "Select Payment Method",
        description: "Please select a payment method.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const methodName = paymentMethods.find(m => m.id === selectedMethod)?.name || 'UPI';
    addMoney(numAmount, methodName);
    
    addNotification({
      type: 'wallet',
      title: 'Money Added Successfully',
      message: `₹${numAmount.toLocaleString('en-IN')} has been added to your wallet via ${methodName}.`,
      priority: 'medium'
    });

    toast({
      title: "Money Added!",
      description: `₹${numAmount.toLocaleString('en-IN')} has been added to your wallet.`,
    });

    setIsProcessing(false);
    setIsAddingMoney(false);
    setAmount('');
    setSelectedMethod(null);
  }, [amount, selectedMethod, addMoney, addNotification, toast]);

  const handleDialogChange = useCallback((open: boolean) => {
    setIsAddingMoney(open);
    if (!open) {
      setAmount('');
      setSelectedMethod(null);
    }
  }, []);

  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Wallet</h1>
          <p className="text-muted-foreground">
            Manage your funds and view transaction history
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-trust rounded-2xl p-8 text-white mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-white/80 text-sm mb-1">Available Balance</p>
              <p className="text-4xl font-bold">₹{availableBalance.toLocaleString('en-IN')}</p>
              {heldInEscrow > 0 && (
                <p className="text-white/60 text-sm mt-2">
                  + ₹{heldInEscrow.toLocaleString('en-IN')} held in escrow
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <WalletIcon className="h-8 w-8 text-white/80" />
              <StatusBadge status={walletState} />
            </div>
          </div>
          
          <Dialog open={isAddingMoney} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                disabled={walletState === 'FROZEN'}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Money
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Money to Wallet</DialogTitle>
                <DialogDescription>
                  Choose a payment method and enter the amount to add.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8 h-12 text-lg"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {presetAmounts.map(preset => (
                      <Button
                        key={preset}
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(String(preset))}
                      >
                        ₹{preset}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map(method => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                          selectedMethod === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <span className="text-2xl">{method.icon}</span>
                        <span className="font-medium text-foreground">{method.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleAddMoney}
                  className="w-full"
                  size="lg"
                  disabled={isProcessing || !amount || !selectedMethod}
                >
                  {isProcessing ? (
                    <>
                      <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Add ₹{amount || '0'}
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Status Warning */}
        {walletState !== 'ACTIVE' && <StatusWarning status={walletState} />}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<ArrowDownLeft className="h-5 w-5 text-success" />}
            iconBg="bg-success/10"
            label="Available Balance"
            value={availableBalance}
          />
          <StatCard
            icon={<Shield className="h-5 w-5 text-warning" />}
            iconBg="bg-warning/10"
            label="Held in Escrow"
            value={heldInEscrow}
          />
          <StatCard
            icon={<ArrowUpRight className="h-5 w-5 text-primary" />}
            iconBg="bg-primary/10"
            label="Total Balance"
            value={stats.totalBalance}
          />
        </div>

        {/* Transaction History */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Transaction History</h2>
          </div>
          
          <div className="divide-y divide-border">
            {transactions.length === 0 ? (
              <div className="p-8 text-center">
                <WalletIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              transactions.map(transaction => (
                <TransactionRow key={transaction.transactionId} transaction={transaction} />
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Extracted components for better performance
const StatusBadge = ({ status }: { status: WalletStatus }) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
    case 'LIMITED':
      return <Badge className="bg-warning/10 text-warning border-warning/20">Limited</Badge>;
    case 'FROZEN':
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Frozen</Badge>;
  }
};

const StatusWarning = ({ status }: { status: WalletStatus }) => {
  const isFrozen = status === 'FROZEN';
  return (
    <div className={`rounded-xl p-5 mb-8 ${
      isFrozen 
        ? 'bg-destructive/10 border border-destructive/20' 
        : 'bg-warning/10 border border-warning/20'
    }`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`h-5 w-5 shrink-0 ${isFrozen ? 'text-destructive' : 'text-warning'}`} />
        <div>
          <p className={`font-semibold ${isFrozen ? 'text-destructive' : 'text-warning'}`}>
            {isFrozen ? 'Wallet Frozen' : 'Wallet Limited'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {isFrozen 
              ? 'Your wallet has been frozen by admin. Please contact support.'
              : 'Some features are limited. Complete verification to unlock full access.'}
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, iconBg, label, value }: { 
  icon: React.ReactNode; 
  iconBg: string; 
  label: string; 
  value: number 
}) => (
  <div className="bg-card rounded-xl border border-border p-5">
    <div className="flex items-center gap-3 mb-2">
      <div className={`h-10 w-10 rounded-full ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <p className="text-2xl font-bold text-foreground">₹{value.toLocaleString('en-IN')}</p>
  </div>
);

const TransactionRow = ({ transaction }: { transaction: { 
  transactionId: string; 
  type: string; 
  description: string; 
  timestamp: string; 
  orderId?: string; 
  amount: number; 
  from: string;
  to: string;
}}) => {
  const icon = useMemo(() => {
    switch (transaction.type) {
      case 'WALLET_CREDIT':
        return <ArrowDownLeft className="h-4 w-4 text-success" />;
      case 'WALLET_DEBIT':
        return <ArrowUpRight className="h-4 w-4 text-destructive" />;
      case 'ESCROW_HOLD':
        return <Shield className="h-4 w-4 text-warning" />;
      case 'ESCROW_RELEASE':
        return <CheckCircle2 className="h-4 w-4 text-primary" />;
      case 'ESCROW_REFUND':
        return <ArrowDownLeft className="h-4 w-4 text-success" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  }, [transaction.type]);

  const isPositive = ['WALLET_CREDIT', 'ESCROW_REFUND'].includes(transaction.type);
  const isNegative = ['WALLET_DEBIT', 'ESCROW_HOLD'].includes(transaction.type);

  return (
    <div className="p-5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="font-medium text-foreground">{transaction.description}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(transaction.timestamp).toLocaleDateString()}
            {transaction.orderId && ` • Order: ${transaction.orderId}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {transaction.from} → {transaction.to}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${
          isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-foreground'
        }`}>
          {isPositive ? '+' : isNegative ? '-' : ''}₹{transaction.amount.toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  );
};

export default Wallet;
