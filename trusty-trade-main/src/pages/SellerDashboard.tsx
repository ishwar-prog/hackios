import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProductStore } from '@/store/useProductStore';
import { useOrderStore } from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { useToast } from '@/hooks/use-toast';
import { Package, DollarSign, ShoppingBag, Plus, Eye, Edit, Trash2, Star, Truck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Link } from 'react-router-dom';

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { products, deleteProduct, getProductsBySeller } = useProductStore();
  const { getOrdersBySeller, updateOrderStatus } = useOrderStore();
  const { user } = useAuthStore();
  const { formatPrice } = useCurrencyStore();
  const { notifyProductDeleted } = useNotificationStore();
  const { toast } = useToast();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const myListings = user ? getProductsBySeller(user.id) : [];
  const myOrders = user ? getOrdersBySeller(user.id) : [];

  const handleDeleteListing = () => {
    if (deleteConfirmId) {
      const product = myListings.find(p => p.id === deleteConfirmId);
      deleteProduct(deleteConfirmId);
      
      // Trigger real notification for product deletion
      if (product) {
        notifyProductDeleted(deleteConfirmId, product.name);
      }
      
      setDeleteConfirmId(null);
      toast({ title: "Listing Removed", description: `Your product '${product?.name}' has been removed successfully.` });
    }
  };

  const handleMarkAsShipped = (orderId: string) => {
    updateOrderStatus(orderId, 'shipped');
    toast({ title: "Order Marked as Shipped", description: "The buyer has been notified." });
  };

  const totalSales = myOrders
    .filter(order => order.status === 'verified')
    .reduce((sum, order) => sum + order.amount, 0);

  const stats = [
    { label: 'Total Sales', value: formatPrice(totalSales), change: '+12%', icon: DollarSign, color: 'text-success' },
    { label: 'Active Listings', value: String(myListings.length), change: '+3', icon: Package, color: 'text-primary' },
    { label: 'Orders This Month', value: String(myOrders.length), change: '+18%', icon: ShoppingBag, color: 'text-warning' },
    { label: 'Customer Rating', value: '4.9', change: '+0.1', icon: Star, color: 'text-success' },
  ];

  // Use real orders instead of hardcoded ones
  const recentOrders = myOrders.slice(0, 3).map(order => ({
    id: order.id,
    product: order.product.name,
    buyer: `${order.buyerId.slice(0, 8)}...`, // Anonymize buyer ID
    amount: formatPrice(order.amount),
    status: order.status,
    date: new Date(order.createdAt).toLocaleDateString(),
    canShip: order.status === 'paid'
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shipped': return 'bg-primary/10 text-primary border-primary/20';
      case 'delivered': return 'bg-warning/10 text-warning border-warning/20';
      case 'verified': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = { excellent: 'New', good: 'Like New', fair: 'Good', poor: 'Fair' };
    return labels[condition] || condition;
  };


  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold text-foreground mb-2">Seller Dashboard</h1><p className="text-muted-foreground">Manage your listings and track your sales</p></div>
          <Button className="bg-gradient-trust" asChild><Link to="/sell"><Plus className="h-4 w-4 mr-2" />Add New Listing</Link></Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4"><stat.icon className={`h-8 w-8 ${stat.color}`} /><span className={`text-sm font-medium ${stat.color}`}>{stat.change}</span></div>
              <div><p className="text-2xl font-bold text-foreground">{stat.value}</p><p className="text-sm text-muted-foreground">{stat.label}</p></div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
          {[{ id: 'overview', label: 'Overview' }, { id: 'orders', label: 'Orders' }, { id: 'listings', label: 'My Listings' }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{tab.label}</button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-semibold text-foreground">Recent Orders</h3><Button variant="ghost" size="sm">View All</Button></div>
              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders yet</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{order.product}</p>
                        <p className="text-sm text-muted-foreground">Buyer: {order.buyer} • {order.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{order.amount}</p>
                          <Badge variant="outline" className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                        {order.canShip && (
                          <Button size="sm" onClick={() => handleMarkAsShipped(order.id)}>
                            <Truck className="h-4 w-4 mr-1" />
                            Ship
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Performance Metrics</h3>
              <div className="space-y-6">
                <div><div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">Response Time</span><span className="text-sm font-medium text-foreground">2.3 hours</span></div><div className="w-full bg-muted rounded-full h-2"><div className="bg-success h-2 rounded-full" style={{ width: '85%' }}></div></div></div>
                <div><div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">On-Time Shipping</span><span className="text-sm font-medium text-foreground">96%</span></div><div className="w-full bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{ width: '96%' }}></div></div></div>
                <div><div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">Customer Satisfaction</span><span className="text-sm font-medium text-foreground">4.9/5.0</span></div><div className="w-full bg-muted rounded-full h-2"><div className="bg-warning h-2 rounded-full" style={{ width: '98%' }}></div></div></div>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'orders' && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">All Orders</h3>
            {myOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
                <p className="text-sm text-muted-foreground mt-2">Orders will appear here when customers buy your products</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{order.product.name}</p>
                        <p className="text-sm text-muted-foreground">Order {order.id} • {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatPrice(order.amount)}</p>
                        <p className="text-sm text-muted-foreground">Buyer: {order.buyerId.slice(0, 8)}...</p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(order.status)}>{order.status}</Badge>
                      {order.status === 'paid' && (
                        <Button size="sm" onClick={() => handleMarkAsShipped(order.id)}>
                          <Truck className="h-4 w-4 mr-1" />
                          Ship
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6"><h3 className="text-lg font-semibold text-foreground">My Listings</h3><Button asChild><Link to="/sell"><Plus className="h-4 w-4 mr-2" />Add Listing</Link></Button></div>
            {myListings.length === 0 ? (
              <div className="text-center py-12"><Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground mb-4">No listings yet</p><Button asChild><Link to="/sell">Create Your First Listing</Link></Button></div>
            ) : (
              <div className="space-y-4">
                {myListings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <img src={listing.image} alt={listing.name} className="h-16 w-16 rounded-lg object-cover" />
                      <div><p className="font-medium text-foreground">{listing.name}</p><p className="text-sm text-muted-foreground">Condition: {getConditionLabel(listing.condition)}</p><Badge variant="outline" className="bg-success/10 text-success border-success/20 mt-1">Active</Badge></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right"><p className="text-xl font-bold text-foreground">${listing.price.toLocaleString()}</p></div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild><Link to={`/product/${listing.id}`}><Eye className="h-4 w-4" /></Link></Button>
                        <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(listing.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>Remove Listing?</DialogTitle><DialogDescription>This action cannot be undone. Your listing will be permanently removed.</DialogDescription></DialogHeader><DialogFooter className="gap-2"><Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button><Button variant="destructive" onClick={handleDeleteListing}>Remove</Button></DialogFooter></DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SellerDashboard;