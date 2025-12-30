import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAdminStore, type DisputeCase, type WalletControl, type UserReport, type AdminMessage } from '@/store/useAdminStore';
import { useProductStore } from '@/store/useProductStore';
import { useToast } from '@/hooks/use-toast';
import {
  Shield, LogOut, AlertTriangle, Users, FileWarning, Wallet,
  CheckCircle2, XCircle, Eye, ChevronDown, ChevronRight,
  DollarSign, Ban, Clock, MessageSquare, Package, Trash2, Search,
  Snowflake, Unlock, Flag, Send, Activity, TrendingUp, UserX
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    isAdminAuthenticated, 
    adminUser, 
    adminLogout, 
    disputes, 
    resolveDispute,
    updateDisputeStatus,
    userRestrictions,
    restrictUser,
    removeRestriction,
    walletControls,
    freezeWallet,
    unfreezeWallet,
    limitWallet,
    userReports,
    updateReportStatus,
    adminMessages,
    addMessageToThread,
    resolveMessage,
    adminActions,
    getOpenDisputesCount,
    getFrozenWalletsCount,
    getPendingReportsCount,
    getTotalUsersCount,
    getActiveListingsCount,
    deleteProductAsAdmin
  } = useAdminStore();
  const { products, deleteProduct } = useProductStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDispute, setSelectedDispute] = useState<DisputeCase | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [expandedDispute, setExpandedDispute] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null);
  const [messageContent, setMessageContent] = useState('');

  // Redirect if not authenticated
  if (!isAdminAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    adminLogout();
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin panel.",
    });
    navigate('/');
  };

  const handleResolveDispute = (disputeId: string, resolution: 'buyer' | 'seller') => {
    resolveDispute(disputeId, resolution, adminNotes);
    toast({
      title: "Dispute Resolved",
      description: `Dispute resolved in favor of ${resolution}. ${resolution === 'buyer' ? 'Refund initiated.' : 'Escrow released to seller.'}`,
    });
    setSelectedDispute(null);
    setAdminNotes('');
  };

  const handleFreezeWallet = (userId: string, userName: string) => {
    freezeWallet(userId, userName, 'Suspicious activity detected');
    toast({
      title: "Wallet Frozen",
      description: `${userName}'s wallet has been frozen.`,
    });
  };

  const handleUnfreezeWallet = (userId: string) => {
    unfreezeWallet(userId);
    toast({
      title: "Wallet Unfrozen",
      description: "Wallet has been reactivated.",
    });
  };

  const handleDeleteProductAsAdmin = (productId: string, productName: string) => {
    deleteProduct(productId);
    deleteProductAsAdmin(productId);
    toast({
      title: "Product Deleted",
      description: `"${productName}" has been removed from the marketplace.`,
    });
  };

  const handleSendMessage = () => {
    if (!selectedMessage || !messageContent.trim()) return;
    
    addMessageToThread(selectedMessage.id, 'admin', messageContent);
    setMessageContent('');
    toast({
      title: "Message Sent",
      description: "Your response has been sent to the user.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Open</Badge>;
      case 'investigating':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Investigating</Badge>;
      case 'resolved_buyer':
        return <Badge className="bg-success/10 text-success border-success/20">Resolved - Buyer</Badge>;
      case 'resolved_seller':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Resolved - Seller</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getWalletStatusBadge = (status: WalletControl['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case 'LIMITED':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Limited</Badge>;
      case 'FROZEN':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Frozen</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = [
    { label: 'Total Users', value: getTotalUsersCount(), icon: Users, color: 'text-primary' },
    { label: 'Active Listings', value: getActiveListingsCount(), icon: Package, color: 'text-success' },
    { label: 'Open Disputes', value: getOpenDisputesCount(), icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Frozen Wallets', value: getFrozenWalletsCount(), icon: Snowflake, color: 'text-warning' },
  ];

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.seller.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-trust flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">Trusty Trade</span>
              <Badge variant="outline" className="ml-2">Admin Panel</Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {adminUser?.name}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage disputes, control wallets, enforce rules, and maintain platform trust
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg w-fit overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'disputes', label: 'Disputes', count: getOpenDisputesCount() },
            { id: 'wallets', label: 'Wallet Control', count: getFrozenWalletsCount() },
            { id: 'reports', label: 'User Reports', count: getPendingReportsCount() },
            { id: 'products', label: 'Listing Moderation' },
            { id: 'messages', label: 'User Support' },
            { id: 'audit', label: 'Audit Log' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Admin Actions */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Admin Actions
              </h3>
              <div className="space-y-3">
                {adminActions.slice(0, 5).map((action) => (
                  <div key={action.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{action.action.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">{action.details}</p>
                      <p className="text-xs text-muted-foreground">{new Date(action.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Health */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Platform Status</span>
                  <Badge className="bg-success/10 text-success border-success/20">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dispute Resolution Rate</span>
                  <span className="text-sm font-medium text-foreground">94%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">User Satisfaction</span>
                  <span className="text-sm font-medium text-foreground">4.8/5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fraud Detection</span>
                  <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disputes Tab */}
        {activeTab === 'disputes' && (
          <div className="space-y-4">
            {disputes.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Disputes</h3>
                <p className="text-muted-foreground">All disputes have been resolved.</p>
              </div>
            ) : (
              disputes.map((dispute) => (
                <div key={dispute.id} className="bg-card rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setExpandedDispute(expandedDispute === dispute.id ? null : dispute.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{dispute.productName}</h3>
                          {getStatusBadge(dispute.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {dispute.buyerName} vs {dispute.sellerName} • ${dispute.amount}
                        </p>
                      </div>
                    </div>
                    {expandedDispute === dispute.id ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  
                  {expandedDispute === dispute.id && (
                    <div className="px-6 pb-6 border-t border-border pt-4">
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Order ID</p>
                          <p className="text-foreground">{dispute.orderId}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Issue Type</p>
                          <p className="text-foreground capitalize">{dispute.issueType.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Created</p>
                          <p className="text-foreground">{new Date(dispute.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Amount in Escrow</p>
                          <p className="text-foreground font-semibold">${dispute.amount}</p>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                        <p className="text-foreground bg-muted p-4 rounded-lg">{dispute.description}</p>
                      </div>

                      {(dispute.status === 'open' || dispute.status === 'investigating') && (
                        <div className="flex gap-3">
                          <Button
                            onClick={() => setSelectedDispute(dispute)}
                            className="flex-1"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Resolve Dispute
                          </Button>
                          {dispute.status === 'open' && (
                            <Button
                              variant="outline"
                              onClick={() => updateDisputeStatus(dispute.id, 'investigating')}
                            >
                              Mark Investigating
                            </Button>
                          )}
                        </div>
                      )}

                      {dispute.resolution && (
                        <div className="bg-success/10 border border-success/20 rounded-lg p-4 mt-4">
                          <p className="text-sm font-medium text-success">Resolution: {dispute.resolution}</p>
                          {dispute.adminNotes && (
                            <p className="text-sm text-muted-foreground mt-1">Notes: {dispute.adminNotes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Wallet Control Tab */}
        {activeTab === 'wallets' && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Control System
              </h3>
              <div className="space-y-4">
                {walletControls.map((wallet) => (
                  <div key={wallet.userId} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{wallet.userName}</p>
                        <p className="text-sm text-muted-foreground">Balance: ${wallet.balance.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Last activity: {new Date(wallet.lastActivity).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getWalletStatusBadge(wallet.status)}
                      {wallet.status === 'FROZEN' ? (
                        <Button size="sm" variant="outline" onClick={() => handleUnfreezeWallet(wallet.userId)}>
                          <Unlock className="h-4 w-4 mr-1" />
                          Unfreeze
                        </Button>
                      ) : (
                        <Button size="sm" variant="destructive" onClick={() => handleFreezeWallet(wallet.userId, wallet.userName)}>
                          <Snowflake className="h-4 w-4 mr-1" />
                          Freeze
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* User Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {userReports.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Reports</h3>
                <p className="text-muted-foreground">No user reports to review.</p>
              </div>
            ) : (
              userReports.map((report) => (
                <div key={report.id} className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                        <FileWarning className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          Report against {report.reportedUserName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Reported by {report.reporterName} • {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={
                      report.status === 'pending' ? 'bg-warning/10 text-warning border-warning/20' :
                      report.status === 'resolved' ? 'bg-success/10 text-success border-success/20' :
                      'bg-muted'
                    }>
                      {report.status}
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Reason</p>
                    <p className="text-foreground capitalize">{report.reason.replace('_', ' ')}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                    <p className="text-foreground">{report.description}</p>
                  </div>

                  {report.status === 'pending' && (
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        onClick={() => updateReportStatus(report.id, 'reviewed')}
                      >
                        Mark Reviewed
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateReportStatus(report.id, 'resolved')}
                      >
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => updateReportStatus(report.id, 'dismissed')}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products by name, seller, or category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Products Found</h3>
                <p className="text-muted-foreground">
                  {productSearch ? 'No products match your search.' : 'No products in the marketplace.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-background/80 text-foreground">
                        {product.condition}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <Link to={`/product/${product.id}`} className="hover:text-primary">
                        <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-foreground">${product.price}</span>
                        <span className="text-sm text-muted-foreground">by {product.seller.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <Link to={`/product/${product.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove "{product.name}" from the marketplace. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteProductAsAdmin(product.id, product.name)}>
                                Delete Product
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                User Support Messages
              </h3>
              <div className="space-y-4">
                {adminMessages.map((message) => (
                  <div key={message.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">{message.subject}</h4>
                        <p className="text-sm text-muted-foreground">From: {message.userName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={message.priority === 'high' ? 'destructive' : message.priority === 'medium' ? 'default' : 'secondary'}>
                          {message.priority}
                        </Badge>
                        <Badge variant={message.status === 'open' ? 'destructive' : 'default'}>
                          {message.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {message.messages.slice(-2).map((msg) => (
                        <div key={msg.id} className={`p-3 rounded-lg ${msg.sender === 'admin' ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'}`}>
                          <p className="text-sm text-foreground">{msg.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {msg.sender === 'admin' ? 'Admin' : message.userName} • {new Date(msg.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                    {message.status === 'open' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setSelectedMessage(message)}>
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => resolveMessage(message.id)}>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Admin Action Audit Log
            </h3>
            <div className="space-y-3">
              {adminActions.map((action) => (
                <div key={action.id} className="flex items-start gap-3 p-4 border border-border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground">{action.action.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">{new Date(action.timestamp).toLocaleString()}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{action.details}</p>
                    <p className="text-xs text-muted-foreground">Target: {action.target} ({action.targetId})</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resolve Dispute Dialog */}
      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Choose how to resolve this dispute. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDispute && (
            <div className="space-y-6 py-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="font-medium text-foreground">{selectedDispute.productName}</p>
                <p className="text-sm text-muted-foreground">
                  Amount: ${selectedDispute.amount}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Admin Notes</label>
                <Textarea
                  placeholder="Add notes about this resolution..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleResolveDispute(selectedDispute.id, 'buyer')}
                  className="bg-success hover:bg-success/90"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Refund Buyer
                </Button>
                <Button
                  onClick={() => handleResolveDispute(selectedDispute.id, 'seller')}
                  variant="outline"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Release to Seller
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Reply Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {selectedMessage?.userName}</DialogTitle>
            <DialogDescription>
              Subject: {selectedMessage?.subject}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Your Response</label>
              <Textarea
                placeholder="Type your response..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={handleSendMessage} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Response
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;