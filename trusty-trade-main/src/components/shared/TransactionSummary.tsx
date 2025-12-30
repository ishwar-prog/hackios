import { useMemo } from 'react';
import { useWalletStore } from '@/store/useWalletStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Shield, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

interface TransactionSummaryProps {
  className?: string;
}

export const TransactionSummary = ({ className = '' }: TransactionSummaryProps) => {
  const { availableBalance, heldInEscrow, transactions, getTotalBalance } = useWalletStore();
  const { user } = useAuthStore();

  // Get last 5 transactions
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

  const formatINR = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'WALLET_CREDIT':
      case 'ESCROW_REFUND':
        return <ArrowDownLeft className="h-4 w-4 text-success" />;
      case 'WALLET_DEBIT':
      case 'ESCROW_HOLD':
        return <ArrowUpRight className="h-4 w-4 text-destructive" />;
      case 'ESCROW_RELEASE':
        return <Shield className="h-4 w-4 text-primary" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'WALLET_CREDIT':
      case 'ESCROW_REFUND':
        return 'text-success';
      case 'WALLET_DEBIT':
      case 'ESCROW_HOLD':
        return 'text-destructive';
      case 'ESCROW_RELEASE':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  if (!user) return null;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-primary" />
          Transaction Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Available Balance</span>
            </div>
            <p className="text-xl font-bold text-primary">{formatINR(availableBalance)}</p>
          </div>
          
          <div className="bg-warning/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-foreground">In Escrow</span>
            </div>
            <p className="text-xl font-bold text-warning">{formatINR(heldInEscrow)}</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Recent Transactions</h4>
          <div className="space-y-2">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
            ) : (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.timestamp).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${getTransactionColor(transaction.type)}`}>
                      {['WALLET_CREDIT', 'ESCROW_REFUND'].includes(transaction.type) ? '+' : '-'}
                      {formatINR(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.from} → {transaction.to}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Role Badge */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">Account Type</span>
          <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'seller' ? 'default' : 'secondary'}>
            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};