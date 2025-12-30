import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { OrderCard } from '@/components/order/OrderCard';
import { useOrderStore } from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Package, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/data/products';

const Orders = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  
  const { orders, verifyOrder, updateOrderStatus } = useOrderStore();
  const { user, isAuthenticated } = useAuthStore();
  
  // Get orders for current user (buyer perspective)
  const userOrders = isAuthenticated 
    ? orders.filter(order => order.buyerId === user?.id)
    : [];
  
  // Filter orders by status
  const filteredOrders = statusFilter === 'all' 
    ? userOrders 
    : userOrders.filter(order => order.status === statusFilter);

  const handleVerify = async (orderId: string) => {
    try {
      await verifyOrder(orderId);
    } catch (error) {
      console.error('Failed to verify order:', error);
    }
  };

  const handleDispute = (orderId: string) => {
    navigate(`/dispute/${orderId}`);
  };

  const statusOptions: { value: OrderStatus | 'all'; label: string; count: number }[] = [
    { value: 'all', label: 'All Orders', count: userOrders.length },
    { value: 'paid', label: 'Paid', count: userOrders.filter(o => o.status === 'paid').length },
    { value: 'shipped', label: 'Shipped', count: userOrders.filter(o => o.status === 'shipped').length },
    { value: 'delivered', label: 'Delivered', count: userOrders.filter(o => o.status === 'delivered').length },
    { value: 'verified', label: 'Verified', count: userOrders.filter(o => o.status === 'verified').length },
    { value: 'disputed', label: 'Disputed', count: userOrders.filter(o => o.status === 'disputed').length },
  ];

  // Note: Auth guard is handled at route level via AuthGuard component

  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Orders</h1>
          <p className="text-muted-foreground">
            Track your purchases and verify delivered products
          </p>
        </div>

        {userOrders.length > 0 ? (
          <>
            {/* Status Filter */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Filter by status:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant={statusFilter === option.value ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${
                      statusFilter === option.value 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setStatusFilter(option.value)}
                  >
                    {option.label} ({option.count})
                  </Badge>
                ))}
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onVerify={handleVerify}
                    onDispute={handleDispute}
                    showActions={true}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No orders with this status
                  </h3>
                  <p className="text-muted-foreground">
                    Try selecting a different filter or browse products to make your first order.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">
              Start shopping to see your orders here
            </p>
            <Link to="/">
              <Button>Browse Products</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
